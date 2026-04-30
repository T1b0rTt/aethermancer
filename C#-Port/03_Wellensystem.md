# 03 — Wellensystem: Konfiguration, Spawning, Skalierung

---

## Übersicht

Das Wellensystem besteht aus:
1. **WaveData-Tabelle** — 10 vordefinierte Wellenkonfigurationen
2. **SpawnQueue** — Zeitgesteuerte Spawn-Liste für die aktuelle Welle
3. **WaveManager** — Update-Schleife, die Queue abarbeitet und Wellenende erkennt

---

## WaveData-Struktur

```csharp
public struct SpawnGroup {
    public string EnemyType;    // "zombie" | "bat" | "ogre" | "boss"
    public int    Count;
    public float  Delay;        // Sekunden zwischen je zwei Spawns dieser Gruppe
}

public struct WaveData {
    public string       Label;    // Anzeigename
    public bool         IsBoss;
    public SpawnGroup[] Groups;
}
```

### Alle 10 Wellen

```csharp
static readonly WaveData[] WAVES = new WaveData[] {
    new WaveData { Label="Welle 1 — Die ersten Toten",      IsBoss=false, Groups=new[]{ new SpawnGroup{EnemyType="zombie",Count=8,  Delay=1.5f} } },
    new WaveData { Label="Welle 2 — Nacht der Fledermäuse", IsBoss=false, Groups=new[]{ new SpawnGroup{EnemyType="zombie",Count=10, Delay=1.2f}, new SpawnGroup{EnemyType="bat",Count=6,Delay=0.8f} } },
    new WaveData { Label="Welle 3 — Stärker & schneller",   IsBoss=false, Groups=new[]{ new SpawnGroup{EnemyType="zombie",Count=14, Delay=1.0f}, new SpawnGroup{EnemyType="bat",Count=8,Delay=0.7f} } },
    new WaveData { Label="Welle 4 — Riesen erwachen",       IsBoss=false, Groups=new[]{ new SpawnGroup{EnemyType="zombie",Count=12, Delay=1.0f}, new SpawnGroup{EnemyType="bat",Count=8,Delay=0.8f}, new SpawnGroup{EnemyType="ogre",Count=3,Delay=3.0f} } },
    new WaveData { Label="BOSS — Schatten des Abgrunds",    IsBoss=true,  Groups=new[]{ new SpawnGroup{EnemyType="zombie",Count=10, Delay=1.5f}, new SpawnGroup{EnemyType="boss",Count=1,Delay=5.0f} } },
    new WaveData { Label="Welle 6 — Blutrausch",            IsBoss=false, Groups=new[]{ new SpawnGroup{EnemyType="zombie",Count=18, Delay=0.9f}, new SpawnGroup{EnemyType="bat",Count=12,Delay=0.6f}, new SpawnGroup{EnemyType="ogre",Count=4,Delay=2.5f} } },
    new WaveData { Label="Welle 7 — Ogre-Invasion",         IsBoss=false, Groups=new[]{ new SpawnGroup{EnemyType="ogre",Count=8,   Delay=2.0f}, new SpawnGroup{EnemyType="bat",Count=14,Delay=0.6f} } },
    new WaveData { Label="Welle 8 — Apokalypse",            IsBoss=false, Groups=new[]{ new SpawnGroup{EnemyType="zombie",Count=20, Delay=0.8f}, new SpawnGroup{EnemyType="bat",Count=16,Delay=0.5f}, new SpawnGroup{EnemyType="ogre",Count=6,Delay=2.0f} } },
    new WaveData { Label="BOSS — Das Ende naht",            IsBoss=true,  Groups=new[]{ new SpawnGroup{EnemyType="zombie",Count=15, Delay=1.0f}, new SpawnGroup{EnemyType="boss",Count=1,Delay=4.0f}, new SpawnGroup{EnemyType="bat",Count=10,Delay=0.7f} } },
    new WaveData { Label="Welle 10 — Unendliche Wut",       IsBoss=false, Groups=new[]{ new SpawnGroup{EnemyType="zombie",Count=25, Delay=0.7f}, new SpawnGroup{EnemyType="bat",Count=18,Delay=0.5f}, new SpawnGroup{EnemyType="ogre",Count=8,Delay=1.8f} } },
};
```

---

## Spawn-Queue

Beim Start jeder Welle wird eine flache Liste mit Spawn-Einträgen erzeugt,
jeder mit einem absoluten Timer-Wert:

```csharp
public struct SpawnEntry {
    public string EnemyType;
    public float  Timer;     // Sekunden ab Wellenstart bis Spawn
    public int    Scale;     // Schwierigkeits-Multiplikator
}

List<SpawnEntry> BuildSpawnQueue(WaveData wd, int waveIndex) {
    int   waveScale = waveIndex / WAVES.Length; // 0 für Runde 1, 1 für Runde 2, ...
    float scaleMod  = 1f + waveScale * 0.05f;
    var   queue     = new List<SpawnEntry>();

    foreach (var group in wd.Groups) {
        for (int i = 0; i < group.Count; i++) {
            float timer = group.Delay * i * scaleMod;
            if (i == 0) timer = group.Delay * 0.5f; // Erste Einheit leicht verzögert
            queue.Add(new SpawnEntry { EnemyType=group.EnemyType, Timer=timer, Scale=waveScale });
        }
    }

    queue.Sort((a, b) => a.Timer.CompareTo(b.Timer));
    return queue;
}
```

---

## WaveManager

```csharp
public class WaveManager {
    public  int   CurrentWave  = 0;   // 1-basiert, Anzeige
    public  bool  WaveActive   = false;
    private float elapsed      = 0;
    private List<SpawnEntry> spawnQueue = new();

    public void BeginWave(int waveIndex, GameManager game) {
        int   wIdx = waveIndex % WAVES.Length;
        WaveData wd = WAVES[wIdx];
        CurrentWave = waveIndex + 1;
        WaveActive  = true;
        elapsed     = 0;
        spawnQueue  = BuildSpawnQueue(wd, waveIndex);

        game.ShowAnnouncement(wd.Label, wd.IsBoss ? "⚠ BOSS-WELLE ⚠" : "");
    }

    public void Update(float dt, GameManager game) {
        if (!WaveActive) return;
        elapsed += dt;

        // Fällige Spawns abarbeiten
        while (spawnQueue.Count > 0 && spawnQueue[0].Timer <= elapsed) {
            var entry = spawnQueue[0];
            spawnQueue.RemoveAt(0);
            game.SpawnEnemy(entry.EnemyType, entry.Scale);
        }

        // Wellenende: Queue leer UND keine Feinde mehr auf dem Feld
        if (spawnQueue.Count == 0 && game.Enemies.Count == 0) {
            WaveComplete(game);
        }
    }

    private void WaveComplete(GameManager game) {
        WaveActive = false;
        game.ScheduleSkillTree(0.4f); // 400ms Verzögerung vor Skilltree
    }
}
```

---

## Feind-Spawn-Position

Feinde erscheinen am Bildschirmrand (außerhalb des sichtbaren Bereichs):

```csharp
Vector2 GetSpawnPosition(Vector2 playerPos, float screenW, float screenH) {
    float margin = 80f;
    int   side   = Random.Range(0, 4);
    float x, y;

    switch (side) {
        case 0: x = Random.Range(playerPos.x - screenW/2 - margin, playerPos.x + screenW/2 + margin);
                y = playerPos.y - screenH/2 - margin; break;
        case 1: x = Random.Range(playerPos.x - screenW/2 - margin, playerPos.x + screenW/2 + margin);
                y = playerPos.y + screenH/2 + margin; break;
        case 2: x = playerPos.x - screenW/2 - margin;
                y = Random.Range(playerPos.y - screenH/2 - margin, playerPos.y + screenH/2 + margin); break;
        default:x = playerPos.x + screenW/2 + margin;
                y = Random.Range(playerPos.y - screenH/2 - margin, playerPos.y + screenH/2 + margin); break;
    }

    x = Mathf.Clamp(x, 0, WORLD_SIZE);
    y = Mathf.Clamp(y, 0, WORLD_SIZE);
    return new Vector2(x, y);
}
```

---

## Schwierigkeits-Skalierung

Nach Abschluss aller 10 Wellen startet Runde 2 (index 10 → WAVES[0] mit `scale=1`).
`scale` erhöht HP und Speed der Feinde:

| Feind   | HP-Formel                    | Speed-Formel           |
|---------|------------------------------|------------------------|
| Zombie  | `60 + scale * 15`            | `55 + scale * 5`       |
| Flederm.| `25 + scale * 8`             | `130 + scale * 10`     |
| Oger    | `280 + scale * 60`           | `40 + scale * 3`       |
| Boss    | `2500 + scale * 400`         | `48 + scale * 4`       |

---

## Erweitertes System — 10 Runden × 10 Wellen

### Struktur

```
Gesamtwellen: 100
Runden:       10
Wellen/Runde: 10
Boss-Wellen:  Welle 10 jeder Runde (10, 20, 30 ... 100)
```

```csharp
// Berechnung aus absolutem Wellen-Index (0-basiert)
int round     = waveIndex / 10;         // 0–9
int waveInRnd = waveIndex % 10;         // 0–9
bool isBoss   = waveInRnd == 9;         // letzte Welle der Runde
int scale     = round;                  // Schwierigkeits-Multiplikator
```

### Boss-Rotation (welcher Boss in welcher Runde)

```csharp
static string GetBossType(int round) {
    if (round == 9) return "final";     // Runde 10: alle 3 Bosse
    return (round % 3) switch {
        0 => "shadow_demon",            // Runden 1, 4, 7
        1 => "lichkoning",              // Runden 2, 5, 8
        2 => "chaos_kraken",            // Runden 3, 6, 9
        _ => "shadow_demon"
    };
}
```

### Wellen-Template Wiederverwendung

Die 10 WaveData-Templates werden für alle Runden wiederverwendet.
Nur `scale` (= Rundenindex) erhöht sich:

```csharp
WaveData GetWaveData(int waveIndex) {
    int templateIdx = waveIndex % WAVES.Length;  // 0–9
    int scale       = waveIndex / WAVES.Length;  // steigt jede Runde

    if (waveIndex % 10 == 9) {
        // Boss-Welle: eigenes Template
        return BuildBossWave(scale, GetBossType(waveIndex / 10));
    }
    return WAVES[templateIdx]; // normales Template + scale-Parameter
}

WaveData BuildBossWave(int scale, string bossType) {
    return new WaveData {
        Label  = GetBossLabel(bossType, scale),
        IsBoss = true,
        Groups = new[] {
            new SpawnGroup { EnemyType="zombie", Count=8+scale*2, Delay=1.5f },
            new SpawnGroup { EnemyType=bossType, Count=1,         Delay=6.0f },
        }
    };
}
```

### Anzeige im HUD

```
Runde 3 / Welle 7    →  Absolut: Welle 27
```

```csharp
string WaveLabel(int waveIndex) {
    int round = waveIndex / 10 + 1;
    int wave  = waveIndex % 10 + 1;
    return $"Runde {round} · Welle {wave}";
}
```

### Level-Up System (EXP durch Kills)

Parallel zum Skilltree gibt es ein **Run-internes Level-Up-System**:

```csharp
public class PlayerLevel {
    public int   Level    = 1;
    public float Exp      = 0;
    public float ExpToNext => 20f + Level * 15f;   // steigt mit Level

    public bool AddExp(float amount) {
        Exp += amount;
        if (Exp >= ExpToNext) {
            Exp -= ExpToNext;
            Level++;
            return true;  // Level-Up! → Waffen-Auswahl zeigen
        }
        return false;
    }
}

// EXP pro Feind-Typ
static float GetExp(string enemyType) => enemyType switch {
    "zombie"        => 4f,
    "bat"           => 3f,
    "ogre"          => 12f,
    "skeleton_mage" => 8f,
    "slime"         => 5f,
    "shadow_ghost"  => 7f,
    "boss"          => 100f,
    _               => 5f
};
```

### Waffen-Auswahl bei Level-Up

Beim Level-Up erscheint sofort (Spiel pausiert) ein Auswahl-Screen mit **3 zufälligen Waffen/Passives**:
- Bereits besessene Waffen können nochmal gewählt werden → Level-Erhöhung
- Neue Waffe → belegt einen Slot (max 6)
- Passives belegen ebenfalls einen Slot
- Screen schließt sich nach Wahl automatisch → Spiel geht weiter

```csharp
WeaponDef[] GetLevelUpOffer(List<string> ownedWeapons, int offerCount = 3) {
    var pool = ALL_WEAPONS.Where(w => {
        int ownedLevel = GetWeaponLevel(w.Id, ownedWeapons);
        return ownedLevel < w.MaxLevel;
    }).ToArray();

    Shuffle(pool);
    return pool.Take(offerCount).ToArray();
}
// offerCount kann durch Meta-Skill "meta_offers" erhöht werden
```
