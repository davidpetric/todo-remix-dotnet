using backend.Data;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<TodoRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapPost("/todos", ([FromServices] TodoRepository repo, [FromBody] Todo newTodo) =>
{
    var successOrErrror = repo.Insert(newTodo);
    return successOrErrror.IsError ? Results.BadRequest() : Results.Ok();
})
.WithName("CreateTodo")
.WithOpenApi();

app.MapGet("/todos/{id}", ([FromServices] TodoRepository repo, [FromRoute] string id) =>
{
    var errorOrTodo = repo.Retrieve(id);

    return errorOrTodo.IsError
        ? Results.BadRequest(errorOrTodo.Errors)
        : Results.Ok(errorOrTodo.Value);
})
.WithName("GetTodo")
.WithOpenApi();


app.MapGet("/todos", ([FromServices] TodoRepository repo) =>
{
    var todos = repo.List();

    return Results.Ok(todos);
})
.WithName("ListTodos")
.WithOpenApi();


app.Run();


public record Todo(string Id, string Name, bool Done);
