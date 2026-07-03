namespace MazdoorSetu.Core.Entities;

public class JobTag
{
    public Guid JobId { get; set; }
    public Job Job { get; set; } = null!;
    public string Tag { get; set; } = null!;
}
