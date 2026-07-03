using MazdoorSetu.Core.Enums;

namespace MazdoorSetu.Core.Entities;

public class Review
{
    public Guid Id { get; set; }
    public ReviewDirection Direction { get; set; }

    public Guid SubjectId { get; set; }
    public User Subject { get; set; } = null!;

    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public Guid? JobId { get; set; }
    public Job? Job { get; set; }

    public int Overall { get; set; }
    public string Comment { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public ICollection<ReviewCategoryScore> CategoryScores { get; set; } = new List<ReviewCategoryScore>();
}
