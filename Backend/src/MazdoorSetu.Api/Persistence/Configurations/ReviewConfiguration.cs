using MazdoorSetu.Api.Persistence.Conversions;
using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedNever();

        builder.Property(r => r.Direction).HasConversion<string>().HasMaxLength(30);
        builder.Property(r => r.Overall).IsRequired();
        builder.Property(r => r.Comment).IsRequired().HasMaxLength(1000);

        builder.Property(r => r.CreatedAt)
            .HasConversion<UtcDateTimeConverter>()
            .HasColumnType("datetime2");

        // Two distinct FKs to User (subject and author) — Restrict on both to
        // avoid multiple cascade paths into Reviews.
        builder.HasOne(r => r.Subject)
            .WithMany()
            .HasForeignKey(r => r.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Author)
            .WithMany()
            .HasForeignKey(r => r.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Optional link to the job the review is about (nullable FK).
        builder.HasOne(r => r.Job)
            .WithMany()
            .HasForeignKey(r => r.JobId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // A subject's public profile reviews, filtered by direction.
        builder.HasIndex(r => new { r.SubjectId, r.Direction });
    }
}
