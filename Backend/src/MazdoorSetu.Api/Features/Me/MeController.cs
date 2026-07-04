using MazdoorSetu.Api.Common;
using MazdoorSetu.Api.Features.Applications;
using MazdoorSetu.Api.Features.Jobs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MazdoorSetu.Api.Features.Me;

[ApiController]
[Route("api/v1/me")]
[Authorize]
public class MeController : ControllerBase
{
    private readonly ApplicationWriteService _applications;
    private readonly JobWriteService _jobs;

    public MeController(ApplicationWriteService applications, JobWriteService jobs)
    {
        _applications = applications;
        _jobs = jobs;
    }

    private Guid MeId => User.GetUserId()!.Value;

    [HttpGet("applications")]
    [Authorize(Roles = "Worker")]
    public async Task<IActionResult> MyApplications() =>
        Ok(await _applications.GetMyApplicationsAsync(MeId));

    [HttpGet("posted-jobs")]
    [Authorize(Roles = "Employer,Contractor")]
    public async Task<IActionResult> PostedJobs() =>
        Ok(await _jobs.GetPostedJobsAsync(MeId));
}
