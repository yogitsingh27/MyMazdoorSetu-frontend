using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Core.Entities;
using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Api.Features.Jobs;

// Reusable EF Core projection from Job -> JobSummaryDto. The poster rating is a
// correlated aggregate (Worker->Hirer reviews about the poster), computed on read.
public static class JobProjections
{
    public static IQueryable<JobSummaryDto> ToSummary(this IQueryable<Job> query, AppDbContext db) =>
        query.Select(job => new JobSummaryDto
        {
            Code = job.Code,
            Title = job.Title,
            Trade = job.Trade.Name,
            Wage = job.Wage,
            Location = job.Location,
            Duration = job.Duration,
            PostedByRole = job.PostedByRole,
            PosterRating = Math.Round(
                db.Reviews.Where(r => r.SubjectId == job.PostedById && r.Direction == ReviewDirection.WorkerToHirer)
                    .Select(r => (double?)r.Overall).Average() ?? 0d, 1),
            PosterReviewCount = db.Reviews.Count(r => r.SubjectId == job.PostedById && r.Direction == ReviewDirection.WorkerToHirer),
            Tags = job.Tags.Select(t => t.Tag).ToList()
        });
}
