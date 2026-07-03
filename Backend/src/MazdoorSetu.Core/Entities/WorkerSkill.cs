namespace MazdoorSetu.Core.Entities;

public class WorkerSkill
{
    public Guid WorkerProfileId { get; set; }
    public WorkerProfile WorkerProfile { get; set; } = null!;
    public string Skill { get; set; } = null!;
}
