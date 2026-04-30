# TODO — Aethermancer JavaScript (Originalspiel)

Alle geplanten Features und Erweiterungen für die laufende HTML5/JS-Version.
**Implementierung erst nach ausdrücklichem OK.**

---

## Block 1 — Neue Feinde (3 Stück) ✅

- [x] **SkeletonMagier** (`svg/skeleton_mage.svg` erstellen)
  - [x] SVG-Sprite: weißes Skelett in Robe, Stab mit rotem Orb
  - [x] Klasse `SkeletonMageEnemy` in `game.js`
  - [x] Hält Abstand (220px), nähert sich nur wenn zu weit
  - [x] Schießt alle 2.5s ein rotes Projektil auf den Spieler
  - [x] Feind-Projektil-Klasse (trifft Spieler, kein Piercing)
  - [x] Ab Welle 5 spawnen

- [x] **SchleimKlops** (`svg/slime.svg` + `svg/slime_small.svg` erstellen)
  - [x] 2 SVGs: großer Slime (grün, glänzend) + kleiner Slime
  - [x] Klasse `SlimeEnemy` mit `isSmall`-Flag
  - [x] Bei Tod (wenn nicht `isSmall`): 2 kleine Slimes an gleicher Position spawnen
  - [x] Kleiner Slime teilt sich nicht mehr
  - [x] Ab Welle 3 spawnen

- [x] **Schattengeist** (`svg/ghost.svg` erstellen)
  - [x] SVG-Sprite: halbtransparente lila Gestalt
  - [x] Klasse `GhostEnemy`
  - [x] Alle 3s: 1s lang unverwundbar + Sprite auf alpha 0.2
  - [x] Projektile die während Phase treffen werden ignoriert (`canBeHit()`-Check)
  - [x] Ab Welle 6 spawnen

---

## Block 2 — Neue Bosse (2 Stück) ✅

- [x] **Lichkönig** (`svg/lichkoning.svg` erstellen)
  - [x] SVG-Sprite: Skelett-König mit Krone, Schild-Aura
  - [x] Klasse `LichkoningEnemy`
  - [x] Schild-Phase (600 HP Schild, absorbiert Schaden zuerst, blau dargestellt)
  - [x] Nach Schild-Tod: Phase 2 (schneller, mehr Beschwörungen)
  - [x] Teleportiert alle 6s hinter den Spieler
  - [x] Beschwört alle 8s 3 Zombies (Phase 1) / 6 Zombies (Phase 2)
  - [x] Boss-HP-Balken: zeigt Schild (blau) getrennt von HP (rot)

- [x] **Chaoskraken** (`svg/kraken.svg` erstellen)
  - [x] SVG-Sprite: dunkler Oktopus, Tentakelarme
  - [x] Klasse `KrakenEnemy`
  - [x] Spawnt alle 3s einen Tentakel nahe Spieler (steht 4s, Kontaktschaden)
  - [x] Tentakel-Klasse: separates Objekt, eigene Kollision
  - [x] Alle 10s: Spin-Attacke (2s), feuert 8 Projektile radial
  - [x] Klasse `TentacleArm` als eigenes Entity

---

## Block 3 — 10 Runden × 10 Wellen System ✅

- [x] Wellenzähler auf 100 (10 Runden à 10 Wellen) umstellen
- [x] Interne Berechnung: `round = Math.floor(waveIndex / 10)`, `waveInRound = waveIndex % 10`
- [x] HUD-Anzeige ändern: `"Runde 1 · Welle 3"` statt `"Welle 3"`
- [x] Boss-Wellen nur auf Welle 10, 20, 30 ... (jede 10. Welle)
- [x] Boss-Rotation: `round % 3 === 0` → Schatten, `=== 1` → Lichkönig, `=== 2` → Kraken
- [x] Runde-10-Welle-100: Finaler Boss (alle 3 gleichzeitig)
- [x] `WAVE_DATA`-Tabelle auf 10 Templates kürzen, Rest via Skalierung
- [x] Boss-Welle-Label anpassen ("BOSS — Runde X")
- [x] Schwierigkeits-Skalierung: `scale = round` (statt `Math.floor(idx / WAVE_DATA.length)`)

---

## Block 4 — Charakter-Auswahl (4 Charaktere) ✅

- [x] Charakter-Datentabelle `CHARACTERS` in `game.js` anlegen
- [x] **Äthermagier** (aktuell): keine Änderungen nötig, wird Charakter 1
- [x] **Schattenläuferin** (`svg/shadow_runner.svg` erstellen)
  - [x] SVG-Sprite: dunkle Figur, Kapuze, Klingenakzente
  - [x] Stats: 100 HP, Speed 290, Damage 30
  - [x] Passiv: jeder 5. Schuss ist Crit (2×)
  - [x] Superkraft: "Schattenklone" — 3 Klone für 5s (20s CD)
- [x] **Eisenkriegerin** (`svg/warrior.svg` erstellen)
  - [x] SVG-Sprite: Rüstung, Hammer
  - [x] Stats: 260 HP, Speed 140, Damage 55
  - [x] Passiv: 20% Schadensreduktion; unter 30% HP +20%
  - [x] Superkraft: "Erderschütterung" — Feinde auf Screen 2s betäuben (30s CD)
- [x] **Naturwächter** (`svg/nature_guardian.svg` erstellen)
  - [x] SVG-Sprite: grüne Robe, Ranken-Stab
  - [x] Stats: 180 HP, Speed 175, Damage 35
  - [x] Passiv: startet mit 2 HP/s Regen
  - [x] Superkraft: "Naturgewalt" — 8 rotierende Ranken für 6s (22s CD)
- [x] Charakter-Auswahl-Screen (Menü: vor Spielstart)
  - [x] 4 Karten nebeneinander
  - [x] Gesperrte Charaktere zeigen Kosten (Seelenkristalle)
  - [x] Auswahl wird gespeichert
- [x] `applyCharacterToPlayer()` beim Spielstart aufrufen

---

## Block 5 — EXP-System & Level-Up mit Waffen-Auswahl ✅

- [x] `PlayerLevel`-Objekt: `level`, `exp`, `expToNext`
- [x] EXP-Tabelle je Feindtyp (zombie 4, bat 3, ogre 12, boss 100 ...)
- [x] EXP-Anzeige im HUD (kleiner Balken unter HP oder oben)
- [x] Level-Up-Event: Spiel pausiert, Waffen-Auswahl-Screen öffnet sich
- [x] Waffen-Datentabelle `WEAPONS` (18 Einträge, erstmal 6 für Start)
  - [x] Magieschuss (bereits vorhanden, als Waffe verwalten)
  - [x] Orbiting Orbs
  - [x] Blitzschlag
  - [x] Frostpfeil (mit Slow-Effekt)
  - [x] Giftnebel
  - [x] Seelensplitter (Bounce)
- [x] Waffen-Instanzen: `{id, level}` pro aktiver Waffe
- [x] Max 6 aktive Waffen gleichzeitig
- [x] Waffen-Slots-Anzeige unten links im HUD
- [x] Waffen-Auswahl-Screen: 3 zufällige Angebote
  - [x] Bereits besessene Waffe: zeigt aktuelles Level, Level-Up möglich
  - [x] Neue Waffe: zeigt "NEU" Badge
  - [x] "Überspringen" Button
- [x] Waffeneffekte updaten im Game-Loop (je nach aktiven Waffen)

---

## Block 6 — Persistenter Skilltree (Meta-Progression) ✅

- [x] Seelenkristalle: eigene Währung, getrennt von Run-Kristallen
- [x] Seelenkristall-Vergabe bei Run-Ende: `kills * 0.5 + wave * 5 + hp/10`
- [x] `MetaSkillTree`-Objekt mit eigenem localStorage-Key `aethermancer_meta`
- [x] 12 Meta-Skills implementieren (Datentabelle `META_SKILLS`)
  - [x] meta_hp (Start-HP Bonus)
  - [x] meta_speed (Start-Speed Bonus)
  - [x] meta_dmg (Start-Schaden Bonus)
  - [x] meta_startgem (Start-Kristalle)
  - [x] meta_regen (passiver Regen)
  - [x] meta_magnet (größerer Magnet-Radius)
  - [x] meta_offers (mehr Level-Up Angebote)
  - [x] meta_reroll (1 Reroll pro Welle)
  - [x] meta_weapslot (+1 Waffen-Slot)
  - [x] unlock_shadow (Schattenläuferin freischalten)
  - [x] unlock_warrior (Eisenkriegerin freischalten)
  - [x] unlock_nature (Naturwächter freischalten)
- [x] Meta-Skilltree-Screen im Hauptmenü ("Upgrades"-Button)
  - [x] Zeigt alle Meta-Skills mit Level und Kosten
  - [x] Seelenkristall-Anzeige oben
- [x] `applyMetaToPlayer()` beim Spielstart
- [x] Meta-Save bei jedem Run-Ende (Sieg + Tod)
- [x] Run-Save bei Tod NICHT überschreiben

---

## Block 7 — Spielmodi

- [ ] Modus-Datentabelle `GAME_MODES` anlegen
- [ ] Modus-Auswahl-Screen (nach Charakter-Auswahl)
- [ ] **Endlosmodus**: dynamische Spawns statt WaveData, unendlich
  - [ ] Spawn-Rate-Formel: `5 + wave * 2` Zombies etc.
  - [ ] Upgrade alle 10 Wellen
  - [ ] Highscore: längste Überlebenszeit in localStorage
- [ ] **Zeitangriff** (15 Minuten):
  - [ ] Countdown-Timer im HUD statt Wellen-Anzeige
  - [ ] Kontinuierlicher Spawn (steigend alle 60s)
  - [ ] Sieg-Screen bei 0:00
- [ ] **Herausforderungs-Modus**:
  - [ ] 8 Modifikatoren als Datentabelle
  - [ ] Beim Start: 1–3 zufällige Modifikatoren ziehen + anzeigen
  - [ ] Jeden Modifikator als Flag im GameManager implementieren
    - [ ] Kein Regen / Lifesteal
    - [ ] Halbe HP, +50% Schaden
    - [ ] Doppelte Feinde, halbe Feind-HP
    - [ ] 90s Wellen-Timer
    - [ ] Permadeath (kein Save)
    - [ ] Kein Skilltree / Level-Up
    - [ ] Feinde 50% schneller
    - [ ] Max 1 Waffe
  - [ ] Bonus-Kristall-Multiplikator anzeigen

---

## Block 8 — Zweite Map (Verdorbener Wald)

- [ ] Map-Datentabelle `MAPS` anlegen
- [ ] Map-Auswahl-Screen (nach Modus-Auswahl)
- [ ] **Map 2: Verdorbener Wald**
  - [ ] Hintergrundfarbe: `#060e06` / `#0a160a`
  - [ ] Baumstumpf-Klasse: Position, Radius, Kollision
  - [ ] 80–120 Baumstümpfe zufällig platzieren (Mindestabstand zum Start: 200px)
  - [ ] `svg/tree_stump.svg` erstellen
  - [ ] Spieler-Kollision mit Baumstümpfen (Bewegung blockieren)
  - [ ] Feind-Kollision mit Baumstümpfen (Bewegung blockieren oder umgehen)
  - [ ] Projektile bei Baumstumpf-Treffer zerstören
  - [ ] Heilpilze spawnen (6–10 pro Map)
  - [ ] `svg/mushroom.svg` erstellen
  - [ ] Heilpilz aufsammeln → +15 HP, einmalig
  - [ ] Nebel-Vignette: CSS radial-gradient über Canvas

---

## Block 9 — UI & HUD Erweiterungen

- [ ] HUD-Anzeige: "Runde X · Welle Y" statt "Welle N"
- [ ] EXP-Balken im HUD
- [ ] Waffen-Slots (6 Felder unten links)
- [ ] Boss-HP-Balken (unten mitte, nur bei aktiven Bossen sichtbar)
  - [ ] Schild-Segment (blau) + Boss-HP (rot) für Lichkönig
- [ ] Seelenkristall-Anzeige im Run-Ende-Screen
- [ ] Run-Ende-Screen (Sieg bei Welle 100 oder Tod)
  - [ ] Statistiken: Welle, Kills, Zeit, verdiente Seelenkristalle
  - [ ] "Weiterspielen" (nur bei Sieg) + "Hauptmenü"
- [ ] Meta-Upgrades-Screen im Hauptmenü
- [ ] Charakter-Auswahl-Screen
- [ ] Modus-Auswahl-Screen
- [ ] Map-Auswahl-Screen
- [ ] Reroll-Button im Wellen-Upgrade-Screen (wenn Meta-Skill aktiv)

---

## Block 10 — Speicher-Erweiterung

- [ ] Run-Save um Charakter, Modus, Map, Waffen, Level, EXP erweitern
- [ ] Separaten Meta-Save (`aethermancer_meta`) anlegen
- [ ] Meta-Save bei Tod automatisch
- [ ] Run-Save bei Tod NICHT schreiben
- [ ] Sieg: Run-Save löschen, Meta-Save aktualisieren
- [ ] Version auf `v:2` erhöhen, Migration von `v:1` schreiben
- [ ] Seelenkristalle kumulativ addieren (nicht überschreiben)

---

## Fortschritt

```
✅ Block 1 — Neue Feinde (SkeletonMage, SlimeBlob, ShadowGhost)
✅ Block 2 — Neue Bosse (Lichkönig, Chaoskraken)
✅ Block 3 — 10 Runden × 10 Wellen System
✅ Block 4 — Charakter-Auswahl (4 Charaktere)
✅ Block 5 — EXP-System & Waffen-Auswahl
✅ Block 6 — Persistenter Meta-Skilltree
⬜ Block 7 — Spielmodi
⬜ Block 8 — Zweite Map
⬜ Block 9 — UI & HUD Erweiterungen
⬜ Block 10 — Speicher-Erweiterung
```

> ✅ Nach Block 1–4: alle Kämpfe + Charaktere vollständig.
> ⬜ Nach Block 5: Waffen-System läuft.
> ⬜ Nach Block 6: vollständige Progression.
