namespace MazdoorSetu.Api.Common;

// Shared by worker-detail and employer-detail responses. `AuthorLabel` is the
// reviewer's role in context (e.g. "Worker · Plumber", "Employer"); `Verified`
// means the review is linked to a completed job. `Date` is ISO-8601 UTC.
public class ReviewDto
{
    public Guid Id { get; set; }
    public string AuthorName { get; set; } = "";
    public string AuthorLabel { get; set; } = "";
    public DateTime Date { get; set; }
    public int Overall { get; set; }
    public bool Verified { get; set; }
    public string Comment { get; set; } = "";
    public List<CategoryScoreDto> Categories { get; set; } = new();
}

public class CategoryScoreDto
{
    public string Category { get; set; } = "";
    public int Score { get; set; }
}
