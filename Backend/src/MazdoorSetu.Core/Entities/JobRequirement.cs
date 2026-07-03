namespace MazdoorSetu.Core.Entities;

public class JobRequirement
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;
    public string Text { get; set; } = null!;
}
