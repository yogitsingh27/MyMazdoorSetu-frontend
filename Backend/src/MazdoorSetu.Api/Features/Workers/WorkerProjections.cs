using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Core.Entities;
using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Api.Features.Workers;

// Reusable EF Core projection from User (worker) -> WorkerSummaryDto. Rating and
// jobsDone are computed on read (Hirer->Worker reviews; accepted apps on completed jobs).
public static class WorkerProjections
{
    public static IQueryable<WorkerSummaryDto> ToSummary(this IQueryable<User> query, AppDbContext db) =>
        query.Select(u => new WorkerSummaryDto
        {
            Id = u.Id,
            Name = u.Name,
            AvatarColor = u.AvatarColor,
            City = u.City,
            Trade = u.WorkerProfile!.Trade.Name,
            Verified = u.IsVerified,
            Rating = Math.Round(
                db.Reviews.Where(r => r.SubjectId == u.Id && r.Direction == ReviewDirection.HirerToWorker)
                    .Select(r => (double?)r.Overall).Average() ?? 0d, 1),
            JobsDone = db.Applications.Count(a =>
                a.ApplicantId == u.Id && a.Status == ApplicationStatus.Accepted && a.Job.Status == JobStatus.Completed),
            Skills = u.WorkerProfile!.Skills.Select(s => s.Skill).ToList()
        });
}
