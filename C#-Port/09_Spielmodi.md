# 09 — Spielmodi

---

## Übersicht

| Modus | Freischalt | Kernziel |
|-------|------------|----------|
| **Überleben** | Sofort | 10 Runden × 10 Wellen abschließen |
| **Endlosmodus** | Sofort | So lange wie möglich überleben |
| **Zeitangriff** | 200 Seelenkristalle | 15 Minuten überstehen |
| **Herausforderung** | 400 Seelenkristalle | Spezielle Modifikatoren, höhere Belohnungen |

---

## Modus 1 — Überleben *(Standard)*

**Ziel:** 10 Runden à 10 Wellen überstehen (100 Wellen gesamt).

```
Runde 1  → Wellen 1–10   (Welle 10  = Boss Runde 1)
Runde 2  → Wellen 11–20  (Welle 20  = Boss Runde 2)
...
Runde 10 → Wellen 91–100 (Welle 100 = Finaler Boss)
```

- Zwischen jeder Welle: 3 zufällige Waffen/Upgrades wählen
- Alle 10 Wellen: Boss + Skilltree-Screen + Auto-Save
- Belohnung bei Abschluss: Seelenkristalle basierend auf verbleibender HP, Zeit und Wave-Count
- Kein Fortschritt bei Tod → Run vorbei, Seelenkristalle aus bisherigem Run werden gutgeschrieben

**Boss-Rotation pro Runde:**

| Runde | Boss |
|-------|------|
| 1, 4, 7 | Schatten des Abgrunds |
| 2, 5, 8 | Lichkönig |
| 3, 6, 9 | Chaoskraken |
| 10      | Alle 3 Bosse gleichzeitig (Final) |

---

## Modus 2 — Endlosmodus

**Ziel:** Überlebe so lang wie möglich. Kein Ende.

- Wellen werden endlos wiederholt mit wachsendem `scale`
- `scale` steigt alle 5 Wellen um 1
- Feinde werden nach Welle 30 deutlich schneller als im Überleben-Modus
- Alle 10 Wellen Upgrade-Auswahl (kein Skilltree, nur Waffen)
- **Highscore:** Länste Überlebenszeit wird lokal gespeichert
- Belohnung: Seelenkristalle = Wellen × 2

```csharp
// Endlosmodus hat keine WaveData-Tabelle, nur dynamische Spawns
int zombies = 5 + wave * 2;
int bats     = wave > 3  ? 3 + wave      : 0;
int ogres    = wave > 8  ? 1 + wave/3    : 0;
int boss     = wave % 10 == 0 ? 1        : 0;
```

---

## Modus 3 — Zeitangriff

**Ziel:** 15 Minuten überstehen bei konstant fließenden Gegnern.

- Kein Wellensystem — Feinde spawnen kontinuierlich
- Spawn-Rate steigt alle 60 Sekunden
- Upgrade-Auswahl alle 3 Minuten (= 5× während des Runs)
- Timer läuft oben in der Mitte
- Kein Boss — dafür nach 10 und 13 Minuten je ein Mini-Boss (Oger-Horde)
- Bei Abschluss: Seelenkristalle × 1.5 Multiplikator
- Highscore: Meiste Kills in 15 Minuten

---

## Modus 4 — Herausforderung

**Ziel:** Überleben-Modus mit aktivierten Modifikatoren. Höhere Belohnung.

Beim Start: 1–3 zufällige Modifikatoren werden ausgewürfelt (anzeigbar, aber unveränderlich).

### Modifikator-Liste

| Name | Effekt | Bonus-Multiplikator |
|------|--------|---------------------|
| **Eisenherz** | Kein Lifesteal, kein Regen | × 1.5 |
| **Glasskanone** | −50% HP, +50% Schaden | × 1.3 |
| **Schwarm** | Doppelt so viele Feinde, −30% Feind-HP | × 1.4 |
| **Zeitdruck** | Wellen-Timer: Welle endet nach 90s (ob fertig oder nicht) | × 1.3 |
| **Permadeath** | Kein Auto-Save, kein Fortsetzen | × 2.0 |
| **Kein Skilltree** | Keine Upgrade-Auswahl zwischen Wellen | × 1.6 |
| **Raserei** | Feinde bewegen sich 50% schneller | × 1.4 |
| **Einzel-Waffe** | Max 1 aktive Waffe (skaliert stärker) | × 1.5 |

Kombinationen stapeln den Multiplikator-Bonus.

---

## Datenstruktur

```csharp
public enum GameMode { Survival, Endless, TimeAttack, Challenge }

public struct GameModeConfig {
    public GameMode Mode;
    public int[]    ActiveModifiers; // IDs der aktiven Modifikatoren (nur für Challenge)
}

public struct Modifier {
    public int    Id;
    public string Name;
    public string Desc;
    public float  BonusMultiplier;
}
```

---

## Modus-Auswahl-Screen

Nach Charakter-Auswahl:
- 4 Kacheln (2×2)
- Gesperrte Modi zeigen Freischalt-Kosten
- Challenge-Modus zeigt würfelbaren Vorschau-Modifikator
