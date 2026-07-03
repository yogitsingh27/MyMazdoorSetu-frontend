using MazdoorSetu.Core.Entities;

namespace MazdoorSetu.Api.Persistence.Seed;

// Permanent reference vocabulary — seeded into every environment via HasData
// (see TradeConfiguration / CityConfiguration). Fixed literal GUIDs are required
// because HasData bakes the values into a migration; they must never change.
// The same GUID constants are reused by DevDataSeeder for worker/job trade FKs.
public static class ReferenceData
{
    // --- Trades ---
    public static readonly Guid MasonId       = new("10000000-0000-0000-0000-000000000001");
    public static readonly Guid PainterId     = new("10000000-0000-0000-0000-000000000002");
    public static readonly Guid ElectricianId = new("10000000-0000-0000-0000-000000000003");
    public static readonly Guid PlumberId     = new("10000000-0000-0000-0000-000000000004");
    public static readonly Guid CarpenterId   = new("10000000-0000-0000-0000-000000000005");
    public static readonly Guid SupervisorId  = new("10000000-0000-0000-0000-000000000006");
    public static readonly Guid WelderId       = new("10000000-0000-0000-0000-000000000007");
    public static readonly Guid HelperId       = new("10000000-0000-0000-0000-000000000008");
    public static readonly Guid BarBenderId    = new("10000000-0000-0000-0000-000000000009");
    public static readonly Guid TilerId        = new("10000000-0000-0000-0000-00000000000a");
    public static readonly Guid FabricatorId   = new("10000000-0000-0000-0000-00000000000b");
    public static readonly Guid PopWorkerId    = new("10000000-0000-0000-0000-00000000000c");

    // --- Cities ---
    public static readonly Guid DelhiId        = new("20000000-0000-0000-0000-000000000001");
    public static readonly Guid NoidaId        = new("20000000-0000-0000-0000-000000000002");
    public static readonly Guid GreaterNoidaId = new("20000000-0000-0000-0000-000000000003");
    public static readonly Guid GurugramId     = new("20000000-0000-0000-0000-000000000004");
    public static readonly Guid GhaziabadId    = new("20000000-0000-0000-0000-000000000005");
    public static readonly Guid FaridabadId    = new("20000000-0000-0000-0000-000000000006");

    public static readonly Trade[] Trades =
    {
        new() { Id = MasonId, Name = "Mason" },
        new() { Id = PainterId, Name = "Painter" },
        new() { Id = ElectricianId, Name = "Electrician" },
        new() { Id = PlumberId, Name = "Plumber" },
        new() { Id = CarpenterId, Name = "Carpenter" },
        new() { Id = SupervisorId, Name = "Supervisor" },
        new() { Id = WelderId, Name = "Welder" },
        new() { Id = HelperId, Name = "Helper" },
        new() { Id = BarBenderId, Name = "Bar Bender" },
        new() { Id = TilerId, Name = "Tiler" },
        new() { Id = FabricatorId, Name = "Fabricator" },
        new() { Id = PopWorkerId, Name = "POP Worker" },
    };

    public static readonly City[] Cities =
    {
        new() { Id = DelhiId, Name = "Delhi" },
        new() { Id = NoidaId, Name = "Noida" },
        new() { Id = GreaterNoidaId, Name = "Greater Noida" },
        new() { Id = GurugramId, Name = "Gurugram" },
        new() { Id = GhaziabadId, Name = "Ghaziabad" },
        new() { Id = FaridabadId, Name = "Faridabad" },
    };
}
