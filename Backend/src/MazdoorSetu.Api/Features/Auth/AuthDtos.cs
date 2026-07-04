using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Api.Features.Auth;

public class RegisterRequest
{
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string City { get; set; } = "";
    public string Password { get; set; } = "";
    public List<Role> Roles { get; set; } = new();
}

public class LoginRequest
{
    public string Phone { get; set; } = "";
    public string Password { get; set; } = "";
}

public class AuthResponse
{
    public string AccessToken { get; set; } = "";
    public string TokenType { get; set; } = "Bearer";
    public DateTime ExpiresAtUtc { get; set; }
    public MeDto User { get; set; } = new();
}

public class MeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string City { get; set; } = "";
    public string AvatarColor { get; set; } = "";
    public bool IsVerified { get; set; }
    public AccountStatus Status { get; set; }
    public List<Role> Roles { get; set; } = new();
    public ProfilesDto Profiles { get; set; } = new();
}

public class ProfilesDto
{
    public bool Worker { get; set; }
    public bool Contractor { get; set; }
    public bool Employer { get; set; }
    public bool Agent { get; set; }
}
