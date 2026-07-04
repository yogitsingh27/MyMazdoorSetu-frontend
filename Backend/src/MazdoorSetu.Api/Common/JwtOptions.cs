namespace MazdoorSetu.Api.Common;

// Bound from the "Jwt" configuration section. The signing Key must come from a
// secret store in production (environment/KMS) — never committed.
public class JwtOptions
{
    public string Key { get; set; } = "";
    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public int AccessTokenMinutes { get; set; } = 30;
    public int RefreshTokenDays { get; set; } = 14;
}
