using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using MazdoorSetu.Api.Common;
using MazdoorSetu.Api.Features.Auth;
using MazdoorSetu.Api.Features.Employers;
using MazdoorSetu.Api.Features.Jobs;
using MazdoorSetu.Api.Features.Workers;
using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Api.Persistence.Seed;
using MazdoorSetu.Core.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
    // Serialize enums as the frontend's lowercase strings ("employer", "open", "available").
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddProblemDetails();

// Readiness probe (see /health). Dependency-free DB check.
builder.Services.AddHealthChecks().AddCheck<MazdoorSetu.Api.Common.DbHealthCheck>("database");

// Minimal request logging: method, path, status, duration.
builder.Services.AddHttpLogging(o =>
    o.LoggingFields = HttpLoggingFields.RequestMethod | HttpLoggingFields.RequestPath
        | HttpLoggingFields.ResponseStatusCode | HttpLoggingFields.Duration);

// Trust the platform reverse proxy so Request.IsHttps/RemoteIp are accurate — this
// makes the refresh cookie's `Secure = Request.IsHttps` correct behind TLS termination.
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Cleared to accept the platform's proxy; restrict KnownNetworks/KnownProxies for a
    // hardened deployment (see docs/DEPLOYMENT.md).
    o.KnownNetworks.Clear();
    o.KnownProxies.Clear();
});

const string FrontendCors = "frontend";
// Origins from config (Cors:Origins). Dev falls back to the Vite dev server.
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };
builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCors, policy =>
        policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddScoped<JobReadService>();
builder.Services.AddScoped<WorkerReadService>();
builder.Services.AddScoped<EmployerReadService>();
builder.Services.AddScoped<MazdoorSetu.Api.Features.Jobs.JobWriteService>();
builder.Services.AddScoped<MazdoorSetu.Api.Features.Applications.ApplicationWriteService>();

// --- Authentication & authorization ---
var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()
    ?? throw new InvalidOperationException("Missing 'Jwt' configuration section.");
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false; // keep "sub"/"role" claim names as-is
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            NameClaimType = "name",
            RoleClaimType = "role",
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddSingleton<PasswordHasher<User>>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddScoped<AuthService>();

// --- Rate limiting: basic per-IP fixed window for the auth endpoints ---
// Limits are configurable (defaults 20/60 per minute); tests raise them to avoid throttling.
var authPermitLimit = builder.Configuration.GetValue<int?>("RateLimit:AuthPermitPerMinute") ?? 20;
var writePermitLimit = builder.Configuration.GetValue<int?>("RateLimit:WritePermitPerMinute") ?? 60;
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = authPermitLimit, // per IP per minute across the auth endpoints; tunable
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

    // Global per-IP limiter for state-changing requests. GETs/HEAD/OPTIONS and the
    // auth endpoints (which carry their own "auth" policy) are exempt so they aren't
    // double-counted. Reuses the OnRejected 429 ProblemDetails below.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        var method = httpContext.Request.Method;
        if (HttpMethods.IsGet(method) || HttpMethods.IsHead(method) || HttpMethods.IsOptions(method)
            || httpContext.Request.Path.StartsWithSegments("/api/v1/auth"))
            return RateLimitPartition.GetNoLimiter("exempt");

        var key = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter("write:" + key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = writePermitLimit, // writes per IP per minute; tunable
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
        });
    });

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/problem+json";
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            title = "Too Many Requests",
            status = 429,
            detail = "Too many attempts. Please wait a moment and try again.",
            code = "auth.rate_limited",
        }, cancellationToken);
    };
});

var app = builder.Build();

// Must run first so downstream sees the real scheme/IP behind a proxy.
app.UseForwardedHeaders();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Development-only, idempotent demo seeding.
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var seeded = await DevDataSeeder.SeedAsync(db);
    app.Logger.LogInformation(seeded
        ? "Development seed data applied."
        : "Development seed data already present — skipped.");
}
else
{
    // Apply pending migrations on startup (guarded: non-Development only). Suitable for a
    // single-instance beta; for multi-instance, run migrations as a separate deploy step
    // instead — see docs/DEPLOYMENT.md.
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // Migrations only apply to a relational provider (skips e.g. the in-memory
        // provider used by integration tests).
        if (db.Database.IsRelational())
            await db.Database.MigrateAsync();
    }

    // Unhandled exceptions return an RFC 7807 ProblemDetails (no stack traces in prod).
    app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(new
        {
            title = "Server Error",
            status = 500,
            detail = "An unexpected error occurred.",
            code = "server.error",
        });
    }));
    app.UseHsts();
}

app.UseHttpLogging();

app.UseCors(FrontendCors);

app.UseRateLimiter();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

// Exposed so the integration-test project can boot the real app via WebApplicationFactory.
public partial class Program { }
