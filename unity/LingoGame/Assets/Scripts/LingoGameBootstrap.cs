using UnityEngine;
public sealed class LingoGameBootstrap : MonoBehaviour
{
    [SerializeField] private string gameId = "LINGO-GAME";
    [SerializeField] private string gameVersion = "0.1.0";
    void Awake()
    {
        DontDestroyOnLoad(gameObject);
        Debug.Log($"LINGO GAME BOOT | {gameId} | {gameVersion}");
    }
}
