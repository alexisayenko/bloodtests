var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var dataDir = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "data");
Directory.CreateDirectory(dataDir);

var analysesFile = Path.Combine(dataDir, "analyses.json");
var resultsFile = Path.Combine(dataDir, "results.json");
var plannedFile = Path.Combine(dataDir, "planned.json");
var panelsFile = Path.Combine(dataDir, "panels.json");

if (!File.Exists(analysesFile)) File.WriteAllText(analysesFile, "[]");
if (!File.Exists(resultsFile)) File.WriteAllText(resultsFile, "[]");
if (!File.Exists(plannedFile)) File.WriteAllText(plannedFile, "[]");
if (!File.Exists(panelsFile)) File.WriteAllText(panelsFile, "[]");

// Serve the HTML page
var htmlPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "index.html"));
app.MapGet("/", () => Results.File(htmlPath, "text/html"));

// Read-only API
app.MapGet("/api/analyses", () => Results.Content(File.ReadAllText(analysesFile), "application/json"));
app.MapGet("/api/results", () => Results.Content(File.ReadAllText(resultsFile), "application/json"));
app.MapGet("/api/planned", () => Results.Content(File.ReadAllText(plannedFile), "application/json"));
app.MapGet("/api/panels", () => Results.Content(File.ReadAllText(panelsFile), "application/json"));

app.Run("http://0.0.0.0:5000");
