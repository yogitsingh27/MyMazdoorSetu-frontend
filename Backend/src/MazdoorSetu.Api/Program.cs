using System.Text.Json;
using System.Text.Json.Serialization;
using MazdoorSetu.Api.Features.Employers;
using MazdoorSetu.Api.Features.Jobs;
using MazdoorSetu.Api.Features.Workers;
using MazdoorSetu.Api.Persistence;
using MazdoorSetu.Api.Persistence.Seed;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
    // Serialize enums as the frontend's lowercase strings ("employer", "open", "available").
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddProblemDetails();

const string FrontendCors = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCors, policy =>
        policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddScoped<JobReadService>();
builder.Services.AddScoped<WorkerReadService>();
builder.Services.AddScoped<EmployerReadService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Development-only, idempotent demo seeding.
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var seeded = await DevDataSeeder.SeedAsync(db);
    app.Logger.LogInformation(seeded
        ? "Development seed data applied."
        : "Development seed data already present — skipped.");
}

app.UseCors(FrontendCors);

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
