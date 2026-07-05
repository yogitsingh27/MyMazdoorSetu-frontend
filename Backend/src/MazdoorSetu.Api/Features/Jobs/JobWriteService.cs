using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Core.Entities;
using MazdoorSetu.Core.Enums;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace MazdoorSetu.Api.Features.Jobs;

public enum JobWriteError { None, NotFound, Forbidden, InvalidTransition, TradeUnknown }

public class JobWriteService
{
    private readonly AppDbContext _db;

    public JobWriteService(AppDbContext db) => _db = db;

    public async Task<(JobWriteError error, JobDto? job)> CreateAsync(Guid userId, CreateJobRequest req)
    {
        var trade = await _db.Trades.FirstOrDefaultAsync(t => t.Name == req.Trade);
        if (trade is null)
            return (JobWriteError.TradeUnknown, null);

        var job = new Job
        {
            Id = Guid.NewGuid(),
            Title = req.Title.Trim(),
            TradeId = trade.Id,
            Wage = req.Wage.Trim(),
            Location = req.Location.Trim(),
            Duration = req.Duration.Trim(),
            Description = req.Description.Trim(),
            Status = JobStatus.Open,
            Openings = req.Openings,
            PostedById = userId,
            PostedByRole = req.PostedAsRole,
            PostedAt = DateTime.UtcNow,
        };
        foreach (var tag in (req.Tags ?? new()).Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).Distinct())
            job.Tags.Add(new JobTag { JobId = job.Id, Tag = tag });
        foreach (var text in (req.Requirements ?? new()).Where(x => !string.IsNullOrWhiteSpace(x)))
            job.Requirements.Add(new JobRequirement { Id = Guid.NewGuid(), JobId = job.Id, Text = text.Trim() });

        _db.Jobs.Add(job);

        // The code is derived from the current max suffix, so two concurrent creates can
        // pick the same value. The unique index on Job.Code is the integrity backstop; on a
        // duplicate-key violation (and ONLY that) we recompute — GenerateCodeAsync now sees
        // the winner — and retry. Any other DbUpdateException propagates immediately.
        const int maxAttempts = 5;
        for (var attempt = 1; ; attempt++)
        {
            job.Code = await GenerateCodeAsync();
            try
            {
                await _db.SaveChangesAsync();
                break;
            }
            catch (DbUpdateException ex) when (attempt < maxAttempts && IsDuplicateKeyViolation(ex))
            {
                // Duplicate Job.Code from a concurrent create — recompute and retry.
            }
        }

        return (JobWriteError.None, await MapAsync(job.Id));
    }

    public async Task<(JobWriteError error, JobDto? job)> CloseAsync(Guid userId, string code)
    {
        var job = await _db.Jobs.FirstOrDefaultAsync(j => j.Code == code);
        if (job is null) return (JobWriteError.NotFound, null);
        if (job.PostedById != userId) return (JobWriteError.Forbidden, null);
        if (job.Status != JobStatus.Open) return (JobWriteError.InvalidTransition, null); // only Open -> Closed
        job.Status = JobStatus.Closed;
        await _db.SaveChangesAsync();
        return (JobWriteError.None, await MapAsync(job.Id));
    }

    public async Task<(JobWriteError error, JobDto? job)> CompleteAsync(Guid userId, string code)
    {
        var job = await _db.Jobs.FirstOrDefaultAsync(j => j.Code == code);
        if (job is null) return (JobWriteError.NotFound, null);
        if (job.PostedById != userId) return (JobWriteError.Forbidden, null);
        // A job must be Closed before it can be Completed — Completed means work actually finished.
        if (job.Status != JobStatus.Closed) return (JobWriteError.InvalidTransition, null);
        job.Status = JobStatus.Completed;
        await _db.SaveChangesAsync();
        return (JobWriteError.None, await MapAsync(job.Id));
    }

    public async Task<List<PostedJobDto>> GetPostedJobsAsync(Guid userId) =>
        await _db.Jobs.Where(j => j.PostedById == userId)
            .OrderByDescending(j => j.PostedAt)
            .Select(j => new PostedJobDto
            {
                Code = j.Code,
                Title = j.Title,
                Trade = j.Trade.Name,
                Status = j.Status,
                Openings = j.Openings,
                PostedByRole = j.PostedByRole,
                PostedAt = j.PostedAt,
                ApplicationCount = _db.Applications.Count(a => a.JobId == j.Id),
                PendingCount = _db.Applications.Count(a => a.JobId == j.Id && a.Status == ApplicationStatus.Pending),
            }).ToListAsync();

    private async Task<JobDto> MapAsync(Guid id) =>
        await _db.Jobs.Where(j => j.Id == id).Select(j => new JobDto
        {
            Code = j.Code,
            Title = j.Title,
            Trade = j.Trade.Name,
            Wage = j.Wage,
            Location = j.Location,
            Duration = j.Duration,
            Description = j.Description,
            Status = j.Status,
            Openings = j.Openings,
            PostedByRole = j.PostedByRole,
            PostedAt = j.PostedAt,
            Tags = j.Tags.Select(t => t.Tag).ToList(),
            Requirements = j.Requirements.Select(r => r.Text).ToList(),
        }).FirstAsync();

    // SQL Server duplicate-key errors: 2627 (unique constraint) / 2601 (unique index).
    // Job.Code is the only unique index a create can trip, so this scopes the retry to the
    // code collision and lets every other DbUpdateException surface.
    private static bool IsDuplicateKeyViolation(DbUpdateException ex) =>
        ex.InnerException is SqlException sql && (sql.Number == 2601 || sql.Number == 2627);

    // "JOB-NNNN" from the current max numeric suffix; the unique index on Code is the safety net.
    private async Task<string> GenerateCodeAsync()
    {
        var max = 2200;
        foreach (var c in await _db.Jobs.Select(j => j.Code).ToListAsync())
        {
            var parts = c.Split('-');
            if (parts.Length == 2 && int.TryParse(parts[1], out var n) && n > max) max = n;
        }
        return $"JOB-{max + 1}";
    }
}
