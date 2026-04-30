# 04 — Skilltree: Upgrade-System, Skill-Daten, Anwendung

---

## Konzept

- Nach jeder Welle erhält der Spieler **3 zufällige Skill-Angebote**
- Ein Skill kostet Kristalle: `Basiskosten + Stufe × 20`
- Jeder Skill hat eine maximale Stufe (`Max`)
- Beim Kauf wird der Skill sofort auf den Spieler angewendet
- Skills werden beim Speichern mitgespeichert

---

## Skill-Daten

```csharp
public struct SkillDef {
    public string Id;
    public string Name;
    public string Icon;
    public string Category;   // "attack" | "mobility" | "defense" | "power"
    public string Desc;
    public int    Max;        // Max-Stufe
    public float  BaseValue;  // Wert pro Stufe (prozentual oder absolut)
    public int    BaseCost;   // Kristalle für Stufe 0→1
}

static readonly SkillDef[] SKILLS = new SkillDef[] {
    // ── Attack ────────────────────────────────────────────────────────────
    new SkillDef { Id="dmg",      Name="Scharfe Klingen",  Icon="⚔",  Category="attack",   Desc="+30% Schaden pro Stufe.",              Max=5, BaseValue=0.30f, BaseCost=40  },
    new SkillDef { Id="firerate", Name="Schnellfeuer",     Icon="🏹", Category="attack",   Desc="+25% Feuerrate pro Stufe.",            Max=5, BaseValue=0.25f, BaseCost=40  },
    new SkillDef { Id="trishot",  Name="Dreifachschuss",   Icon="🌀", Category="attack",   Desc="Feuert 3 Projektile gleichzeitig.",    Max=1, BaseValue=1f,    BaseCost=120 },
    new SkillDef { Id="piercing", Name="Durchschlag",      Icon="💫", Category="attack",   Desc="Projektile durchdringen Feinde.",      Max=1, BaseValue=1f,    BaseCost=100 },
    // ── Mobility ──────────────────────────────────────────────────────────
    new SkillDef { Id="speed",    Name="Windläufer",       Icon="💨", Category="mobility", Desc="+25% Bewegungsgeschwindigkeit.",       Max=4, BaseValue=0.25f, BaseCost=35  },
    new SkillDef { Id="magnet",   Name="Juwelen-Magnet",   Icon="🧲", Category="mobility", Desc="+50 Aufnahmeradius pro Stufe.",        Max=3, BaseValue=50f,   BaseCost=30  },
    // ── Defense ───────────────────────────────────────────────────────────
    new SkillDef { Id="maxhp",    Name="Eiserner Wille",   Icon="❤", Category="defense",  Desc="+40 Max HP pro Stufe.",                Max=5, BaseValue=40f,   BaseCost=45  },
    new SkillDef { Id="regen",    Name="Regeneration",     Icon="🌿", Category="defense",  Desc="+1.5 HP/s Lebensregeneration.",        Max=3, BaseValue=1.5f,  BaseCost=60  },
    new SkillDef { Id="lifesteal",Name="Lebensraub",       Icon="🩸", Category="defense",  Desc="+8% Lifesteal pro Treffer.",           Max=3, BaseValue=0.08f, BaseCost=70  },
    // ── Power ─────────────────────────────────────────────────────────────
    new SkillDef { Id="nova_dmg", Name="Arkane Nova",      Icon="✨", Category="power",    Desc="+50% Superkraft-Schaden.",             Max=3, BaseValue=0.50f, BaseCost=80  },
    new SkillDef { Id="nova_cd",  Name="Kühlung",          Icon="⏱", Category="power",    Desc="-20% Superkraft-Cooldown.",            Max=3, BaseValue=0.20f, BaseCost=70  },
    new SkillDef { Id="nova_size",Name="Nova-Radius",      Icon="🔮", Category="power",    Desc="+40% Superkraft-Radius.",             Max=3, BaseValue=0.40f, BaseCost=65  },
};
```

---

## Skill-Level verwalten

```csharp
public class SkillTree {
    private Dictionary<string, int> levels = new();

    public SkillTree() {
        foreach (var s in SKILLS) levels[s.Id] = 0;
    }

    public int  GetLevel(string id) => levels.TryGetValue(id, out int v) ? v : 0;
    public bool IsMaxed(string id)  => GetLevel(id) >= GetDef(id).Max;

    public int GetCost(string id) {
        int lv = GetLevel(id);
        return GetDef(id).BaseCost + lv * 20;
    }

    public bool Purchase(string id, ref int currency) {
        if (IsMaxed(id)) return false;
        int cost = GetCost(id);
        if (currency < cost) return false;
        currency -= cost;
        levels[id]++;
        return true;
    }

    public SkillDef GetDef(string id) =>
        Array.Find(SKILLS, s => s.Id == id);

    // 3 zufällige, nicht-gemaxte Skills für das Angebot
    public SkillDef[] GetRandomOffer(int count = 3) {
        var pool = SKILLS.Where(s => !IsMaxed(s.Id)).ToArray();
        Shuffle(pool);
        return pool.Take(count).ToArray();
    }
}
```

---

## Skills auf Spieler anwenden

Diese Methode muss nach jedem Kauf und beim Laden eines Spielstands aufgerufen werden:

```csharp
void ApplySkillsToPlayer(Player p, SkillTree st) {
    int Lv(string id) => st.GetLevel(id);

    // Bewegung
    p.BaseSpeed     = 200f * (1f + Lv("speed")    * 0.25f);

    // Schaden & Feuerrate
    p.Damage        = 40f  * (1f + Lv("dmg")      * 0.30f);
    p.FireRate      = 1.5f * (1f + Lv("firerate") * 0.25f);

    // Leben
    float oldMaxHp  = p.MaxHp;
    p.MaxHp         = 150f + Lv("maxhp") * 40f;
    p.Hp            = Mathf.Min(p.Hp + (p.MaxHp - oldMaxHp), p.MaxHp); // HP anteilig anpassen
    p.Regen         = Lv("regen")     * 1.5f;
    p.Lifesteal     = Lv("lifesteal") * 0.08f;

    // Spezial
    p.TriShot       = Lv("trishot")  > 0;
    p.Piercing      = Lv("piercing") > 0;
    p.MagnetRadius  = 40f + Lv("magnet") * 50f;

    // Superkraft
    p.SuperpowerMaxCd = 25f * (1f - Lv("nova_cd") * 0.20f);
}
```

---

## Superkraft — Arkane Nova

```csharp
void ActivateSuperpower(Player p, SkillTree st, List<Enemy> enemies) {
    if (p.SuperpowerCd > 0) return;
    p.SuperpowerCd = p.SuperpowerMaxCd;

    float radius = 300f * (1f + st.GetLevel("nova_size") * 0.40f);
    float damage = 300f * (1f + st.GetLevel("nova_dmg")  * 0.50f);

    // NovaEffect spawnen (visuell)
    SpawnNovaEffect(p.Position, radius);

    // Alle Feinde in Radius treffen
    for (int i = enemies.Count - 1; i >= 0; i--) {
        if (Vector2.Distance(p.Position, enemies[i].Position) < radius) {
            enemies[i].TakeDamage(damage);
            if (enemies[i].Dead) {
                OnEnemyKilled(enemies[i]);
                enemies.RemoveAt(i);
            }
        }
    }
}
```

---

## Serialisierung (für Speichern)

```csharp
// Alle Level als Dictionary speichern/laden
Dictionary<string, int> ToDict() => new Dictionary<string, int>(levels);

void FromDict(Dictionary<string, int> dict) {
    foreach (var s in SKILLS)
        levels[s.Id] = dict.TryGetValue(s.Id, out int v) ? v : 0;
}
```

---

## Meta-Progression — Persistenter Skilltree

Bleibt nach dem Tod erhalten. Wird mit **Seelenkristallen** bezahlt,
die am Ende jedes Runs (egal ob Tod oder Sieg) vergeben werden.

### Seelenkristall-Vergabe

```
Kills × 0.5
+ Erreichte Welle × 5
+ Überlebende HP / 10
+ Bonus bei Sieg: +100
```

### Persistente Upgrades (12 Stück)

```csharp
static readonly MetaSkillDef[] META_SKILLS = {
    // Charakter-Upgrades
    new MetaSkillDef { Id="meta_hp",       Name="Zähigkeit",        Desc="+15 Start-HP pro Stufe",           Max=10, BaseCost=50,  BaseValue=15f  },
    new MetaSkillDef { Id="meta_speed",    Name="Wandergeist",      Desc="+5% Startgeschwindigkeit",         Max=5,  BaseCost=80,  BaseValue=0.05f},
    new MetaSkillDef { Id="meta_dmg",      Name="Alte Wunden",      Desc="+5% Startschaden",                 Max=5,  BaseCost=80,  BaseValue=0.05f},
    new MetaSkillDef { Id="meta_startgem", Name="Erbschaft",        Desc="+25 Startkristalle pro Stufe",     Max=8,  BaseCost=60,  BaseValue=25f  },
    new MetaSkillDef { Id="meta_regen",    Name="Urinstinkt",       Desc="+0.3 HP/s passiv (immer aktiv)",  Max=5,  BaseCost=100, BaseValue=0.3f },
    new MetaSkillDef { Id="meta_magnet",   Name="Gier",             Desc="+20 Magnet-Radius dauerhaft",      Max=5,  BaseCost=70,  BaseValue=20f  },

    // Run-Verbesserungen
    new MetaSkillDef { Id="meta_offers",   Name="Auswahl",          Desc="+1 Angebot beim Level-Up (max 5)", Max=2,  BaseCost=200, BaseValue=1f   },
    new MetaSkillDef { Id="meta_reroll",   Name="Schicksal",        Desc="1 Reroll pro Welle gratis",        Max=1,  BaseCost=300, BaseValue=1f   },
    new MetaSkillDef { Id="meta_weapslot", Name="Waffenarsenal",    Desc="+1 Waffen-Slot (max 8)",           Max=2,  BaseCost=350, BaseValue=1f   },

    // Charakter-Freischaltung (verknüpft mit 07_Charaktere.md)
    new MetaSkillDef { Id="unlock_shadow", Name="Schattenläuferin", Desc="Schattenläuferin freischalten",    Max=1,  BaseCost=300, BaseValue=0f   },
    new MetaSkillDef { Id="unlock_warrior",Name="Eisenkriegerin",   Desc="Eisenkriegerin freischalten",      Max=1,  BaseCost=500, BaseValue=0f   },
    new MetaSkillDef { Id="unlock_nature", Name="Naturwächter",     Desc="Naturwächter freischalten",        Max=1,  BaseCost=400, BaseValue=0f   },
};
```

### Persistente Werte auf Spieler anwenden

```csharp
void ApplyMetaToPlayer(Player p, MetaSkillTree meta) {
    int Lv(string id) => meta.GetLevel(id);

    p.MaxHp        += Lv("meta_hp")    * 15f;
    p.Hp            = p.MaxHp;
    p.BaseSpeed    *= 1f + Lv("meta_speed")  * 0.05f;
    p.Damage       *= 1f + Lv("meta_dmg")    * 0.05f;
    p.Regen        += Lv("meta_regen") * 0.3f;
    p.MagnetRadius += Lv("meta_magnet") * 20f;
    // Startkristalle werden in GameManager.StartGame vergeben
}
```

### Persistentes Speichern

Meta-Fortschritt wird getrennt vom Run-Save gespeichert:
- `aethermancer_meta` (eigener Eintrag in PlayerPrefs / eigene JSON-Datei)
- Wird bei Tod NICHT zurückgesetzt
- Enthält: Seelenkristall-Gesamt, alle Meta-Skill-Level, freigeschaltete Charaktere/Maps/Modi

```csharp
[System.Serializable]
public class MetaSaveData {
    public int                    Version = 1;
    public int                    SoulCrystals;       // Gesamt (auch ausgegebene)
    public int                    SoulCrystalsSpent;
    public Dictionary<string,int> MetaSkills;
    public List<string>           UnlockedCharacters;
    public List<string>           UnlockedMaps;
    public List<string>           UnlockedModes;
    public int                    BestWave;
    public long                   TotalPlaytime;      // Sekunden
}
```
