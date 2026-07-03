using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Core.Entities;

public class VerificationRecord
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DocumentType DocumentType { get; set; }
    public VerificationStatus Status { get; set; }

    // One-way hash only — the raw Aadhaar/Voter ID/PAN number is never stored.
    public string DocumentHash { get; set; } = null!;

    public DateTime? VerifiedAt { get; set; }
}
