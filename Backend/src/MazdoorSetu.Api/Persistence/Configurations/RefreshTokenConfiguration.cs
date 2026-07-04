using MazdoorSetu.Api.Persistence.Conversions;
using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();

        // SHA-256 hex of the raw token.
        builder.Property(t => t.TokenHash).IsRequired().HasMaxLength(64).IsFixedLength();

        builder.Property(t => t.CreatedAtUtc).HasConversion<UtcDateTimeConverter>().HasColumnType("datetime2");
        builder.Property(t => t.ExpiresAtUtc).HasConversion<UtcDateTimeConverter>().HasColumnType("datetime2");
        builder.Property(t => t.RevokedAtUtc).HasConversion<UtcNullableDateTimeConverter>().HasColumnType("datetime2");

        builder.Property(t => t.CreatedByIp).HasMaxLength(45); // fits IPv6
        builder.Property(t => t.RevokedByIp).HasMaxLength(45);

        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => t.TokenHash).IsUnique(); // lookup by hash
        builder.HasIndex(t => t.UserId);

        // ReplacedByTokenId is audit-only lineage (points at another RefreshToken.Id);
        // deliberately not a foreign key, to keep rotation simple and avoid cascade cycles.
    }
}
