using MazdoorSetu.Api.Persistence.Conversions;
using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class VerificationRecordConfiguration : IEntityTypeConfiguration<VerificationRecord>
{
    public void Configure(EntityTypeBuilder<VerificationRecord> builder)
    {
        builder.ToTable("VerificationRecords");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).ValueGeneratedNever();

        builder.Property(v => v.DocumentType).HasConversion<string>().HasMaxLength(30);
        builder.Property(v => v.Status).HasConversion<string>().HasMaxLength(30);

        // Fixed-length one-way hash of the government ID number (SHA-256 hex).
        // The raw Aadhaar/Voter ID/PAN number is never persisted.
        builder.Property(v => v.DocumentHash).IsRequired().HasMaxLength(64).IsFixedLength();

        builder.Property(v => v.VerifiedAt)
            .HasConversion<UtcNullableDateTimeConverter>()
            .HasColumnType("datetime2");

        builder.HasOne(v => v.User)
            .WithMany()
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(v => v.UserId);
    }
}
