# 08 — Waffen & Angriffe (18 Stück)

---

## Konzept

- Waffen werden beim **Level-Up** (3 zufällige Auswahl) oder im **Skilltree** freigeschaltet
- Der Spieler kann bis zu **6 aktive Waffen** gleichzeitig tragen
- Jede Waffe hat ein **Level 1–5** (beim erneuten Wählen der gleichen Waffe)
- Waffen und **Passive Items** teilen sich die 6 Slots
- Passive Items verstärken vorhandene Waffen (Synergie-System)
- Jede Waffe hat ein eigenes SVG-Icon (klein, für UI)

---

## Waffen-Kategorien

| Kategorie   | Typ            | Beschreibung |
|-------------|----------------|--------------|
| Projektil   | Gerichtet      | Fliegt in Richtung Ziel |
| Orbit       | Rotierend      | Kreist um den Spieler |
| Nahkampf    | Melee          | Trifft in der Nähe |
| Fläche      | AOE            | Trifft alle in einem Bereich |
| Beschwörung | Summon         | Spawnt Helfer/Strukturen |
| Passiv      | Item           | Verstärkt andere Waffen oder Stats |

---

## Alle 18 Waffen

### 1 — Magieschuss *(Startwaffe Äthermagier)*
- **Typ:** Projektil
- **Beschreibung:** Schneller Magiebolt auf den nächsten Feind.
- **Level-Skalierung:** +1 Projektil pro Level (bis 5 Projektile bei Lv5)
- **Passiv-Synergie:** "Arkaner Fokus" → +50% Schaden

---

### 2 — Orbiting Orbs
- **Typ:** Orbit
- **Beschreibung:** 2 Energiekugeln kreisen um den Spieler, treffen was sie berühren.
- **Level-Skalierung:** +1 Kugel pro Level (max 6), größerer Radius
- **Passiv-Synergie:** "Rotationsfeld" → Kugeln hinterlassen Energie-Trail

---

### 3 — Blitzschlag
- **Typ:** Fläche
- **Beschreibung:** Trifft alle 1.5s den nächsten Feind und kettet zu 2 weiteren.
- **Level-Skalierung:** +1 Kette, +Schaden
- **Passiv-Synergie:** "Leitfähigkeit" → Gegner bleiben 0.5s betäubt

---

### 4 — Frostpfeil
- **Typ:** Projektil
- **Beschreibung:** Langsames Projektil, verlangsamt Feinde um 40% für 2s.
- **Level-Skalierung:** Mehr Verlangsamung, mehr Projektile
- **Passiv-Synergie:** "Tiefschlaf" → Feinde unter 20% HP werden eingefroren

---

### 5 — Schattenklinge *(Startwaffe Schattenläuferin)*
- **Typ:** Orbit / Nahkampf
- **Beschreibung:** Rotierende Klingenklinge im engen Orbit. Schnell, durchdringend.
- **Level-Skalierung:** +1 Klinge, schnellere Rotation
- **Passiv-Synergie:** "Kritischer Schnitt" → 20% Crit-Chance, 2× Schaden

---

### 6 — Kriegshammer *(Startwaffe Eisenkriegerin)*
- **Typ:** Nahkampf / Fläche
- **Beschreibung:** Schlägt alle 1.2s in einem großen Bogen vor dem Spieler.
- **Level-Skalierung:** Größerer Bogen, mehr Schaden, Rückschlag
- **Passiv-Synergie:** "Erschütterung" → Bodenrisse dehnen sich aus

---

### 7 — Dornenranke *(Startwaffe Naturwächter)*
- **Typ:** Projektil
- **Beschreibung:** Durchdringender Schuss, trifft alle Feinde in einer Linie.
- **Level-Skalierung:** Mehr Projektile nebeneinander, +Schaden
- **Passiv-Synergie:** "Giftstacheln" → Feinde bluten 3s nach Treffer

---

### 8 — Giftnebel
- **Typ:** Fläche
- **Beschreibung:** Erzeugt alle 3s eine Giftcloud am Spieler (3s Lebenszeit).
- **Level-Skalierung:** Größere Cloud, mehr DPS, länger
- **Passiv-Synergie:** "Pesthauch" → Infizierte Feinde stecken andere an

---

### 9 — Heiliger Strahl
- **Typ:** Projektil (Homing)
- **Beschreibung:** Langsamer Strahl der sich aktiv auf Feinde zubewegt.
- **Level-Skalierung:** Mehr Strahlen, schärferes Tracking
- **Passiv-Synergie:** "Heiliger Zorn" → Trifft Boss, +100% Schaden

---

### 10 — Meteorregen
- **Typ:** Fläche (Random)
- **Beschreibung:** Alle 4s fallen 3 Meteore auf zufällige Feinde.
- **Level-Skalierung:** +1 Meteor, mehr Schaden, kleineres Intervall
- **Passiv-Synergie:** "Einschlagzone" → Meteore hinterlassen Feuerfläche (3s)

---

### 11 — Schallwelle
- **Typ:** Fläche (Kegel)
- **Beschreibung:** Kegelförmige Druckwelle nach vorne, wirft Feinde zurück.
- **Level-Skalierung:** Breiterer Kegel, mehr Rückwurf, mehr Schaden
- **Passiv-Synergie:** "Resonanz" → Zurückgeworfene Feinde explodieren beim Aufprall

---

### 12 — Dunkelblitz
- **Typ:** Projektil
- **Beschreibung:** Schnelles schwarzes Projektil, trifft 3× bevor es verschwindet.
- **Level-Skalierung:** +1 Treffer pro Projektil, höhere Feuerrate
- **Passiv-Synergie:** "Schattenecho" → Jeder Treffer spawnt ein kleines Schattenorb

---

### 13 — Zeitbombe
- **Typ:** Beschwörung
- **Beschreibung:** Platziert alle 5s eine Mine. Explodiert wenn Feind drüberläuft.
- **Level-Skalierung:** Mehr Minen gleichzeitig, größerer Explosionsradius
- **Passiv-Synergie:** "Kettenreaktion" → Explosion zündet benachbarte Minen

---

### 14 — Eissturm
- **Typ:** Fläche (Permanent)
- **Beschreibung:** Kleine Eiskristalle kreisen in größerem Orbit, langsam aber stark.
- **Level-Skalierung:** Mehr Kristalle, größerer Orbit
- **Passiv-Synergie:** "Absolute Null" → Feinde unter Eisstatus explodieren beim Tod

---

### 15 — Seelensplitter
- **Typ:** Projektil (Bounce)
- **Beschreibung:** Schuss prallt zwischen Feinden ab (bis zu 4× pro Schuss).
- **Level-Skalierung:** +1 Abpraller, mehr Schaden
- **Passiv-Synergie:** "Seelenraub" → Jeder Abpraller heilt 2 HP

---

### 16 — Tornados
- **Typ:** Fläche (Beweglich)
- **Beschreibung:** Spawnt 2 kleine Tornados, die sich zufällig durch die Arena bewegen.
- **Level-Skalierung:** +1 Tornado, größerer Radius, mehr DPS
- **Passiv-Synergie:** "Windkanal" → Tornados saugen Feinde an

---

### 17 — Skelett-Beschwörung
- **Typ:** Beschwörung
- **Beschreibung:** Beschwört 1 Skelett-Krieger der Feinde verfolgt.
- **Level-Skalierung:** +1 Skelett (max 5), mehr HP für Skelette
- **Passiv-Synergie:** "Untotenarmee" → Skelette explodieren beim Tod

---

### 18 — Arkanexplosion
- **Typ:** Fläche
- **Beschreibung:** Alle 6s Explosion um den Spieler (Radius 200).
- **Level-Skalierung:** Größerer Radius, mehr Schaden, kürzeres Intervall
- **Passiv-Synergie:** "Arkane Überlastung" → Tötet 5+ Feinde → sofortige zweite Explosion

---

## Passive Items (6 Stück, zählen als Waffen-Slot)

| Name | Effekt |
|------|--------|
| Arkaner Fokus | +50% Projektilschaden |
| Rotationsfeld | Orbit-Waffen: +30% Rotationsgeschwindigkeit, hinterlassen Trail |
| Leitfähigkeit | Blitz-Waffen: +2 Ketten, Feinde betäubt 0.5s |
| Tiefschlaf | Frost-Waffen: Einfrieren unter 20% HP |
| Kritischer Schnitt | +20% Crit-Chance global |
| Seelenresonanz | Jede 10. Kills: alle aktiven Waffen cooldown reset |

---

## Level-Up System

```csharp
public struct WeaponDef {
    public string   Id;
    public string   Name;
    public string   Icon;        // Emoji oder Sprite-Pfad
    public string   Category;   // "projectile" | "orbit" | "melee" | "aoe" | "summon" | "passive"
    public string   Desc;
    public int      MaxLevel;    // immer 5
    public float[]  DamagePerLevel;     // [Lv1, Lv2, Lv3, Lv4, Lv5]
    public float[]  CooldownPerLevel;
    public string   SynergyPassiveId;   // welches Passive diese Waffe synergiert
    public string   SynergyDesc;
}

// Beim Level-Up: 3 zufällige Waffen/Passives anbieten
// Bereits besessene Waffen können nochmal gewählt werden (= Level erhöhen)
// Neue Waffe = Lv1
```

---

## Waffen-UI (Ingame)

Unten links: bis zu 6 Slots, zeigen aktive Waffen mit Level-Pip.
```
[ 🌀 Lv3 ][ ⚡ Lv2 ][ 💀 Lv1 ][ __ ][ __ ][ __ ]
```
