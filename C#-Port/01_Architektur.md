# 01 — Architektur: Game-Loop, State Machine, Kamera

---

## Game States

Das Spiel kennt genau 6 Zustände. Nur im Zustand `Playing` läuft die Update-Logik.

```
MENU          → Startbildschirm, kein Update
PLAYING       → Normales Spiel, voller Update-Zyklus
PAUSED        → Eingabe blockiert, kein Update (ESC-Toggle)
SKILLTREE     → Nach jeder Welle, kein Update, UI-Overlay
GAMEOVER      → Spieler gestorben, kein Update
```

```csharp
public enum GameState { Menu, Playing, Paused, SkillTree, GameOver }
```

---

## Game-Loop (Update-Reihenfolge)

Nur aktiv wenn `state == Playing`. Delta-Time wird geclampt auf max. 80ms.

```
1.  Player.Update(dt)          — Bewegung, Cooldowns, Regen
2.  Camera.Follow(player)      — Kamera auf Spieler zentrieren
3.  Player.TryAutoShoot(dt)    — Neues Projektil spawnen wenn bereit
4.  foreach Enemy → Update(dt) — Feind-KI, Bewegung
5.  foreach Enemy → CheckPlayerCollision — Schaden an Spieler
6.  foreach Projectile → Update(dt)
7.  foreach Projectile → CheckEnemyCollisions
8.  foreach Effect → Update(dt)      — NovaEffect etc.
9.  foreach Particle → Update(dt)
10. foreach Pickup → Update(dt) + CheckPlayerCollection
11. WaveManager.Update(dt)     — Spawn-Queue abarbeiten, Wave-Ende prüfen
12. HUD.Update()               — HP-Bar, Superpower-Balken aktualisieren
```

---

## Render-Reihenfolge (Back → Front)

```
1.  Hintergrund (tiled, kamera-relativ)
2.  Pickups (Gems)
3.  Feinde
4.  Spieler
5.  Projektile
6.  NovaEffects
7.  Partikel
8.  UI / HUD (Screen-Space, kein Camera-Transform)
```

---

## Kamera

Die Kamera ist kein eigenes Objekt — sie ist ein `Vector2 offset`:

```csharp
// Kamera-Position (obere linke Ecke der Ansicht in Weltkoordinaten)
Vector2 camera = new Vector2(
    player.X - screenWidth  / 2f,
    player.Y - screenHeight / 2f
);

// Welt → Screen
Vector2 WorldToScreen(Vector2 worldPos) => worldPos - camera;

// Screen → Welt
Vector2 ScreenToWorld(Vector2 screenPos) => screenPos + camera;
```

In **Unity** einfach `Camera.main.transform.position` auf Spieler-Position setzen (Z = -10).

---

## Weltgröße

```csharp
const float WORLD_SIZE = 4000f;   // Quadratische Welt
const int   TILE_SIZE  = 64;      // Hintergrund-Kachelgröße
```

Spieler und Feinde werden per `Mathf.Clamp` innerhalb der Weltgrenzen gehalten.

---

## Klassen-Übersicht (empfohlene Unity-Struktur)

```
Scripts/
├── Core/
│   ├── GameManager.cs      ← State Machine, Singleton
│   ├── WaveManager.cs      ← Spawn-Queue, Wave-Fortschritt
│   └── SaveSystem.cs       ← JSON Serialize/Deserialize
├── Entities/
│   ├── Player.cs
│   ├── Enemy.cs            ← Basisklasse
│   ├── ZombieEnemy.cs
│   ├── BatEnemy.cs
│   ├── OgreEnemy.cs
│   └── BossEnemy.cs
├── Combat/
│   ├── Projectile.cs
│   ├── NovaEffect.cs
│   └── Particle.cs
├── Pickups/
│   └── GemPickup.cs
├── Systems/
│   └── SkillTree.cs        ← Skill-Daten + Anwendungslogik
└── UI/
    ├── HUD.cs
    ├── SkillTreeUI.cs
    └── MenuUI.cs
```

---

## Utility-Methoden (direkt übertragbar)

```csharp
static float Clamp(float v, float a, float b) => Math.Max(a, Math.Min(b, v));
static float Lerp(float a, float b, float t)  => a + (b - a) * t;
static float Rand(float a, float b)            => a + Random.value * (b - a);

static Vector2 Normalize(float dx, float dy) {
    float m = Mathf.Sqrt(dx*dx + dy*dy);
    if (m == 0) return Vector2.zero;
    return new Vector2(dx/m, dy/m);
}
```
