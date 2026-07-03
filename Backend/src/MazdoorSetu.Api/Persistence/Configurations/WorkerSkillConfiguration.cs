using MazdoorSetu.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazdoorSetu.Api.Persistence.Configurations;

public class WorkerSkillConfiguration : IEntityTypeConfiguration<WorkerSkill>
{
    public void Configure(EntityTypeBuilder<WorkerSkill> builder)
    {
        builder.ToTable("WorkerSkills");

        builder.HasKey(ws => new { ws.WorkerProfileId, ws.Skill });

        builder.Property(ws => ws.Skill).IsRequired().HasMaxLength(60);

        builder.HasOne(ws => ws.WorkerProfile)
            .WithMany(wp => wp.Skills)
            .HasForeignKey(ws => ws.WorkerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        // Worker search matches on skill text.
        builder.HasIndex(ws => ws.Skill);
    }
}
