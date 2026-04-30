# 05 — Rendering: Sprites, Kamera, Hintergrund, UI

---

## SVG → Sprite-Konvertierung

Die Original-Sprites sind SVG-Dateien. Für Unity/MonoGame müssen diese in PNG konvertiert werden.

### Empfohlene Tools
| Tool | Methode |
|------|---------|
| **Inkscape CLI** | `inkscape input.svg --export-png=output.png --export-width=96` |
| **Figma / Illustrator** | SVG öffnen, als PNG 2× oder 4× exportieren |
| **svg2png (npm)** | `npx svg2png input.svg -o output.png -w 96 -h 112` |

### Sprite-Größen (in Pixeln)

| Sprite          | Datei         | Breite | Höhe |
|-----------------|---------------|--------|------|
| Spieler (Magier)| player.svg    | 48     | 64   |
| Zombie          | zombie.svg    | 40     | 52   |
| Fledermaus      | bat.svg       | 64     | 36   |
| Oger            | ogre.svg      | 56     | 72   |
| Boss-Dämon      | boss.svg      | 96     | 112  |
| Kristall-Gem    | gem.svg       | 20     | 24   |

> **Tipp:** Bei 2× Auflösung exportieren (doppelte Pixelgröße), damit Sprites auf HiDPI-Screens scharf bleiben. In Unity Pixels Per Unit entsprechend setzen.

---

## Spieler-Sprite Details

- Bobbing-Animation: Y-Offset = `sin(walkAnim) * 2` Pixel (nur beim Bewegen)
- Unverwundbarkeit: `alpha = 0.5` wenn `invulnTime > 0`
- Ziel-Indikator: kleiner Kreis 30 Pixel in Richtung `aimAngle`
  ```csharp
  Vector2 aimDot = player.Position + new Vector2(
      Mathf.Cos(aimAngle) * 30,
      Mathf.Sin(aimAngle) * 30
  );
  // Kleiner Cyan-Kreis, Radius 3
  ```

---

## Feind-Sprite Details

### Trefferblitz
Wenn `enemy.FlashTime > 0`: Sprite mit weißem Multiply-Shader oder `Color.white` rendern.

In Unity:
```csharp
// Auf dem SpriteRenderer
spriteRenderer.color = enemy.FlashTime > 0 ? Color.white : Color.white; // normales white
// Besser: eigener Shader mit "Hit Flash" Parameter
material.SetFloat("_HitFlash", enemy.FlashTime > 0 ? 1f : 0f);
```

### HP-Balken (über jedem Feind)
```
Breite:  radius * 2 + 8
Höhe:    4 px
Y:       enemy.Position.y - radius - 10
Farbe Hintergrund: #330000
Farbe Balken:      #ff3333
Füllung: (hp / maxHp) * Breite
```

### Boss-Aura
Pulsierender Lila-Kreis, Radius = `enemy.Radius + 20`:
```csharp
float alpha = 0.18f + Mathf.Sin(Time.time / 0.3f) * 0.06f;
// Zeichne Kreis mit dieser Transparenz in #aa00ff
```

---

## Projektile

```
Kern:    Cyan (#00eeff), Radius 6, mit Glow-Effekt (shadowBlur in Canvas)
Leuchtpunkt: Weißer Kreis, Radius 2, bei (x-1, y-1)
Schweif: Transparenter Kreis (alpha 0.3) bei Position - Direction*10, Radius 3.6
```

In Unity: `Trail Renderer` oder manuell über `LineRenderer`.

---

## Nova-Effekt

Expandierender Ring, der in ~0.5 Sekunden auf Maximalradius wächst:
```csharp
// NovaEffect.cs
float progress = 1f - (life / maxLife);   // 0→1
float radius   = maxRadius * progress;
float alpha    = (life / maxLife) * 0.5f; // Verblasst

// Zeichne Ring: strokeStyle #cc88ff, lineWidth 6
// Zeichne Fläche: fillStyle #aa44ff, alpha * 0.2
```

---

## Hintergrund (Tiled)

```csharp
// Tile-Größe: 64×64 Pixel
// Farbe: #080818 (Dunkelblau-Schwarz)
// Gitterlinien: #111128, 0.5px

// Kamera-relativer Offset (damit Tiles mit der Kamera mitscrollen):
float offsetX = ((-camera.x % tileSize) + tileSize) % tileSize;
float offsetY = ((-camera.y % tileSize) + tileSize) % tileSize;

// Zeichne Tiles ab (offsetX - tileSize) bis (screenWidth + tileSize)
```

In Unity: TiledBackground mit Material, oder ein großes Quad mit Tiling-Shader.

---

## Partikel

```
Form:     Kreis, Radius = size * (life/maxLife)
Alpha:    life / maxLife
Farbe:    particle.color
Gravitation: velocity.y += 120 * dt
Reibung:  velocity.x *= 0.97 pro Frame
```

---

## UI — HUD (Screen Space)

Alle UI-Elemente sind unabhängig von der Kamera-Position.

### HP-Leiste (oben links)
```
Hintergrundbalken: 160×12px, #330000
Füllung:           (hp/maxHp)*160 px, Gradient #ee4444→#ff8866
Text:              "HP / maxHP", klein
```

### Währungs-Anzeige (oben rechts)
```
Text: "[Betrag] ◆ KRISTALLE"
Farbe: #00ccff
Größe: 18px bold
```

### Wellen-Anzeige (oben mitte)
```
Text: "Welle [N]"
Farbe: #ffdd44
Größe: 20px bold
```

### Superpower-Leiste (unten mitte)
```
Label:   "✨ ARKANE NOVA"
Balken:  220×10px, Gradient #8800ff→#cc44ff
Füllung: (1 - superpowerCd / superpowerMaxCd) * 220
Text:    "LEERTASTE — BEREIT!" wenn cd=0 (pulsierend)
         "Leertaste (X.Xs)"   wenn cd>0
```

---

## UI — Skill-Tree Overlay (Screen Space, Modal)

Beim Öffnen: Hintergrund abdunkeln (`rgba(0,0,5,0.92)`, Blur-Effekt).

Zeige **3 Skill-Karten** nebeneinander:
```
Breite:  220px
Höhe:    ~220px
Layout:  Flex-Row, Abstand 18px
Inhalt:  Icon | Name | Beschreibung | Stufe | Kosten
Hover:   Y-Transform -4px, hellerer Rand
```

Farbiger oberer Balken je Kategorie:
```
attack   → Rot-Orange Gradient
mobility → Grün-Cyan Gradient
defense  → Blau-Cyan Gradient
power    → Lila-Pink Gradient
```

---

## Float-Text (Floating Damage/Pickup Numbers)

Erscheint an Weltposition, bewegt sich nach oben und verblasst:

```csharp
// Konvertiere Weltposition → Screenposition
// Zeige Text 1.2 Sekunden lang
// Animation: Y -= 60px, Scale 1→0.8, Alpha 1→0
```
