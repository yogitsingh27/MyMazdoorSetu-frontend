using MazdoorSetu.Api.Common;
using MazdoorSetu.Api.Features.Jobs;
using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Api.Features.Employers;

public class EmployerDetailDto
{
    public Guid Id { get; set; }
    public string OrgName { get; set; } = "";
    public EmployerKind Kind { get; set; }
    public string City { get; set; } = "";
    public bool Verified { get; set; }
    public string? Tagline { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int JobsPosted { get; set; }
    public int CurrentlyHiring { get; set; }
    public List<ReviewDto> Reviews { get; set; } = new();
    public List<JobSummaryDto> OpenJobs { get; set; } = new();
}
