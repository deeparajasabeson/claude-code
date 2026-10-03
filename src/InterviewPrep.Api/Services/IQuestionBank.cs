using InterviewPrep.Api.Models;

namespace InterviewPrep.Api.Services;

/// <summary>
/// Read-only access to the interview question bank. The default implementation reads
/// an embedded JSON file; swap in Azure Cosmos DB or Azure SQL by registering another implementation.
/// </summary>
public interface IQuestionBank
{
    IReadOnlyList<Category> GetCategories();

    Category? GetCategory(string slug);

    InterviewQuestion? GetQuestion(string slug, int number);

    IReadOnlyList<SearchResult> Search(string term, int maxResults = 20);
}
