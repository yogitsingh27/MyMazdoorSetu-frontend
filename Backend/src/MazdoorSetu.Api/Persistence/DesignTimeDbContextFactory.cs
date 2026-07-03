using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MazdoorSetu.Api.Persistence;

// Lets the EF Core tooling (dotnet ef) construct AppDbContext at design time
// without the application host being wired up. The connection string is only
// used when actually talking to a database (e.g. `database update`); scaffolding
// a migration never opens a connection. Override via the MAZDOORSETU_DB env var.
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("MAZDOORSETU_DB")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=MazdoorSetuDev;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new AppDbContext(options);
    }
}
