using MazdoorSetu.Api.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace MazdoorSetu.Api.Common;

// Readiness check: confirms the app can reach the database. Dependency-free
// (no extra health-check package) — resolved per request scope so the scoped
// AppDbContext is available.
public class DbHealthCheck : IHealthCheck
{
    private readonly AppDbContext _db;

    public DbHealthCheck(AppDbContext db) => _db = db;

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _db.Database.CanConnectAsync(cancellationToken)
                ? HealthCheckResult.Healthy()
                : HealthCheckResult.Unhealthy("Database is unreachable.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database check failed.", ex);
        }
    }
}
