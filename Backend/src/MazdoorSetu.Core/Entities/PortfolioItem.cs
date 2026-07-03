namespace MazdoorSetu.Core.Entities;

public class PortfolioItem
{
    public Guid Id { get; set; }
    public Guid WorkerProfileId { get; set; }
    public WorkerProfile WorkerProfile { get; set; } = null!;
    public string Description { get; set; } = null!;
}
