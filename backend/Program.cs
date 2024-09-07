using backend.Data;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(x =>
{
    x.SwaggerDoc("v1",
        new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Version = "v1",
            Title = "Todo API"
        });

    x.TagActionsBy(y =>
    {
        return [y.ActionDescriptor.DisplayName];
    });
});

builder.Services.AddScoped<TodoRepository>();

builder.Services.AddCors();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(x =>
    {
        x.DocumentTitle = "Todo API";
    });

    app.UseCors(opt =>
    {
        opt.AllowAnyOrigin()
           .AllowAnyHeader()
           .AllowAnyMethod();
    });
}

app.UseHttpsRedirection();

app.MapGet("/todos/{id}", ([FromServices] TodoRepository repo, [FromRoute] string id) =>
{
    var todoResponse = repo.Retrieve(id);

    return todoResponse.Match(
        t => Results.Ok(todoResponse.Value),
        err => Results.BadRequest(todoResponse.Errors));
})
.WithName("GetTodo")
.WithTags("Todo")
.Produces<Todo>(StatusCodes.Status200OK)
.ProducesProblem(StatusCodes.Status400BadRequest)
.WithOpenApi();

app.MapGet("/todos", ([FromServices] TodoRepository repo) =>
{
    var todos = repo.List();

    return Results.Ok(todos);
})
.WithName("ListTodos")
.WithTags("Todo")
.Produces<IEnumerable<Todo>>(StatusCodes.Status200OK, MediaTypeNames.Application.Json)
.WithOpenApi();

app.MapPost("/todos", ([FromServices] TodoRepository repo, [FromBody] Todo newTodo) =>
{
    var insertResponse = repo.Insert(newTodo);

    return insertResponse.Match(
        x => Results.CreatedAtRoute("GetTodo", new { newTodo.Id }),
        err => Results.BadRequest(
            new ProblemDetails()
            {
                Detail = "",
                Status = StatusCodes.Status400BadRequest
            }));
})
.WithName("CreateTodo")
.WithTags("Todo")
.Accepts<Todo>(MediaTypeNames.Application.Json)
.WithOpenApi();

app.MapDelete("/todos/{id}", ([FromServices] TodoRepository repo, [FromRoute] string id)
    => repo.Delete(id)
        .Match(
            deleted => Results.Ok(),
            errors => Results.BadRequest(errors.FirstOrDefault().Code)
         )
)
.WithName("DeleteTodo")
.WithTags("Todo")
.WithOpenApi();

app.MapPost("/todos/{id}/done", (
    [FromServices] TodoRepository repo,
    [FromRoute] string id,
    [FromBody] IsDoneTodoRequest req)
    => repo.IsDone(id, req.Done)
        .Match(
            success => Results.Ok(),
            errors => Results.BadRequest(errors.FirstOrDefault().Code)
         )
)
.WithName("UpdateDone")
.WithTags("Todo")
.WithOpenApi();

app.Run();


public record Todo(string Id, string Name, bool Done);
public record IsDoneTodoRequest(bool Done);
