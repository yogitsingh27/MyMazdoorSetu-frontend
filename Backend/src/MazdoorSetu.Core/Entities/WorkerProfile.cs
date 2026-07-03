using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Core.Entities;

public class WorkerProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid TradeId { get; set; }
    public Trade Trade { get; set; } = null!;

    public int ExperienceYears { get; set; }
    public Availability Availability { get; set; }

    public ICollection<WorkerSkill> Skills { get; set; } = new List<WorkerSkill>();
    public ICollection<PortfolioItem> Portfolio { get; set; } = new List<PortfolioItem>();
}
