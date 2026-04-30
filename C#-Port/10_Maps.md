# 10 — Maps & Umgebungen

---

## Übersicht

| Map | Name | Freischalt | Stil |
|-----|------|------------|------|
| 1   | Verfluchte Katakomben | Sofort | Dunkel, Stein, Blau-Schwarz |
| 2   | Verdorbener Wald | 250 Seelenkristalle | Grün-Dunkel, Nebel, Bäume als Hindernisse |

---

## Map 1 — Verfluchte Katakomben *(aktuell)*

**Hintergrund:** Dunkle Steinfliesen, 64×64 Tile-Grid  
**Farben:** `#080818` (Boden), `#111128` (Gitterlinien)  
**Weltgröße:** 4000 × 4000  
**Besonderheiten:**
- Kein Hindernisse (offenes Feld)
- Seltene Dekoration: Knochen, Fackeln (rein visuell)

**Gegner-Thema:** Untote (Zombies, Fledermäuse, Oger, Boss-Dämonen)

---

## Map 2 — Verdorbener Wald

**Hintergrund:** Moos-Boden mit Wurzeln, Baum-Silhouetten  
**Farben:** `#060e06` (Boden), `#0a160a` (Gras-Muster), `#1a2e1a` (Gitterakzent)  
**Weltgröße:** 4000 × 4000  
**Besonderheiten:**
- **Baumstümpfe als Hindernisse** — Spieler und Feinde können nicht hindurch
- **Nebel-Effekt** — leichte Vignette, begrenzte Sichtweite am Rand
- **Seltene Pilzgruppen** — heilen den Spieler einmalig um 15 HP wenn berührt

**Gegner-Thema:** Waldkreaturen (neue Feinde bevorzugt hier)

### Hindernisse (Baumstümpfe)

```csharp
public struct Obstacle {
    public Vector2 Position;
    public float   Radius;      // Kollisionsradius (ca. 24–36)
    public bool    IsSolid;     // Spieler + Feinde werden blockiert
}

// Beim Map-Load: 80–120 zufällige Baumstümpfe platzieren
// Mindestabstand zum Spieler-Startpunkt: 200px
// Mindestabstand zueinander: 80px (kein Cluster)
```

### Kollisions-Check mit Hindernissen

```csharp
bool IsBlockedByObstacle(Vector2 newPos, float entityRadius, List<Obstacle> obstacles) {
    foreach (var obs in obstacles) {
        if (Vector2.Distance(newPos, obs.Position) < entityRadius + obs.Radius)
            return true;
    }
    return false;
}

// Gilt für: Spieler, Feinde, Projektile (Projektile werden zerstört)
```

### Heilpilze

```csharp
public class HealingMushroom {
    public Vector2 Position;
    public float   Radius   = 18f;
    public int     HealAmt  = 15;
    public bool    Used     = false;

    public bool CheckCollect(Player p) {
        if (Used) return false;
        if (Vector2.Distance(Position, p.Position) < Radius + p.Radius) {
            Used = true;
            return true;
        }
        return false;
    }
}
// Anzahl pro Run: 6–10 zufällig platziert, sichtbar als kleines grünes Objekt
```

---

## Map-Konfiguration (C#)

```csharp
public struct MapDef {
    public string   Id;
    public string   Name;
    public Color    TileColor;
    public Color    GridColor;
    public bool     HasObstacles;
    public bool     HasHealPickups;
    public string   EnemyTheme;     // beeinflusst welche Feinde bevorzugt spawnen
    public int      UnlockCost;
}

static readonly MapDef[] MAPS = {
    new MapDef {
        Id="catacombs", Name="Verfluchte Katakomben",
        TileColor=new Color(0.03f,0.03f,0.09f),
        GridColor=new Color(0.07f,0.07f,0.16f),
        HasObstacles=false, HasHealPickups=false,
        EnemyTheme="undead", UnlockCost=0
    },
    new MapDef {
        Id="forest", Name="Verdorbener Wald",
        TileColor=new Color(0.02f,0.06f,0.02f),
        GridColor=new Color(0.04f,0.09f,0.04f),
        HasObstacles=true, HasHealPickups=true,
        EnemyTheme="nature", UnlockCost=250
    },
};
```

---

## Map-Auswahl-Screen

Nach Modus-Auswahl (oder in separatem Screen):
- 2 Kacheln nebeneinander
- Gesperrte Map zeigt Freischalt-Kosten
- Vorschau-Thumbnail (Screenshot oder handgezeichnetes Bild)
- Aktuelle Map wird für den nächsten Run gespeichert

---

## Geplante weitere Maps (für spätere Updates)

| Name | Thema | Besonderheit |
|------|-------|--------------|
| Feuerhölle | Lavakammern | Boden-Lava-Schaden in Randbereichen |
| Gefrorene Zitadelle | Eisburg | Vereiste Feinde, Rutsch-Mechanik |
| Void-Abyss | Nichts | Unsichtbarer Boden, nur Plattformen |
