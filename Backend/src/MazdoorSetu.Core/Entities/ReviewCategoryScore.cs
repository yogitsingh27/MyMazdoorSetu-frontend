namespace MazdoorSetu.Core.Entities;

public class ReviewCategoryScore
{
    public Guid ReviewId { get; set; }
    public Review Review { get; set; } = null!;
    public string Category { get; set; } = null!;
    public int Score { get; set; }
}
