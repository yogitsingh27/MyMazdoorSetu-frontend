using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Core.Entities;

public class Application
{
    public Guid Id { get; set; }

    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;

    public Guid ApplicantId { get; set; }
    public User Applicant { get; set; } = null!;

    public ApplicationStatus Status { get; set; }
    public DateTime AppliedAt { get; set; }
    public DateTime? DecidedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
