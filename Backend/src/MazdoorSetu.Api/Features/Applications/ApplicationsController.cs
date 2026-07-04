using MazdoorSetu.Api.Common;
using MazdoorSetu.Api.Common.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MazdoorSetu.Api.Features.Applications;

// Absolute routes: application actions span /jobs/{code}/applications and /applications/{id}.
[ApiController]
public class ApplicationsController : ControllerBase
{
    private readonly ApplicationWriteService _svc;

    public ApplicationsController(ApplicationWriteService svc) => _svc = svc;

    private Guid Me => User.GetUserId()!.Value;

    [HttpPost("api/v1/jobs/{code}/applications")]
    [Authorize(Roles = "Worker")]
    public async Task<IActionResult> Apply(string code)
    {
        var (error, app, created) = await _svc.ApplyAsync(Me, code);
        return error switch
        {
            // 201 for a new application; 200 when a withdrawn one is reactivated in place.
            ApplicationWriteError.None => created ? StatusCode(StatusCodes.Status201Created, app) : Ok(app),
            ApplicationWriteError.JobNotFound => ApiProblem.NotFound("job.not_found", $"No job exists with code '{code}'."),
            ApplicationWriteError.SelfApply => ApiProblem.Conflict("application.self_apply", "You cannot apply to a job you posted."),
            ApplicationWriteError.JobNotOpen => ApiProblem.Conflict("job.not_open", "This job is not open for applications."),
            ApplicationWriteError.AlreadyApplied => ApiProblem.Conflict("application.already_applied", "You already have an application for this job."),
            _ => ApiProblem.BadRequest("request.invalid", "Invalid request."),
        };
    }

    [HttpGet("api/v1/jobs/{code}/applications")]
    [Authorize(Roles = "Employer,Contractor")]
    public async Task<IActionResult> Applicants(string code)
    {
        var (error, applicants) = await _svc.GetJobApplicantsAsync(Me, code);
        return error switch
        {
            ApplicationWriteError.None => Ok(applicants),
            ApplicationWriteError.JobNotFound => ApiProblem.NotFound("job.not_found", $"No job exists with code '{code}'."),
            ApplicationWriteError.Forbidden => ApiProblem.Forbidden("job.forbidden", "You do not own this job."),
            _ => ApiProblem.BadRequest("request.invalid", "Invalid request."),
        };
    }

    [HttpPost("api/v1/applications/{id:guid}/withdraw")]
    [Authorize(Roles = "Worker")]
    public async Task<IActionResult> Withdraw(Guid id) =>
        MapMine(await _svc.WithdrawAsync(Me, id));

    [HttpPost("api/v1/applications/{id:guid}/accept")]
    [Authorize(Roles = "Employer,Contractor")]
    public async Task<IActionResult> Accept(Guid id) =>
        MapDecision(await _svc.DecideAsync(Me, id, accept: true));

    [HttpPost("api/v1/applications/{id:guid}/reject")]
    [Authorize(Roles = "Employer,Contractor")]
    public async Task<IActionResult> Reject(Guid id) =>
        MapDecision(await _svc.DecideAsync(Me, id, accept: false));

    private IActionResult MapMine((ApplicationWriteError error, MyApplicationDto? application) r) => r.error switch
    {
        ApplicationWriteError.None => Ok(r.application),
        ApplicationWriteError.NotFound => ApiProblem.NotFound("application.not_found", "No such application."),
        ApplicationWriteError.Forbidden => ApiProblem.Forbidden("application.forbidden", "This is not your application."),
        ApplicationWriteError.NotPending => ApiProblem.Conflict("application.not_pending", "Only a pending application can be changed."),
        _ => ApiProblem.BadRequest("request.invalid", "Invalid request."),
    };

    private IActionResult MapDecision((ApplicationWriteError error, ApplicantDto? application) r) => r.error switch
    {
        ApplicationWriteError.None => Ok(r.application),
        ApplicationWriteError.NotFound => ApiProblem.NotFound("application.not_found", "No such application."),
        ApplicationWriteError.Forbidden => ApiProblem.Forbidden("application.forbidden", "You do not own the job for this application."),
        ApplicationWriteError.JobCompleted => ApiProblem.Conflict("application.job_completed", "This job is completed; applications can no longer be decided."),
        ApplicationWriteError.NotPending => ApiProblem.Conflict("application.not_pending", "Only a pending application can be decided."),
        _ => ApiProblem.BadRequest("request.invalid", "Invalid request."),
    };
}
