using MazdoorSetu.Api.Common;
using MazdoorSetu.Api.Features.Jobs;
using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace MazdoorSetu.Api.Features.Employers;

public class EmployerReadService
{
    private readonly AppDbContext _db;

    public EmployerReadService(AppDbContext db) => _db = db;

    public async Task<EmployerDetailDto?> GetDetailAsync(Guid id)
    {
        var dto = await _db.Users.Where(u => u.Id == id && u.EmployerProfile != null).Select(u => new EmployerDetailDto
        {
            Id = u.Id,
            OrgName = u.EmployerProfile!.OrgName,
            Kind = u.EmployerProfile!.Kind,
            City = u.City,
            Verified = u.IsVerified,
            Tagline = u.EmployerProfile!.Tagline,
            Rating = Math.Round(
                _db.Reviews.Where(r => r.SubjectId == u.Id && r.Direction == ReviewDirection.WorkerToHirer)
                    .Select(r => (double?)r.Overall).Average() ?? 0d, 1),
            ReviewCount = _db.Reviews.Count(r => r.SubjectId == u.Id && r.Direction == ReviewDirection.WorkerToHirer),
            JobsPosted = _db.Jobs.Count(j => j.PostedById == u.Id && j.PostedByRole == Role.Employer),
            CurrentlyHiring = _db.Jobs.Count(j => j.PostedById == u.Id && j.PostedByRole == Role.Employer && j.Status == JobStatus.Open)
        }).FirstOrDefaultAsync();

        if (dto is null)
            return null;

        // Embedded: reviews about this employer (Worker->Hirer), newest first.
        dto.Reviews = await _db.Reviews
            .Where(r => r.SubjectId == id && r.Direction == ReviewDirection.WorkerToHirer)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                AuthorName = r.Author.Name,
                AuthorLabel = r.Author.WorkerProfile != null ? "Worker · " + r.Author.WorkerProfile!.Trade.Name : "Worker",
                Date = r.CreatedAt,
                Overall = r.Overall,
                Verified = r.JobId != null,
                Comment = r.Comment,
                Categories = r.CategoryScores.Select(c => new CategoryScoreDto { Category = c.Category, Score = c.Score }).ToList()
            }).ToListAsync();

        // Embedded: this employer's currently-open jobs.
        dto.OpenJobs = await _db.Jobs
            .Where(j => j.PostedById == id && j.PostedByRole == Role.Employer && j.Status == JobStatus.Open)
            .OrderByDescending(j => j.PostedAt)
            .ToSummary(_db)
            .ToListAsync();

        return dto;
    }
}
