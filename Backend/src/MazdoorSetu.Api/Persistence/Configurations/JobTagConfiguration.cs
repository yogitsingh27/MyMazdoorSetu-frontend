using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class JobTagConfiguration : IEntityTypeConfiguration<JobTag>
{
    public void Configure(EntityTypeBuilder<JobTag> builder)
    {
        builder.ToTable("JobTags");

        builder.HasKey(t => new { t.JobId, t.Tag });

        builder.Property(t => t.Tag).IsRequired().HasMaxLength(60);

        builder.HasOne(t => t.Job)
            .WithMany(j => j.Tags)
            .HasForeignKey(t => t.JobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
