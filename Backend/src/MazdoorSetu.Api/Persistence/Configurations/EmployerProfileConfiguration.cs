using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class EmployerProfileConfiguration : IEntityTypeConfiguration<EmployerProfile>
{
    public void Configure(EntityTypeBuilder<EmployerProfile> builder)
    {
        builder.ToTable("EmployerProfiles");

        builder.HasKey(e => e.UserId);
        builder.Property(e => e.UserId).ValueGeneratedNever();

        builder.Property(e => e.OrgName).IsRequired().HasMaxLength(160);
        builder.Property(e => e.Kind).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Tagline).HasMaxLength(300);

        builder.HasOne(e => e.User)
            .WithOne(u => u.EmployerProfile)
            .HasForeignKey<EmployerProfile>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
