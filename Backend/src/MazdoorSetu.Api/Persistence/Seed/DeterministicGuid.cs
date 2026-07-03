using System.Security.Cryptography;
using System.Text;

namespace MazdoorSetu.Api.Persistence.Seed;

// Produces a stable GUID from a logical name, so demo entities keep the same
// id across database resets (useful for Phase 1 tests and demo logins). This
// is an id-derivation utility only — NOT security or KYC hashing.
public static class DeterministicGuid
{
    private const string Namespace = "mazdoorsetu-dev-seed";

    public static Guid For(string name)
    {
        var bytes = MD5.HashData(Encoding.UTF8.GetBytes(Namespace + ":" + name));
        return new Guid(bytes);
    }
}
