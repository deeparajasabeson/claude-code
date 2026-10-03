using System.Text.Json;
using System.Text.Json.Serialization;
using InterviewPrep.Api.Models;

namespace InterviewPrep.Api.Services;

public sealed class JsonQuestionBank : IQuestionBank
{
    private const string ResourceName = "InterviewPrep.Api.Data.questions.json";

    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly IReadOnlyList<Category> _categories;
    private readonly Dictionary<string, Category> _bySlug;

    public JsonQuestionBank(QuestionBankDocument document)
    {
        _categories = document.Categories
            .Select(c => c with { Questions = c.Questions.OrderBy(q => q.Number).ToList() })
            .OrderBy(c => c.Order)
            .ToList();
        _bySlug = _categories.ToDictionary(c => c.Slug, StringComparer.OrdinalIgnoreCase);
    }

    public static JsonQuestionBank FromEmbeddedResource()
    {
        using var stream = typeof(JsonQuestionBank).Assembly.GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException($"Embedded resource '{ResourceName}' was not found.");
        var document = JsonSerializer.Deserialize<QuestionBankDocument>(stream, SerializerOptions)
            ?? throw new InvalidOperationException("The question bank file is empty.");
        return new JsonQuestionBank(document);
    }

    public IReadOnlyList<Category> GetCategories() => _categories;

    public Category? GetCategory(string slug) => _bySlug.GetValueOrDefault(slug);

    public InterviewQuestion? GetQuestion(string slug, int number) =>
        GetCategory(slug)?.Questions.FirstOrDefault(q => q.Number == number);

    public IReadOnlyList<SearchResult> Search(string term, int maxResults = 20)
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return [];
        }

        var needle = term.Trim();
        return _categories
            .SelectMany(c => c.Questions.Select(q => (Category: c, Question: q)))
            .Select(x => (x.Category, x.Question, Score: Score(x.Question, needle)))
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.Category.Order)
            .ThenBy(x => x.Question.Number)
            .Take(maxResults)
            .Select(x => new SearchResult(x.Category.Slug, x.Category.Title, x.Question))
            .ToList();
    }

    private static int Score(InterviewQuestion question, string needle)
    {
        var score = 0;
        if (question.Question.Contains(needle, StringComparison.OrdinalIgnoreCase)) score += 3;
        if (question.Tags.Any(t => t.Contains(needle, StringComparison.OrdinalIgnoreCase))) score += 2;
        if (question.KeyPoints.Any(k => k.Contains(needle, StringComparison.OrdinalIgnoreCase))) score += 1;
        if (question.Answer.Contains(needle, StringComparison.OrdinalIgnoreCase)) score += 1;
        return score;
    }
}
