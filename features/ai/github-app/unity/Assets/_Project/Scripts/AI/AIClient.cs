// Unity C# client to call the hosted web API for AI features.
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

public class AIClient
{
    private static readonly HttpClient _http = new HttpClient();
    private readonly string _baseUrl;

    public AIClient(string baseUrl)
    {
        _baseUrl = baseUrl;
    }

    public async Task<string> PostJson(string path, string json)
    {
        var res = await _http.PostAsync(_baseUrl + path, new StringContent(json, Encoding.UTF8, "application/json"));
        return await res.Content.ReadAsStringAsync();
    }
}
