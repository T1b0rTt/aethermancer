# 02 — Entities: Spieler, Feinde, Projektile, Partikel

---

## Player

### Felder

```csharp
public class Player {
    // Position & Kollision
    public Vector2 Position;
    public float   Radius = 18f;

    // Bewegung
    public float   BaseSpeed = 200f;   // wird durch Skill modifiziert
    public float   Speed => BaseSpeed; // Property

    // Kampf
    public float   Damage         = 40f;
    public float   FireRate        = 1.5f;  // Schüsse pro Sekunde
    public float   ShotCooldown   = 0f;    // aktueller Cooldown-Timer
    public float   ProjectileSpeed = 520f;
    public bool    TriShot        = false; // 3 Projektile gleichzeitig
    public bool    Piercing       = false; // Projektile durchdringen

    // Leben
    public float   MaxHp    = 150f;
    public float   Hp       = 150f;
    public float   Regen    = 0f;      // HP/s
    public float   Lifesteal = 0f;     // 0.0–1.0

    // Magnet
    public float   MagnetRadius = 40f; // Pickup-Einsammelradius

    // Superkraft
    public float   SuperpowerMaxCd = 25f;
    public float   SuperpowerCd    = 0f;

    // Internes
    private float  invulnTime = 0f;
    private float  aimAngle   = 0f;
    private float  walkAnim   = 0f;
    public  int    Score      = 0;
}
```

### Update

```csharp
void Update(float dt, InputState input, List<Enemy> enemies) {
    // 1. Bewegung
    Vector2 move = input.MoveDirection; // normalisiert aus Pfeiltasten
    if (move != Vector2.zero) {
        Position += move * Speed * dt;
        Position = ClampToWorld(Position);
        walkAnim += dt * 8f;
    }

    // 2. Auto-Aim: nächsten Feind finden
    Enemy nearest = FindNearest(enemies);
    if (nearest != null)
        aimAngle = Mathf.Atan2(nearest.Y - Position.Y, nearest.X - Position.X);

    // 3. Cooldowns
    SuperpowerCd = Mathf.Max(0, SuperpowerCd - dt);
    invulnTime   = Mathf.Max(0, invulnTime   - dt);
    ShotCooldown = Mathf.Max(0, ShotCooldown - dt);

    // 4. Regeneration
    if (Regen > 0) Hp = Mathf.Min(MaxHp, Hp + Regen * dt);
}
```

### Auto-Shoot

```csharp
List<Projectile> TryShoot(List<Enemy> enemies) {
    if (ShotCooldown > 0 || enemies.Count == 0) return null;
    ShotCooldown = 1f / FireRate;

    var shots = new List<Projectile>();
    float[] angles = TriShot
        ? new[] { aimAngle - 0.22f, aimAngle, aimAngle + 0.22f }
        : new[] { aimAngle };

    foreach (float a in angles)
        shots.Add(new Projectile(Position, a, Damage, ProjectileSpeed, Piercing));

    return shots;
}
```

### Schaden nehmen

```csharp
void TakeDamage(float dmg) {
    if (invulnTime > 0) return;
    Hp -= dmg;
    invulnTime = 0.15f;   // kurze Unverwundbarkeit nach Treffer
}
```

---

## Enemy (Basisklasse)

```csharp
public abstract class Enemy {
    public Vector2 Position;
    public float   Radius;
    public float   MaxHp, Hp;
    public float   Speed;
    public float   Damage;      // DPS bei Kontakt mit Spieler
    public int     Reward;      // Kristall-Wert
    public int     ScoreValue;
    public int     Id;          // eindeutige ID für Piercing-Tracking
    public float   FlashTime;   // Trefferblitz-Timer
    public Color   BloodColor;

    public bool Dead => Hp <= 0;
    public bool CollidesWithPlayer(Player p) =>
        Vector2.Distance(Position, p.Position) < Radius + p.Radius - 6f;

    public virtual void Update(float dt, Player player) {
        FlashTime = Mathf.Max(0, FlashTime - dt);
        Vector2 dir = (player.Position - Position).normalized;
        Position += dir * Speed * dt;
        Position = ClampToWorld(Position);
    }

    public void TakeDamage(float dmg) {
        Hp -= dmg;
        FlashTime = 0.12f;
        // Partikel spawnen (via Callback oder Event)
    }
}
```

### ZombieEnemy

```csharp
public class ZombieEnemy : Enemy {
    public ZombieEnemy(Vector2 pos, int waveScale) {
        Radius     = 16f;
        MaxHp = Hp = 60f + waveScale * 15f;
        Speed      = 55f + waveScale * 5f;
        Damage     = 12f;
        Reward     = 8;
        ScoreValue = 10;
        BloodColor = new Color(0.2f, 0.4f, 0.0f);
    }
}
```

### BatEnemy

Sonderfall: zickzack Bewegung über Sinuskurve.

```csharp
public class BatEnemy : Enemy {
    private float wobble;
    private float wobbleDir;

    public BatEnemy(Vector2 pos, int waveScale) {
        Radius     = 14f;
        MaxHp = Hp = 25f + waveScale * 8f;
        Speed      = 130f + waveScale * 10f;
        Damage     = 8f;
        Reward     = 5;
        ScoreValue = 8;
        wobble     = Random.value * Mathf.PI * 2;
        wobbleDir  = Random.value > 0.5f ? 1f : -1f;
    }

    public override void Update(float dt, Player player) {
        FlashTime = Mathf.Max(0, FlashTime - dt);
        wobble += dt * 4f;

        Vector2 toPlayer = (player.Position - Position).normalized;
        float   perp     = wobbleDir;
        Vector2 offset   = new Vector2(Mathf.Cos(wobble) * perp * 0.4f,
                                       Mathf.Sin(wobble) * perp * 0.4f);
        Vector2 dir = (toPlayer + offset).normalized;
        Position += dir * Speed * dt;
        Position = ClampToWorld(Position);
    }
}
```

### OgreEnemy

```csharp
public class OgreEnemy : Enemy {
    public OgreEnemy(Vector2 pos, int waveScale) {
        Radius     = 28f;
        MaxHp = Hp = 280f + waveScale * 60f;
        Speed      = 40f + waveScale * 3f;
        Damage     = 25f;
        Reward     = 25;
        ScoreValue = 30;
    }
}
```

### BossEnemy

Sonderfall: Charge-Angriff alle 4 Sekunden.

```csharp
public class BossEnemy : Enemy {
    private float chargeTimer    = 0;
    private float chargeInterval = 4f;
    private bool  charging       = false;
    private Vector2 chargeVel;
    private float chargeDuration = 0;

    public BossEnemy(Vector2 pos, int waveScale) {
        Radius     = 44f;
        MaxHp = Hp = 2500f + waveScale * 400f;
        Speed      = 48f + waveScale * 4f;
        Damage     = 40f;
        Reward     = 200;
        ScoreValue = 500;
    }

    public override void Update(float dt, Player player) {
        FlashTime = Mathf.Max(0, FlashTime - dt);
        chargeTimer += dt;

        if (charging) {
            Position     += chargeVel * dt;
            chargeDuration -= dt;
            if (chargeDuration <= 0) charging = false;
        } else {
            Vector2 dir = (player.Position - Position).normalized;
            Position += dir * Speed * dt;

            if (chargeTimer >= chargeInterval) {
                chargeTimer    = 0;
                charging       = true;
                chargeDuration = 0.4f;
                chargeVel      = (player.Position - Position).normalized * 480f;
            }
        }
        Position = ClampToWorld(Position);
    }
}
```

---

## Projectile

```csharp
public class Projectile {
    public Vector2    Position;
    public Vector2    Direction;   // normalisiert
    public float      Damage;
    public float      Speed;
    public bool       Piercing;
    public float      Life   = 3.5f;
    public float      Radius = 6f;
    public HashSet<int> HitIds = new HashSet<int>(); // für Piercing

    public bool Dead => Life <= 0
                     || Position.x < -100 || Position.x > WORLD + 100
                     || Position.y < -100 || Position.y > WORLD + 100;

    public void Update(float dt) {
        Position += Direction * Speed * dt;
        Life     -= dt;
    }

    // Gibt true zurück wenn Treffer (und registriert ihn)
    public bool CheckHit(Enemy e) {
        if (HitIds.Contains(e.Id)) return false;
        if (Vector2.Distance(Position, e.Position) >= Radius + e.Radius) return false;
        HitIds.Add(e.Id);
        if (!Piercing) Life = 0;
        return true;
    }
}
```

---

## Particle

```csharp
public class Particle {
    public Vector2 Position;
    public Vector2 Velocity;
    public Color   Color;
    public float   Size;
    public float   Life, MaxLife;

    public bool Dead => Life <= 0;

    public void Update(float dt) {
        Position  += Velocity * dt;
        Velocity.y += 120f * dt;  // Gravitation
        Velocity.x *= 0.97f;
        Life       -= dt;
    }
}

// Hilfsmethode
static void SpawnBlood(List<Particle> list, Vector2 pos, int n = 12, Color color = ...) {
    for (int i = 0; i < n; i++) {
        float a = Random.Range(0f, Mathf.PI * 2);
        float s = Random.Range(40f, 180f);
        list.Add(new Particle {
            Position = pos,
            Velocity = new Vector2(Mathf.Cos(a)*s, Mathf.Sin(a)*s - 60),
            Color    = color,
            Size     = Random.Range(2f, 5f),
            Life = MaxLife = Random.Range(0.4f, 0.9f)
        });
    }
}
```

---

## GemPickup

```csharp
public class GemPickup {
    public Vector2 Position;
    public int     Value;
    public float   BobOffset; // Sinus-Animation
    private float  bobTimer;

    public void Update(float dt) => bobTimer += dt * 3f;
    public float VisualY => Position.y + Mathf.Sin(bobTimer) * 3f;

    public bool IsCollectedBy(Player p) =>
        Vector2.Distance(Position, p.Position) < 10f + p.MagnetRadius;
}
```

---

## Neue Feindtypen (3 Zusätzliche)

### SkeletonMage — Fernkämpfer

```csharp
public class SkeletonMage : Enemy {
    private float shootTimer = 0;
    private float shootInterval = 2.5f;
    private float keepDistance = 220f;   // hält Abstand zum Spieler

    public SkeletonMage(Vector2 pos, int waveScale) {
        Radius     = 15f;
        MaxHp = Hp = 50f + waveScale * 12f;
        Speed      = 60f + waveScale * 4f;
        Damage     = 0f;   // kein Kontaktschaden — nur Projektile
        Reward     = 12;
        ScoreValue = 15;
        BloodColor = new Color(0.7f, 0.7f, 0.5f);
    }

    public override void Update(float dt, Player player) {
        FlashTime = Mathf.Max(0, FlashTime - dt);
        float d = Vector2.Distance(Position, player.Position);

        // Abstand halten: näher rangehen bis keepDistance, dann stehen bleiben
        if (d > keepDistance) {
            Vector2 dir = (player.Position - Position).normalized;
            Position += dir * Speed * dt;
        }

        // Schuss alle 2.5s
        shootTimer += dt;
        if (shootTimer >= shootInterval) {
            shootTimer = 0;
            FireProjectile(player); // Event/Callback an GameManager
        }
        Position = ClampToWorld(Position);
    }
    // Projektil: Schaden 20, Geschwindigkeit 280, kein Piercing
}
```

**Spawn-Thema:** ab Welle 3 / Runde 2+

---

### SlimeBlob — Teilungs-Gegner

```csharp
public class SlimeBlob : Enemy {
    public bool  IsSmall     = false;  // kleine Version teilt sich nicht mehr
    public float SplitRadius = 12f;   // Radius der Kinder

    public SlimeBlob(Vector2 pos, int waveScale, bool small = false) {
        IsSmall    = small;
        Radius     = small ? 12f : 22f;
        MaxHp = Hp = small ? 20f + waveScale*5f : 80f + waveScale*20f;
        Speed      = small ? 95f : 55f;
        Damage     = small ? 6f  : 18f;
        Reward     = small ? 3   : 15;
        ScoreValue = small ? 5   : 20;
        BloodColor = new Color(0.2f, 0.8f, 0.2f);
    }

    // Bei Tod: wenn nicht small → 2× SlimeBlob(small=true) spawnen
    public List<Enemy> OnDeath() {
        if (IsSmall) return new List<Enemy>();
        return new List<Enemy> {
            new SlimeBlob(Position + new Vector2(-20, 0), waveScale, true),
            new SlimeBlob(Position + new Vector2( 20, 0), waveScale, true),
        };
    }
}
```

**Spawn-Thema:** ab Welle 2 / Runde 1+

---

### ShadowGhost — Phasen-Gegner

```csharp
public class ShadowGhost : Enemy {
    private float phaseTimer   = 0;
    private float phaseInterval = 3f;
    private bool  isPhased     = false; // unverwundbar + unsichtbar
    private float phaseDuration = 1f;

    public ShadowGhost(Vector2 pos, int waveScale) {
        Radius     = 16f;
        MaxHp = Hp = 40f + waveScale * 10f;
        Speed      = 110f + waveScale * 8f;
        Damage     = 15f;
        Reward     = 10;
        ScoreValue = 12;
        BloodColor = new Color(0.3f, 0f, 0.5f);
    }

    public override void Update(float dt, Player player) {
        FlashTime = Mathf.Max(0, FlashTime - dt);
        phaseTimer += dt;

        if (isPhased) {
            phaseDuration -= dt;
            if (phaseDuration <= 0) isPhased = false;
            return; // kein Bewegen während Phase
        }

        Vector2 dir = (player.Position - Position).normalized;
        Position += dir * Speed * dt;
        Position  = ClampToWorld(Position);

        if (phaseTimer >= phaseInterval) {
            phaseTimer    = 0;
            isPhased      = true;
            phaseDuration = 1f;   // 1s unverwundbar
        }
    }

    // Projektile ignorieren ihn während isPhased == true
    public override bool CanBeHit() => !isPhased;
    // Sprite: halbe Transparenz wenn isPhased
}
```

**Spawn-Thema:** ab Welle 5 / Runde 1+

---

## Neue Bosse (2 Zusätzliche)

### Lichkönig — Boss 2

```csharp
public class Lichkoning : Enemy {
    private float teleportTimer  = 0;
    private float teleportCd     = 6f;
    private float summonTimer    = 0;
    private float summonCd       = 8f;
    private float summonCount    = 3;    // Anzahl Skelette pro Beschwörung
    private float shieldHp;
    private bool  shieldActive   = true;

    public Lichkoning(Vector2 pos, int waveScale) {
        Radius     = 40f;
        MaxHp = Hp = 3500f + waveScale * 500f;
        shieldHp   = 600f + waveScale * 100f;
        Speed      = 55f + waveScale * 3f;
        Damage     = 35f;
        Reward     = 300;
        ScoreValue = 700;
        BloodColor = new Color(0.5f, 0.5f, 0.2f);
    }

    public override void Update(float dt, Player player) {
        FlashTime     = Mathf.Max(0, FlashTime - dt);
        teleportTimer += dt;
        summonTimer   += dt;

        // Phase 1: Schild aktiv → langsamer, schild absorbiert Schaden
        // Phase 2 (Schild weg): schneller, mehr Beschwörungen

        Vector2 dir = (player.Position - Position).normalized;
        float spd = shieldActive ? Speed * 0.6f : Speed * 1.3f;
        Position += dir * spd * dt;

        // Teleport: springt hinter den Spieler
        if (teleportTimer >= teleportCd) {
            teleportTimer = 0;
            Vector2 behind = player.Position - dir * 80f;
            Position = ClampToWorld(behind);
            // Visueller Effekt: Dunkelblitz-Flash
        }

        // Beschwörung
        if (summonTimer >= summonCd) {
            summonTimer = 0;
            int count = shieldActive ? (int)summonCount : (int)(summonCount * 2);
            SummonSkeletons(count); // Event an GameManager
        }

        Position = ClampToWorld(Position);
    }

    // Schaden-Override: zuerst Schild treffen
    public override void TakeDamage(float dmg) {
        if (shieldActive) {
            shieldHp -= dmg;
            if (shieldHp <= 0) shieldActive = false;
        } else {
            base.TakeDamage(dmg);
        }
    }
    // Boss-HP-Leiste zeigt: Schild-HP (blau) + Boss-HP (rot)
}
```

**Erscheint in:** Runde 2, 5, 8 (Welle 10 der jeweiligen Runde)

---

### Chaoskraken — Boss 3

```csharp
public class ChaosKraken : Enemy {
    private float tentacleTimer  = 0;
    private float tentacleCd     = 3f;
    private float spinTimer      = 0;
    private float spinDuration   = 0;
    private bool  spinning       = false;
    private List<TentacleArm> tentacles = new();

    public ChaosKraken(Vector2 pos, int waveScale) {
        Radius     = 52f;
        MaxHp = Hp = 4500f + waveScale * 600f;
        Speed      = 35f + waveScale * 2f;
        Damage     = 50f;
        Reward     = 350;
        ScoreValue = 800;
        BloodColor = new Color(0f, 0.3f, 0.5f);
    }

    public override void Update(float dt, Player player) {
        FlashTime      = Mathf.Max(0, FlashTime - dt);
        tentacleTimer += dt;
        spinTimer     += dt;

        if (!spinning) {
            Vector2 dir = (player.Position - Position).normalized;
            Position += dir * Speed * dt;
        } else {
            spinDuration -= dt;
            if (spinDuration <= 0) spinning = false;
            // Dreht sich + schleudert Tentakel-Projektile radial
        }

        // Tentakel spawnen (bleiben 4s auf dem Feld, blockieren Bewegung)
        if (tentacleTimer >= tentacleCd) {
            tentacleTimer = 0;
            SpawnTentacle(player.Position); // spawnt TentacleArm nahe Spieler
        }

        // Alle 10s: Spin-Attacke (2s)
        if (spinTimer >= 10f) {
            spinTimer    = 0;
            spinning     = true;
            spinDuration = 2f;
            FireRadialProjectiles(8); // 8 Projektile radial
        }

        Position = ClampToWorld(Position);
    }
}

// Tentakel-Arm: steht still, 3 Sek. Lebenszeit, Kontaktschaden, blockiert Spieler
public class TentacleArm {
    public Vector2 Position;
    public float   Radius   = 20f;
    public float   Life     = 4f;
    public float   Damage   = 20f;
    public bool    Dead => Life <= 0;
    public void Update(float dt) => Life -= dt;
}
```

**Erscheint in:** Runde 3, 6, 9 (Welle 10 der jeweiligen Runde)

---

## Final-Boss — Dreifaltigkeit des Chaos (Runde 10, Welle 100)

Alle 3 Bosse erscheinen gleichzeitig mit reduziertem HP:
- Schatten des Abgrunds: 60% HP
- Lichkönig: 60% HP (ohne Schild)
- Chaoskraken: 60% HP (kein Tentakel-Spawn)

Spezialregel: Tötet man einen Boss, heilen die anderen 10% HP.
