namespace backend.Data;

using Dapper;
using Microsoft.Data.Sqlite;
using System.Data;

public class DataDbContext(
    IConfiguration configuration,
    ILogger<DataDbContext> logger)
{
    public IDbConnection CreateConnection()
        => new SqliteConnection(configuration.GetConnectionString("Db"));

    public void Init()
    {
        using var con = CreateConnection();

        const string sql =
        """
          CREATE TABLE IF NOT EXISTS Todo (
                id TEXT,
                name TEXT NOT NULL,
                done BOOLEAN NOT NULL
            )
        """;

        var result = con.Execute(sql);
        if (result == 0)
        {
            logger.LogInformation("No changes applied");
        }
        else
        {

            logger.LogInformation("Changes applied: {count}", result);
        }
    }
}
