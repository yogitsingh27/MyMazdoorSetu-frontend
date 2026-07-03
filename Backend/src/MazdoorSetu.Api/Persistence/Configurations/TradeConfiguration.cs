using MazdoorSetu.Api.Persistence.Seed;
using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class TradeConfiguration : IEntityTypeConfiguration<Trade>
{
    public void Configure(EntityTypeBuilder<Trade> builder)
    {
        builder.ToTable("Trades");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();

        builder.Property(t => t.Name).IsRequired().HasMaxLength(60);
        builder.HasIndex(t => t.Name).IsUnique();

        // Permanent reference vocabulary — present in every environment.
        builder.HasData(ReferenceData.Trades);
    }
}
