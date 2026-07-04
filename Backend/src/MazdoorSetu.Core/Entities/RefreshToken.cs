namespace MazdoorSetu.Core.Entities;

// A rotating refresh token. Only the SHA-256 hash of the raw token is stored;
// the raw value lives only in the client's httpOnly cookie. Audit fields support
// future security investigations.
public class RefreshToken
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string TokenHash { get; set; } = null!; // SHA-256 hex of the raw token

    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }

    public string? CreatedByIp { get; set; }
    public string? RevokedByIp { get; set; }

    // On rotation, the id of the token that superseded this one (audit lineage).
    public Guid? ReplacedByTokenId { get; set; }
}
