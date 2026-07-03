using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MazdoorSetu.Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedReferenceData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Cities",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), "Delhi" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), "Noida" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), "Greater Noida" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), "Gurugram" },
                    { new Guid("20000000-0000-0000-0000-000000000005"), "Ghaziabad" },
                    { new Guid("20000000-0000-0000-0000-000000000006"), "Faridabad" }
                });

            migrationBuilder.InsertData(
                table: "Trades",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "Mason" },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "Painter" },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "Electrician" },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "Plumber" },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "Carpenter" },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "Supervisor" },
                    { new Guid("10000000-0000-0000-0000-000000000007"), "Welder" },
                    { new Guid("10000000-0000-0000-0000-000000000008"), "Helper" },
                    { new Guid("10000000-0000-0000-0000-000000000009"), "Bar Bender" },
                    { new Guid("10000000-0000-0000-0000-00000000000a"), "Tiler" },
                    { new Guid("10000000-0000-0000-0000-00000000000b"), "Fabricator" },
                    { new Guid("10000000-0000-0000-0000-00000000000c"), "POP Worker" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Cities",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-00000000000a"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-00000000000b"));

            migrationBuilder.DeleteData(
                table: "Trades",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-00000000000c"));
        }
    }
}
