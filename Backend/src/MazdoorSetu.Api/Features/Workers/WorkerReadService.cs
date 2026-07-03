using MazdoorSetu.Api.Common;
using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace MazdoorSetu.Api.Features.Workers;

public class WorkerReadService
{
    private readonly AppDbContext _db;

    public WorkerReadService(AppDbContext db) => _db = db;

    public async Task<PagedResult<WorkerSummaryDto>> BrowseAsync(
        string? q, string? trade, string? city, Availability? availability, bool verifiedOnly, int page, int pageSize)
    {
        var query = _db.Users.Where(u => u.WorkerProfile != null);

        if (!string.IsNullOrWhiteSpace(trade))
            query = query.Where(u => u.WorkerProfile!.Trade.Name == trade);
        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(u => u.City == city);
        if (availability != null)
            query = query.Where(u => u.WorkerProfile!.Availability == availability);
        if (verifiedOnly)
            query = query.Where(u => u.IsVerified);
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(u =>
                u.Name.Contains(q) || u.City.Contains(q) || u.WorkerProfile!.Trade.Name.Contains(q) ||
                u.WorkerProfile!.Skills.Any(s => s.Skill.Contains(q)) ||
                u.WorkerProfile!.Portfolio.Any(p => p.Description.Contains(q)));

        var ordered = query
            .OrderByDescending(u => u.IsVerified)
            .ThenByDescending(u => u.WorkerProfile!.ExperienceYears)
            .ThenBy(u => u.Name);

        var total = await ordered.CountAsync();
        var items = await ordered.Skip((page - 1) * pageSize).Take(pageSize).ToSummary(_db).ToListAsync();
        return new PagedResult<WorkerSummaryDto>(items, page, pageSize, total);
    }

    public async Task<WorkerDetailDto?> GetDetailAsync(Guid id)
    {
        var dto = await _db.Users.Where(u => u.Id == id && u.WorkerProfile != null).Select(u => new WorkerDetailDto
        {
            Id = u.Id,
            Name = u.Name,
            AvatarColor = u.AvatarColor,
            City = u.City,
            Verified = u.IsVerified,
            Trade = u.WorkerProfile!.Trade.Name,
            ExperienceYears = u.WorkerProfile!.ExperienceYears,
            Availability = u.WorkerProfile!.Availability,
            Rating = Math.Round(
                _db.Reviews.Where(r => r.SubjectId == u.Id && r.Direction == ReviewDirection.HirerToWorker)
                    .Select(r => (double?)r.Overall).Average() ?? 0d, 1),
            ReviewCount = _db.Reviews.Count(r => r.SubjectId == u.Id && r.Direction == ReviewDirection.HirerToWorker),
            JobsDone = _db.Applications.Count(a =>
                a.ApplicantId == u.Id && a.Status == ApplicationStatus.Accepted && a.Job.Status == JobStatus.Completed),
            Skills = u.WorkerProfile!.Skills.Select(s => s.Skill).ToList(),
            Portfolio = u.WorkerProfile!.Portfolio.Select(p => p.Description).ToList(),
            Languages = u.Languages.Select(l => l.Language).ToList()
        }).FirstOrDefaultAsync();

        if (dto is null)
            return null;

        // Embedded: reviews about this worker (Hirer->Worker), newest first.
        dto.Reviews = await _db.Reviews
            .Where(r => r.SubjectId == id && r.Direction == ReviewDirection.HirerToWorker)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                AuthorName = r.Author.EmployerProfile != null ? r.Author.EmployerProfile.OrgName
                    : r.Author.ContractorProfile != null ? r.Author.ContractorProfile.BusinessName
                    : r.Author.Name,
                AuthorLabel = r.Author.EmployerProfile != null ? "Employer"
                    : r.Author.ContractorProfile != null ? "Contractor"
                    : "Hirer",
                Date = r.CreatedAt,
                Overall = r.Overall,
                Verified = r.JobId != null,
                Comment = r.Comment,
                Categories = r.CategoryScores.Select(c => new CategoryScoreDto { Category = c.Category, Score = c.Score }).ToList()
            }).ToListAsync();

        // Embedded: up to 3 other workers of the same trade.
        dto.Similar = await _db.Users
            .Where(u => u.WorkerProfile != null && u.Id != id && u.WorkerProfile!.Trade.Name == dto.Trade)
            .OrderByDescending(u => u.IsVerified)
            .ThenBy(u => u.Name)
            .Take(3)
            .ToSummary(_db)
            .ToListAsync();

        return dto;
    }
}
