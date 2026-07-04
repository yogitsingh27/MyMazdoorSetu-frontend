using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Core.Entities;
using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Api.Features.Applications;

public static class ApplicationProjections
{
    public static IQueryable<MyApplicationDto> ToMine(this IQueryable<Application> query) =>
        query.Select(a => new MyApplicationDto
        {
            Id = a.Id,
            JobCode = a.Job.Code,
            JobTitle = a.Job.Title,
            Trade = a.Job.Trade.Name,
            Wage = a.Job.Wage,
            JobStatus = a.Job.Status,
            Status = a.Status,
            AppliedAt = a.AppliedAt,
            DecidedAt = a.DecidedAt,
            UpdatedAt = a.UpdatedAt,
        });

    public static IQueryable<ApplicantDto> ToApplicant(this IQueryable<Application> query, AppDbContext db) =>
        query.Select(a => new ApplicantDto
        {
            Id = a.Id,
            JobCode = a.Job.Code,
            JobTitle = a.Job.Title,
            PostedByRole = a.Job.PostedByRole,
            Status = a.Status,
            AppliedAt = a.AppliedAt,
            DecidedAt = a.DecidedAt,
            UpdatedAt = a.UpdatedAt,
            Applicant = new ApplicantInfoDto
            {
                Id = a.Applicant.Id,
                Name = a.Applicant.Name,
                Trade = a.Applicant.WorkerProfile != null ? a.Applicant.WorkerProfile.Trade.Name : null,
                Rating = Math.Round(
                    db.Reviews.Where(r => r.SubjectId == a.ApplicantId && r.Direction == ReviewDirection.HirerToWorker)
                        .Select(r => (double?)r.Overall).Average() ?? 0d, 1),
            },
        });
}
