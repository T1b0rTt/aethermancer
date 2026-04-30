# Aethermancer

**Vampire Survivors-style HTML5 Arena Survival Game.**

Überlebe die Dunkelheit — kämpfe in einer endlosen Arena gegen Horden von Monstern, level auf, sammle Waffen und verbessere deine Fähigkeiten in 10 Runden mit je 10 Wellen.

## Spielen

```bash
# Lokal starten (kein Server nötig)
open index.html
```

Oder einfach `index.html` im Browser öffnen.

## Steuerung

| Taste | Aktion |
|-------|--------|
| WASD / Pfeiltasten | Bewegen |
| Automatisch | Schießen (auf nächsten Feind) |
| Leertaste | Superkraft |
| ESC | Pause |
| F5 | Speichern |

## Features

- **4 Charaktere** mit einzigartigen Stats, Passiven und Superkräften
  - ✨ Äthermagier — Arkane Nova (AoE-Explosion)
  - 🌑 Schattenläuferin — Kritische Treffer, Schattenklone
  - 🛡️ Eisenkriegerin — Tank mit Schadensreduktion, Erderschütterung
  - 🌿 Naturwächter — Heilung, rotierende Ranken

- **9 Feindtypen + 3 Bosse**
  - Zombies, Fledermäuse, Oger, Skelettmagier, Schleimklopse, Schattengeister
  - Lichkönig (Teleport + Beschwörung), Chaoskraken (Tentakel + Spin), Schattenboss

- **10 Runden × 10 Wellen** mit Boss-Rotation und Schwierigkeits-Skalierung

- **6 Waffen** mit Level-Up-System
  - 🔵 Magieschuss · 🟣 Orbit-Kugeln · ⚡ Blitzschlag
  - ❄️ Frostpfeil (Slow) · ☠️ Giftwolke (AoE) · 💠 Seelensplitter (Bounce)

- **12 Run-Upgrades** (Skilltree) pro Welle

- **12 Meta-Upgrades** (persistent) mit Seelenkristall-Währung
  - HP, Speed, Damage, Regeneration, Startgems, Magnet-Radius
  - Mehr Waffenangebote, Reroll, Extra-Waffenslot
  - Charakter-Freischaltungen

## Technik

- **Vanilla JS** (keine Frameworks, keine Abhängigkeiten)
- HTML5 Canvas Rendering
- SVG Sprites (16 handgefertigte Assets)
- Delta-Time Game Loop
- localStorage Persistenz (Run-Save + Meta-Progression)

## Fortschritt

```
✅ Block 1 — Neue Feinde (SkeletonMage, SlimeBlob, ShadowGhost)
✅ Block 2 — Neue Bosse (Lichkönig, Chaoskraken)
✅ Block 3 — 10 Runden × 10 Wellen System
✅ Block 4 — Charakter-Auswahl (4 Charaktere)
✅ Block 5 — EXP-System & Waffen-Auswahl
✅ Block 6 — Persistenter Meta-Skilltree
⬜ Block 7 — Spielmodi (Endlos, Zeitangriff, Herausforderungen)
⬜ Block 8 — Zweite Map (Verdorbener Wald)
⬜ Block 9 — UI & HUD Erweiterungen
⬜ Block 10 — Speicher-Erweiterung
```

## Projektstruktur

```
.
├── index.html      # Einstiegspunkt + DOM-Overlays
├── style.css       # HUD, Menüs, Overlays
├── js/
│   └── game.js     # Gesamte Spiellogik (~2600 Zeilen)
└── svg/
    ├── player.svg
    ├── shadow_runner.svg, warrior.svg, nature_guardian.svg
    ├── zombie.svg, bat.svg, ogre.svg, boss.svg
    ├── skeleton_mage.svg, slime.svg, slime_small.svg, ghost.svg
    ├── lichkoning.svg, kraken.svg, tentacle_arm.svg
    └── gem.svg
```
