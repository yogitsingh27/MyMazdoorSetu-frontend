using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Core.Entities;

public class Job
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string Title { get; set; } = null!;

    public Guid TradeId { get; set; }
    public Trade Trade { get; set; } = null!;

    public string Wage { get; set; } = null!;
    public string Location { get; set; } = null!;
    public string Duration { get; set; } = null!;
    public string Description { get; set; } = null!;
    public JobStatus Status { get; set; }
    public int Openings { get; set; }

    public Guid PostedById { get; set; }
    public User PostedBy { get; set; } = null!;
    public Role PostedByRole { get; set; }

    public DateTime PostedAt { get; set; }

    public ICollection<JobTag> Tags { get; set; } = new List<JobTag>();
    public ICollection<JobRequirement> Requirements { get; set; } = new List<JobRequirement>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
