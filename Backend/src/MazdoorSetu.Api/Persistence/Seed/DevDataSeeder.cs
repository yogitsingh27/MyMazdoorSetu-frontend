using MazdoorSetu.Core.Entities;
using MazdoorSetu.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace MazdoorSetu.Api.Persistence.Seed;

// Development/demo data only. Idempotent: no-ops if any users already exist,
// so it is safe to run on every Development startup. Never runs in Production
// (gated in Program.cs). Reference data (Trades/Cities) is NOT seeded here —
// it comes from HasData; this seeder only references those fixed GUIDs.
public static class DevDataSeeder
{
    public static async Task<bool> SeedAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
            return false;

        var today = new DateTime(2026, 7, 3, 0, 0, 0, DateTimeKind.Utc);

        Guid Uid(string slug) => DeterministicGuid.For("user:" + slug);
        Guid Jid(string code) => DeterministicGuid.For("job:" + code);
        DateTime Ago(int days) => today.AddDays(-days);

        // ---------- Workers (single Worker role) ----------
        var workerDefs = new[]
        {
            new WorkerDef("u_anita", "Anita Devi", "96400-44120", "Delhi", "teal", ReferenceData.PainterId,
                new[] { "Interior", "Texture", "Putty" }, 6, Availability.Available, true, new[] { "Hindi" },
                new[] { "Interior painting, 3-room flat, Lajpat Nagar", "Texture wall finish, living room" }),
            new WorkerDef("u_suresh", "Suresh Yadav", "97700-88421", "Ghaziabad", "amber", ReferenceData.PlumberId,
                new[] { "Fitting", "Repair" }, 4, Availability.Booked, true, new[] { "Hindi" },
                System.Array.Empty<string>()),
            new WorkerDef("u_irfan", "Irfan Ali", "98111-22334", "Noida", "navy", ReferenceData.ElectricianId,
                new[] { "Wiring", "Panel fitting", "Repair" }, 7, Availability.Available, true, new[] { "Hindi", "Urdu" },
                new[] { "New wiring for a 3BHK flat, Sector 62", "Distribution board upgrade, shop complex" }),
            new WorkerDef("u_pooja", "Pooja Sharma", "98222-33445", "Delhi", "teal", ReferenceData.CarpenterId,
                new[] { "Modular", "Furniture", "Polishing" }, 5, Availability.Available, true, new[] { "Hindi" },
                new[] { "Modular kitchen installation, Dwarka", "Wardrobe fitting, 2BHK flat" }),
            new WorkerDef("u_deepak", "Deepak Verma", "98333-44556", "Gurugram", "amber", ReferenceData.SupervisorId,
                new[] { "Site coordination", "Team management", "Reporting" }, 10, Availability.Booked, true, new[] { "Hindi", "English" },
                new[] { "Residential tower site supervision, Sector 57" }),
            new WorkerDef("u_vikash", "Vikash Yadav", "98444-55667", "Ghaziabad", "navy", ReferenceData.WelderId,
                new[] { "Arc welding", "Fabrication" }, 4, Availability.Available, false, new[] { "Hindi" },
                new[] { "Gate and grill fabrication, residential complex" }),
            new WorkerDef("u_mahendra", "Mahendra Kumar", "98555-66778", "Delhi", "teal", ReferenceData.HelperId,
                new[] { "Material handling", "Site cleaning", "Loading" }, 2, Availability.Available, true, new[] { "Hindi" },
                System.Array.Empty<string>()),
            new WorkerDef("u_ritu", "Ritu Devi", "98666-77889", "Gurugram", "amber", ReferenceData.MasonId,
                new[] { "Plastering", "Tiling", "Brickwork" }, 8, Availability.Booked, true, new[] { "Hindi" },
                new[] { "Boundary wall construction, Sector 57", "Bathroom tiling, independent floor" }),
            new WorkerDef("u_sanjay", "Sanjay Kumar", "98777-88990", "Noida", "navy", ReferenceData.PlumberId,
                new[] { "Fitting", "Drainage" }, 3, Availability.Available, false, new[] { "Hindi" },
                System.Array.Empty<string>()),
            new WorkerDef("u_kavita", "Kavita Rani", "98888-99001", "Gurugram", "teal", ReferenceData.PainterId,
                new[] { "Interior", "Texture", "POP" }, 6, Availability.Available, true, new[] { "Hindi" },
                new[] { "Interior painting, 3BHK flat, Sector 45" }),
            new WorkerDef("u_ajay", "Ajay Singh", "98999-00112", "Ghaziabad", "amber", ReferenceData.CarpenterId,
                new[] { "Doors", "Furniture" }, 9, Availability.Booked, true, new[] { "Hindi" },
                new[] { "Custom door fitting, villa", "Office furniture installation" }),
            new WorkerDef("u_faisal", "Faisal Khan", "99000-11223", "Delhi", "navy", ReferenceData.ElectricianId,
                new[] { "Wiring", "Inverter setup" }, 5, Availability.Available, true, new[] { "Hindi", "Urdu" },
                new[] { "Inverter and wiring setup, independent house" }),
            new WorkerDef("u_sunil", "Sunil Kumar", "99011-22100", "Faridabad", "amber", ReferenceData.BarBenderId,
                new[] { "Rebar cutting", "Bar bending", "Steel fixing" }, 7, Availability.Available, true, new[] { "Hindi" },
                new[] { "Rebar fixing for slab, tower project, Faridabad" }),
            new WorkerDef("u_rekha", "Rekha Devi", "99022-33200", "Greater Noida", "teal", ReferenceData.TilerId,
                new[] { "Floor tiling", "Wall tiling", "Marble fitting" }, 6, Availability.Available, true, new[] { "Hindi" },
                new[] { "Floor tiling, 2BHK apartment, Greater Noida" }),
        };

        var users = new List<User>();

        foreach (var w in workerDefs)
        {
            var id = Uid(w.Slug);
            var u = new User { Id = id, Phone = w.Phone, Name = w.Name, City = w.City, AvatarColor = w.Color, IsVerified = w.Verified };
            u.Roles.Add(new UserRole { UserId = id, Role = Role.Worker });
            foreach (var lang in w.Langs) u.Languages.Add(new UserLanguage { UserId = id, Language = lang });

            var wp = new WorkerProfile { UserId = id, TradeId = w.Trade, ExperienceYears = w.Exp, Availability = w.Avail };
            foreach (var s in w.Skills) wp.Skills.Add(new WorkerSkill { WorkerProfileId = id, Skill = s });
            for (var i = 0; i < w.Portfolio.Length; i++)
                wp.Portfolio.Add(new PortfolioItem { Id = DeterministicGuid.For($"portfolio:{w.Slug}:{i}"), WorkerProfileId = id, Description = w.Portfolio[i] });
            u.WorkerProfile = wp;
            users.Add(u);
        }

        // ---------- Ramesh: Worker + Contractor (multi-role) ----------
        var rameshId = Uid("u_ramesh");
        var ramesh = new User { Id = rameshId, Phone = "98200-12233", Name = "Ramesh Kumar", City = "Delhi", AvatarColor = "amber", IsVerified = true };
        ramesh.Roles.Add(new UserRole { UserId = rameshId, Role = Role.Worker });
        ramesh.Roles.Add(new UserRole { UserId = rameshId, Role = Role.Contractor });
        ramesh.Languages.Add(new UserLanguage { UserId = rameshId, Language = "Hindi" });
        ramesh.Languages.Add(new UserLanguage { UserId = rameshId, Language = "English" });
        var rameshWp = new WorkerProfile { UserId = rameshId, TradeId = ReferenceData.MasonId, ExperienceYears = 9, Availability = Availability.Available };
        foreach (var s in new[] { "Plastering", "Brickwork", "Tiling" }) rameshWp.Skills.Add(new WorkerSkill { WorkerProfileId = rameshId, Skill = s });
        var rameshPortfolio = new[] { "Wall plastering, 2BHK flat, Dwarka", "Brickwork boundary wall, Rohini", "Tile fitting, bathroom renovation", "Concrete flooring, shop complex" };
        for (var i = 0; i < rameshPortfolio.Length; i++)
            rameshWp.Portfolio.Add(new PortfolioItem { Id = DeterministicGuid.For($"portfolio:u_ramesh:{i}"), WorkerProfileId = rameshId, Description = rameshPortfolio[i] });
        ramesh.WorkerProfile = rameshWp;
        ramesh.ContractorProfile = new ContractorProfile { UserId = rameshId, BusinessName = "Kumar Works", BusinessVerified = false };
        users.Add(ramesh);

        // ---------- Apex: Contractor + Employer (multi-role) ----------
        var apexId = Uid("u_apex");
        var apex = new User { Id = apexId, Phone = "98110-55000", Name = "Apex Builders", City = "Noida", AvatarColor = "navy", IsVerified = true };
        apex.Roles.Add(new UserRole { UserId = apexId, Role = Role.Contractor });
        apex.Roles.Add(new UserRole { UserId = apexId, Role = Role.Employer });
        apex.Languages.Add(new UserLanguage { UserId = apexId, Language = "Hindi" });
        apex.Languages.Add(new UserLanguage { UserId = apexId, Language = "English" });
        apex.ContractorProfile = new ContractorProfile { UserId = apexId, BusinessName = "Apex Builders Pvt Ltd", BusinessVerified = true };
        apex.EmployerProfile = new EmployerProfile { UserId = apexId, OrgName = "Apex Builders Pvt Ltd", Kind = EmployerKind.Builder, Tagline = "Residential and commercial builder in Noida — steady hiring across trades." };
        users.Add(apex);

        // ---------- Meena: Employer (homeowner) ----------
        var meenaId = Uid("u_meena");
        var meena = new User { Id = meenaId, Phone = "99100-30912", Name = "Meena Sharma", City = "Delhi", AvatarColor = "navy", IsVerified = true };
        meena.Roles.Add(new UserRole { UserId = meenaId, Role = Role.Employer });
        meena.Languages.Add(new UserLanguage { UserId = meenaId, Language = "Hindi" });
        meena.Languages.Add(new UserLanguage { UserId = meenaId, Language = "English" });
        meena.EmployerProfile = new EmployerProfile { UserId = meenaId, OrgName = "Sharma Residence", Kind = EmployerKind.Homeowner, Tagline = "Family home renovation in Dwarka — occasional skilled work, fair and direct." };
        users.Add(meena);

        // ---------- Grand Crown Hotel: Employer (hotel) ----------
        var grandId = Uid("u_grand");
        var grand = new User { Id = grandId, Phone = "98730-21000", Name = "Grand Crown Hotel", City = "Gurugram", AvatarColor = "teal", IsVerified = true };
        grand.Roles.Add(new UserRole { UserId = grandId, Role = Role.Employer });
        grand.Languages.Add(new UserLanguage { UserId = grandId, Language = "English" });
        grand.EmployerProfile = new EmployerProfile { UserId = grandId, OrgName = "Grand Crown Hotel", Kind = EmployerKind.Hotel, Tagline = "Mid-size hotel in Gurugram — regular maintenance and renovation work." };
        users.Add(grand);

        // ---------- Priya: Agent ----------
        var priyaId = Uid("u_priya");
        var priya = new User { Id = priyaId, Phone = "90040-77654", Name = "Priya Nair", City = "Delhi", AvatarColor = "amber", IsVerified = true };
        priya.Roles.Add(new UserRole { UserId = priyaId, Role = Role.Agent });
        foreach (var lang in new[] { "Hindi", "English", "Malayalam" }) priya.Languages.Add(new UserLanguage { UserId = priyaId, Language = lang });
        priya.AgentProfile = new AgentProfile { UserId = priyaId, CoverageArea = "West & South Delhi" };
        users.Add(priya);

        // ---------- Admin ----------
        var adminId = Uid("u_admin");
        var admin = new User { Id = adminId, Phone = "90000-00001", Name = "Platform Admin", City = "Delhi", AvatarColor = "navy", IsVerified = true };
        admin.Roles.Add(new UserRole { UserId = adminId, Role = Role.Admin });
        admin.Languages.Add(new UserLanguage { UserId = adminId, Language = "English" });
        users.Add(admin);

        // ---------- Jobs ----------
        var jobDefs = new[]
        {
            // Completed (anchor reviews)
            new JobDef("JOB-2204", "Tile fitting, bathroom", ReferenceData.MasonId, "₹3,500 fixed", "Rohini, Delhi", "5 days",
                "Tile fitting for a single bathroom — tiles and adhesive already purchased, fitting and grouting needed.",
                JobStatus.Completed, 1, "u_apex", Role.Employer, new[] { "Tools provided" }, new[] { "Experience with bathroom tile fitting", "Own tile cutter" }, 20),
            new JobDef("JOB-2276", "Interior painting, 3 rooms", ReferenceData.PainterId, "₹600–750/day", "Sector 29, Gurugram", "4 days",
                "Interior painting for 3 rooms in a hotel guest wing — two coats plus minor putty work before painting.",
                JobStatus.Completed, 2, "u_grand", Role.Employer, new[] { "Meals included" }, new[] { "Experience with interior wall painting", "Own brushes and rollers" }, 18),
            new JobDef("JOB-2150", "Bathroom leak repair, residence", ReferenceData.PlumberId, "₹2,000 fixed", "Dwarka, Delhi", "1 day",
                "Diagnose and fix a persistent bathroom water leak in a family residence.",
                JobStatus.Completed, 1, "u_meena", Role.Employer, System.Array.Empty<string>(), new[] { "Same-day availability" }, 24),
            // Closed
            new JobDef("JOB-2200", "Debris clearing, completed site", ReferenceData.HelperId, "₹550–650/day", "Sector 29, Gurugram", "3 days",
                "Clear construction debris and clean up a finished renovation site.",
                JobStatus.Closed, 2, "u_grand", Role.Employer, System.Array.Empty<string>(), new[] { "Physically fit for manual work" }, 30),
            // Open
            new JobDef("JOB-2291", "Wall plastering, 2BHK flat", ReferenceData.MasonId, "₹700–900/day", "Dwarka Sector 12, Delhi", "5 days",
                "Plastering and finishing for a 2BHK flat under renovation — 4 rooms plus one bathroom.",
                JobStatus.Open, 2, "u_meena", Role.Employer, new[] { "Meals included", "Tools provided" }, new[] { "2+ years of plastering experience", "Own basic hand tools" }, 4),
            new JobDef("JOB-2288", "Electrical rewiring, shop complex", ReferenceData.ElectricianId, "₹900–1100/day", "Karol Bagh, Delhi", "3 days",
                "Full rewiring of a 3-shop commercial complex with new copper wiring and updated distribution boards.",
                JobStatus.Open, 3, "u_ramesh", Role.Contractor, new[] { "Direct contact" }, new[] { "Licensed electrician preferred", "Own multimeter and basic tools" }, 3),
            new JobDef("JOB-2280", "Site supervisor, residential tower", ReferenceData.SupervisorId, "₹18,000–22,000/mo", "Sector 62, Noida", "3 months",
                "Supervise daily site activity for a residential tower — coordinate crews, track materials, report progress.",
                JobStatus.Open, 1, "u_apex", Role.Contractor, new[] { "Long term" }, new[] { "3+ years supervising construction sites", "Own smartphone for site updates" }, 8),
            new JobDef("JOB-2295", "Bathroom fitting, new flat", ReferenceData.PlumberId, "₹800–1000/day", "Sector 45, Gurugram", "4 days",
                "Complete bathroom plumbing fit-out for a new-construction flat — pipe fitting, fixtures, pressure testing.",
                JobStatus.Open, 1, "u_apex", Role.Contractor, new[] { "Tools provided" }, new[] { "3+ years plumbing experience", "Familiar with CPVC fitting" }, 6),
            new JobDef("JOB-2299", "Modular kitchen installation", ReferenceData.CarpenterId, "₹900–1200/day", "Vaishali, Ghaziabad", "6 days",
                "Installation of a pre-fabricated modular kitchen — carcass assembly, shutter fitting, hardware.",
                JobStatus.Open, 2, "u_meena", Role.Employer, new[] { "Meals included" }, new[] { "Experience with modular kitchen installation", "Own power tools" }, 7),
            new JobDef("JOB-2305", "Gate and grill welding", ReferenceData.WelderId, "₹1000–1300/day", "Sector 62, Noida", "5 days",
                "Fabrication and installation of iron gates and window grills for a residential complex.",
                JobStatus.Open, 2, "u_apex", Role.Contractor, new[] { "Tools provided", "Direct contact" }, new[] { "Experience with arc welding", "Own welding mask and gloves" }, 9),
            new JobDef("JOB-2308", "General site helper", ReferenceData.HelperId, "₹500–600/day", "Dwarka Sector 21, Delhi", "10 days",
                "General labour support on an active site — carrying material, mixing cement, assisting skilled workers.",
                JobStatus.Open, 4, "u_ramesh", Role.Contractor, new[] { "Meals included" }, new[] { "No prior experience required", "Physically fit for manual work" }, 3),
            new JobDef("JOB-2312", "Boundary wall construction", ReferenceData.MasonId, "₹700–850/day", "Sector 57, Gurugram", "8 days",
                "Construction of a boundary wall for a plot — brickwork, plastering, and finishing.",
                JobStatus.Open, 3, "u_grand", Role.Employer, new[] { "Tools provided" }, new[] { "Experience with brickwork", "Own trowels and levels" }, 5),
            new JobDef("JOB-2315", "New wiring, 3BHK flat", ReferenceData.ElectricianId, "₹850–1000/day", "Kavi Nagar, Ghaziabad", "4 days",
                "Complete electrical wiring for a new 3BHK flat — conduit laying, wiring, switchboard installation.",
                JobStatus.Open, 1, "u_meena", Role.Employer, new[] { "Direct contact" }, new[] { "Licensed electrician preferred", "Own wiring tools" }, 6),
            new JobDef("JOB-2318", "Exterior painting, villa", ReferenceData.PainterId, "₹650–800/day", "Sector 50, Noida", "6 days",
                "Exterior wall painting for an independent villa — surface prep, primer, weatherproof top coat.",
                JobStatus.Open, 2, "u_apex", Role.Contractor, new[] { "Tools provided" }, new[] { "Experience with weatherproof paints", "Comfortable on scaffolding" }, 10),
            new JobDef("JOB-2330", "Steel reinforcement, tower slab", ReferenceData.BarBenderId, "₹800–1000/day", "Sector 15, Faridabad", "7 days",
                "Rebar cutting, bending, and fixing for a tower slab pour on an active project.",
                JobStatus.Open, 3, "u_apex", Role.Contractor, new[] { "Long term" }, new[] { "Rebar fixing experience", "Can read basic bar bending schedules" }, 5),
            new JobDef("JOB-2333", "Floor tiling, apartment", ReferenceData.TilerId, "₹850–1050/day", "Pari Chowk, Greater Noida", "5 days",
                "Floor and wall tiling for a 2BHK apartment — tiles supplied, fitting and grouting needed.",
                JobStatus.Open, 2, "u_grand", Role.Employer, new[] { "Tools provided" }, new[] { "Floor and wall tiling experience", "Own tile cutter" }, 4),
        };

        var jobs = new List<Job>();
        foreach (var j in jobDefs)
        {
            var jid = Jid(j.Code);
            var job = new Job
            {
                Id = jid, Code = j.Code, Title = j.Title, TradeId = j.Trade, Wage = j.Wage,
                Location = j.Location, Duration = j.Duration, Description = j.Description,
                Status = j.Status, Openings = j.Openings, PostedById = Uid(j.Poster),
                PostedByRole = j.Role, PostedAt = Ago(j.Days),
            };
            foreach (var t in j.Tags) job.Tags.Add(new JobTag { JobId = jid, Tag = t });
            for (var i = 0; i < j.Reqs.Length; i++)
                job.Requirements.Add(new JobRequirement { Id = DeterministicGuid.For($"req:{j.Code}:{i}"), JobId = jid, Text = j.Reqs[i] });
            jobs.Add(job);
        }

        // ---------- Applications (all four statuses) ----------
        Application App(string jobCode, string applicant, ApplicationStatus status, int appliedDays, int? decidedDays, int updatedDays) => new()
        {
            Id = DeterministicGuid.For($"app:{jobCode}:{applicant}"),
            JobId = Jid(jobCode),
            ApplicantId = Uid(applicant),
            Status = status,
            AppliedAt = Ago(appliedDays),
            DecidedAt = decidedDays.HasValue ? Ago(decidedDays.Value) : null,
            UpdatedAt = Ago(updatedDays),
        };

        var applications = new List<Application>
        {
            // Accepted on the completed jobs (drive derived "jobs done")
            App("JOB-2204", "u_ramesh", ApplicationStatus.Accepted, 22, 21, 21),
            App("JOB-2276", "u_anita", ApplicationStatus.Accepted, 20, 19, 19),
            App("JOB-2150", "u_suresh", ApplicationStatus.Accepted, 26, 25, 25),
            // Pending
            App("JOB-2288", "u_irfan", ApplicationStatus.Pending, 2, null, 2),
            App("JOB-2299", "u_pooja", ApplicationStatus.Pending, 5, null, 5),
            App("JOB-2295", "u_sanjay", ApplicationStatus.Pending, 4, null, 4),
            App("JOB-2312", "u_ritu", ApplicationStatus.Pending, 4, null, 4),
            // Accepted on an open job (accepted but work not completed)
            App("JOB-2291", "u_ritu", ApplicationStatus.Accepted, 3, 2, 2),
            // Rejected
            App("JOB-2318", "u_kavita", ApplicationStatus.Rejected, 8, 7, 7),
            // Withdrawn
            App("JOB-2315", "u_faisal", ApplicationStatus.Withdrawn, 6, null, 5),
        };

        // ---------- Reviews ----------
        Review Review(string key, ReviewDirection dir, string author, string subject, string? jobCode, int overall, string comment, int createdDays, (string Cat, int Score)[] cats)
        {
            var rid = DeterministicGuid.For("review:" + key);
            var r = new Review
            {
                Id = rid, Direction = dir, AuthorId = Uid(author), SubjectId = Uid(subject),
                JobId = jobCode is null ? null : Jid(jobCode), Overall = overall, Comment = comment, CreatedAt = Ago(createdDays),
            };
            foreach (var c in cats) r.CategoryScores.Add(new ReviewCategoryScore { ReviewId = rid, Category = c.Cat, Score = c.Score });
            return r;
        }

        (string, int)[] Hirer(int pay, int safety, int comm, int fair) => new[] { ("Payment reliability", pay), ("Site safety", safety), ("Communication", comm), ("Fair treatment", fair) };
        (string, int)[] Worker(int quality, int punct, int comm, int safety) => new[] { ("Work quality", quality), ("Punctuality", punct), ("Communication", comm), ("Safety compliance", safety) };

        var reviews = new List<Review>
        {
            // JOB-2204: Ramesh <-> Apex (employer)
            Review("2204-w2h", ReviewDirection.WorkerToHirer, "u_ramesh", "u_apex", "JOB-2204", 5, "Paid on time and the site was well organised.", 19, Hirer(5, 5, 4, 5)),
            Review("2204-h2w", ReviewDirection.HirerToWorker, "u_apex", "u_ramesh", "JOB-2204", 5, "Solid tiling work, finished a day early and cleaned up.", 19, Worker(5, 5, 4, 5)),
            // JOB-2276: Anita <-> Grand
            Review("2276-w2h", ReviewDirection.WorkerToHirer, "u_anita", "u_grand", "JOB-2276", 5, "Clear instructions and prompt payment.", 17, Hirer(5, 5, 4, 5)),
            Review("2276-h2w", ReviewDirection.HirerToWorker, "u_grand", "u_anita", "JOB-2276", 5, "Very neat painting, covered furniture properly.", 17, Worker(5, 5, 5, 5)),
            // JOB-2150: Suresh <-> Meena
            Review("2150-w2h", ReviewDirection.WorkerToHirer, "u_suresh", "u_meena", "JOB-2150", 4, "Fair and respectful; payment a day late but informed in advance.", 23, Hirer(4, 4, 5, 4)),
            Review("2150-h2w", ReviewDirection.HirerToWorker, "u_meena", "u_suresh", "JOB-2150", 4, "Fixed the leak quickly and explained the issue clearly.", 23, Worker(4, 4, 5, 4)),
            // Unverified (no linked job)
            Review("ritu-informal", ReviewDirection.HirerToWorker, "u_grand", "u_ritu", null, 5, "Reliable mason from an earlier project.", 40, Worker(5, 4, 4, 5)),
            Review("deepak-informal", ReviewDirection.WorkerToHirer, "u_deepak", "u_apex", null, 4, "Well-run sites with good safety standards.", 45, Hirer(4, 5, 4, 4)),
        };

        // ---------- Verification records (verified users only) ----------
        var verifications = new List<VerificationRecord>();
        var vi = 0;
        foreach (var u in users.Where(x => x.IsVerified))
        {
            var docType = (vi % 3) switch { 0 => DocumentType.Aadhaar, 1 => DocumentType.VoterId, _ => DocumentType.Pan };
            // Placeholder 64-char hash — NOT a real KYC hash; no cryptography here.
            var hash = u.Id.ToString("N") + DeterministicGuid.For("kyc:" + u.Id).ToString("N");
            verifications.Add(new VerificationRecord
            {
                Id = DeterministicGuid.For("verif:" + u.Id),
                UserId = u.Id,
                DocumentType = docType,
                Status = VerificationStatus.Verified,
                DocumentHash = hash,
                VerifiedAt = Ago(60),
            });
            vi++;
        }

        db.Users.AddRange(users);
        db.Jobs.AddRange(jobs);
        db.Applications.AddRange(applications);
        db.Reviews.AddRange(reviews);
        db.VerificationRecords.AddRange(verifications);

        await db.SaveChangesAsync();
        return true;
    }

    private sealed record WorkerDef(
        string Slug, string Name, string Phone, string City, string Color, Guid Trade,
        string[] Skills, int Exp, Availability Avail, bool Verified, string[] Langs, string[] Portfolio);

    private sealed record JobDef(
        string Code, string Title, Guid Trade, string Wage, string Location, string Duration, string Description,
        JobStatus Status, int Openings, string Poster, Role Role, string[] Tags, string[] Reqs, int Days);
}
