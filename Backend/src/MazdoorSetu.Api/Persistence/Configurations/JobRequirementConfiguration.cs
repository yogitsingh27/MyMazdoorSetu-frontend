using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class JobRequirementConfiguration : IEntityTypeConfiguration<JobRequirement>
{
    public void Configure(EntityTypeBuilder<JobRequirement> builder)
    {
        builder.ToTable("JobRequirements");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedNever();

        builder.Property(r => r.Text).IsRequired().HasMaxLength(300);

        builder.HasOne(r => r.Job)
            .WithMany(j => j.Requirements)
            .HasForeignKey(r => r.JobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
