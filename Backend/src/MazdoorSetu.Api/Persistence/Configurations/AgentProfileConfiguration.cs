using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class AgentProfileConfiguration : IEntityTypeConfiguration<AgentProfile>
{
    public void Configure(EntityTypeBuilder<AgentProfile> builder)
    {
        builder.ToTable("AgentProfiles");

        builder.HasKey(a => a.UserId);
        builder.Property(a => a.UserId).ValueGeneratedNever();

        builder.Property(a => a.CoverageArea).IsRequired().HasMaxLength(120);

        builder.HasOne(a => a.User)
            .WithOne(u => u.AgentProfile)
            .HasForeignKey<AgentProfile>(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
