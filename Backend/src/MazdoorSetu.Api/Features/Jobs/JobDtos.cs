using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Api.Features.Jobs;

public class JobSummaryDto
{
    public string Code { get; set; } = "";
    public string Title { get; set; } = "";
    public string Trade { get; set; } = "";
    public string Wage { get; set; } = "";
    public string Location { get; set; } = "";
    public string Duration { get; set; } = "";
    public Role PostedByRole { get; set; }
    public double PosterRating { get; set; }
    public int PosterReviewCount { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class PosterDto
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = "";
    public Role Role { get; set; }
    public EmployerKind? Kind { get; set; }
    public bool Verified { get; set; }
    public string AvatarColor { get; set; } = "";
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
}

public class JobDetailDto
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
    public DateTime PostedAt { get; set; }
    public List<string> Requirements { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public PosterDto Poster { get; set; } = new();
    public List<JobSummaryDto> Similar { get; set; } = new();
}
