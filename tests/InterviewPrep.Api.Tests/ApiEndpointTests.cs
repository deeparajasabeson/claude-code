using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace InterviewPrep.Api.Tests;

public class ApiEndpointTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Categories_endpoint_returns_summaries()
    {
        var categories = await _client.GetFromJsonAsync<JsonElement[]>("/api/categories");

        Assert.NotNull(categories);
        Assert.Equal(3, categories.Length);
        Assert.All(categories, c => Assert.Equal(20, c.GetProperty("questionCount").GetInt32()));
    }

    [Fact]
    public async Task Category_endpoint_returns_questions_with_string_difficulty()
    {
        var category = await _client.GetFromJsonAsync<JsonElement>("/api/categories/dotnet-core");

        var first = category.GetProperty("questions")[0];
        Assert.Equal(".NET Core", category.GetProperty("title").GetString());
        Assert.Equal(JsonValueKind.String, first.GetProperty("difficulty").ValueKind);
        Assert.False(string.IsNullOrEmpty(first.GetProperty("code").GetString()));
    }

    [Fact]
    public async Task Question_endpoint_returns_single_question()
    {
        var question = await _client.GetFromJsonAsync<JsonElement>("/api/categories/react/questions/3");

        Assert.Equal(3, question.GetProperty("number").GetInt32());
    }

    [Theory]
    [InlineData("/api/categories/cobol")]
    [InlineData("/api/categories/react/questions/99")]
    [InlineData("/api/does-not-exist")]
    public async Task Unknown_api_resources_return_404(string url)
    {
        var response = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Search_requires_a_term()
    {
        var response = await _client.GetAsync("/api/search?q=a");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Search_finds_matches_across_categories()
    {
        var results = await _client.GetFromJsonAsync<JsonElement[]>("/api/search?q=Entra");

        Assert.NotNull(results);
        var categories = results.Select(r => r.GetProperty("categorySlug").GetString()).Distinct().ToList();
        Assert.Contains("dotnet-core", categories);
        Assert.Contains("react", categories);
    }

    [Fact]
    public async Task Health_endpoint_is_healthy()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync());
    }
}
