using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Core.Entities;

public class EmployerProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string OrgName { get; set; } = null!;
    public EmployerKind Kind { get; set; }
    public string? Tagline { get; set; }
}
