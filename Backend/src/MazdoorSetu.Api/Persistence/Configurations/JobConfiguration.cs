using MazdoorSetu.Api.Persistence.Conversions;
using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class JobConfiguration : IEntityTypeConfiguration<Job>
{
    public void Configure(EntityTypeBuilder<Job> builder)
    {
        builder.ToTable("Jobs");

        builder.HasKey(j => j.Id);
        builder.Property(j => j.Id).ValueGeneratedNever();

        builder.Property(j => j.Code).IsRequired().HasMaxLength(20);
        builder.Property(j => j.Title).IsRequired().HasMaxLength(160);
        builder.Property(j => j.Wage).IsRequired().HasMaxLength(60);
        builder.Property(j => j.Location).IsRequired().HasMaxLength(200);
        builder.Property(j => j.Duration).IsRequired().HasMaxLength(40);
        builder.Property(j => j.Description).IsRequired().HasMaxLength(2000);
        builder.Property(j => j.Openings).IsRequired();

        builder.Property(j => j.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(j => j.PostedByRole).HasConversion<string>().HasMaxLength(30);

        builder.Property(j => j.PostedAt)
            .HasConversion<UtcDateTimeConverter>()
            .HasColumnType("datetime2");

        builder.HasOne(j => j.Trade)
            .WithMany()
            .HasForeignKey(j => j.TradeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(j => j.PostedBy)
            .WithMany()
            .HasForeignKey(j => j.PostedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(j => j.Code).IsUnique();
        builder.HasIndex(j => j.Status);
        builder.HasIndex(j => j.TradeId);
        builder.HasIndex(j => j.PostedById);
    }
}
