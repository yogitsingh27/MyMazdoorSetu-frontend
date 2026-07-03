using MazdoorSetu.Api.Common.Errors;
using Microsoft.AspNetCore.Mvc;

namespace MazdoorSetu.Api.Features.Jobs;

[ApiController]
[Route("api/v1/jobs")]
public class JobsController : ControllerBase
{
    private readonly JobReadService _svc;

    public JobsController(JobReadService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Browse(
        [FromQuery] string? q,
        [FromQuery] string? trade,
        [FromQuery] string? city,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
            return ApiProblem.BadRequest("request.invalid", "page must be >= 1 and pageSize must be between 1 and 100.");

        return Ok(await _svc.BrowseAsync(q, trade, city, page, pageSize));
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> Detail(string code)
    {
        var dto = await _svc.GetDetailAsync(code);
        return dto is null
            ? ApiProblem.NotFound("job.not_found", $"No job exists with code '{code}'.")
            : Ok(dto);
    }
}
