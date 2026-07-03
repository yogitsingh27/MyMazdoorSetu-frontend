using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class WorkerProfileConfiguration : IEntityTypeConfiguration<WorkerProfile>
{
    public void Configure(EntityTypeBuilder<WorkerProfile> builder)
    {
        builder.ToTable("WorkerProfiles");

        // Shared primary key: UserId is both PK and FK to User (1:1).
        builder.HasKey(wp => wp.UserId);
        builder.Property(wp => wp.UserId).ValueGeneratedNever();

        builder.Property(wp => wp.ExperienceYears).IsRequired();
        builder.Property(wp => wp.Availability).HasConversion<string>().HasMaxLength(30);

        builder.HasOne(wp => wp.User)
            .WithOne(u => u.WorkerProfile)
            .HasForeignKey<WorkerProfile>(wp => wp.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(wp => wp.Trade)
            .WithMany()
            .HasForeignKey(wp => wp.TradeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(wp => wp.TradeId);
        builder.HasIndex(wp => wp.Availability);
    }
}
