using InterviewPrep.Api.Models;
using InterviewPrep.Api.Services;

namespace InterviewPrep.Api.Tests;

public class QuestionBankTests
{
    private readonly JsonQuestionBank _bank = JsonQuestionBank.FromEmbeddedResource();

    [Fact]
    public void Has_three_categories_in_book_order()
    {
        var slugs = _bank.GetCategories().Select(c => c.Slug);

        Assert.Equal(["agentic-ai", "dotnet-core", "react"], slugs);
    }

    [Theory]
    [InlineData("agentic-ai")]
    [InlineData("dotnet-core")]
    [InlineData("react")]
    public void Each_category_has_twenty_numbered_questions(string slug)
    {
        var category = _bank.GetCategory(slug);

        Assert.NotNull(category);
        Assert.Equal(Enumerable.Range(1, 20), category.Questions.Select(q => q.Number));
    }

    [Fact]
    public void Every_question_is_complete()
    {
        var questions = _bank.GetCategories().SelectMany(c => c.Questions).ToList();

        Assert.All(questions, q =>
        {
            Assert.False(string.IsNullOrWhiteSpace(q.Question));
            Assert.True(q.Answer.Length > 200, $"Answer to '{q.Question}' is too short.");
            Assert.InRange(q.KeyPoints.Count, 3, 5);
            Assert.False(string.IsNullOrWhiteSpace(q.PracticeCue));
            Assert.NotEmpty(q.Tags);
        });
        Assert.Equal(questions.Count, questions.Select(q => q.Question).Distinct().Count());
    }

    [Fact]
    public void Category_lookup_is_case_insensitive()
    {
        Assert.Equal("React", _bank.GetCategory("REACT")?.Title);
        Assert.Null(_bank.GetCategory("angular"));
    }

    [Fact]
    public void GetQuestion_returns_null_for_unknown_number()
    {
        Assert.NotNull(_bank.GetQuestion("react", 20));
        Assert.Null(_bank.GetQuestion("react", 21));
    }

    [Fact]
    public void Search_ranks_question_text_matches_first()
    {
        var results = _bank.Search("agentic RAG");

        Assert.NotEmpty(results);
        Assert.Equal("What is agentic RAG?", results[0].Question.Question);
    }

    [Fact]
    public void Search_with_blank_term_returns_nothing()
    {
        Assert.Empty(_bank.Search("   "));
    }

    [Fact]
    public void Categories_are_sorted_by_order_even_if_source_is_not()
    {
        var question = new InterviewQuestion(1, "Q", "A", null, ["k"], "cue", Difficulty.Foundational, ["t"], false);
        var bank = new JsonQuestionBank(new QuestionBankDocument(
        [
            new Category("b", "B", "", "", 2, [question]),
            new Category("a", "A", "", "", 1, [question])
        ]));

        Assert.Equal(["a", "b"], bank.GetCategories().Select(c => c.Slug));
    }
}
