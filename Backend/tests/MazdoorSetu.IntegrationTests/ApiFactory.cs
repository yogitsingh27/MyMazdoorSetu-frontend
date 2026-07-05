using MazdoorSetu.Api.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MazdoorSetu.IntegrationTests;

// Boots the real API (all controllers, services, auth/JWT, cookies, middleware,
// EF) via WebApplicationFactory. Only the DB provider is swapped for an isolated
// in-memory store so the suite runs anywhere (incl. Linux CI) with no SQL Server.
public class ApiFactory : WebApplicationFactory<Program>
{
    // Shared root so the seeding provider and the app's provider address the same store.
    private static readonly InMemoryDatabaseRoot Root = new();
    private readonly string _dbName = "itests-" + Guid.NewGuid();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing"); // neither dev seeding nor prod migrate-on-startup runs

        // UseSetting injects host configuration early enough to be read during
        // builder construction (Program reads Jwt/ConnectionStrings there).
        builder.UseSetting("ConnectionStrings:Default", "InMemory-overridden");
        builder.UseSetting("Jwt:Key", "integration-test-signing-key-please-use-32+-characters!!");
        builder.UseSetting("Jwt:Issuer", "mazdoorsetu");
        builder.UseSetting("Jwt:Audience", "mazdoorsetu");
        builder.UseSetting("Jwt:AccessTokenMinutes", "30");
        builder.UseSetting("Jwt:RefreshTokenDays", "14");
        // Raise limits so the suite isn't throttled; the limiter middleware still runs.
        builder.UseSetting("RateLimit:AuthPermitPerMinute", "100000");
        builder.UseSetting("RateLimit:WritePermitPerMinute", "100000");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor is not null) services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase(_dbName, Root));

            // Create the schema and apply HasData reference vocabulary (Trades/Cities).
            using var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();
        });
    }
}
