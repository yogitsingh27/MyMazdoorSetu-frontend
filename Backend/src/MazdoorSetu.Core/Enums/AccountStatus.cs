namespace MazdoorSetu.Core.Enums;

public enum AccountStatus
{
    // Active is the zero-value so it coincides with both the CLR default and the
    // DB default — an unset Status safely means Active, and Pending (future OTP)
    // is only ever stored when set explicitly.
    Active,    // may authenticate
    Pending,   // reserved for future OTP verification (not verified yet)
    Blocked,   // suspended by moderation — cannot authenticate
    Disabled   // deactivated (self or admin) — cannot authenticate
}
