using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Core.Entities;

public class UserRole
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Role Role { get; set; }
}
