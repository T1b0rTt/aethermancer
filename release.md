# Aethermancer v1.0.0 — Release Notes

Erstes vollständiges Release. Alle 10 Implementierungs-Blöcke abgeschlossen.

## Features

### 4 spielbare Charaktere
- **Äthermagier** — Arkane Nova (AoE-Explosion)
- **Schattenläuferin** — Kritische Treffer + Schattenklone
- **Eisenkriegerin** — Tank mit Schadensreduktion + Erderschütterung
- **Naturwächter** — Heilung + rotierende Ranken

### 9 Feindtypen + 3 Bosse
- Zombies, Fledermäuse, Oger, Skelettmagier (Projektil), Schleimklopse (Teilung), Schattengeister (Phasing)
- **Lichkönig** — Schild + Teleport + Beschwörung (2 Phasen)
- **Chaoskraken** — Tentakel + Radial-Spin-Attacke
- **Schattenboss** — Klassischer Endboss

### 10 Runden × 10 Wellen
- Boss jede 10. Welle mit Rotation (Schatten → Lichkönig → Kraken)
- Finale Welle 100: alle 3 Bosse gleichzeitig
- Sieg-Screen mit "Weiterspielen (Endlos)"-Option

### 6 Waffen mit Level-Up-System
- 🔵 Magieschuss — Standard-Projektil
- 🟣 Orbit-Kugeln — Rotierende Schutzsphären
- ⚡ Blitzschlag — Trifft zufälligen Feind im Umkreis
- ❄️ Frostpfeil — Verlangsamt Feinde
- ☠️ Giftwolke — AoE-Gift über Zeit
- 💠 Seelensplitter — Bounced zwischen Feinden

### 3 Spielmodi
- **Standard** — 10 Runden × 10 Wellen mit Boss-Rotation
- **Endlosmodus** — Dynamische Spawns, lokaler Highscore
- **Zeitangriff** — 15 Minuten überleben

### Herausforderungs-Modus
8 zufällige Modifikatoren mit Bonus-Seelenkristall-Multiplikator:
- Kein Regen/Lifesteal, Halbe HP +50% Schaden, Doppelte Feinde, 90s Wellen-Timer
- Permadeath, Kein Level-Up, Feinde 50% schneller, Max 1 Waffe

### 2 Maps
- **Die Arena** — Offenes Feld ohne Hindernisse
- **Verdorbener Wald** — Baumstümpfe (Kollision), Heilpilze (+15 HP), Nebel-Vignette

### Meta-Progression
- 12 dauerhafte Meta-Upgrades (HP, Speed, Damage, Regen, Startgems, Magnet, etc.)
- Seelenkristall-Währung (kumulativ über alle Runs)
- 3 Charakter-Freischaltungen via Meta-Skills
- Speichern/Laden mit vollständigem State-Restore (Charakter, Modus, Map, Waffen, EXP)
- Reroll-Funktion im Skilltree

### HUD
- HP-Balken, EXP-Balken, Waffen-Slots (6 Felder)
- Boss-HP-Balken mit Schild-Anzeige (Lichkönig)
- Runde/Welle-Anzeige, Kristall/Seelenkristall-Zähler
- Spielzeit-Tracking, Run-Ende-Statistiken

## Steuerung

| Taste | Aktion |
|-------|--------|
| WASD / Pfeiltasten | Bewegen |
| Automatisch | Schießen |
| Leertaste | Superkraft |
| ESC | Pause |
| F5 | Speichern |

## Technik

- **Vanilla JS** — keine Frameworks, keine Abhängigkeiten
- HTML5 Canvas Rendering
- 18 handgefertigte SVG-Sprites
- Delta-Time Game Loop
- localStorage Persistenz (Run-Save v:5 + Meta-Save + Highscore)

## Installation

Keine Installation nötig. Einfach `index.html` im Browser öffnen.

```bash
open index.html
```

## Changelog

### v1.0.0 (Erstveröffentlichung)
- Alle 10 Blöcke abgeschlossen
- Vollständiges Spiel mit 4 Charakteren, 9 Feinden, 3 Bossen
- 6 Waffen, Meta-Progression, 3 Spielmodi, 2 Maps
- Komplettes HUD mit Boss-HP-Bar, Spielzeit, Sieg-Screen
