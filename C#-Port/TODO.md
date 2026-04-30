# TODO — Aethermancer C# Port

---

## Phase 1 — Projekt-Setup

- [ ] Framework wählen (Unity 2D URP empfohlen)
- [ ] Unity-Projekt anlegen (2D, URP, C#)
- [ ] Ordnerstruktur anlegen (`Scripts/`, `Sprites/`, `Scenes/`, `Audio/`)
- [ ] SVGs nach PNG konvertieren — Original-Sprites (2× Auflösung)
  - [ ] player.svg → player.png (96×128)
  - [ ] zombie.svg → zombie.png (80×104)
  - [ ] bat.svg    → bat.png    (128×72)
  - [ ] ogre.svg   → ogre.png   (112×144)
  - [ ] boss.svg   → boss.png   (192×224)
  - [ ] gem.svg    → gem.png    (40×48)
- [ ] Neue Sprites erstellen / konvertieren
  - [ ] Schattenläuferin (48×64)
  - [ ] Eisenkriegerin (48×64)
  - [ ] Naturwächter (48×64)
  - [ ] SkeletonMage (40×52)
  - [ ] SlimeBlob groß (44×44) + klein (24×24)
  - [ ] ShadowGhost (40×52)
  - [ ] Lichkönig (96×112)
  - [ ] ChaosKraken (120×128)
  - [ ] Weapon-Icons für alle 18 Waffen (32×32 je)
  - [ ] Heilpilz (28×32)
- [ ] Sprites in Unity importieren, Pixels Per Unit setzen
- [ ] Haupt-Scene anlegen (`GameScene`)
- [ ] Kamera auf 2D einstellen, Hintergrundfarbe #080818

---

## Phase 2 — Core Systems

- [ ] `GameManager.cs` — Singleton, State Machine (Menu/Playing/Paused/SkillTree/LevelUp/GameOver)
- [ ] `InputHandler.cs` — Pfeiltasten/WASD, Space, ESC, F5
- [ ] Weltgrenzen definieren (4000×4000)
- [ ] Kamera-Follow implementieren (Camera folgt Spieler, Z=-10)
- [ ] `WaveManager.cs` — SpawnQueue, 10×10 Struktur, Boss-Rotation
- [ ] `PlayerLevel.cs` — EXP-System, Level-Up-Event
- [ ] Tiled-Hintergrund (64×64 Tile, kamera-relativ)

---

## Phase 3 — Entities: Spieler & Charaktere

- [ ] `Player.cs` — Basisklasse mit allen Stats
  - [ ] Bewegung, Weltgrenzen-Clamp
  - [ ] Auto-Aim, Auto-Shoot, ShotCooldown
  - [ ] TriShot, Piercing
  - [ ] Invulnerability-Frames
  - [ ] Regeneration, Lifesteal
  - [ ] Superpower-Cooldown
  - [ ] EXP aufnehmen, Level-Up auslösen
  - [ ] Wobble-Animation beim Laufen
- [ ] `CharacterDef.cs` — Datentabelle für 4 Charaktere
- [ ] Äthermagier-Passiv implementieren (jeder 5. Schuss 2×)
- [ ] Schattenläuferin-Passiv implementieren (Post-Dash-Bonus)
- [ ] Eisenkriegerin-Passiv implementieren (Schadensreduktion, HP-Threshold)
- [ ] Naturwächter-Passiv implementieren (skalierender Regen)
- [ ] Charakter-Auswahl-Screen (4 Karten, Freischalt-Lock)

---

## Phase 4 — Entities: Feinde & Bosse

- [ ] `Enemy.cs` — Basisklasse (HP, Speed, Damage, FlashTime, HP-Balken)
- [ ] `ZombieEnemy.cs`
- [ ] `BatEnemy.cs` (Zickzack via Sinuskurve)
- [ ] `OgreEnemy.cs`
- [ ] `SkeletonMage.cs` (Fernkampf, Abstandshalten, schießt Projektile)
- [ ] `SlimeBlob.cs` (Teilung bei Tod → 2 kleine Slimes)
- [ ] `ShadowGhost.cs` (Phasen-Unverwundbarkeit alle 3s)
- [ ] `BossEnemy.cs` (Schatten des Abgrunds, Charge-Angriff)
- [ ] `Lichkoning.cs` (Schild, Teleport, Skelett-Beschwörung)
- [ ] `ChaosKraken.cs` (Tentakel, Radial-Projektile, Spin-Attacke)
- [ ] Final-Boss-Logik (alle 3 gleichzeitig, Heilung bei Mitboss-Tod)

---

## Phase 5 — Waffen-System

- [ ] `WeaponDef.cs` — Datentabelle für alle 18 Waffen + 6 Passive
- [ ] `WeaponInstance.cs` — aktive Waffe mit Level, Cooldown, Effekt-Logik
- [ ] Waffen-Slots: max 6, anzeigbar in HUD
- [ ] Jede Waffe implementieren:
  - [ ] Magieschuss
  - [ ] Orbiting Orbs
  - [ ] Blitzschlag (Ketten-Logik)
  - [ ] Frostpfeil (Verlangsamung)
  - [ ] Schattenklinge (Orbit/Nahkampf)
  - [ ] Kriegshammer (Kegel-AOE)
  - [ ] Dornenranke (Pierce-Linie)
  - [ ] Giftnebel (AOE-Cloud)
  - [ ] Heiliger Strahl (Homing)
  - [ ] Meteorregen (Random AOE)
  - [ ] Schallwelle (Kegel + Knockback)
  - [ ] Dunkelblitz (Multi-Hit Projektil)
  - [ ] Zeitbombe (Mine-Spawner)
  - [ ] Eissturm (Orbit AOE)
  - [ ] Seelensplitter (Bounce-Projektil)
  - [ ] Tornados (bewegliche AOE)
  - [ ] Skelett-Beschwörung (Summon)
  - [ ] Arkanexplosion (periodische AOE)
- [ ] Passive Items implementieren (6 Stück, Synergie-Effekte)
- [ ] Waffen-Auswahl-Screen bei Level-Up (3 Angebote, pausiert Spiel)

---

## Phase 6 — Kampfsystem

- [ ] Projektil ↔ Feind Kollision + Piercing-Tracking
- [ ] Feind ↔ Spieler Kollision (DPS)
- [ ] Lifesteal bei Treffer
- [ ] Feind-Tod: Partikel + Gem + EXP + Kill-Zähler
- [ ] Slime-Teilung bei Tod
- [ ] SkeletonMage-Projektile (treffen auch Spieler)
- [ ] Tentakel (blockieren Spieler + Feind-Bewegung)
- [ ] Superkraft je Charakter implementieren
- [ ] Treffer-Blitz (weißer Shader, 0.12s)
- [ ] Screen-Shake bei Boss-Treffer + Nova
- [ ] Floating Text (Schaden, Heilung, EXP, +Kristalle)

---

## Phase 7 — Wellen & Spawning (10×10)

- [ ] Alle 10 WaveData-Templates übertragen (aus `03_Wellensystem.md`)
- [ ] Rundenindex + Wellen-in-Runde Berechnung
- [ ] Boss-Rotation implementieren (shadow/lich/kraken nach Runde)
- [ ] Final-Boss-Welle (Runde 10, Welle 100)
- [ ] SpawnQueue-Aufbau mit Timer-Sortierung
- [ ] Spawn-Position am Bildschirmrand
- [ ] Wellen-Skalierung per `scale = round`
- [ ] EXP je Feindtyp vergeben
- [ ] Wellen-Ende erkennen → Level-Up prüfen → Skilltree
- [ ] Wellen-Ankündigung (Label + Boss-Warnung)

---

## Phase 8 — Skilltree & Meta-Progression

- [ ] `SkillTree.cs` — 12 Run-Skills, 3 zufällige Angebote
- [ ] `MetaSkillTree.cs` — 12 persistente Meta-Skills
- [ ] `ApplySkillsToPlayer()` — Run-Skills auf Spieler
- [ ] `ApplyMetaToPlayer()` — Meta-Skills auf Spieler (beim Start)
- [ ] Skilltree-UI (Wellen-Ende: 3 Angebote)
- [ ] Meta-Skilltree-UI (Hauptmenü: alle Meta-Skills kaufbar)
- [ ] Seelenkristall-Vergabe bei Run-Ende (Tod oder Sieg)
- [ ] Reroll-Button (wenn Meta-Skill "Schicksal" gekauft)
- [ ] Charakter-Freischaltung über Meta-Skills

---

## Phase 9 — Spielmodi

- [ ] `GameModeConfig.cs` — Enum + Modifier-Daten
- [ ] Überleben-Modus (Standard, 100 Wellen)
- [ ] Endlosmodus (keine WaveData, dynamische Spawns)
- [ ] Zeitangriff-Modus (15 Minuten, Timer im HUD)
- [ ] Herausforderungs-Modus (1–3 zufällige Modifikatoren)
- [ ] Alle 8 Modifikatoren implementieren
- [ ] Modus-Auswahl-Screen (nach Charakter-Auswahl)
- [ ] Belohnungs-Multiplikatoren je Modus

---

## Phase 10 — Maps

- [ ] Map-Konfiguration (`MapDef.cs`)
- [ ] Map 1: Verfluchte Katakomben (aktuell, kein Umbau nötig)
- [ ] Map 2: Verdorbener Wald
  - [ ] Grüne Hintergrundfarben
  - [ ] Hindernisse (Baumstümpfe) spawnen + Kollision
  - [ ] Heilpilze spawnen + einsammeln + Heileffekt
  - [ ] Nebel-Vignette (Post-Processing)
- [ ] Map-Auswahl-Screen (nach Modus-Auswahl)
- [ ] Hindernisse in Enemy-KI berücksichtigen (Pathfinding oder einfaches Umgehen)

---

## Phase 11 — UI & HUD (vollständig)

- [ ] HP-Balken (Gradient rot)
- [ ] Runde + Welle Anzeige ("Runde 2 · Welle 4")
- [ ] Kristall-Anzeige
- [ ] Seelenkristall-Anzeige (nur Hauptmenü / Meta-Screen)
- [ ] Superpower-Balken (je Charakter eigene Farbe)
- [ ] Waffen-Slots (6 Icons unten links mit Level-Pip)
- [ ] Boss-HP-Balken (unten Mitte, nur bei aktiven Bossen)
- [ ] Level + EXP-Balken (oben oder neben HP)
- [ ] Wellen-Ankündigung + Boss-Warnung
- [ ] Hauptmenü (Neues Spiel / Fortsetzen / Meta-Upgrades)
- [ ] Charakter-Auswahl-Screen
- [ ] Modus-Auswahl-Screen
- [ ] Map-Auswahl-Screen
- [ ] Run-Ende-Screen (Sieg / Tod, Stats, Seelenkristalle verdient)
- [ ] Pause-Overlay
- [ ] Speichern-Indikator

---

## Phase 12 — Speichersystem

- [ ] `SaveData.cs` — Run-Save (Welle, HP, Skills, Waffen, Charakter, Modus, Map)
- [ ] `MetaSaveData.cs` — persistenter Save (Seelenkristalle, Meta-Skills, Freischaltungen)
- [ ] `SaveSystem.cs` — Save / Load / HasSave / Delete (beide Typen)
- [ ] Auto-Save nach jeder Welle
- [ ] Auto-Save nach Skill-/Waffen-Kauf
- [ ] Meta-Save nach Run-Ende
- [ ] Manuell speichern: F5
- [ ] Kein Run-Save bei Tod (aber Meta-Save immer)
- [ ] Schema-Versionierung + Migration

---

## Phase 13 — Polish & Audio

- [ ] Hintergrundmusik (Loop, je Map eigener Track)
- [ ] Sound-Effekte: Schuss, Treffer, Tod, Gem, Nova, Level-Up, Kauf
- [ ] Feind-Spawn-Animation (Fade-In)
- [ ] Spieler-Lauf-Animation
- [ ] Boss-Eintritts-Cutscene (kurze Kamerafahrt)
- [ ] Highscore-Tabelle (lokal, beste Welle + Zeit pro Charakter)
- [ ] Vollbild (F11 / Alt+Enter)
- [ ] Einstellungen: Lautstärke, Vollbild, Sprache

---

## Phase 14 — Build & Release

- [ ] Build-Settings: Windows / Mac / Linux
- [ ] App-Icon setzen
- [ ] Build testen (kein Editor)
- [ ] Speicherpfad Release: `%AppData%/Aethermancer/`
- [ ] Optional: WebGL-Build für itch.io

---

## Empfohlene Reihenfolge

```
1 → 2 → 3 (1 Charakter) → 6 (Basis-Kampf) → 4 (alle Feinde) →
5 (Waffen) → 7 (Wellen) → 8 (Progression) → 9 → 10 → 11 → 12 → 13 → 14
```

> Spielbar nach Phase 6 (1 Charakter, Zombies, Magieschuss, keine Wellen).
> Feature-Complete nach Phase 12.
