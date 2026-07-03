namespace MazdoorSetu.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Phone { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string City { get; set; } = null!;
    public string AvatarColor { get; set; } = null!;
    public bool IsVerified { get; set; }

    public ICollection<UserRole> Roles { get; set; } = new List<UserRole>();
    public ICollection<UserLanguage> Languages { get; set; } = new List<UserLanguage>();

    public WorkerProfile? WorkerProfile { get; set; }
    public ContractorProfile? ContractorProfile { get; set; }
    public EmployerProfile? EmployerProfile { get; set; }
    public AgentProfile? AgentProfile { get; set; }
}
