# 06 — Speichersystem: Save/Load mit JSON

---

## Übersicht

Das Original speichert in `localStorage` (Browser). Im C#-Port wird das auf
**JSON-Datei** (MonoGame/Desktop) oder **Unity PlayerPrefs + JsonUtility** (Unity) abgebildet.

---

## Gespeicherte Daten

```csharp
[System.Serializable]
public class SaveData {
    public int                    Version    = 1;       // Schema-Version
    public int                    Wave;                 // aktuelle Wellen-Nummer (1-basiert)
    public int                    Currency;             // Kristalle
    public int                    TotalKills;
    public int                    PlayerHp;             // gerundetes HP
    public Dictionary<string,int> Skills;               // skill-id → level
    public long                   Timestamp;            // Unix-Millisekunden
}
```

---

## Unity — Implementierung

```csharp
public static class SaveSystem {
    const string SAVE_KEY = "aethermancer_save";

    public static void Save(GameState game) {
        var data = new SaveData {
            Wave       = game.WaveManager.CurrentWave,
            Currency   = game.Currency,
            TotalKills = game.TotalKills,
            PlayerHp   = Mathf.CeilToInt(game.Player.Hp),
            Skills     = game.SkillTree.ToDict(),
            Timestamp  = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        };
        string json = JsonUtility.ToJson(data);
        PlayerPrefs.SetString(SAVE_KEY, json);
        PlayerPrefs.Save();
    }

    public static SaveData Load() {
        if (!PlayerPrefs.HasKey(SAVE_KEY)) return null;
        string json = PlayerPrefs.GetString(SAVE_KEY);
        try {
            var data = JsonUtility.FromJson<SaveData>(json);
            if (data.Version != 1) return null;
            return data;
        } catch {
            return null;
        }
    }

    public static bool HasSave() => PlayerPrefs.HasKey(SAVE_KEY);

    public static void Delete() {
        PlayerPrefs.DeleteKey(SAVE_KEY);
        PlayerPrefs.Save();
    }
}
```

> **Hinweis:** `JsonUtility` unterstützt kein `Dictionary<string,int>` direkt.
> Entweder `Newtonsoft.Json` (via Unity Package Manager) verwenden oder
> Skills als zwei parallele Arrays serialisieren:
> ```csharp
> public string[] SkillIds;
> public int[]    SkillLevels;
> ```

---

## MonoGame / Desktop — Implementierung (JSON-Datei)

```csharp
using System.Text.Json;

public static class SaveSystem {
    static string SavePath =>
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                     "Aethermancer", "save.json");

    public static void Save(GameState game) {
        var data = new SaveData { /* ... */ };
        Directory.CreateDirectory(Path.GetDirectoryName(SavePath));
        File.WriteAllText(SavePath, JsonSerializer.Serialize(data, new JsonSerializerOptions {
            WriteIndented = true
        }));
    }

    public static SaveData Load() {
        if (!File.Exists(SavePath)) return null;
        try {
            return JsonSerializer.Deserialize<SaveData>(File.ReadAllText(SavePath));
        } catch {
            return null;
        }
    }

    public static bool HasSave() => File.Exists(SavePath);
}
```

---

## Laden und Anwenden

```csharp
void LoadAndApply(SaveData data, GameManager game) {
    if (data == null) return;

    game.WaveManager.CurrentWave = data.Wave;
    game.Currency   = data.Currency;
    game.TotalKills = data.TotalKills;

    // Skills wiederherstellen
    game.SkillTree.FromDict(data.Skills);

    // Spieler erstellen und Skills anwenden
    game.Player = new Player(WORLD_SIZE / 2f, WORLD_SIZE / 2f);
    ApplySkillsToPlayer(game.Player, game.SkillTree);

    // HP aus Save setzen (auf neues MaxHp geclampt)
    game.Player.Hp = Mathf.Min(data.PlayerHp, game.Player.MaxHp);
}
```

---

## Auto-Save Punkte

| Zeitpunkt | Aktion |
|-----------|--------|
| Nach jeder Welle (Skilltree öffnet) | `SaveSystem.Save()` |
| Skill gekauft + Skilltree geschlossen | `SaveSystem.Save()` |
| Manuelle Taste (`F5`) | `SaveSystem.Save()` |
| Game Over | **Kein** Auto-Save (damit der Run nicht gespeichert wird wenn man stirbt) |

---

## Menü — "Fortsetzen"-Button

```csharp
void InitMenu() {
    bool hasSave = SaveSystem.HasSave();
    continueButton.gameObject.SetActive(hasSave);

    if (hasSave) {
        var data = SaveSystem.Load();
        continueButton.GetComponentInChildren<Text>().text =
            $"FORTSETZEN  (Welle {data?.Wave ?? 1})";
    }
}

void OnContinueClicked() {
    var data = SaveSystem.Load();
    if (data == null) return;
    LoadAndApply(data, gameManager);
    gameManager.StartGame(fromSave: true);
}
```

---

## Versionierung / Migration

Falls das Datenschema in einer späteren Version geändert wird:

```csharp
static SaveData Migrate(SaveData data) {
    switch (data.Version) {
        case 1:
            // aktuell keine Migration nötig
            return data;
        default:
            Debug.LogWarning("Unbekannte Save-Version, wird ignoriert.");
            return null;
    }
}
```
