using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace MazdoorSetu.IntegrationTests;

// A small number of high-value tests over the real HTTP API covering the
// critical user workflows: Register, Login, Refresh, Create Job, Apply,
// Withdraw, Accept, Reject, Close Job, Complete Job (plus the key guards:
// reactivation, duplicate, ownership/role, openings decrement).
public class CriticalPathTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public CriticalPathTests(ApiFactory factory) => _factory = factory;

    // --- helpers ---
    private static async Task<JsonElement> JsonAsync(HttpResponseMessage r) =>
        await r.Content.ReadFromJsonAsync<JsonElement>();

    private async Task RegisterAsync(HttpClient c, string name, string phone, string[] roles)
    {
        var res = await c.PostAsJsonAsync("/api/v1/auth/register",
            new { name, phone, city = "Delhi", password = "Password1", roles });
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
    }

    private async Task<string> LoginAsync(HttpClient c, string phone)
    {
        var res = await c.PostAsJsonAsync("/api/v1/auth/login", new { phone, password = "Password1" });
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        return (await JsonAsync(res)).GetProperty("accessToken").GetString()!;
    }

    // Registers + logs in a user and returns a cookie-bearing, token-authenticated client.
    private async Task<HttpClient> AuthedClientAsync(string name, string phone, string[] roles)
    {
        var c = _factory.CreateClient(); // HandleCookies defaults to true (refresh cookie)
        await RegisterAsync(c, name, phone, roles);
        var token = await LoginAsync(c, phone);
        c.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return c;
    }

    [Fact]
    public async Task Auth_Register_Login_Refresh_Works()
    {
        var c = _factory.CreateClient();

        // Register → 201, no tokens
        await RegisterAsync(c, "Auth User", "90000-00001", new[] { "worker" });

        // Login → 200 + access token + refresh cookie
        var token = await LoginAsync(c, "90000-00001");
        Assert.False(string.IsNullOrWhiteSpace(token));

        // Authenticated call succeeds with the token
        c.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var me = await c.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Equal("90000-00001", (await JsonAsync(me)).GetProperty("phone").GetString());

        // Refresh (cookie sent automatically) → 200 + a fresh access token
        var refresh = await c.PostAsync("/api/v1/auth/refresh", null);
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace((await JsonAsync(refresh)).GetProperty("accessToken").GetString()));

        // Wrong password → 401 (generic)
        var bad = await c.PostAsJsonAsync("/api/v1/auth/login", new { phone = "90000-00001", password = "nope" });
        Assert.Equal(HttpStatusCode.Unauthorized, bad.StatusCode);
    }

    [Fact]
    public async Task HiringWorkflow_Create_Apply_Withdraw_Accept_Reject_Close_Complete()
    {
        var employer = await AuthedClientAsync("Emp", "90000-10001", new[] { "employer" });
        var workerA = await AuthedClientAsync("Worker A", "90000-10002", new[] { "worker" });
        var workerB = await AuthedClientAsync("Worker B", "90000-10003", new[] { "worker" });

        // Create Job → 201, Open, openings 2
        var create = await employer.PostAsJsonAsync("/api/v1/jobs", new
        {
            title = "Wall plastering", trade = "Mason", wage = "800/day", location = "Delhi",
            duration = "5 days", description = "Plastering work", openings = 2, postedAsRole = "employer",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var job = await JsonAsync(create);
        var code = job.GetProperty("code").GetString()!;
        Assert.Equal("open", job.GetProperty("status").GetString());
        Assert.Equal(2, job.GetProperty("openings").GetInt32());

        // Apply (A and B) → 201
        var applyA = await workerA.PostAsync($"/api/v1/jobs/{code}/applications", null);
        Assert.Equal(HttpStatusCode.Created, applyA.StatusCode);
        var appAId = (await JsonAsync(applyA)).GetProperty("id").GetString()!;
        var applyB = await workerB.PostAsync($"/api/v1/jobs/{code}/applications", null);
        Assert.Equal(HttpStatusCode.Created, applyB.StatusCode);
        var appBId = (await JsonAsync(applyB)).GetProperty("id").GetString()!;

        // Withdraw A → 200 withdrawn
        var withdraw = await workerA.PostAsync($"/api/v1/applications/{appAId}/withdraw", null);
        Assert.Equal(HttpStatusCode.OK, withdraw.StatusCode);
        Assert.Equal("withdrawn", (await JsonAsync(withdraw)).GetProperty("status").GetString());

        // Re-apply A → 200 (reactivation, SAME id)
        var reapply = await workerA.PostAsync($"/api/v1/jobs/{code}/applications", null);
        Assert.Equal(HttpStatusCode.OK, reapply.StatusCode);
        Assert.Equal(appAId, (await JsonAsync(reapply)).GetProperty("id").GetString());

        // Duplicate apply while pending → 409
        var dup = await workerA.PostAsync($"/api/v1/jobs/{code}/applications", null);
        Assert.Equal(HttpStatusCode.Conflict, dup.StatusCode);

        // Employer views applicants → 200, both present
        var applicants = await employer.GetAsync($"/api/v1/jobs/{code}/applications");
        Assert.Equal(HttpStatusCode.OK, applicants.StatusCode);
        Assert.Equal(2, (await JsonAsync(applicants)).GetArrayLength());

        // Ownership/role guard: a worker cannot accept → 403
        var forbidden = await workerA.PostAsync($"/api/v1/applications/{appBId}/accept", null);
        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);

        // Accept A → 200 accepted, openings decremented (2 → 1)
        var accept = await employer.PostAsync($"/api/v1/applications/{appAId}/accept", null);
        Assert.Equal(HttpStatusCode.OK, accept.StatusCode);
        Assert.Equal("accepted", (await JsonAsync(accept)).GetProperty("status").GetString());
        var jobAfter = await JsonAsync(await employer.GetAsync($"/api/v1/jobs/{code}"));
        Assert.Equal(1, jobAfter.GetProperty("openings").GetInt32());

        // Reject B → 200 rejected
        var reject = await employer.PostAsync($"/api/v1/applications/{appBId}/reject", null);
        Assert.Equal(HttpStatusCode.OK, reject.StatusCode);
        Assert.Equal("rejected", (await JsonAsync(reject)).GetProperty("status").GetString());

        // Close (Open → Closed) → 200
        var close = await employer.PostAsync($"/api/v1/jobs/{code}/close", null);
        Assert.Equal(HttpStatusCode.OK, close.StatusCode);
        Assert.Equal("closed", (await JsonAsync(close)).GetProperty("status").GetString());

        // Complete (Closed → Completed) → 200
        var complete = await employer.PostAsync($"/api/v1/jobs/{code}/complete", null);
        Assert.Equal(HttpStatusCode.OK, complete.StatusCode);
        Assert.Equal("completed", (await JsonAsync(complete)).GetProperty("status").GetString());
    }
}
