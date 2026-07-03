using MazdoorSetu.Api.Common.Errors;
using MazdoorSetu.Core.Enums;
using Microsoft.AspNetCore.Mvc;

namespace MazdoorSetu.Api.Features.Workers;

[ApiController]
[Route("api/v1/workers")]
public class WorkersController : ControllerBase
{
    private readonly WorkerReadService _svc;

    public WorkersController(WorkerReadService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Browse(
        [FromQuery] string? q,
        [FromQuery] string? trade,
        [FromQuery] string? city,
        [FromQuery] string? availability,
        [FromQuery] bool? verified,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
            return ApiProblem.BadRequest("request.invalid", "page must be >= 1 and pageSize must be between 1 and 100.");

        Availability? avail = null;
        if (!string.IsNullOrWhiteSpace(availability))
        {
            if (Enum.TryParse<Availability>(availability, ignoreCase: true, out var parsed))
                avail = parsed;
            else
                return ApiProblem.BadRequest("request.invalid", "availability must be 'available' or 'booked'.");
        }

        return Ok(await _svc.BrowseAsync(q, trade, city, avail, verified == true, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Detail(Guid id)
    {
        var dto = await _svc.GetDetailAsync(id);
        return dto is null
            ? ApiProblem.NotFound("worker.not_found", $"No worker exists with id '{id}'.")
            : Ok(dto);
    }
}
