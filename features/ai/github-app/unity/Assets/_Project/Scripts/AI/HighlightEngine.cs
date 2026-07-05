using System.Threading.Tasks;

public class HighlightEngine
{
    private AIClient _client;

    public HighlightEngine(string baseUrl)
    {
        _client = new AIClient(baseUrl);
    }

    public async Task<string> GetHighlight(string jsonPayload)
    {
        var resp = await _client.PostJson("/highlight", jsonPayload);
        return resp;
    }
}
