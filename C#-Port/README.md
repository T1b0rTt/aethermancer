# Aethermancer — C# Port

## Was ist dieses Projekt?

Aethermancer ist ein Vampire-Survivors-ähnliches Top-Down-Survival-Game, ursprünglich in
**HTML5 Canvas + Vanilla JavaScript** gebaut. Dieses Verzeichnis enthält alle Anweisungen,
Architektur-Beschreibungen und Datenstrukturen, die für einen sauberen C#-Port benötigt werden.

---

## Empfohlene C#-Frameworks

| Framework | Bewertung | Hinweis |
|-----------|-----------|---------|
| **Unity** | ⭐⭐⭐⭐⭐ | Empfehlung. Beste SVG/Sprite-Tools, Asset Store, große Community. |
| **MonoGame** | ⭐⭐⭐⭐ | Sehr nah an der Original-Architektur (Game-Loop, SpriteBatch). Kein Editor. |
| **Godot 4 (C#)** | ⭐⭐⭐⭐ | Gute Wahl wenn man Godot kennt. C#-Unterstützung solide. |

> Für diesen Port wird **Unity** empfohlen (2D URP). Die Dokumentation ist darauf ausgerichtet,
> kann aber leicht auf MonoGame übertragen werden.

---

## Ordnerstruktur der Dokumentation

```
C#-Port/
├── README.md               ← Diese Datei
├── 01_Architektur.md       ← Game-Loop, State Machine, Kamera
├── 02_Entities.md          ← Spieler, Feinde, Projektile, Partikel
├── 03_Wellensystem.md      ← Wave-Konfiguration, Spawning, Skalierung
├── 04_Skilltree.md         ← Upgrade-System, Skill-Daten
├── 05_Rendering.md         ← Sprites, Kamera, Hintergrund, UI
└── 06_Speichersystem.md    ← Save/Load mit JSON
```

---

## Originaldateien (JavaScript-Referenz)

```
game/
├── index.html              ← HTML-Struktur + UI-Overlays
├── style.css               ← UI-Styling (HUD, Skilltree, Menüs)
├── js/game.js              ← Gesamte Spiellogik (~1000 Zeilen)
└── svg/                    ← Sprite-Quellen
    ├── player.svg
    ├── zombie.svg
    ├── bat.svg
    ├── ogre.svg
    ├── boss.svg
    └── gem.svg
```

---

## Kernmechaniken auf einen Blick

- **Steuerung**: Pfeiltasten / WASD
- **Auto-Aim**: Nächster Feind wird automatisch anvisiert
- **Auto-Shoot**: Schuss ohne Spieler-Input, basierend auf `fireRate`
- **Wellen**: 10 vordefinierte Wellen + endlose Skalierung danach
- **Superkraft**: „Arkane Nova" — Flächenexplosion (Leertaste, 25s Cooldown)
- **Skilltree**: 3 zufällige Angebote nach jeder Welle, 12 Fähigkeiten gesamt
- **Währung**: Kristall-Gems aus toten Feinden aufsammeln
- **Speichern**: localStorage (JS) → wird zu JSON-Datei / PlayerPrefs (Unity)

---

## Nächste Schritte

1. Alle `.md`-Dateien in diesem Ordner lesen
2. Unity-Projekt anlegen (2D, URP)
3. SVGs zu PNG/Sprite konvertieren oder als SVG-Asset importieren
4. Mit `01_Architektur.md` beginnen → Top-Down implementieren
