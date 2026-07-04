using MazdoorSetu.Api.Common;
using MazdoorSetu.Api.Common.Errors;
using MazdoorSetu.Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MazdoorSetu.Api.Features.Jobs;

// Authenticated job writes. The public read endpoints live in JobsController and are untouched.
[ApiController]
[Route("api/v1/jobs")]
[Authorize(Roles = "Employer,Contractor")]
public class JobWriteController : ControllerBase
{
    private readonly JobWriteService _svc;

    public JobWriteController(JobWriteService svc) => _svc = svc;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title) || req.Title.Length > 160
            || string.IsNullOrWhiteSpace(req.Wage) || req.Wage.Length > 60
            || string.IsNullOrWhiteSpace(req.Location) || req.Location.Length > 200
            || string.IsNullOrWhiteSpace(req.Duration) || req.Duration.Length > 40
            || string.IsNullOrWhiteSpace(req.Description) || req.Description.Length > 2000)
            return ApiProblem.BadRequest("request.invalid", "Title, wage, location, duration, and description are required and length-bounded.");
        if (req.Openings < 1)
            return ApiProblem.BadRequest("request.invalid", "Openings must be at least 1.");
        if (req.PostedAsRole != Role.Employer && req.PostedAsRole != Role.Contractor)
            return ApiProblem.BadRequest("request.invalid", "postedAsRole must be 'employer' or 'contractor'.");
        if (!User.IsInRole(req.PostedAsRole.ToString()))
            return ApiProblem.BadRequest("request.invalid", "postedAsRole must be a role you hold.");

        var (error, job) = await _svc.CreateAsync(User.GetUserId()!.Value, req);
        if (error == JobWriteError.TradeUnknown)
            return ApiProblem.BadRequest("request.invalid", $"Unknown trade '{req.Trade}'.");

        return Created($"/api/v1/jobs/{job!.Code}", job);
    }

    [HttpPost("{code}/close")]
    public async Task<IActionResult> Close(string code) =>
        MapJob(await _svc.CloseAsync(User.GetUserId()!.Value, code), code);

    [HttpPost("{code}/complete")]
    public async Task<IActionResult> Complete(string code) =>
        MapJob(await _svc.CompleteAsync(User.GetUserId()!.Value, code), code);

    private IActionResult MapJob((JobWriteError error, JobDto? job) result, string code) => result.error switch
    {
        JobWriteError.None => Ok(result.job),
        JobWriteError.NotFound => ApiProblem.NotFound("job.not_found", $"No job exists with code '{code}'."),
        JobWriteError.Forbidden => ApiProblem.Forbidden("job.forbidden", "You do not own this job."),
        JobWriteError.InvalidTransition => ApiProblem.Conflict("job.invalid_transition", "The job is not in a state that allows this transition."),
        _ => ApiProblem.BadRequest("request.invalid", "Invalid request."),
    };
}
