using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace MazdoorSetu.Api.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<UserLanguage> UserLanguages => Set<UserLanguage>();
    public DbSet<WorkerProfile> WorkerProfiles => Set<WorkerProfile>();
    public DbSet<WorkerSkill> WorkerSkills => Set<WorkerSkill>();
    public DbSet<PortfolioItem> PortfolioItems => Set<PortfolioItem>();
    public DbSet<ContractorProfile> ContractorProfiles => Set<ContractorProfile>();
    public DbSet<EmployerProfile> EmployerProfiles => Set<EmployerProfile>();
    public DbSet<AgentProfile> AgentProfiles => Set<AgentProfile>();
    public DbSet<Trade> Trades => Set<Trade>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<JobTag> JobTags => Set<JobTag>();
    public DbSet<JobRequirement> JobRequirements => Set<JobRequirement>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ReviewCategoryScore> ReviewCategoryScores => Set<ReviewCategoryScore>();
    public DbSet<VerificationRecord> VerificationRecords => Set<VerificationRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
