using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class PortfolioItemConfiguration : IEntityTypeConfiguration<PortfolioItem>
{
    public void Configure(EntityTypeBuilder<PortfolioItem> builder)
    {
        builder.ToTable("PortfolioItems");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();

        builder.Property(p => p.Description).IsRequired().HasMaxLength(300);

        builder.HasOne(p => p.WorkerProfile)
            .WithMany(wp => wp.Portfolio)
            .HasForeignKey(p => p.WorkerProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
