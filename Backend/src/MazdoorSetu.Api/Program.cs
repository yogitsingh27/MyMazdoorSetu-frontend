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

const string FrontendCors = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCors, policy =>
        policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

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
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20, // per IP per minute across the auth endpoints; tunable
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
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

app.UseCors(FrontendCors);

app.UseRateLimiter();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
