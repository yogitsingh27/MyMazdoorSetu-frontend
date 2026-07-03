namespace MazdoorSetu.Core.Entities;

public class ContractorProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string BusinessName { get; set; } = null!;
    public bool BusinessVerified { get; set; }
}
