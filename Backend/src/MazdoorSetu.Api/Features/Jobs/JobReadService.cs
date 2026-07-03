using MazdoorSetu.Api.Common;
using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace MazdoorSetu.Api.Features.Jobs;

public class JobReadService
{
    private readonly AppDbContext _db;

    public JobReadService(AppDbContext db) => _db = db;

    public async Task<PagedResult<JobSummaryDto>> BrowseAsync(string? q, string? trade, string? city, int page, int pageSize)
    {
        // Public browse shows only open jobs.
        var query = _db.Jobs.Where(j => j.Status == JobStatus.Open);

        if (!string.IsNullOrWhiteSpace(trade))
            query = query.Where(j => j.Trade.Name == trade);
        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(j => j.Location.Contains(city));
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(j =>
                j.Title.Contains(q) || j.Description.Contains(q) || j.Location.Contains(q) ||
                j.Trade.Name.Contains(q) || j.Wage.Contains(q) || j.Tags.Any(t => t.Tag.Contains(q)));

        var ordered = query.OrderByDescending(j => j.PostedAt).ThenBy(j => j.Code);
        var total = await ordered.CountAsync();
        var items = await ordered.Skip((page - 1) * pageSize).Take(pageSize).ToSummary(_db).ToListAsync();
        return new PagedResult<JobSummaryDto>(items, page, pageSize, total);
    }

    public async Task<JobDetailDto?> GetDetailAsync(string code)
    {
        var dto = await _db.Jobs.Where(j => j.Code == code).Select(job => new JobDetailDto
        {
            Code = job.Code,
            Title = job.Title,
            Trade = job.Trade.Name,
            Wage = job.Wage,
            Location = job.Location,
            Duration = job.Duration,
            Description = job.Description,
            Status = job.Status,
            Openings = job.Openings,
            PostedAt = job.PostedAt,
            Requirements = job.Requirements.Select(r => r.Text).ToList(),
            Tags = job.Tags.Select(t => t.Tag).ToList(),
            Poster = new PosterDto
            {
                Id = job.PostedById,
                DisplayName =
                    job.PostedByRole == Role.Employer && job.PostedBy.EmployerProfile != null ? job.PostedBy.EmployerProfile.OrgName
                    : job.PostedByRole == Role.Contractor && job.PostedBy.ContractorProfile != null ? job.PostedBy.ContractorProfile.BusinessName
                    : job.PostedBy.Name,
                Role = job.PostedByRole,
                Kind = job.PostedBy.EmployerProfile != null ? (EmployerKind?)job.PostedBy.EmployerProfile.Kind : null,
                Verified = job.PostedBy.IsVerified,
                AvatarColor = job.PostedBy.AvatarColor,
                Rating = Math.Round(
                    _db.Reviews.Where(r => r.SubjectId == job.PostedById && r.Direction == ReviewDirection.WorkerToHirer)
                        .Select(r => (double?)r.Overall).Average() ?? 0d, 1),
                ReviewCount = _db.Reviews.Count(r => r.SubjectId == job.PostedById && r.Direction == ReviewDirection.WorkerToHirer)
            }
        }).FirstOrDefaultAsync();

        if (dto is null)
            return null;

        // Embedded: up to 3 other open jobs of the same trade.
        dto.Similar = await _db.Jobs
            .Where(j => j.Status == JobStatus.Open && j.Code != code && j.Trade.Name == dto.Trade)
            .OrderByDescending(j => j.PostedAt)
            .Take(3)
            .ToSummary(_db)
            .ToListAsync();

        return dto;
    }
}
