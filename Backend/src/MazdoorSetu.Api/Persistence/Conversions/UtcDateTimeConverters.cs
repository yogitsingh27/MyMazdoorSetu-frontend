using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazdoorSetu.Api.Persistence.Conversions;

// Persist every DateTime as UTC and read it back with Kind=Utc, so the model
// never carries an ambiguous "was this local or UTC?" value. The frontend
// already emits UTC ISO strings, so writes are no-ops in practice.
public sealed class UtcDateTimeConverter : ValueConverter<DateTime, DateTime>
{
    public UtcDateTimeConverter()
        : base(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
    {
    }
}

public sealed class UtcNullableDateTimeConverter : ValueConverter<DateTime?, DateTime?>
{
    public UtcNullableDateTimeConverter()
        : base(
            v => v.HasValue ? v.Value.ToUniversalTime() : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v)
    {
    }
}
