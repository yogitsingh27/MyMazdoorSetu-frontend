using MazdoorSetu.Api.Persistence.Conversions;
using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<Application>
{
    public void Configure(EntityTypeBuilder<Application> builder)
    {
        builder.ToTable("Applications");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedNever();

        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(30);

        builder.Property(a => a.AppliedAt)
            .HasConversion<UtcDateTimeConverter>()
            .HasColumnType("datetime2");
        builder.Property(a => a.DecidedAt)
            .HasConversion<UtcNullableDateTimeConverter>()
            .HasColumnType("datetime2");
        builder.Property(a => a.UpdatedAt)
            .HasConversion<UtcDateTimeConverter>()
            .HasColumnType("datetime2");

        builder.HasOne(a => a.Job)
            .WithMany(j => j.Applications)
            .HasForeignKey(a => a.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Applicant)
            .WithMany()
            .HasForeignKey(a => a.ApplicantId)
            .OnDelete(DeleteBehavior.Restrict);

        // The business identity of an application: at most one row per
        // (Job, Applicant). Withdraw + re-apply mutate this row, never insert.
        builder.HasIndex(a => new { a.JobId, a.ApplicantId }).IsUnique();

        // A worker's "My applications" list.
        builder.HasIndex(a => a.ApplicantId);
    }
}
