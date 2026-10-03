namespace InterviewPrep.Api.Models;

public enum Difficulty
{
    Foundational,
    Intermediate,
    Advanced
}

public sealed record InterviewQuestion(
    int Number,
    string Question,
    string Answer,
    string? Code,
    IReadOnlyList<string> KeyPoints,
    string PracticeCue,
    Difficulty Difficulty,
    IReadOnlyList<string> Tags,
    bool FromGuide);

public sealed record Category(
    string Slug,
    string Title,
    string Subtitle,
    string Description,
    int Order,
    IReadOnlyList<InterviewQuestion> Questions);

public sealed record CategorySummary(
    string Slug,
    string Title,
    string Subtitle,
    string Description,
    int Order,
    int QuestionCount)
{
    public static CategorySummary From(Category category) => new(
        category.Slug,
        category.Title,
        category.Subtitle,
        category.Description,
        category.Order,
        category.Questions.Count);
}

public sealed record SearchResult(string CategorySlug, string CategoryTitle, InterviewQuestion Question);

public sealed record QuestionBankDocument(IReadOnlyList<Category> Categories);
