using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class ReviewCategoryScoreConfiguration : IEntityTypeConfiguration<ReviewCategoryScore>
{
    public void Configure(EntityTypeBuilder<ReviewCategoryScore> builder)
    {
        builder.ToTable("ReviewCategoryScores");

        builder.HasKey(s => new { s.ReviewId, s.Category });

        builder.Property(s => s.Category).IsRequired().HasMaxLength(60);
        builder.Property(s => s.Score).IsRequired();

        builder.HasOne(s => s.Review)
            .WithMany(r => r.CategoryScores)
            .HasForeignKey(s => s.ReviewId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
