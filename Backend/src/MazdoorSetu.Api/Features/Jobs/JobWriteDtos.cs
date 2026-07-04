using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Api.Features.Jobs;

public class CreateJobRequest
{
    public string Title { get; set; } = "";
    public string Trade { get; set; } = "";       // must exist in the seeded Trades
    public string Wage { get; set; } = "";
    public string Location { get; set; } = "";
    public string Duration { get; set; } = "";
    public string Description { get; set; } = "";
    public int Openings { get; set; }
    public Role PostedAsRole { get; set; }         // employer | contractor — must be a role the caller holds
    public List<string>? Tags { get; set; }
    public List<string>? Requirements { get; set; }
}

public class JobDto
{
    public string Code { get; set; } = "";
    public string Title { get; set; } = "";
    public string Trade { get; set; } = "";
    public string Wage { get; set; } = "";
    public string Location { get; set; } = "";
    public string Duration { get; set; } = "";
    public string Description { get; set; } = "";
    public JobStatus Status { get; set; }
    public int Openings { get; set; }
    public Role PostedByRole { get; set; }
    public DateTime PostedAt { get; set; }
    public List<string> Tags { get; set; } = new();
    public List<string> Requirements { get; set; } = new();
}

public class PostedJobDto
{
    public string Code { get; set; } = "";
    public string Title { get; set; } = "";
    public string Trade { get; set; } = "";
    public JobStatus Status { get; set; }
    public int Openings { get; set; }
    public Role PostedByRole { get; set; }
    public DateTime PostedAt { get; set; }
    public int ApplicationCount { get; set; }
    public int PendingCount { get; set; }
}
