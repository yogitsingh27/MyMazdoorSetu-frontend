using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Core.Entities;
using MazdoorSetu.Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MazdoorSetu.Api.Features.Auth;

public enum AuthError { None, PhoneTaken, InvalidCredentials, AccountInactive, InvalidRefresh }

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;
    private readonly PasswordHasher<User> _hasher;

    public AuthService(AppDbContext db, TokenService tokens, PasswordHasher<User> hasher)
    {
        _db = db;
        _tokens = tokens;
        _hasher = hasher;
    }

    public async Task<(AuthError error, User? user)> RegisterAsync(RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Phone == req.Phone.Trim()))
            return (AuthError.PhoneTaken, null);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = req.Name.Trim(),
            Phone = req.Phone.Trim(),
            City = req.City.Trim(),
            AvatarColor = "navy",
            IsVerified = false,
            Status = AccountStatus.Active, // when OTP is introduced this becomes Pending until verified
        };
        user.PasswordHash = _hasher.HashPassword(user, req.Password);
        foreach (var role in req.Roles.Distinct())
            user.Roles.Add(new UserRole { UserId = user.Id, Role = role });

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return (AuthError.None, user); // NO tokens issued — the client logs in explicitly
    }

    public async Task<(AuthError error, AuthResponse? response, string? rawRefresh)> LoginAsync(LoginRequest req, string? ip)
    {
        var user = await _db.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Phone == req.Phone.Trim());
        // Generic failure — never reveal whether the phone or the password was wrong.
        if (user is null || user.PasswordHash is null)
            return (AuthError.InvalidCredentials, null, null);

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password);
        if (result == PasswordVerificationResult.Failed)
            return (AuthError.InvalidCredentials, null, null);

        if (user.Status != AccountStatus.Active)
            return (AuthError.AccountInactive, null, null);

        var (response, raw) = await IssueAsync(user, ip);
        return (AuthError.None, response, raw);
    }

    public async Task<(AuthError error, AuthResponse? response, string? rawRefresh)> RefreshAsync(string? rawRefresh, string? ip)
    {
        if (string.IsNullOrEmpty(rawRefresh))
            return (AuthError.InvalidRefresh, null, null);

        var hash = TokenService.HashToken(rawRefresh);
        var existing = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash);
        if (existing is null || existing.RevokedAtUtc != null || existing.ExpiresAtUtc <= DateTime.UtcNow)
            return (AuthError.InvalidRefresh, null, null);

        var user = await _db.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == existing.UserId);
        if (user is null || user.Status != AccountStatus.Active)
            return (AuthError.InvalidRefresh, null, null);

        // Rotate: revoke the presented token and issue a fresh one, linking lineage.
        var (access, accessExp) = _tokens.CreateAccessToken(user);
        var (raw, newHash, refreshExp) = _tokens.CreateRefreshToken();
        var newToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = newHash,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = refreshExp,
            CreatedByIp = ip,
        };
        existing.RevokedAtUtc = DateTime.UtcNow;
        existing.RevokedByIp = ip;
        existing.ReplacedByTokenId = newToken.Id;
        _db.RefreshTokens.Add(newToken);
        await _db.SaveChangesAsync();

        var me = await BuildMeAsync(user.Id);
        return (AuthError.None, new AuthResponse { AccessToken = access, ExpiresAtUtc = accessExp, User = me }, raw);
    }

    public async Task LogoutAsync(string? rawRefresh, string? ip)
    {
        if (string.IsNullOrEmpty(rawRefresh)) return;
        var hash = TokenService.HashToken(rawRefresh);
        var existing = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash);
        if (existing is not null && existing.RevokedAtUtc == null)
        {
            existing.RevokedAtUtc = DateTime.UtcNow;
            existing.RevokedByIp = ip;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<MeDto> BuildMeAsync(Guid userId) =>
        await _db.Users.Where(u => u.Id == userId).Select(u => new MeDto
        {
            Id = u.Id,
            Name = u.Name,
            Phone = u.Phone,
            City = u.City,
            AvatarColor = u.AvatarColor,
            IsVerified = u.IsVerified,
            Status = u.Status,
            Roles = u.Roles.Select(r => r.Role).ToList(),
            Profiles = new ProfilesDto
            {
                Worker = u.WorkerProfile != null,
                Contractor = u.ContractorProfile != null,
                Employer = u.EmployerProfile != null,
                Agent = u.AgentProfile != null,
            },
        }).FirstAsync();

    private async Task<(AuthResponse response, string rawRefresh)> IssueAsync(User user, string? ip)
    {
        var (access, accessExp) = _tokens.CreateAccessToken(user);
        var (raw, hash, refreshExp) = _tokens.CreateRefreshToken();
        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = hash,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = refreshExp,
            CreatedByIp = ip,
        });
        await _db.SaveChangesAsync();
        var me = await BuildMeAsync(user.Id);
        return (new AuthResponse { AccessToken = access, ExpiresAtUtc = accessExp, User = me }, raw);
    }
}
