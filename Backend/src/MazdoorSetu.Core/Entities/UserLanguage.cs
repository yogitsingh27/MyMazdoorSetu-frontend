namespace MazdoorSetu.Core.Entities;

public class UserLanguage
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Language { get; set; } = null!;
}
