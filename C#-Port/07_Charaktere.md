# 07 — Spielbare Charaktere (4 Stück)

---

## Konzept

Jeder Charakter hat:
- Eigene **Basiswerte** (HP, Speed, Damage)
- Eine **Startewaffe** (unterscheidet den Spielstil von Anfang an)
- Eine **Passive Fähigkeit** (immer aktiv)
- Eine **eigene Superkraft** (Leertaste, eigener Cooldown)
- Eigenes **SVG-Sprite**

Charaktere werden im Hauptmenü ausgewählt. Der gewählte Charakter wird mitgespeichert.
Neue Charaktere werden über **Meta-Progression** (Seelenkristalle) freigeschalten.

---

## Charakter 1 — Äthermagier *(Standard, von Anfang an verfügbar)*

| Eigenschaft | Wert |
|-------------|------|
| HP          | 150  |
| Speed       | 200  |
| Damage      | 40   |
| Startewaffe | Magieschuss |
| Passiv      | **Arkane Verstärkung** — jeder 5. Schuss macht 2× Schaden |
| Superkraft  | **Arkane Nova** — Flächenexplosion (Radius 300, 300 Schaden, 25s CD) |
| Freischalt  | Sofort verfügbar |

**Spielstil:** Ausgewogen. Gut für Einsteiger. Skaliert stark mit Feuerrate-Upgrades.

---

## Charakter 2 — Schattenläuferin *(freischaltbar)*

| Eigenschaft | Wert |
|-------------|------|
| HP          | 100  |
| Speed       | 290  |
| Damage      | 30   |
| Startewaffe | Schattenklinge (Nahkampf, rotierendes Orbit) |
| Passiv      | **Schattensprung** — nach einem Dash 1s Unverwundbarkeit + 50% mehr Schaden |
| Superkraft  | **Schattenklone** — 3 Klone erscheinen für 5s und greifen Feinde an (20s CD) |
| Freischalt  | 300 Seelenkristalle |

**Spielstil:** Hohe Mobilität, riskant. Belohnt aggressives Spielen in Menschenmassen.

---

## Charakter 3 — Eisenkriegerin *(freischaltbar)*

| Eigenschaft | Wert |
|-------------|------|
| HP          | 260  |
| Speed       | 140  |
| Damage      | 55   |
| Startewaffe | Kriegshammer (langsam, riesiger Nahkampfbereich) |
| Passiv      | **Schildwall** — nimmt 20% weniger Schaden; unter 30% HP zusätzlich 20% |
| Superkraft  | **Erderschütterung** — Stampf-Angriff, betäubt alle Feinde auf dem Bildschirm 2s (30s CD) |
| Freischalt  | 500 Seelenkristalle |

**Spielstil:** Tank. Überlebt lange, muss nah ran. Synergie mit Lifesteal-Skills.

---

## Charakter 4 — Naturwächter *(freischaltbar)*

| Eigenschaft | Wert |
|-------------|------|
| HP          | 180  |
| Speed       | 175  |
| Damage      | 35   |
| Startewaffe | Dornenranke (durchdringender Schuss, langsame Feuerrate) |
| Passiv      | **Lebensfluss** — Regen startet bei 2 HP/s (statt 0), skaliert mit fehlendem HP |
| Superkraft  | **Naturgewalt** — spawnt 8 rotierende Ranken für 6s (22s CD) |
| Freischalt  | 400 Seelenkristalle |

**Spielstil:** Durchhalter. Selbstheilung ermöglicht lange Runs ohne Defense-Upgrades.

---

## Charakter-Datenstruktur (C#)

```csharp
public struct CharacterDef {
    public string  Id;
    public string  Name;
    public string  SpritePath;
    public float   BaseHp;
    public float   BaseSpeed;
    public float   BaseDamage;
    public string  StartWeaponId;
    public string  PassiveName;
    public string  PassiveDesc;
    public string  SuperName;
    public string  SuperDesc;
    public float   SuperCooldown;
    public int     UnlockCost;     // 0 = sofort verfügbar
}
```

---

## Charakter-Auswahl-Screen

- Vor dem Start eines neuen Runs
- 4 Karten nebeneinander (oder 2×2 Grid)
- Gesperrte Charaktere zeigen Kosten in Seelenkristallen
- Ausgewählter Charakter wird für den Run gespeichert
- Letzter gespielter Charakter wird vorausgewählt
