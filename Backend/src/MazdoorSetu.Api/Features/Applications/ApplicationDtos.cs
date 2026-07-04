using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Api.Features.Applications;

// Worker's view of their own application.
public class MyApplicationDto
{
    public Guid Id { get; set; }
    public string JobCode { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string Trade { get; set; } = "";
    public string Wage { get; set; } = "";
    public JobStatus JobStatus { get; set; }
    public ApplicationStatus Status { get; set; }
    public DateTime AppliedAt { get; set; }
    public DateTime? DecidedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// Poster's view of an application to one of their jobs.
public class ApplicantDto
{
    public Guid Id { get; set; }
    public string JobCode { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public Role PostedByRole { get; set; }
    public ApplicationStatus Status { get; set; }
    public DateTime AppliedAt { get; set; }
    public DateTime? DecidedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ApplicantInfoDto Applicant { get; set; } = new();
}

public class ApplicantInfoDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string? Trade { get; set; }
    public double Rating { get; set; }
}
