namespace backend.Data;

using ErrorOr;
using Microsoft.Data.Sqlite;

public class TodoRepository
{
    public ErrorOr<Success> Insert(Todo todo)
    {
        try
        {
            using SqliteConnection con = GetConnection();

            var cmd = con.CreateCommand();

            cmd.CommandText =
            """
            CREATE TABLE IF NOT EXISTS Todo (
                id TEXT,
                name TEXT NOT NULL,
                done BOOLEAN NOT NULL
            )
            """;

            cmd.ExecuteNonQuery();


            cmd.CommandText = "INSERT INTO Todo (id, name, done) Values ($id, $name, $done)";

            cmd.Parameters.AddWithValue("$id", todo.Id);
            cmd.Parameters.AddWithValue("$name", todo.Name);
            cmd.Parameters.AddWithValue("done", todo.Done);

            cmd.ExecuteNonQuery();

            return new Success();
        }
        catch (Exception)
        {
            return new Error();
        }
    }

    public ErrorOr<Todo> Retrieve(string id)
    {
        using SqliteConnection con = GetConnection();

        var cmd = con.CreateCommand();

        cmd.CommandText =
        """
            SELECT 
                id,
                name,
                done 
            FROM 
                Todo
            WHERE
                id = $id
        """;

        cmd.Parameters.AddWithValue("$id", id);


        string? idResult = null!;
        string? nameResult = null!;
        bool? doneResult = null!;

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            idResult = reader.GetString(0);
            nameResult = reader.GetString(1);
            doneResult = reader.GetBoolean(2);
        }

        if (idResult is null)
        {
            return Error.NotFound();
        }

        Todo todo = new(id, nameResult, doneResult.GetValueOrDefault());

        return todo;
    }

    public List<Todo> List()
    {
        using SqliteConnection con = GetConnection();

        var cmd = con.CreateCommand();

        cmd.CommandText =
        """
            SELECT 
                id,
                name,
                done 
            FROM 
                Todo
        """;

        using var reader = cmd.ExecuteReader();

        List<Todo> todos = [];
        while (reader.Read())
        {
            string idResult = reader.GetString(0);
            string nameResult = reader.GetString(1);
            bool doneResult = reader.GetBoolean(2);

            todos.Add(new(idResult, nameResult, doneResult));
        }

        return todos;
    }

    private static SqliteConnection GetConnection()
    {
        var con = new SqliteConnection("Data Source=TodoDb.db");

        con.Open();

        return con;
    }

    public ErrorOr<Deleted> Delete(string id)
    {
        using var con = GetConnection();

        var cmd = con.CreateCommand();
        cmd.CommandText =
            """
                DELETE FROM TODO Where id = $id;
            """;
        cmd.Parameters.AddWithValue("$id", id);

        int deletedCount = cmd.ExecuteNonQuery();

        return deletedCount == 1
            ? new Deleted()
            : Error.NotFound($"Id: {id} not found.");
    }

    public ErrorOr<Updated> IsDone(string id, bool done)
    {
        using var con = GetConnection();

        var cmd = con.CreateCommand();

        cmd.CommandText =
            """
                UPDATE TODO
                    SET done = $done
                WHERE 
                    Id = $id
            """;

        cmd.Parameters.AddWithValue("$id", id);
        cmd.Parameters.AddWithValue("$done", done);

        int updatedCount = cmd.ExecuteNonQuery();

        return updatedCount == 1
            ? new Updated()
            : Error.Unexpected();
    }
}

