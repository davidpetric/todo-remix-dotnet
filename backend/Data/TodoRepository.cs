namespace backend.Data;

using Dapper;
using ErrorOr;

public class TodoRepository(
    ILogger<TodoRepository> logger,
    DataDbContext dataDbContext)
{
    public ErrorOr<Success> Insert(Todo todo)
    {
        try
        {
            using var con = dataDbContext.CreateConnection();

            const string query =
            """
            INSERT INTO
                Todo (id, name, done) 
            Values 
                (@id, @name, @done)
            """;

            con.Execute(
                query,
                new { id = todo.Id, name = todo.Name, done = todo.Done }
            );

            return new Success();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "{exMessage}", ex.Message);
            return new Error();
        }
    }

    public ErrorOr<Todo> Retrieve(string id)
    {
        using var con = dataDbContext.CreateConnection();

        const string query =
        """
        SELECT
            id,
            name,
            done 
        FROM
            Todo
        WHERE
            id = @id
        """;

        Todo? todo = con.QueryFirstOrDefault<Todo>(query, new { id });
        if (todo is null)
        {
            return Error.NotFound();
        }

        return todo;
    }

    // TODO: implement pagination
    public Todo[] List()
    {
        using var con = dataDbContext.CreateConnection();

        const string query =
        """
        SELECT
            id,
            name,
            done 
        FROM
            Todo
        """;

        Todo[] todos = con.Query<Todo>(query).ToArray();
        return todos;
    }

    public ErrorOr<Deleted> Delete(string id)
    {
        using var con = dataDbContext.CreateConnection();

        const string query =
        """
        DELETE 
        FROM 
            TODO 
        WHERE 
            id = @id;
        """;

        int deletedCount = con.Execute(query, new { id });

        return deletedCount == 1
            ? new Deleted()
            : Error.NotFound(@"Id: {id} not found.");
    }

    public ErrorOr<Updated> IsDone(string id, bool done)
    {
        using var con = dataDbContext.CreateConnection();

        const string query =
        """
        UPDATE TODO
            SET done = @done
        WHERE 
            id = @id
        """;

        int updatedCount = con.Execute(query, new { id, done });

        return updatedCount == 1
            ? new Updated()
            : Error.Unexpected();
    }
}

