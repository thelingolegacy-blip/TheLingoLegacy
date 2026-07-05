using System.Threading.Tasks;
using UnityEngine;

public class CommentaryEngine
{
    private AIClient _client;

    public CommentaryEngine(string baseUrl)
    {
        _client = new AIClient(baseUrl);
    }

    public async Task<string> GetCommentary(string jsonPayload)
    {
        var resp = await _client.PostJson("/commentary", jsonPayload);
        return resp;
    }
}
