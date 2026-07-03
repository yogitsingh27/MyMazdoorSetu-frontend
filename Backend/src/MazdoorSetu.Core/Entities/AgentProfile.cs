namespace MazdoorSetu.Core.Entities;

public class AgentProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string CoverageArea { get; set; } = null!;
}
