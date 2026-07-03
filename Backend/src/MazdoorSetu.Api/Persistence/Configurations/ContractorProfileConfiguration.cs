using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class ContractorProfileConfiguration : IEntityTypeConfiguration<ContractorProfile>
{
    public void Configure(EntityTypeBuilder<ContractorProfile> builder)
    {
        builder.ToTable("ContractorProfiles");

        builder.HasKey(c => c.UserId);
        builder.Property(c => c.UserId).ValueGeneratedNever();

        builder.Property(c => c.BusinessName).IsRequired().HasMaxLength(160);
        builder.Property(c => c.BusinessVerified).IsRequired();

        builder.HasOne(c => c.User)
            .WithOne(u => u.ContractorProfile)
            .HasForeignKey<ContractorProfile>(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
