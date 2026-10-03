using System.Text.Json.Serialization;
using Azure.Monitor.OpenTelemetry.AspNetCore;
using InterviewPrep.Api.Endpoints;
using InterviewPrep.Api.Services;
using Microsoft.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IQuestionBank>(_ => JsonQuestionBank.FromEmbeddedResource());

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
builder.Services.AddOutputCache(options =>
    options.AddPolicy("questions", policy => policy.Expire(TimeSpan.FromMinutes(10))));

// Application Insights via OpenTelemetry; App Service supplies the connection string as an app setting.
if (!string.IsNullOrWhiteSpace(builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"]))
{
    builder.Services.AddOpenTelemetry().UseAzureMonitor();
}

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHsts();
}

// The React build is published into wwwroot; Vite fingerprints everything under /assets.
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        if (ctx.Context.Request.Path.StartsWithSegments("/assets"))
        {
            ctx.Context.Response.Headers[HeaderNames.CacheControl] = "public, max-age=31536000, immutable";
        }
    }
});

app.UseOutputCache();

app.MapHealthChecks("/health");
app.MapQuestionEndpoints();

// Unknown API routes are real 404s; everything else is a client-side route handled by React Router.
app.Map("/api/{**rest}", () => TypedResults.NotFound());
app.MapFallbackToFile("index.html");

app.Run();
