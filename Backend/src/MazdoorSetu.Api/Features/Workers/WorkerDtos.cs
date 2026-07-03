using MazdoorSetu.Api.Common;
using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Api.Features.Workers;

public class WorkerSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string AvatarColor { get; set; } = "";
    public string City { get; set; } = "";
    public string Trade { get; set; } = "";
    public bool Verified { get; set; }
    public double Rating { get; set; }
    public int JobsDone { get; set; }
    public List<string> Skills { get; set; } = new();
}

public class WorkerDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string AvatarColor { get; set; } = "";
    public string City { get; set; } = "";
    public bool Verified { get; set; }
    public string Trade { get; set; } = "";
    public int ExperienceYears { get; set; }
    public Availability Availability { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int JobsDone { get; set; }
    public List<string> Skills { get; set; } = new();
    public List<string> Portfolio { get; set; } = new();
    public List<string> Languages { get; set; } = new();
    public List<ReviewDto> Reviews { get; set; } = new();
    public List<WorkerSummaryDto> Similar { get; set; } = new();
}
