using InterviewPrep.Api.Models;
using InterviewPrep.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace InterviewPrep.Api.Endpoints;

public static class QuestionEndpoints
{
    public static IEndpointRouteBuilder MapQuestionEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api")
            .WithTags("Interview questions")
            .CacheOutput("questions");

        api.MapGet("/categories", GetCategories)
            .WithName("GetCategories")
            .WithSummary("Lists the book's chapters (topic categories).");

        api.MapGet("/categories/{slug}", GetCategory)
            .WithName("GetCategory")
            .WithSummary("Gets one category with all of its questions and answers.");

        api.MapGet("/categories/{slug}/questions/{number:int}", GetQuestion)
            .WithName("GetQuestion")
            .WithSummary("Gets a single question and answer.");

        api.MapGet("/search", Search)
            .WithName("SearchQuestions")
            .WithSummary("Searches questions, answers, key points and tags across all categories.");

        return app;
    }

    internal static Ok<CategorySummary[]> GetCategories(IQuestionBank bank) =>
        TypedResults.Ok(bank.GetCategories().Select(CategorySummary.From).ToArray());

    internal static Results<Ok<Category>, NotFound> GetCategory(string slug, IQuestionBank bank) =>
        bank.GetCategory(slug) is { } category ? TypedResults.Ok(category) : TypedResults.NotFound();

    internal static Results<Ok<InterviewQuestion>, NotFound> GetQuestion(string slug, int number, IQuestionBank bank) =>
        bank.GetQuestion(slug, number) is { } question ? TypedResults.Ok(question) : TypedResults.NotFound();

    internal static Results<Ok<IReadOnlyList<SearchResult>>, ValidationProblem> Search(string? q, IQuestionBank bank)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["q"] = ["Provide a search term of at least 2 characters."]
            });
        }

        return TypedResults.Ok(bank.Search(q));
    }
}
