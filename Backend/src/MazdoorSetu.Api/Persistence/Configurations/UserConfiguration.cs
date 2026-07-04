using MazdoorSetu.Core.Entities;
using MazdoorSetu.Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).ValueGeneratedNever();

        builder.Property(u => u.Phone).IsRequired().HasMaxLength(20);
        builder.Property(u => u.Name).IsRequired().HasMaxLength(120);
        builder.Property(u => u.City).IsRequired().HasMaxLength(80);
        builder.Property(u => u.AvatarColor).IsRequired().HasMaxLength(20);
        builder.Property(u => u.IsVerified).IsRequired();

        // PBKDF2 hash string (nullable — future OTP-only accounts have no password).
        builder.Property(u => u.PasswordHash).HasMaxLength(200);

        // Account lifecycle; default Active so existing rows migrate cleanly.
        builder.Property(u => u.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(AccountStatus.Active);

        builder.HasIndex(u => u.Phone).IsUnique();

        // Roles, Languages, and the four 1:1 profiles are configured from the
        // dependent side (their own configuration classes).
    }
}
