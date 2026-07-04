using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Core.Entities;
using MazdoorSetu.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace MazdoorSetu.Api.Features.Applications;

public enum ApplicationWriteError
{
    None, JobNotFound, JobNotOpen, SelfApply, AlreadyApplied, NotFound, Forbidden, NotPending, JobCompleted
}

public class ApplicationWriteService
{
    private readonly AppDbContext _db;

    public ApplicationWriteService(AppDbContext db) => _db = db;

    // `created` is true for a brand-new application (→ 201) and false when a withdrawn
    // application is reactivated in place (→ 200).
    public async Task<(ApplicationWriteError error, MyApplicationDto? application, bool created)> ApplyAsync(Guid userId, string code)
    {
        var job = await _db.Jobs.FirstOrDefaultAsync(j => j.Code == code);
        if (job is null) return (ApplicationWriteError.JobNotFound, null, false);
        if (job.PostedById == userId) return (ApplicationWriteError.SelfApply, null, false);
        if (job.Status != JobStatus.Open) return (ApplicationWriteError.JobNotOpen, null, false);

        var existing = await _db.Applications.FirstOrDefaultAsync(a => a.JobId == job.Id && a.ApplicantId == userId);
        if (existing is not null)
        {
            // One application per (job, worker): reactivate a withdrawn one, else reject the duplicate.
            if (existing.Status != ApplicationStatus.Withdrawn)
                return (ApplicationWriteError.AlreadyApplied, null, false);

            existing.Status = ApplicationStatus.Pending;
            existing.AppliedAt = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.DecidedAt = null;
            await _db.SaveChangesAsync();
            return (ApplicationWriteError.None, await MineAsync(existing.Id), false);
        }

        var app = new Application
        {
            Id = Guid.NewGuid(),
            JobId = job.Id,
            ApplicantId = userId,
            Status = ApplicationStatus.Pending,
            AppliedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Applications.Add(app);
        await _db.SaveChangesAsync();
        return (ApplicationWriteError.None, await MineAsync(app.Id), true);
    }

    public async Task<(ApplicationWriteError error, MyApplicationDto? application)> WithdrawAsync(Guid userId, Guid appId)
    {
        var app = await _db.Applications.FirstOrDefaultAsync(a => a.Id == appId);
        if (app is null) return (ApplicationWriteError.NotFound, null);
        if (app.ApplicantId != userId) return (ApplicationWriteError.Forbidden, null);
        if (app.Status != ApplicationStatus.Pending) return (ApplicationWriteError.NotPending, null);

        app.Status = ApplicationStatus.Withdrawn;
        app.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return (ApplicationWriteError.None, await MineAsync(app.Id));
    }

    public async Task<(ApplicationWriteError error, ApplicantDto? application)> DecideAsync(Guid userId, Guid appId, bool accept)
    {
        var app = await _db.Applications.Include(a => a.Job).FirstOrDefaultAsync(a => a.Id == appId);
        if (app is null) return (ApplicationWriteError.NotFound, null);
        if (app.Job.PostedById != userId) return (ApplicationWriteError.Forbidden, null);
        // Cannot accept/reject applications once the job is Completed.
        if (app.Job.Status == JobStatus.Completed) return (ApplicationWriteError.JobCompleted, null);
        // Only a Pending application can be decided — this also blocks re-accepting an Accepted one.
        if (app.Status != ApplicationStatus.Pending) return (ApplicationWriteError.NotPending, null);

        app.Status = accept ? ApplicationStatus.Accepted : ApplicationStatus.Rejected;
        app.DecidedAt = DateTime.UtcNow;
        app.UpdatedAt = DateTime.UtcNow;
        // Decrement remaining openings on accept. Auto-closing the job when Openings reaches 0
        // is deliberately NOT done yet — see docs/JOB_WORKFLOW.md (Future Considerations).
        if (accept && app.Job.Openings > 0)
            app.Job.Openings -= 1;

        await _db.SaveChangesAsync();
        return (ApplicationWriteError.None, await ApplicantAsync(app.Id));
    }

    public async Task<List<MyApplicationDto>> GetMyApplicationsAsync(Guid userId) =>
        await _db.Applications.Where(a => a.ApplicantId == userId)
            .OrderByDescending(a => a.UpdatedAt)
            .ToMine()
            .ToListAsync();

    public async Task<(ApplicationWriteError error, List<ApplicantDto>? applicants)> GetJobApplicantsAsync(Guid userId, string code)
    {
        var job = await _db.Jobs.FirstOrDefaultAsync(j => j.Code == code);
        if (job is null) return (ApplicationWriteError.JobNotFound, null);
        if (job.PostedById != userId) return (ApplicationWriteError.Forbidden, null);

        var list = await _db.Applications.Where(a => a.JobId == job.Id)
            .OrderByDescending(a => a.AppliedAt)
            .ToApplicant(_db)
            .ToListAsync();
        return (ApplicationWriteError.None, list);
    }

    private async Task<MyApplicationDto> MineAsync(Guid id) =>
        await _db.Applications.Where(a => a.Id == id).ToMine().FirstAsync();

    private async Task<ApplicantDto> ApplicantAsync(Guid id) =>
        await _db.Applications.Where(a => a.Id == id).ToApplicant(_db).FirstAsync();
}
