using MazdoorSetu.Api.Common.Errors;
using Microsoft.AspNetCore.Mvc;

namespace MazdoorSetu.Api.Features.Employers;

[ApiController]
[Route("api/v1/employers")]
public class EmployersController : ControllerBase
{
    private readonly EmployerReadService _svc;

    public EmployersController(EmployerReadService svc) => _svc = svc;

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Detail(Guid id)
    {
        var dto = await _svc.GetDetailAsync(id);
        return dto is null
            ? ApiProblem.NotFound("employer.not_found", $"No employer exists with id '{id}'.")
            : Ok(dto);
    }
}
