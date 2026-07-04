using Microsoft.AspNetCore.Mvc;

namespace MazdoorSetu.Api.Common.Errors;

// RFC 7807 ProblemDetails with a machine-readable `code` the bilingual frontend
// localizes (rather than showing server English).
public static class ApiProblem
{
    public static ObjectResult NotFound(string code, string detail) => Build(404, "Not Found", code, detail);

    public static ObjectResult BadRequest(string code, string detail) => Build(400, "Bad Request", code, detail);

    public static ObjectResult Unauthorized(string code, string detail) => Build(401, "Unauthorized", code, detail);

    public static ObjectResult Forbidden(string code, string detail) => Build(403, "Forbidden", code, detail);

    public static ObjectResult Conflict(string code, string detail) => Build(409, "Conflict", code, detail);

    private static ObjectResult Build(int status, string title, string code, string detail)
    {
        var problem = new ProblemDetails { Status = status, Title = title, Detail = detail };
        problem.Extensions["code"] = code;
        return new ObjectResult(problem) { StatusCode = status, ContentTypes = { "application/problem+json" } };
    }
}
