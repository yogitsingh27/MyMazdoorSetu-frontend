using MazdoorSetu.Api.Common;
using MazdoorSetu.Api.Common.Errors;
using MazdoorSetu.Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace MazdoorSetu.Api.Features.Auth;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private const string RefreshCookie = "mms_rt";

    private readonly AuthService _auth;
    private readonly JwtOptions _jwt;

    public AuthController(AuthService auth, IOptions<JwtOptions> jwt)
    {
        _auth = auth;
        _jwt = jwt.Value;
    }

    private string? Ip => HttpContext.Connection.RemoteIpAddress?.ToString();

    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Phone) || string.IsNullOrWhiteSpace(req.City))
            return ApiProblem.BadRequest("request.invalid", "Name, phone, and city are required.");
        if (req.Password is null || req.Password.Length < 8)
            return ApiProblem.BadRequest("request.invalid", "Password must be at least 8 characters.");
        if (req.Roles is null || req.Roles.Count == 0)
            return ApiProblem.BadRequest("request.invalid", "At least one role is required.");
        if (req.Roles.Contains(Role.Admin))
            return ApiProblem.BadRequest("request.invalid", "The admin role cannot be self-registered.");

        var (error, user) = await _auth.RegisterAsync(req);
        if (error == AuthError.PhoneTaken)
            return ApiProblem.Conflict("auth.phone_taken", "An account with that phone number already exists.");

        // 201 Created, NO tokens — the client logs in explicitly.
        return StatusCode(StatusCodes.Status201Created, new { id = user!.Id });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Phone) || string.IsNullOrWhiteSpace(req.Password))
            return ApiProblem.BadRequest("request.invalid", "Phone and password are required.");

        var (error, response, rawRefresh) = await _auth.LoginAsync(req, Ip);
        if (error == AuthError.InvalidCredentials)
            return ApiProblem.Unauthorized("auth.invalid_credentials", "Invalid phone number or password.");
        if (error == AuthError.AccountInactive)
            return ApiProblem.Forbidden("auth.account_inactive", "This account is not active.");

        SetRefreshCookie(rawRefresh!);
        return Ok(response);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Refresh()
    {
        var raw = Request.Cookies[RefreshCookie];
        var (error, response, rawRefresh) = await _auth.RefreshAsync(raw, Ip);
        if (error != AuthError.None)
        {
            ClearRefreshCookie();
            return ApiProblem.Unauthorized("auth.invalid_refresh", "Invalid or expired refresh token.");
        }

        SetRefreshCookie(rawRefresh!);
        return Ok(response);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout()
    {
        await _auth.LogoutAsync(Request.Cookies[RefreshCookie], Ip);
        ClearRefreshCookie();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.GetUserId();
        if (userId is null)
            return ApiProblem.Unauthorized("auth.unauthorized", "Not authenticated.");
        return Ok(await _auth.BuildMeAsync(userId.Value));
    }

    private void SetRefreshCookie(string raw) =>
        Response.Cookies.Append(RefreshCookie, raw, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps, // true in prod (https); false over plain-http dev so the cookie flows
            SameSite = SameSiteMode.Lax,
            Path = "/api/v1/auth",
            Expires = DateTimeOffset.UtcNow.AddDays(_jwt.RefreshTokenDays),
            IsEssential = true,
        });

    private void ClearRefreshCookie() =>
        Response.Cookies.Delete(RefreshCookie, new CookieOptions { Path = "/api/v1/auth" });
}
