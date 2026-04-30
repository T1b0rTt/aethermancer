// ═══════════════════════════════════════════════════
//  AETHERMANCER — Vampire Survivors Clone
// ═══════════════════════════════════════════════════

const WORLD = 4000;
const TILE  = 64;

// ── Utilities ────────────────────────────────────────
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const lerp  = (a,b,t) => a + (b-a)*t;
const rand  = (a,b)   => a + Math.random()*(b-a);
const randInt=(a,b)   => Math.floor(rand(a,b+1));
const dist  = (ax,ay,bx,by) => Math.hypot(bx-ax, by-ay);
const norm  = (dx,dy) => { const m=Math.hypot(dx,dy)||1; return [dx/m,dy/m]; }

// ── Sprite loading ────────────────────────────────────
const sprites = {};
function loadImg(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ═══════════════════════════════════════════════════
//  SKILL TREE DATA
// ═══════════════════════════════════════════════════
const SKILLS = [
  // Tier 1 (ab Welle 1) — Basic
  { id:'speed',   name:'Windläufer',      icon:'💨', tier:1, desc:'+25% Bewegungsgeschwindigkeit.',  max:4, cost:35 },
  { id:'maxhp',   name:'Eiserner Wille',  icon:'❤️', tier:1, desc:'+40 Max HP pro Stufe.',           max:5, cost:45 },
  { id:'dmg',     name:'Scharfe Klingen', icon:'⚔️', tier:1, desc:'+30% Schaden pro Stufe.',          max:5, cost:40 },
  { id:'firerate',name:'Schnellfeuer',    icon:'🏹', tier:1, desc:'+25% Feuerrate pro Stufe.',        max:5, cost:40 },
  // Tier 2 (ab Welle 20) — Mittel
  { id:'lifesteal',name:'Lebensraub',     icon:'🩸', tier:2, desc:'+8% Lifesteal pro Stufe.',        max:3, cost:70 },
  { id:'magnet', name:'Juwelen-Magnet',   icon:'🧲', tier:2, desc:'+50% Pickup-Radius pro Stufe.',   max:3, cost:30 },
  { id:'regen',  name:'Regeneration',     icon:'🌿', tier:2, desc:'+1.5 HP/s Lebensregeneration.',   max:3, cost:60 },
  { id:'armor',  name:'Schutzschild',     icon:'🛡️', tier:2, desc:'+12% Schadensreduktion pro Stufe.', max:3, cost:55 },
  // Tier 3 (ab Welle 40) — Power
  { id:'extraproj',name:'Mehrfachschuss', icon:'🌀', tier:3, desc:'+1 zusätzliches Projektil pro Stufe.', max:2, cost:90 },
  { id:'piercing', name:'Durchschlag',    icon:'💫', tier:3, desc:'Projektile durchdringen Feinde.',  max:1, cost:100 },
  { id:'nova_dmg', name:'Arkane Nova',    icon:'✨', tier:3, desc:'+50% Superkraft-Schaden.',         max:3, cost:80 },
  { id:'nova_cd',  name:'Kühlung',        icon:'⏱️', tier:3, desc:'-20% Superkraft-Cooldown.',       max:3, cost:70 },
];

// ═══════════════════════════════════════════════════
//  CHARACTER DATA (4 playable characters)
// ═══════════════════════════════════════════════════
const CHARACTERS = [
  {
    id:'aether', name:'Äthermagier', icon:'✨',
    hp:150, speed:200, dmg:40,
    desc:'Ausgewogener Magier mit mächtiger Nova.',
    passiveDesc:'Kein spezielles Passiv.',
    spName:'Arkane Nova', spDesc:'AoE-Explosion um den Spieler (300 Schaden).', spCd:25,
    sprite:'player', locked:false, cost:0,
  },
  {
    id:'shadow', name:'Schattenläuferin', icon:'🌑',
    hp:100, speed:290, dmg:30,
    desc:'Schnelle Assassine mit kritischen Treffern.',
    passiveDesc:'Jeder 5. Schuss ist ein Kritischer Treffer (2× Schaden).',
    spName:'Schattenklone', spDesc:'3 Klone kämpfen 5s an deiner Seite.', spCd:20,
    sprite:'shadow_runner', locked:true, cost:500,
  },
  {
    id:'warrior', name:'Eisenkriegerin', icon:'🛡️',
    hp:260, speed:140, dmg:55,
    desc:'Zäher Tank mit Schadensreduktion.',
    passiveDesc:'20% Schadensreduktion; unter 30% HP zusätzlich +20%.',
    spName:'Erderschütterung', spDesc:'Betäubt alle Feinde auf dem Bildschirm für 2s.', spCd:30,
    sprite:'warrior', locked:true, cost:800,
  },
  {
    id:'nature', name:'Naturwächter', icon:'🌿',
    hp:180, speed:175, dmg:35,
    desc:'Heiler mit natürlicher Regeneration.',
    passiveDesc:'Startet mit 2 HP/s Lebensregeneration.',
    spName:'Naturgewalt', spDesc:'8 rotierende Ranken fügen 6s lang Schaden zu.', spCd:22,
    sprite:'nature_guardian', locked:true, cost:600,
  },
];

// ═══════════════════════════════════════════════════
//  WAVE CONFIGURATION (10 Wellen pro Runde)
// ═══════════════════════════════════════════════════
const WAVE_DATA = [
  // Runde 1
  { label:'BOSS — Schatten des Abgrunds', enemies:[{type:'zombie',n:10, delay:1.5},{type:'boss',n:1,delay:5.0}], boss:true, bossType:'shadow' },
  // Runde 2
  { label:'BOSS — Lichkönig herauf',      enemies:[{type:'zombie',n:15, delay:1.2},{type:'lichkoning',n:1,delay:6.0}], boss:true, bossType:'lich' },
  // Runde 3
  { label:'BOSS — Chaoskraken herauf',    enemies:[{type:'zombie',n:12, delay:1.0},{type:'kraken',n:1,delay:5.0}], boss:true, bossType:'kraken' },
  // Runde 4
  { label:'BOSS — Finaler Boss',          enemies:[{type:'zombie',n:20, delay:1.0},{type:'boss',n:1,delay:5.0}], boss:true, bossType:'final' },
  // Runde 5
  { label:'BOSS — Schatten des Abgrunds', enemies:[{type:'zombie',n:10, delay:1.5},{type:'boss',n:1,delay:5.0}], boss:true, bossType:'shadow' },
  // Runde 6
  { label:'BOSS — Lichkönig herauf',      enemies:[{type:'zombie',n:15, delay:1.2},{type:'lichkoning',n:1,delay:6.0}], boss:true, bossType:'lich' },
  // Runde 7
  { label:'BOSS — Chaoskraken herauf',    enemies:[{type:'zombie',n:12, delay:1.0},{type:'kraken',n:1,delay:5.0}], boss:true, bossType:'kraken' },
  // Runde 8
  { label:'BOSS — Finaler Boss',          enemies:[{type:'zombie',n:20, delay:1.0},{type:'boss',n:1,delay:5.0}], boss:true, bossType:'final' },
  // Runde 9
  { label:'BOSS — Schatten des Abgrunds', enemies:[{type:'zombie',n:10, delay:1.5},{type:'boss',n:1,delay:5.0}], boss:true, bossType:'shadow' },
  // Runde 10
  { label:'BOSS — Lichkönig herauf',      enemies:[{type:'zombie',n:15, delay:1.2},{type:'lichkoning',n:1,delay:6.0}], boss:true, bossType:'lich' },
];

// ═══════════════════════════════════════════════════
//  WEAPONS DATA (6 starter weapons)
// ═══════════════════════════════════════════════════
const WEAPONS = [
  {
    id:'magic_shot', name:'Magieschuss', icon:'🔵', cat:'projectile',
    desc:'Standard-Projektil.', maxLevel:6,
    baseDmg:18, baseSpeed:520, baseCd:0.6,
    scaling:'dmg', scalingPerLv:12, cdPerLv:-0.06,
  },
  {
    id:'orbit_orb', name:'Orbit-Kugeln', icon:'🟣', cat:'orbital',
    desc:'2 Kugeln umkreisen den Spieler.', maxLevel:6,
    baseDmg:16, baseSpeed:0, baseCd:0,
    scaling:'count', scalingPerLv:1, cdPerLv:0,
    orbs:2, orbRadius:75, orbSpeed:3.0,
  },
  {
    id:'lightning', name:'Blitzschlag', icon:'⚡', cat:'aoe',
    desc:'Trifft zufälligen Feind im Umkreis.', maxLevel:6,
    baseDmg:40, baseSpeed:0, baseCd:2.0,
    scaling:'dmg', scalingPerLv:18, cdPerLv:-0.18,
    range:500,
  },
  {
    id:'frost_arrow', name:'Frostpfeil', icon:'❄️', cat:'projectile',
    desc:'Projektil mit Slow-Effekt (35% für 1.5s).', maxLevel:6,
    baseDmg:14, baseSpeed:440, baseCd:0.7,
    scaling:'dmg', scalingPerLv:10, cdPerLv:-0.07,
    slow:0.35, slowDuration:1.5,
  },
  {
    id:'poison_gas', name:'Giftwolke', icon:'☠️', cat:'aoe',
    desc:'Hinterlässt Giftwolke (3.5s, AoE-DoT).', maxLevel:6,
    baseDmg:12, baseSpeed:0, baseCd:1.8,
    scaling:'dmg', scalingPerLv:12, cdPerLv:-0.15,
    cloudDuration:3.5, cloudRadius:60,
  },
  {
    id:'soul_shard', name:'Seelensplitter', icon:'💠', cat:'projectile',
    desc:'Projektil bounced zum nächsten Feind (max 4).', maxLevel:6,
    baseDmg:22, baseSpeed:380, baseCd:0.85,
    scaling:'dmg', scalingPerLv:14, cdPerLv:-0.08,
    bounces:4,
  },
];

// ═══════════════════════════════════════════════════
//  GAME MODES
// ═══════════════════════════════════════════════════
const GAME_MODES = [
  { id:'standard', name:'Standard', icon:'⚔️', desc:'10 Runden × 10 Wellen mit Boss-Rotation.' },
  { id:'endless', name:'Endlosmodus', icon:'🌀', desc:'Unendliche Wellen, dynamische Spawns, Highscore.' },
  { id:'timeattack', name:'Zeitangriff', icon:'⏱️', desc:'15 Minuten überleben. Countdown-Timer, kontinuierlicher Spawn.' },
  { id:'challenge', name:'Herausforderung', icon:'💀', desc:'1-3 zufällige Modifikatoren. Bonus-Kristall-Multiplikator.' },
];

// ═══════════════════════════════════════════════════
//  MAPS
// ═══════════════════════════════════════════════════
const MAPS = [
  {
    id:'arena', name:'Die Arena', icon:'🏟️',
    desc:'Offenes Feld ohne Hindernisse.',
    bgColor:'#080818', bgGrid:'#111128', vignette:false,
    stumps:0, mushrooms:0,
  },
  {
    id:'forest', name:'Verdorbener Wald', icon:'🌲',
    desc:'Dichter Wald mit Baumstümpfen und Heilpilzen.',
    bgColor:'#060e06', bgGrid:'#0a160a', vignette:true,
    stumps:100, mushrooms:8,
  },
];

// ═══════════════════════════════════════════════════
//  CHALLENGE MODIFIERS
// ═══════════════════════════════════════════════════
const CHALLENGE_MODS = [
  { id:'no_regen', name:'Kein Regen', desc:'Kein Lifesteal / keine Regeneration.', bonus:0.3 },
  { id:'half_hp', name:'Zerbrechlich', desc:'Halbe HP, +50% Schaden.', bonus:0.4, hpMul:0.5, dmgMul:1.5 },
  { id:'double_enemies', name:'Überzahl', desc:'Doppelte Feinde, halbe Feind-HP.', bonus:0.4, enemyCountMul:2, enemyHpMul:0.5 },
  { id:'wave_timer', name:'Zeitdruck', desc:'90s Wellen-Timer (sonst Game Over).', bonus:0.5 },
  { id:'permadeath', name:'Permadeath', desc:'Kein Speichern möglich.', bonus:0.2 },
  { id:'no_levelup', name:'Kein Aufstieg', desc:'Kein Skilltree / Level-Up.', bonus:0.6 },
  { id:'fast_enemies', name:'Raserei', desc:'Feinde 50% schneller.', bonus:0.3, enemySpeedMul:1.5 },
  { id:'one_weapon', name:'Einzelkampf', desc:'Maximal 1 Waffe.', bonus:0.5 },
];

// ═══════════════════════════════════════════════════
//  META SKILLS (persistent progression)
// ═══════════════════════════════════════════════════
const META_SKILLS = [
  { id:'meta_hp', name:'Lebenskraft', icon:'❤️', desc:'+15 Start-HP pro Stufe.', max:5, baseCost:50, costScale:30 },
  { id:'meta_speed', name:'Geschwindigkeit', icon:'💨', desc:'+8% Speed pro Stufe.', max:5, baseCost:40, costScale:25 },
  { id:'meta_dmg', name:'Kampfkraft', icon:'⚔️', desc:'+10% Schaden pro Stufe.', max:5, baseCost:50, costScale:30 },
  { id:'meta_startgem', name:'Startkapital', icon:'◆', desc:'+15 Start-Kristalle pro Stufe.', max:4, baseCost:40, costScale:25 },
  { id:'meta_regen', name:'Regeneration', icon:'🌿', desc:'+0.5 HP/s passiver Regen.', max:4, baseCost:60, costScale:35 },
  { id:'meta_magnet', name:'Magnetismus', icon:'🧲', desc:'+25% Magnet-Radius pro Stufe.', max:4, baseCost:35, costScale:20 },
  { id:'meta_offers', name:'Mehr Auswahl', icon:'📋', desc:'+1 Level-Up Angebot pro Stufe.', max:2, baseCost:80, costScale:50 },
  { id:'meta_reroll', name:'Reroll', icon:'🎲', desc:'1× Reroll pro Welle.', max:1, baseCost:100, costScale:0 },
  { id:'meta_weapslot', name:'Waffenslot', icon:'🔫', desc:'+1 Waffen-Slot.', max:1, baseCost:150, costScale:0 },
  { id:'unlock_shadow', name:'Schattenläuferin', icon:'🌑', desc:'Schattenläuferin freischalten.', max:1, baseCost:500, costScale:0 },
  { id:'unlock_warrior', name:'Eisenkriegerin', icon:'🛡️', desc:'Eisenkriegerin freischalten.', max:1, baseCost:800, costScale:0 },
  { id:'unlock_nature', name:'Naturwächter', icon:'🌿', desc:'Naturwächter freischalten.', max:1, baseCost:600, costScale:0 },
];

// ═══════════════════════════════════════════════════
//  PARTICLE
// ═══════════════════════════════════════════════════
class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x=x; this.y=y; this.vx=vx; this.vy=vy;
    this.color=color; this.size=size; this.maxLife=life; this.life=life;
  }
  update(dt) {
    this.x += this.vx*dt;
    this.y += this.vy*dt;
    this.vy += 120*dt; // gravity
    this.vx *= 0.97;
    this.life -= dt;
  }
  draw(ctx) {
    const a = Math.max(0, this.life/this.maxLife);
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size*a, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  dead() { return this.life <= 0; }
}

function spawnBlood(particles, x, y, n=12, color='#cc2200') {
  for (let i=0;i<n;i++) {
    const a=rand(0,Math.PI*2), s=rand(40,180);
    particles.push(new Particle(x,y, Math.cos(a)*s, Math.sin(a)*s-60, color, rand(2,5), rand(0.4,0.9)));
  }
}

// Nova visual effect
class NovaEffect {
  constructor(x,y,r) { this.x=x; this.y=y; this.maxR=r; this.r=0; this.life=0.5; this.maxLife=0.5; }
  update(dt) { this.life-=dt; this.r=this.maxR*(1-this.life/this.maxLife); }
  draw(ctx) {
    const a=Math.max(0,this.life/this.maxLife)*0.5;
    ctx.globalAlpha=a;
    ctx.strokeStyle='#cc88ff';
    ctx.lineWidth=6;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=a*0.2;
    ctx.fillStyle='#aa44ff';
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
  dead() { return this.life<=0; }
}

// ═══════════════════════════════════════════════════
//  PROJECTILE
// ═══════════════════════════════════════════════════
class Projectile {
  constructor(x,y,dx,dy,dmg,speed,piercing,color='#00eeff') {
    this.x=x; this.y=y;
    [this.dx,this.dy]=norm(dx,dy);
    this.dmg=dmg; this.speed=speed;
    this.piercing=piercing; this.color=color;
    this.life=3.5; this.r=6;
    this.hit=new Set();
  }
  update(dt) {
    this.x+=this.dx*this.speed*dt;
    this.y+=this.dy*this.speed*dt;
    this.life-=dt;
  }
  draw(ctx) {
    // Trail
    ctx.globalAlpha=0.3;
    ctx.fillStyle=this.color;
    ctx.beginPath();
    ctx.arc(this.x-this.dx*10, this.y-this.dy*10, this.r*0.6, 0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha=1;
    // Core
    ctx.shadowColor=this.color;
    ctx.shadowBlur=12;
    ctx.fillStyle=this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle='white';
    ctx.beginPath();
    ctx.arc(this.x-1, this.y-1, this.r*0.35, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
  }
  dead() { return this.life<=0 || this.x<-100||this.x>WORLD+100||this.y<-100||this.y>WORLD+100; }
  hits(e) {
    if (this.hit.has(e.id)) return false;
    return dist(this.x,this.y,e.x,e.y) < this.r+e.r;
  }
  onHit(e) { this.hit.add(e.id); if(!this.piercing) this.life=0; }
}

// ═══════════════════════════════════════════════════
//  GEM PICKUP
// ═══════════════════════════════════════════════════
let _pickupId=0;
class GemPickup {
  constructor(x,y,val) { this.x=x; this.y=y; this.val=val; this.r=10; this.id=_pickupId++; this.bob=rand(0,Math.PI*2); }
  update(dt) { this.bob+=dt*3; }
  draw(ctx) {
    const yOff=Math.sin(this.bob)*3;
    if (sprites.gem) {
      ctx.drawImage(sprites.gem, this.x-10, this.y-12+yOff, 20, 24);
    } else {
      ctx.fillStyle='#00ccff';
      ctx.beginPath(); ctx.arc(this.x, this.y+yOff, 8, 0,Math.PI*2); ctx.fill();
    }
  }
  collectedBy(p) { return dist(this.x,this.y,p.x,p.y) < this.r+p.magnetRadius; }
}

// ═══════════════════════════════════════════════════
//  PLAYER
// ═══════════════════════════════════════════════════
let _entId=0;
class Player {
  constructor(x,y,charId='aether') {
    this.x=x; this.y=y; this.id=_entId++;
    const cfg=CHARACTERS.find(c=>c.id===charId)||CHARACTERS[0];
    this.charId=cfg.id;

    this.r=18;
    this.baseSpeed=cfg.speed;
    this.maxHp=cfg.hp; this.hp=cfg.hp;
    this.dmg=cfg.dmg;
    this.fireRate=1.5;
    this.shotCooldown=0;
    this.projSpeed=520;
    this.trishot=false;
    this.piercing=false;
    this.regen=cfg.id==='nature'?2:0;
    this.lifesteal=0;
    this.magnetRadius=40;
    this.dmgReduction=cfg.id==='warrior'?0.20:0;

    this.superpowerMaxCd=cfg.spCd;
    this.superpowerCd=0;

    // Shadow Runner: crit tracking
    this.shotCount=0;

    // EXP & Weapon system
    this.level=1; this.exp=0;
    this.activeWeapons=[]; // [{id, level, cdTimer}]
    this._addWeapon('magic_shot'); // start weapon

    this.facing=0;
    this.walkAnim=0;
    this.invulnTime=0;
    this.score=0;
    this.stunned=false;
  }

  get speed() { return this.baseSpeed; }

  update(dt, keys, enemies) {
    if (this.stunned) return; // Eisenkriegerin stun effect

    // Movement
    // Movement
    let mx=0, my=0;
    if (keys['ArrowLeft']||keys['KeyA'])  mx-=1;
    if (keys['ArrowRight']||keys['KeyD']) mx+=1;
    if (keys['ArrowUp']||keys['KeyW'])    my-=1;
    if (keys['ArrowDown']||keys['KeyS'])  my+=1;
    if (mx||my) {
      const [nx,ny]=norm(mx,my);
      this.x=clamp(this.x+nx*this.speed*dt, this.r, WORLD-this.r);
      this.y=clamp(this.y+ny*this.speed*dt, this.r, WORLD-this.r);
      this.walkAnim+=dt*8;
      this.facing=Math.atan2(ny,nx);
    }

    // Auto-aim
    if (enemies.length) {
      let best=null, bd=Infinity;
      for (const e of enemies) {
        const d=dist(this.x,this.y,e.x,e.y);
        if (d<bd) { bd=d; best=e; }
      }
      if (best) this.aimAngle=Math.atan2(best.y-this.y, best.x-this.x);
    }

    // Superpower cooldown
    if (this.superpowerCd>0) this.superpowerCd=Math.max(0, this.superpowerCd-dt);

    // Regen
    if (this.regen>0) this.hp=Math.min(this.maxHp, this.hp+this.regen*dt);

    // Invuln
    if (this.invulnTime>0) this.invulnTime-=dt;

    this.shotCooldown=Math.max(0,this.shotCooldown-dt);
  }

  tryShoot(enemies) {
    if (this.shotCooldown>0) return null;
    if (!enemies.length) return null;
    this.shotCooldown=1/this.fireRate;

    // Shadow Runner: crit every 5th shot
    this.shotCount++;
    let shotDmg=this.dmg;
    let crit=false;
    if (this.charId==='shadow' && this.shotCount>=5) {
      this.shotCount=0;
      shotDmg*=2;
      crit=true;
    }

    const shots=[];
    const baseAng=this.aimAngle||0;
    const extraProj=this.extraProj||0;
    const totalProj=1+extraProj;
    const angles=[];
    const spread=0.2;
    for (let i=0;i<totalProj;i++) {
      const offset=(i-(totalProj-1)/2)*spread;
      angles.push(baseAng+offset);
    }

    for (const a of angles) {
      const proj=new Projectile(
        this.x, this.y,
        Math.cos(a), Math.sin(a),
        shotDmg, this.projSpeed, this.piercing,
        crit?'#ff88ff':'#00eeff'
      );
      shots.push(proj);
    }
    return shots;
  }

  takeDamage(dmg) {
    if (this.invulnTime>0) return;
    // Apply armor + warrior passive (stacked in applySkillsToPlayer)
    if (this.dmgReduction>0) dmg*=(1-this.dmgReduction);
    this.hp-=dmg;
    this.invulnTime=0.15;
  }

  heal(amount) { this.hp=Math.min(this.maxHp, this.hp+amount); }

  dead() { return this.hp<=0; }

  _addWeapon(weaponId) {
    const cfg=WEAPONS.find(w=>w.id===weaponId);
    if (!cfg) return;
    const existing=this.activeWeapons.find(w=>w.id===weaponId);
    if (existing) {
      existing.level=Math.min(existing.level+1, cfg.maxLevel);
    } else {
      const maxSlots=6+(window.game&&window.game.meta&&window.game.meta.metaLevels?window.game.meta.metaLevels['meta_weapslot']||0:0);
      if (this.activeWeapons.length>=maxSlots) return;
      this.activeWeapons.push({id:weaponId, level:1, cdTimer:0});
    }
  }

  _getWeaponCfg(weaponId) { return WEAPONS.find(w=>w.id===weaponId); }

  _awardExp(amount) {
    this.exp+=amount;
    let gained=0;
    let needed=this._expToNext();
    while (this.exp>=needed) {
      this.exp-=needed;
      this.level++;
      gained++;
      needed=this._expToNext();
    }
    return gained; // number of level-ups
  }

  _expToNext() { return 15 + this.level*12; }

  draw(ctx) {
    const wobble=Math.sin(this.walkAnim)*2;
    const cfg=CHARACTERS.find(c=>c.id===this.charId);
    const charSprite=cfg?sprites[cfg.sprite]:sprites.player;
    if (charSprite) {
      ctx.save();
      if (this.invulnTime>0) ctx.globalAlpha=0.5;
      ctx.drawImage(charSprite, this.x-24, this.y-32+wobble, 48, 64);
      ctx.globalAlpha=1;
      ctx.restore();
    } else {
      ctx.fillStyle=this.invulnTime>0?'#4488ff':'#2255ff';
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
    }

    if (this.aimAngle!=null) {
      const ax=this.x+Math.cos(this.aimAngle)*30;
      const ay=this.y+Math.sin(this.aimAngle)*30;
      ctx.fillStyle='rgba(0,255,255,0.5)';
      ctx.beginPath(); ctx.arc(ax,ay,3,0,Math.PI*2); ctx.fill();
    }
  }
}

// ═══════════════════════════════════════════════════
//  ENEMIES
// ═══════════════════════════════════════════════════
class Enemy {
  constructor(x,y,type) {
    this.x=x; this.y=y; this.type=type; this.id=_entId++;
    this.flashTime=0;
    this.stunned=0; this.stunnedTimer=0;
    this.slowAmount=0; this.slowTimer=0;
  }
  takeDamage(dmg, particles) {
    this.hp-=dmg;
    this.flashTime=0.12;
    spawnBlood(particles, this.x, this.y, 6, this.bloodColor||'#cc3300');
  }
  dead() { return this.hp<=0; }
  canBeHit() { return true; }
  update(dt, player) {
    this.flashTime=Math.max(0,this.flashTime-dt);
    // Slow tick
    if (this.slowTimer>0) {
      this.slowTimer-=dt;
      if (this.slowTimer<=0) this.slowAmount=0;
    }
    if (this.stunned>0) {
      this.stunned-=dt;
      return;
    }
    const speedMul=this.slowAmount>0?(1-this.slowAmount):1;
    const [dx,dy]=norm(player.x-this.x, player.y-this.y);
    this.x+=dx*this.speed*speedMul*dt;
    this.y+=dy*this.speed*speedMul*dt;
    this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
  }
  collidesWithPlayer(p) { return dist(this.x,this.y,p.x,p.y) < this.r+p.r-6; }

  _drawSprite(ctx, img, w, h) {
    ctx.save();
    if (this.flashTime>0) {
      ctx.filter='brightness(5) saturate(0)';
    }
    if (this.stunned>0) {
      ctx.globalAlpha=0.6;
    }
    ctx.drawImage(img, this.x-w/2, this.y-h/2, w, h);
    ctx.filter='none';
    ctx.restore();
    this._drawHpBar(ctx);
    // Stunned indicator: yellow stars above enemy
    if (this.stunned>0) {
      ctx.fillStyle='#ffcc00';
      ctx.font='14px Arial';
      ctx.fillText('✨', this.x-10, this.y-this.r-16);
    }
  }

  _drawHpBar(ctx) {
    const w=this.r*2+8, h=4, x=this.x-w/2, y=this.y-this.r-10;
    ctx.fillStyle='#330000';
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#ff3333';
    ctx.fillRect(x,y, w*(this.hp/this.maxHp),h);
  }

  _drawFallback(ctx, color) {
    ctx.fillStyle=this.flashTime>0?'white':color;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
    this._drawHpBar(ctx);
  }
}

class ZombieEnemy extends Enemy {
  constructor(x,y,waveScale) {
    super(x,y,'zombie');
    this.r=16;
    this.maxHp=(60+waveScale*15); this.hp=this.maxHp;
    this.speed=55+waveScale*5;
    this.dmg=12;
    this.reward=8;
    this.expReward=4;
    this.score=10;
    this.bloodColor='#336600';
  }
  draw(ctx) {
    if(sprites.zombie) this._drawSprite(ctx,sprites.zombie,40,52);
    else this._drawFallback(ctx,'#6a8a3a');
  }
}

class BatEnemy extends Enemy {
  constructor(x,y,waveScale) {
    super(x,y,'bat');
    this.r=14;
    this.maxHp=(25+waveScale*8); this.hp=this.maxHp;
    this.speed=130+waveScale*10;
    this.dmg=8;
    this.reward=5;
    this.expReward=3;
    this.score=8;
    this.bloodColor='#330044';
    this.wobble=rand(0,Math.PI*2);
    this.wobbleDir=Math.random()>0.5?1:-1;
  }
  update(dt, player) {
    this.flashTime=Math.max(0,this.flashTime-dt);
    this.wobble+=dt*4;
    const [dx,dy]=norm(player.x-this.x, player.y-this.y);
    const perp=this.wobbleDir;
    const nx=dx+Math.cos(this.wobble)*perp*0.4;
    const ny=dy+Math.sin(this.wobble)*perp*0.4;
    const [fnx,fny]=norm(nx,ny);
    this.x+=fnx*this.speed*dt;
    this.y+=fny*this.speed*dt;
    this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
  }
  draw(ctx) {
    if(sprites.bat) this._drawSprite(ctx,sprites.bat,64,36);
    else this._drawFallback(ctx,'#4a1a6a');
  }
}

class OgreEnemy extends Enemy {
  constructor(x,y,waveScale) {
    super(x,y,'ogre');
    this.r=28;
    this.maxHp=(280+waveScale*60); this.hp=this.maxHp;
    this.speed=40+waveScale*3;
    this.dmg=25;
    this.reward=25;
    this.expReward=12;
    this.score=30;
    this.bloodColor='#445520';
  }
  draw(ctx) {
    if(sprites.ogre) this._drawSprite(ctx,sprites.ogre,56,72);
    else this._drawFallback(ctx,'#667744');
  }
}

class BossEnemy extends Enemy {
  constructor(x,y,waveScale) {
    super(x,y,'boss');
    this.r=44;
    this.maxHp=(2500+waveScale*400); this.hp=this.maxHp;
    this.speed=48+waveScale*4;
    this.dmg=40;
    this.reward=200;
    this.expReward=100;
    this.score=500;
    this.bloodColor='#550044';
    this.chargeTimer=0;
    this.chargeInterval=4;
    this.charging=false;
    this.chargeVx=0; this.chargeVy=0;
    this.chargeDuration=0;
  }
  update(dt, player) {
    this.flashTime=Math.max(0,this.flashTime-dt);
    this.chargeTimer+=dt;

    if (this.charging) {
      this.x+=this.chargeVx*dt;
      this.y+=this.chargeVy*dt;
      this.chargeDuration-=dt;
      if (this.chargeDuration<=0) this.charging=false;
    } else {
      // Slow approach
      const [dx,dy]=norm(player.x-this.x, player.y-this.y);
      this.x+=dx*this.speed*dt;
      this.y+=dy*this.speed*dt;
      // Charge attack
      if (this.chargeTimer>=this.chargeInterval) {
        this.chargeTimer=0;
        this.charging=true;
        this.chargeDuration=0.4;
        const [cx,cy]=norm(player.x-this.x, player.y-this.y);
        this.chargeVx=cx*480; this.chargeVy=cy*480;
      }
    }
    this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
  }
  draw(ctx) {
    // Aura
    ctx.globalAlpha=0.18+Math.sin(Date.now()/300)*0.06;
    ctx.fillStyle='#aa00ff';
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r+20,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    if(sprites.boss) this._drawSprite(ctx,sprites.boss,96,112);
    else this._drawFallback(ctx,'#330044');
  }
}

// ═══════════════════════════════════════════════════
//  BOSSE - NEUE CLASSES
// ═══════════════════════════════════════════════════
class LichkoningEnemy extends Enemy {
  constructor(x,y,waveScale) {
    super(x,y,'lichkoning');
    this.r=34;
    this.maxHp=(3500+waveScale*600); this.hp=this.maxHp;
    this.speed=42+waveScale*4;
    this.dmg=35;
    this.reward=250;
    this.expReward=150;
    this.score=600;
    this.bloodColor='#00ccff';
    // Schild-System
    this.shieldMax=600;
    this.shield=this.shieldMax;
    this.phase=1;
    this.teleportTimer=0;
    this.teleportInterval=6;
    this.summonTimer=0;
    this.summonInterval=8;
    this.spawnedThisWave=0;
    this.scale=waveScale;
  }
  update(dt, player) {
    this.flashTime=Math.max(0,this.flashTime-dt);
    // Schild regeneration
    if (this.shield<this.shieldMax && this.phase===1) {
      this.shield+=30*dt;
      if (this.shield>this.shieldMax) this.shield=this.shieldMax;
    }
    // Teleport hinter Spieler
    this.teleportTimer+=dt;
    if (this.teleportTimer>=this.teleportInterval) {
      this.teleportTimer=0;
      this.x=player.x+rand(-300,-100);
      this.y=player.y+rand(-300,-100);
      this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
    }
    // Beschwörung von Zombies
    this.summonTimer+=dt;
    if (this.summonTimer>=this.summonInterval) {
      this.summonTimer=0;
      const count=this.phase===1?3:6;
      for(let i=0;i<count;i++) {
        const angle=rand(0,Math.PI*2);
        const dist=rand(150,250);
        const sx=this.x+Math.cos(angle)*dist;
        const sy=this.y+Math.sin(angle)*dist;
        game.enemies.push(new ZombieEnemy(clamp(sx,0,WORLD), clamp(sy,0,WORLD), this.scale));
      }
      game.showFloatText(this.x, this.y-60, 'Beschwörung!', '#00ccff');
    }
    // Phase 2: schneller und weniger Schild
    if (this.phase===2) {
      this.speed=70+this.scale*6;
      this.x+=rand(-50,50)*dt;
      this.y+=rand(-50,50)*dt;
    } else {
      const [dx,dy]=norm(player.x-this.x, player.y-this.y);
      this.x+=dx*this.speed*dt;
      this.y+=dy*this.speed*dt;
    }
    this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
  }
  takeDamage(dmg, particles) {
    if (this.phase===1 && this.shield>0) {
      this.shield-=dmg;
      if (this.shield<=0) {
        this.shield=0;
        this.phase=2;
        this.maxHp*=1.5;
        this.hp=this.maxHp;
        this.dmg*=1.5;
        this.speed=70+this.scale*6;
        game.showFloatText(this.x, this.y-60, 'SCHILD ZERBROCHEN!', '#ff0000');
        spawnBlood(particles, this.x, this.y, 30, '#00ccff');
      }
    } else {
      this.hp-=dmg;
    }
    this.flashTime=0.12;
    spawnBlood(particles, this.x, this.y, 4, this.bloodColor);
  }
  draw(ctx) {
    // Schild-Aura
    if (this.phase===1) {
      const pulse=0.3+Math.sin(Date.now()/150)*0.15;
      ctx.globalAlpha=pulse;
      ctx.strokeStyle='#00ccff';
      ctx.lineWidth=4;
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r+24,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha=pulse*0.3;
      ctx.fillStyle='#00ccff';
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r+24,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
      // Schild-HP Bar unter dem Boss
      const shW=this.r*2+10, shX=this.x-shW/2, shY=this.y-this.r-8;
      ctx.fillStyle='#000033';
      ctx.fillRect(shX,shY,shW,5);
      ctx.fillStyle='#00ccff';
      ctx.fillRect(shX,shY,shW*(this.shield/this.shieldMax),5);
    }
    // Boss Sprite
    if (this.flashTime>0) ctx.filter='brightness(5) saturate(0)';
    if (sprites.lichkoning) {
      ctx.drawImage(sprites.lichkoning, this.x-30, this.y-40, 60, 80);
    } else {
      this._drawFallback(ctx, this.phase===1 ? '#0088ff' : '#cc0000');
    }
    ctx.filter='none';
    // Normaler HP Bar
    this._drawHpBar(ctx);
  }
  dead() { return this.hp<=0; }
  canBeHit() { return true; }
}

class KrakenEnemy extends Enemy {
  constructor(x,y,waveScale) {
    super(x,y,'kraken');
    this.r=42;
    this.maxHp=(3000+waveScale*500); this.hp=this.maxHp;
    this.speed=40+waveScale*4;
    this.dmg=30;
    this.reward=220;
    this.expReward=130;
    this.score=550;
    this.bloodColor='#cc0000';
    this.scale=waveScale;
    this.spinTimer=0;
    this.spinInterval=10;
    this.isSpinning=false;
    this.spinDuration=0;
    this.spinAngle=0;
    this.tentacleTimer=0;
    this.tentacleInterval=3;
  }
  update(dt, player) {
    this.flashTime=Math.max(0,this.flashTime-dt);
    if (this.isSpinning) {
      this.spinDuration-=dt;
      this.spinAngle+=dt*8;
      if (this.spinDuration<=0) {
        this.isSpinning=false;
        // Feuere 8 Projektile radial
        for(let i=0;i<8;i++) {
          const ang=this.spinAngle + (Math.PI*2/8)*i;
          game.enemyProjectiles.push(new EnemyProjectile(
            this.x, this.y, Math.cos(ang), Math.sin(ang), 35, 350));
        }
        game.showFloatText(this.x, this.y-60, 'STOß! 8 PROJECTILE', '#ff4400');
      }
    } else {
      this.tentacleTimer+=dt;
      if (this.tentacleTimer>=this.tentacleInterval) {
        this.tentacleTimer=0;
        // Spawne Tentakel nahe Spieler
        const angle=rand(0,Math.PI*2);
        const dist=rand(150,250);
        const tx=player.x+Math.cos(angle)*dist;
        const ty=player.y+Math.sin(angle)*dist;
        game.tentacles.push(new TentacleArm(clamp(tx,0,WORLD), clamp(ty,0,WORLD)));
        game.showFloatText(this.x, this.y-60, '+Tentakel!', '#ff8800');
      }
      // Langsame Bewegung zu Spieler
      const [dx,dy]=norm(player.x-this.x, player.y-this.y);
      this.x+=dx*this.speed*dt;
      this.y+=dy*this.speed*dt;
    }
    this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
  }
  takeDamage(dmg, particles) {
    this.hp-=dmg;
    this.flashTime=0.12;
    spawnBlood(particles, this.x, this.y, 6, this.bloodColor);
  }
  draw(ctx) {
    if (this.flashTime>0) ctx.filter='brightness(5) saturate(0)';
    if (sprites.kraken) {
      ctx.save();
      if (this.isSpinning) {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.spinAngle);
        ctx.drawImage(sprites.kraken, -40, -40, 80, 80);
      } else {
        ctx.drawImage(sprites.kraken, this.x-40, this.y-40, 80, 80);
      }
      ctx.restore();
    } else {
      this._drawFallback(ctx, this.isSpinning ? '#ff0000' : '#221122');
    }
    ctx.filter='none';
    this._drawHpBar(ctx);
  }
  dead() { return this.hp<=0; }
  canBeHit() { return true; }
}

class SkeletonMageEnemy extends Enemy {
  constructor(x,y,waveScale) {
    super(x,y,'skeleton_mage');
    this.r=15;
    this.maxHp=(50+waveScale*12); this.hp=this.maxHp;
    this.speed=60+waveScale*4;
    this.dmg=0;           // no contact damage — only ranged
    this.reward=12;
    this.expReward=8;
    this.score=15;
    this.bloodColor='#bbbbaa';
    this.waveScale=waveScale;
    this.shootTimer=rand(0,1.5); // stagger initial shots
    this.shootInterval=2.5;
    this.keepDistance=220;
    this.pendingShot=null;
  }
  update(dt, player) {
    this.flashTime=Math.max(0,this.flashTime-dt);
    this.shootTimer+=dt;
    const d=dist(this.x,this.y,player.x,player.y);
    if (d>this.keepDistance) {
      const [dx,dy]=norm(player.x-this.x, player.y-this.y);
      this.x+=dx*this.speed*dt;
      this.y+=dy*this.speed*dt;
    } else if (d<this.keepDistance-60) {
      const [dx,dy]=norm(this.x-player.x, this.y-player.y);
      this.x+=dx*this.speed*0.5*dt;
      this.y+=dy*this.speed*0.5*dt;
    }
    this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
    if (this.shootTimer>=this.shootInterval) {
      this.shootTimer=0;
      const [dx,dy]=norm(player.x-this.x, player.y-this.y);
      this.pendingShot={x:this.x, y:this.y, dx, dy};
    }
  }
  draw(ctx) {
    if(sprites.skeleton_mage) this._drawSprite(ctx,sprites.skeleton_mage,40,52);
    else this._drawFallback(ctx,'#ccccaa');
  }
}

class SlimeEnemy extends Enemy {
  constructor(x,y,waveScale,isSmall=false) {
    super(x,y,'slime');
    this.isSmall=isSmall;
    this.waveScale=waveScale;
    this.r=isSmall?10:18;
    this.maxHp=isSmall?(20+waveScale*5):(80+waveScale*20); this.hp=this.maxHp;
    this.speed=isSmall?95:55;
    this.dmg=isSmall?6:18;
    this.reward=isSmall?3:15;
    this.expReward=isSmall?2:10;
    this.score=isSmall?5:20;
    this.bloodColor='#22bb22';
    this.bobTimer=rand(0,Math.PI*2);
  }
  update(dt, player) {
    this.flashTime=Math.max(0,this.flashTime-dt);
    this.bobTimer+=dt*4;
    const [dx,dy]=norm(player.x-this.x, player.y-this.y);
    this.x+=dx*this.speed*dt;
    this.y+=dy*this.speed*dt;
    this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
  }
  draw(ctx) {
    const bob=Math.sin(this.bobTimer)*2;
    const spr=this.isSmall?sprites.slime_small:sprites.slime;
    const [w,h]=this.isSmall?[24,24]:[44,44];
    if (spr) {
      ctx.save();
      if (this.flashTime>0) ctx.filter='brightness(5) saturate(0)';
      ctx.drawImage(spr, this.x-w/2, this.y-h/2+bob, w, h);
      ctx.filter='none';
      ctx.restore();
      this._drawHpBar(ctx);
    } else {
      this._drawFallback(ctx, this.isSmall?'#44cc44':'#22aa22');
    }
  }
}

class GhostEnemy extends Enemy {
  constructor(x,y,waveScale) {
    super(x,y,'ghost');
    this.r=16;
    this.maxHp=(40+waveScale*10); this.hp=this.maxHp;
    this.speed=110+waveScale*8;
    this.dmg=15;
    this.reward=10;
    this.expReward=6;
    this.score=12;
    this.bloodColor='#8833aa';
    this.phaseTimer=rand(0,1.5);
    this.phaseInterval=3;
    this.isPhased=false;
    this.phaseDuration=0;
  }
  canBeHit() { return !this.isPhased; }
  update(dt, player) {
    this.flashTime=Math.max(0,this.flashTime-dt);
    this.phaseTimer+=dt;
    if (this.isPhased) {
      this.phaseDuration-=dt;
      if (this.phaseDuration<=0) this.isPhased=false;
      // drift slowly while phased
      const [dx,dy]=norm(player.x-this.x, player.y-this.y);
      this.x+=dx*this.speed*0.3*dt;
      this.y+=dy*this.speed*0.3*dt;
      this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
      return;
    }
    const [dx,dy]=norm(player.x-this.x, player.y-this.y);
    this.x+=dx*this.speed*dt;
    this.y+=dy*this.speed*dt;
    this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
    if (this.phaseTimer>=this.phaseInterval) {
      this.phaseTimer=0;
      this.isPhased=true;
      this.phaseDuration=1;
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha=this.isPhased?0.2:0.88;
    if (this.flashTime>0) ctx.filter='brightness(5) saturate(0)';
    if (sprites.ghost) {
      ctx.drawImage(sprites.ghost, this.x-20, this.y-26, 40, 52);
    } else {
      ctx.fillStyle='#9933cc';
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
    }
    ctx.filter='none';
    ctx.restore();
    if (!this.isPhased) this._drawHpBar(ctx);
  }
}

// ── Enemy Projectile ──────────────────────────────
class EnemyProjectile {
  constructor(x,y,dx,dy,dmg=20,speed=280) {
    this.x=x; this.y=y;
    [this.dx,this.dy]=norm(dx,dy);
    this.dmg=dmg; this.speed=speed;
    this.life=4; this.r=5;
  }
  update(dt) {
    this.x+=this.dx*this.speed*dt;
    this.y+=this.dy*this.speed*dt;
    this.life-=dt;
  }
  draw(ctx) {
    ctx.shadowColor='#ff4400';
    ctx.shadowBlur=10;
    // trail
    ctx.globalAlpha=0.3;
    ctx.fillStyle='#ff6600';
    ctx.beginPath();
    ctx.arc(this.x-this.dx*8, this.y-this.dy*8, this.r*0.55, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha=1;
    ctx.fillStyle='#ff4400';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#ffcc00';
    ctx.beginPath();
    ctx.arc(this.x-1, this.y-1, this.r*0.38, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
  }
  dead() { return this.life<=0||this.x<-100||this.x>WORLD+100||this.y<-100||this.y>WORLD+100; }
  hitsPlayer(p) { return dist(this.x,this.y,p.x,p.y)<this.r+p.r; }
}

// ═══════════════════════════════════════════════════
//  SPECIAL PROJECTILES (Weapons)
// ═══════════════════════════════════════════════════
class FrostProjectile extends Projectile {
  constructor(x,y,dx,dy,dmg,speed,slow,slowDuration) {
    super(x,y,dx,dy,dmg,speed,false,'#88ddff');
    this.slow=slow; this.slowDuration=slowDuration;
  }
  onHit(e) {
    super.onHit(e);
    e.slowAmount=this.slow; e.slowTimer=this.slowDuration;
  }
  draw(ctx) {
    this.color='#88ddff';
    super.draw(ctx);
  }
}

class SoulProjectile extends Projectile {
  constructor(x,y,dx,dy,dmg,speed,bounces) {
    super(x,y,dx,dy,dmg,speed,true,'#cc88ff');
    this.bounces=bounces;
    this.lastTarget=null;
  }
  onHit(e) {
    super.onHit(e);
    this.lastTarget=e;
    if (this.bounces>0) {
      this.bounces--;
      // Find nearest enemy that isn't the one just hit
      const enemies=game.enemies;
      let best=null,bd=Infinity;
      for (const t of enemies) {
        if (t===e||t.id===e.id) continue;
        const d=dist(e.x,e.y,t.x,t.y);
        if (d<bd){bd=d;best=t;}
      }
      if (best&&bd<500) {
        const [ndx,ndy]=norm(best.x-e.x,best.y-e.y);
        this.x=e.x; this.y=e.y;
        this.dx=ndx; this.dy=ndy;
        this.speed=420;
        this.hit.delete(e.id); // allow re-hit after bounce
        this.life=2;
      } else {
        this.piercing=false; this.life=0;
      }
    }
  }
  draw(ctx) {
    this.color='#cc88ff';
    super.draw(ctx);
  }
}

// ═══════════════════════════════════════════════════
//  TENTACLE ARM (Chaoskraken)
// ═══════════════════════════════════════════════════
class TentacleArm {
  constructor(x,y) {
    this.x=x; this.y=y; this.id=_entId++;
    this.r=12;
    this.maxLife=4;
    this.life=4;
    this.spawnTime=Date.now()/1000;
    this.stunned=0;
  }
  update(dt, player) {
    this.life-=dt;
    if (this.stunned>0) {
      this.stunned-=dt;
      return; // stunned = no movement
    }
    // Tentacle tries to reach player
    const [dx,dy]=norm(player.x-this.x, player.y-this.y);
    this.x+=dx*40*dt;
    this.y+=dy*40*dt;
    // Clamp to world
    this.x=clamp(this.x,0,WORLD); this.y=clamp(this.y,0,WORLD);
  }
  collidesWithPlayer(p) { return dist(this.x,this.y,p.x,p.y) < this.r+p.r-4; }
  dead() { return this.life<=0; }
  draw(ctx) {
    const bob=Math.sin((this.spawnTime-Date.now()/1000)*3)*3;
    if (this.stunned>0) ctx.globalAlpha=0.4;
    if (sprites.tentacle) {
      ctx.save();
      ctx.translate(this.x, this.y+bob);
      ctx.rotate(Math.atan2(ctx.canvas.height/2+this.y, ctx.canvas.width/2+this.x));
      ctx.drawImage(sprites.tentacle, -12, -64, 24, 64);
      ctx.restore();
    } else {
      ctx.fillStyle='#3a2a3a';
      ctx.beginPath(); ctx.arc(this.x,this.y+bob,this.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    if (this.stunned>0) {
      ctx.fillStyle='#ffcc00';
      ctx.font='12px Arial';
      ctx.fillText('✨', this.x-8, this.y-34);
    }
  }
}

// ═══════════════════════════════════════════════════
//  MAP ENTITIES
// ═══════════════════════════════════════════════════
class TreeStump {
  constructor(x,y) {
    this.x=x; this.y=y; this.r=18;
  }
  draw(ctx) {
    if (sprites.tree_stump) {
      ctx.drawImage(sprites.tree_stump, this.x-20, this.y-20);
    } else {
      ctx.fillStyle='#3a2210';
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#2a1808'; ctx.lineWidth=2; ctx.stroke();
    }
  }
  blocksPoint(px,py,pr=0) {
    return dist(this.x,this.y,px,py) < this.r+pr;
  }
}

class MushroomPickup {
  constructor(x,y) {
    this.x=x; this.y=y; this.r=12; this.collected=false;
  }
  draw(ctx) {
    if (this.collected) return;
    if (sprites.mushroom) {
      ctx.drawImage(sprites.mushroom, this.x-12, this.y-14);
    } else {
      ctx.fillStyle='#cc4444';
      ctx.beginPath(); ctx.arc(this.x,this.y-4,10,Math.PI,0); ctx.fill();
      ctx.fillStyle='#ddccaa';
      ctx.fillRect(this.x-2,this.y-4,4,10);
    }
  }
  checkCollect(player) {
    if (this.collected) return false;
    if (dist(this.x,this.y,player.x,player.y) < this.r+player.r) {
      this.collected=true;
      player.heal(15);
      return true;
    }
    return false;
  }
}

// ═══════════════════════════════════════════════════
//  MAIN GAME
// ═══════════════════════════════════════════════════
class Game {
  constructor() {
    this.canvas=document.getElementById('gameCanvas');
    this.ctx=this.canvas.getContext('2d');
    this.state='menu';

    this.player=null;
    this.enemies=[];
    this.projectiles=[];
    this.enemyProjectiles=[];
    this.effects=[];  // NovaEffect etc
    this.particles=[];
    this.pickups=[];

    this.camera={x:0,y:0};
    this.keys={};
    this.prevKeys={};
    this.lastTime=0;

    this.currency=0;
    this.totalKills=0;
    this.wave=0;
    this.playTime=0;          // current wave index (0-based)
    this.waveActive=false;
    this.waveTimer=0;
    this.spawnQueue=[];   // [{type,delay,remaining}]
    this.enemiesThisWave=0;
    this.enemiesKilledThisWave=0;

    this.tentacles=[];    // TentacleArm objects

    this.skills={};       // skill_id -> level
    SKILLS.forEach(s=>{ this.skills[s.id]=0; });

    this.meta={soulGems:0, metaLevels:{}, unlocked:['aether']};
    this.runSoulGems=0; // earned during current run

    this.announceTimer=0;
    this.bgCanvas=null;

    this.init();
  }

  // ── Setup ──────────────────────────────────────
  async init() {
    this.resizeCanvas();
    window.addEventListener('resize', ()=>this.resizeCanvas());
    this.setupInput();
    this.buildPrerendered();

    // Load SVGs
    [sprites.player, sprites.shadow_runner, sprites.warrior, sprites.nature_guardian,
     sprites.tree_stump, sprites.mushroom,
     sprites.zombie, sprites.bat, sprites.ogre, sprites.boss, sprites.gem,
     sprites.skeleton_mage, sprites.slime, sprites.slime_small, sprites.ghost,
     sprites.lichkoning, sprites.kraken, sprites.tentacle] =
      await Promise.all([
        loadImg('svg/player.svg'),
        loadImg('svg/shadow_runner.svg'),
        loadImg('svg/warrior.svg'),
        loadImg('svg/nature_guardian.svg'),
        loadImg('svg/tree_stump.svg'),
        loadImg('svg/mushroom.svg'),
        loadImg('svg/zombie.svg'),
        loadImg('svg/bat.svg'),
        loadImg('svg/ogre.svg'),
        loadImg('svg/boss.svg'),
        loadImg('svg/gem.svg'),
        loadImg('svg/skeleton_mage.svg'),
        loadImg('svg/slime.svg'),
        loadImg('svg/slime_small.svg'),
        loadImg('svg/ghost.svg'),
        loadImg('svg/lichkoning.svg'),
        loadImg('svg/kraken.svg'),
        loadImg('svg/tentacle_arm.svg'),
      ]);

    // UI hooks
    document.getElementById('start-btn').addEventListener('click',    ()=>this.showCharSelect());
    document.getElementById('restart-btn').addEventListener('click',  ()=>this.restart());
    document.getElementById('skilltree-skip').addEventListener('click',()=>this.hideSkillTree());
    document.getElementById('skilltree-save').addEventListener('click',()=>this.save());
    document.getElementById('charselect-back').addEventListener('click',()=>this.hideCharSelect());
    document.getElementById('weaponselect-skip').addEventListener('click',()=>this.hideWeaponSelect());
            document.getElementById('upgrades-btn').addEventListener('click',()=>this.showMetaTree());
    document.getElementById('mapselect-back').addEventListener('click',()=>this.hideMapSelect());
    document.getElementById('modeselect-back').addEventListener('click',()=>this.hideModeSelect());
    document.getElementById('challenge-reroll').addEventListener('click',()=>{
      this._rolledChallengeMods=this._rollChallengeMods();
      this.renderChallengeDetail();
    });
    document.getElementById('meta-back').addEventListener('click',()=>this.hideMetaTree());
    document.getElementById('menu-btn-gameover').addEventListener('click',()=>this.goToMenu());
    document.getElementById('continue-endless-btn').addEventListener('click',()=>this._continueEndless());
    document.getElementById('skilltree-reroll-btn').addEventListener('click',()=>{
      this._rerollAvailable=false;
      this.renderSkillCards();
      document.getElementById('skilltree-reroll').style.display='none';
    });
    document.getElementById('savemanager-close').addEventListener('click',()=>this.hideSaveManager());
    document.getElementById('saves-btn').addEventListener('click',()=>this.showSaveManager());

    // Import drag & drop
    const dropZone=document.getElementById('import-drop-zone');
    const fileInput=document.getElementById('import-file-input');
    dropZone.addEventListener('click',()=>fileInput.click());
    fileInput.addEventListener('change',(e)=>{
      if (e.target.files[0]) this._handleImportFile(e.target.files[0]);
    });
    dropZone.addEventListener('dragover',(e)=>{ e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop',(e)=>{
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) this._handleImportFile(e.dataTransfer.files[0]);
    });

    // Continue button — show if any save exists, use slot 0
    const contBtn=document.getElementById('continue-btn');
    if (this.hasSave(0)) {
      contBtn.style.display='';
      const raw=JSON.parse(localStorage.getItem(this._getSlotKey(0)));
      contBtn.textContent=`FORTSETZEN  (Welle ${raw.wave||1})`;
    }
    contBtn.addEventListener('click', ()=>{
      if (this.load(0)) {
        this._loadingFromSave=true;
        this.showCharSelect();
      }
    });

    this.selectedChar='aether'; // default character
    this.selectedMode='standard';
    this.selectedMap='arena';
    this.treeStumps=[];
    this.mushrooms=[];
    this.gameMode='standard';
    this.challengeMods=[];
    this.bonusMultiplier=1.0;
    this.timeAttackTimer=900; // 15 min
    this.endlessWave=0;

    requestAnimationFrame(t=>this.loop(t));
  }

  resizeCanvas() {
    this.canvas.width=window.innerWidth;
    this.canvas.height=window.innerHeight;
    this.buildPrerendered();
  }

  buildPrerendered() {
    // Pre-render background tile with map-specific colors
    const cfg=MAPS.find(m=>m.id===this.selectedMap)||MAPS[0];
    const tc=document.createElement('canvas');
    tc.width=TILE; tc.height=TILE;
    const tx=tc.getContext('2d');
    tx.fillStyle=cfg.bgColor;
    tx.fillRect(0,0,TILE,TILE);
    tx.strokeStyle=cfg.bgGrid;
    tx.lineWidth=0.5;
    tx.strokeRect(0,0,TILE,TILE);
    // Subtle texture
    tx.fillStyle='rgba(255,255,255,0.015)';
    for(let i=0;i<3;i++) {
      tx.beginPath();
      tx.arc(rand(8,56),rand(8,56),rand(2,8),0,Math.PI*2);
      tx.fill();
    }
    this.bgTile=tc;
  }

  setupInput() {
    window.addEventListener('keydown', e=>{
      if(!this.keys[e.code]) {
        if (e.code==='Space')  { e.preventDefault(); this.activateSuperpower(); }
        if (e.code==='Escape') { e.preventDefault(); this.togglePause(); }
        if (e.code==='F5')     { e.preventDefault(); this.save(); }
        if (e.code==='Enter' || e.code==='NumpadEnter') {
          if (this.state==='skilltree') this.hideSkillTree();
        }
      }
      this.keys[e.code]=true;
    });
    window.addEventListener('keyup', e=>{ this.keys[e.code]=false; });
  }

  // ── Game State ────────────────────────────────
  startGame(fromSave=false) {
    this._loadingFromSave=false;
    document.getElementById('menu-screen').classList.add('hide');
    document.getElementById('charselect-overlay').classList.remove('show');
    document.getElementById('modeselect-overlay').classList.remove('show');

    // Set mode from selection
    if (!fromSave) {
      this.gameMode=this.selectedMode||'standard';
    }

    if (fromSave) {
      this.loadMeta();
    } else {
      this.runSoulGems=0;
      this.playTime=0;
      this.currency=0;
      this.totalKills=0;
      this.wave=0;
      this.endlessWave=0;
      this.timeAttackTimer=900;
      SKILLS.forEach(s=>{ this.skills[s.id]=0; });
      this.loadMeta();
      // Challenge mode: apply stored modifiers
      if (this.gameMode==='challenge' && !this.challengeMods.length) {
        this.challengeMods=this._rolledChallengeMods;
        let totalBonus=0;
        for (const m of this.challengeMods) totalBonus+=m.bonus;
        this.bonusMultiplier=1+totalBonus;
      }
    }
    this.player=new Player(WORLD/2, WORLD/2, this.selectedChar||'aether');
    this.applySkillsToPlayer();
    if (!fromSave) {
      this.applyMetaToPlayer();
      this._generateMap();
    }
    if (fromSave && this._savedHp) {
      this.player.hp=Math.min(this._savedHp, this.player.maxHp);
    }
    // Restore level, EXP, and weapons from save
    if (fromSave && this._savedLevel>1) {
      this.player.level=this._savedLevel;
      this.player.exp=this._savedExp||0;
    }
    if (fromSave && this._savedWeapons) {
      this.player.activeWeapons=[];
      for (const w of this._savedWeapons) {
        this.player.activeWeapons.push({id:w.id, level:w.level, cdTimer:0});
      }
    }
    // Restore mode-specific state from save
    if (fromSave) {
      this.gameMode=this._savedMode||'standard';
      this.selectedMap=this._savedMap||'arena';
      this._generateMap();
      this.timeAttackTimer=this._savedTimeAttack||900;
      this.bonusMultiplier=this._savedBonusMul||1.0;
      // Rebuild challenge mods from IDs
      if (this._savedChallengeMods&&this._savedChallengeMods.length) {
        this.challengeMods=this._savedChallengeMods.map(id=>CHALLENGE_MODS.find(m=>m.id===id)).filter(Boolean);
        this._challengeNoLevelup=this.challengeMods.some(m=>m.id==='no_levelup');
        this._challengeFastEnemies=this.challengeMods.some(m=>m.id==='fast_enemies');
        this._challengeDoubleEnemies=this.challengeMods.some(m=>m.id==='double_enemies');
        this._challengePermadeath=this.challengeMods.some(m=>m.id==='permadeath');
        if (this.challengeMods.some(m=>m.id==='wave_timer')) this._challengeWaveTimer=90;
        if (this.challengeMods.some(m=>m.id==='one_weapon')) {
          this.player.activeWeapons=[{id:'magic_shot',level:1,cdTimer:0}];
        }
        if (this.challengeMods.some(m=>m.id==='no_regen')) {
          this.player.regen=0; this.player.lifesteal=0;
        }
      }
    }
    this.enemies=[];
    this.projectiles=[];
    this.enemyProjectiles=[];
    this.particles=[];
    this.pickups=[];
    this.effects=[];
    this._waveTimeout=null;
    this.state='playing';
    this.beginWave(this.wave);
  }

  _timeAttackVictory() {
    this.state='gameover';
    document.getElementById('boss-hp-panel').classList.remove('show');
    const go=document.getElementById('gameover-screen');
    go.querySelector('h1').textContent='🏆 VICTORY!';
    go.querySelector('h1').style.color='#ffdd44';
    go.querySelector('#go-wave').textContent='15:00 überlebt!';
    go.querySelector('#go-kills').textContent=this.totalKills;
    go.querySelector('#go-currency').textContent=this.currency;
    go.querySelector('#go-time').textContent=this._formatPlayTime();
    go.classList.add('show');
    document.getElementById('continue-endless-btn').style.display='';
    document.getElementById('menu-btn-gameover').style.display='';
    // Add victory bonus on top of wave-earned gems
    this.runSoulGems+=50;
    this.saveMeta(this.runSoulGems);
    document.getElementById('go-souls').textContent=this.runSoulGems;
    this._clearRunSave();
  }

  restart() {
    document.getElementById('gameover-screen').classList.remove('show');
    document.getElementById('boss-hp-panel').classList.remove('show');
    document.getElementById('continue-endless-btn').style.display='none';
    const goH1=document.getElementById('gameover-screen').querySelector('h1');
    goH1.textContent='☠ GAME OVER';
    goH1.style.color='#ff3333';
    this.challengeMods=[];
    this.bonusMultiplier=1.0;
    this.startGame(false);
  }

  goToMenu() {
    document.getElementById('gameover-screen').classList.remove('show');
    document.getElementById('boss-hp-panel').classList.remove('show');
    document.getElementById('continue-endless-btn').style.display='none';
    this.challengeMods=[];
    this.bonusMultiplier=1.0;
    this.playTime=0;
    this.runSoulGems=0;
    this.state='menu';
    this.pickups=[];
    this.enemies=[];
    this.projectiles=[];
    this.enemyProjectiles=[];
    this.tentacles=[];
    this.treeStumps=[];
    this.mushrooms=[];
    document.getElementById('menu-screen').classList.remove('hide');
    // Update continue button
    const contBtn=document.getElementById('continue-btn');
    if (this.hasSave(0)) {
      contBtn.style.display='';
      const raw=JSON.parse(localStorage.getItem(this._getSlotKey(0)));
      contBtn.textContent=`FORTSETZEN  (Welle ${raw.wave||1})`;
    } else {
      contBtn.style.display='none';
    }
  }

  _continueEndless() {
    document.getElementById('gameover-screen').classList.remove('show');
    document.getElementById('continue-endless-btn').style.display='none';
    // Switch to endless mode and continue from current wave
    this.gameMode='endless';
    this.selectedMode='endless';
    this.state='playing';
    this.beginWave(this.wave);
  }

  _clearRunSave(slot=0) {
    localStorage.removeItem(this._getSlotKey(slot));
    const contBtn=document.getElementById('continue-btn');
    if (contBtn && !this.hasAnySave()) contBtn.style.display='none';
  }

  hasAnySave() {
    for (let i=0;i<3;i++) { if (this.hasSave(i)) return true; }
    return false;
  }

  _formatPlayTime() {
    const totalSec=Math.floor(this.playTime);
    const m=Math.floor(totalSec/60);
    const s=totalSec%60;
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  togglePause() {
    if (this.state==='playing') this.state='paused';
    else if (this.state==='paused') this.state='playing';
  }

  gameOver() {
    this.state='gameover';
    const go=document.getElementById('gameover-screen');
    document.getElementById('boss-hp-panel').classList.remove('show');

    // Reset title
    go.querySelector('h1').textContent='☠ GAME OVER';
    go.querySelector('h1').style.color='#ff3333';
    document.getElementById('continue-endless-btn').style.display='none';
    document.getElementById('menu-btn-gameover').style.display='';

    // Mode-specific wave display
    if (this.gameMode==='endless') {
      go.querySelector('#go-wave').textContent=`Welle ${this.wave}`;
      this._saveEndlessHighscore();
    } else if (this.gameMode==='timeattack') {
      const survived=900-this.timeAttackTimer;
      const m=Math.floor(survived/60);
      const s=Math.floor(survived%60);
      go.querySelector('#go-wave').textContent=`${m}:${String(s).padStart(2,'0')}`;
    } else {
      go.querySelector('#go-wave').textContent=`Runde ${this.round} · Welle ${this.waveInRound}`;
    }

    go.querySelector('#go-kills').textContent=this.totalKills;
    go.querySelector('#go-currency').textContent=this.currency;
    go.querySelector('#go-time').textContent=this._formatPlayTime();
    go.classList.add('show');

    this.saveMeta(this.runSoulGems);
    document.getElementById('go-souls').textContent=this.runSoulGems;
    this._clearRunSave();
  }

  // ── Wave Logic ────────────────────────────────
  beginWave(idx) {
    // Mode-specific handling
    if (this.gameMode==='timeattack') {
      // Time attack: continuous spawn, no wave system
      this.waveActive=true;
      this.enemiesThisWave=0;
      this.enemiesKilledThisWave=0;
      this.spawnQueue=[];
      this._timeAttackNextSpawn=0;
      this._timeAttackSpawnRate=1.8; // seconds between spawns
      this._timeAttackElapsed=0;
      this._timeAttackWave=1; // difficulty level
      this.wave=1;
      this.round=1;
      this.waveInRound=1;
      this.updateHUD();
      return;
    }

    if (this.gameMode==='endless') {
      // Endless: dynamic wave generation
      const scale=idx;
      const wd=this._buildEndlessWave(idx, scale);
      this.wave=idx+1;
      this.round=idx+1;
      this.waveInRound=idx+1;
      this.waveActive=true;
      this.enemiesThisWave=0;
      this.enemiesKilledThisWave=0;
      this.spawnQueue=[];
      this._buildSpawnQueue(wd, scale);
      this.showAnnouncement(`Welle ${idx+1}`, `Endlos — Schwierigkeit +${idx}`);
      this.updateHUD();
      return;
    }

    // Runde basierend auf idx (jede 10. Welle ist Boss-Welle)
    const round=Math.floor(idx / 10); // 0-basierte Runde (0-9)
    const waveInRound=(idx % 10) + 1; // Welle 1-10 innerhalb der Runde
    const scale=round;                  // Schwierigkeit basierend auf Runde

    // Boss-Rotation: round % 3 = 0→Schatten, 1→Lichkönig, 2→Chaoskraken
    // Boss-Wellen sind auf Welle 10, 20, 30... (jede 10. Welle)
    let bossType=null;
    if (waveInRound===10) {
      bossType=['shadow','lich','kraken'][round % 3];
    }

    // Build wave definition
    let wd;
    if (bossType) {
      const bossIdx=['shadow','lich','kraken'].indexOf(bossType);
      wd=WAVE_DATA[bossIdx];
    } else {
      wd=this._buildRegularWave(waveInRound, scale);
    }

    this.wave=idx+1;
    this.round=round+1; // Runde 1-10
    this.waveInRound=waveInRound;
    this.waveActive=true;
    this.enemiesThisWave=0;
    this.enemiesKilledThisWave=0;
    this.spawnQueue=[];

    // Reset reroll for this wave
    if (this.meta&&this.meta.metaLevels['meta_reroll']>0) this._rerollAvailable=true;

    // Build spawn queue
    const enemyMul=(this.gameMode==='challenge'&&this._challengeDoubleEnemies)?2:1;
    for (const entry of wd.enemies) {
      const n=entry.n*enemyMul;
      this.enemiesThisWave+=n;
      for (let i=0;i<n;i++) {
        this.spawnQueue.push({
          type:entry.type,
          delay: entry.delay * (i===0?0.5:1),
          timer: entry.delay * i * (1 + scale*0.08),
          scale
        });
      }
    }
    // Sort by timer
    this.spawnQueue.sort((a,b)=>a.timer-b.timer);

    // Show wave announcement
    const isBossWave=waveInRound===10;
    const bossLabel=isBossWave ? `⚠️ BOSS: ${bossType.toUpperCase()} ⚠️` : '';
    const fullLabel=wd.label.replace(/BOSS — /, `Runde ${this.round} · BOSS — `);

    this.showAnnouncement(fullLabel, bossLabel);
    this.updateHUD();
  }

  _buildRegularWave(waveInRound, scale) {
    // Generiert nicht-Boss-Wellen basierend auf Position (1-9) und Rundenskala
    const s=scale; // Schwierigkeits-Multiplikator
    const w=waveInRound;

    if (w<=3) {
      const n=5+Math.floor(s*2)+w;
      return {
        label:`Runde ${s+1} · Welle ${w}`,
        enemies:[
          {type:'zombie', n:n, delay:1.8},
          ...(w>=2?[{type:'bat', n:Math.floor(n*0.4)+s, delay:1.2}]:[]),
        ],
        boss:false,
      };
    }
    if (w<=6) {
      const n=8+Math.floor(s*3)+w;
      return {
        label:`Runde ${s+1} · Welle ${w}`,
        enemies:[
          {type:'zombie', n:n, delay:1.4},
          {type:'bat', n:Math.floor(n*0.5)+s, delay:1.0},
          ...(s>=1?[{type:'skeleton_mage', n:2+s, delay:2.0}]:[]),
          ...(s>=2?[{type:'slime', n:2+s, delay:2.5}]:[]),
        ],
        boss:false,
      };
    }
    // w 7-9
    const n=10+Math.floor(s*4)+w;
    return {
      label:`Runde ${s+1} · Welle ${w}`,
      enemies:[
        {type:'zombie', n:n, delay:1.0},
        {type:'bat', n:Math.floor(n*0.6)+s, delay:0.8},
        {type:'skeleton_mage', n:3+Math.floor(s*1.5), delay:1.8},
        {type:'slime', n:3+s, delay:2.2},
        ...(s>=2?[{type:'ghost', n:2+s, delay:2.8}]:[]),
        ...(w>=9?[{type:'ogre', n:1+Math.floor(s*0.8), delay:4.0}]:[]),
      ],
      boss:false,
    };
  }

  _buildEndlessWave(idx, scale) {
    const s=scale;
    const n=6+Math.floor(s*3)+Math.floor(idx*0.8);
    const isBossWave=(idx>0 && idx%10===0);
    const enemies=[{type:'zombie', n:n, delay:1.4}];
    if (idx>=3) enemies.push({type:'bat', n:Math.floor(n*0.4)+s, delay:1.0});
    if (idx>=5) enemies.push({type:'skeleton_mage', n:2+Math.floor(s*0.6), delay:2.0});
    if (idx>=7) enemies.push({type:'slime', n:2+Math.floor(s*0.6), delay:2.5});
    if (idx>=10) enemies.push({type:'ghost', n:1+Math.floor(s*0.5), delay:3.0});
    if (idx>=15) enemies.push({type:'ogre', n:1+Math.floor(s*0.3), delay:4.5});
    if (isBossWave) {
      const bossType=['boss','lichkoning','kraken'][idx%3];
      enemies.push({type:bossType, n:1, delay:6.0});
    }
    return {enemies, boss:isBossWave};
  }

  _buildSpawnQueue(wd, scale) {
    for (const entry of wd.enemies) {
      this.enemiesThisWave+=entry.n;
      for (let i=0;i<entry.n;i++) {
        this.spawnQueue.push({
          type:entry.type,
          delay:entry.delay*(i===0?0.5:1),
          timer:entry.delay*i*(1+scale*0.06),
          scale,
        });
      }
    }
    this.spawnQueue.sort((a,b)=>a.timer-b.timer);
  }

  _processTimeAttack(dt) {
    this._timeAttackElapsed+=dt;
    this._timeAttackSpawnRate=Math.max(0.25, 1.8-this._timeAttackElapsed/600); // faster spawns over time

    // Difficulty increases every 60s
    if (this._timeAttackElapsed>=this._timeAttackWave*60) {
      this._timeAttackWave++;
    }

    this._timeAttackNextSpawn-=dt;
    if (this._timeAttackNextSpawn<=0) {
      this._timeAttackNextSpawn=this._timeAttackSpawnRate;
      // Spawn based on difficulty
      const scale=this._timeAttackWave-1;
      const r=Math.random();
      if (r<0.4) this.spawnEnemy('zombie', scale);
      else if (r<0.6) this.spawnEnemy('bat', scale);
      else if (r<0.75 && this._timeAttackWave>=3) this.spawnEnemy('skeleton_mage', scale);
      else if (r<0.88 && this._timeAttackWave>=4) this.spawnEnemy('slime', scale);
      else if (r<0.96 && this._timeAttackWave>=6) this.spawnEnemy('ghost', scale);
      else if (this._timeAttackWave>=6) this.spawnEnemy('ogre', scale);
      else this.spawnEnemy('zombie', scale);
    }
  }

  waveUpdate(dt) {
    // Process spawn queue
    for (const entry of this.spawnQueue) {
      entry.timer-=dt;
    }
    while (this.spawnQueue.length && this.spawnQueue[0].timer<=0) {
      const e=this.spawnQueue.shift();
      this.spawnEnemy(e.type, e.scale);
    }

    // Check wave complete
    if (!this.spawnQueue.length && this.enemies.length===0 && this.waveActive) {
      this.waveComplete();
    }
  }

  spawnEnemy(type, scale) {
    const enemyHpMul=(this.gameMode==='challenge'&&this._challengeDoubleEnemies)?0.5:1;
    // Spawn at random edge of screen (with margin)
    const margin=80;
    const cx=this.player.x, cy=this.player.y;
    const W=this.canvas.width, H=this.canvas.height;
    let x,y;
    const side=randInt(0,3);
    if (side===0) { x=rand(cx-W/2-margin, cx+W/2+margin); y=cy-H/2-margin; }
    else if(side===1) { x=rand(cx-W/2-margin, cx+W/2+margin); y=cy+H/2+margin; }
    else if(side===2) { x=cx-W/2-margin; y=rand(cy-H/2-margin, cy+H/2+margin); }
    else             { x=cx+W/2+margin; y=rand(cy-H/2-margin, cy+H/2+margin); }
    x=clamp(x,0,WORLD); y=clamp(y,0,WORLD);

    switch(type) {
      case 'zombie':         this.enemies.push(new ZombieEnemy(x,y,scale));       break;
      case 'bat':            this.enemies.push(new BatEnemy(x,y,scale));          break;
      case 'ogre':           this.enemies.push(new OgreEnemy(x,y,scale));         break;
      case 'boss':           this.enemies.push(new BossEnemy(x,y,scale));         break;
      case 'skeleton_mage':  this.enemies.push(new SkeletonMageEnemy(x,y,scale)); break;
      case 'slime':          this.enemies.push(new SlimeEnemy(x,y,scale,false));  break;
      case 'ghost':          this.enemies.push(new GhostEnemy(x,y,scale));        break;
      case 'lichkoning':     this.enemies.push(new LichkoningEnemy(x,y,scale));   break;
      case 'kraken':         this.enemies.push(new KrakenEnemy(x,y,scale));       break;
    }
    // Apply challenge enemy HP modifier
    if (enemyHpMul!==1 && this.enemies.length) {
      const lastE=this.enemies[this.enemies.length-1];
      lastE.maxHp=Math.floor(lastE.maxHp*enemyHpMul);
      lastE.hp=lastE.maxHp;
    }
    // Apply fast enemy speed
    if (this._challengeFastEnemies && this.enemies.length) {
      const lastE=this.enemies[this.enemies.length-1];
      if (lastE.speed) lastE.speed*=1.5;
      if (lastE.baseSpeed) lastE.baseSpeed*=1.5;
    }
  }

  waveComplete() {
    this.waveActive=false;
    // Award soul gems per wave (5 regular, 10 boss, +40 round bonus)
    const isBoss=this.wave%10===0;
    let gems=isBoss?10:5;
    if (isBoss) gems+=40; // complete round bonus
    this.runSoulGems+=gems;
    this.showFloatText(this.player.x, this.player.y-50, `💎 +${gems}`, '#aa88ff');
    if (this.gameMode==='challenge') {
      const bonus=Math.floor(gems*(this.bonusMultiplier-1));
      if (bonus>0) { this.runSoulGems+=bonus; this.showFloatText(this.player.x, this.player.y-70, `💎 Bonus +${bonus}`, '#ffaa66'); }
    }

    if (this._challengeNoLevelup) {
      // No skill tree in challenge no_levelup mode, just go to next wave
      this._waveTimeout=setTimeout(()=>{
        if (this.state==='playing') this.beginWave(this.wave);
      }, 400);
      this.saveMeta(0);
      return;
    }

    this._waitingForSkillTree=true;
    clearTimeout(this._waveTimeout);
    this._waveTimeout=setTimeout(()=>{
      this._tryShowSkillTree();
    }, 400);
  }

  _tryShowSkillTree() {
    if (this.state==='weaponselect') {
      // Level-up active, retry later
      this._waveTimeout=setTimeout(()=>this._tryShowSkillTree(), 150);
      return;
    }
    if (this.state==='playing') {
      this._waitingForSkillTree=false;
      this.showSkillTree();
    }
  }

  onEnemyKilled(enemy) {
    this.totalKills++;
    this.enemiesKilledThisWave++;
    this.player.score+=enemy.score;
    this.pickups.push(new GemPickup(enemy.x, enemy.y, enemy.reward));
    this.showFloatText(enemy.x, enemy.y, `+${enemy.reward}◆`, '#00ccff');
    // EXP award and level-up check
    if (enemy.expReward && !this._challengeNoLevelup) {
      const gained=this.player._awardExp(enemy.expReward);
      if (gained>0) {
        this._pendingLevelUps=(this._pendingLevelUps||0)+gained;
        this.showFloatText(this.player.x, this.player.y-50, `⬆ LEVEL ${this.player.level}!`, '#ffdd44');
        this.showWeaponSelect();
      }
    }
    // Slime splits into two small slimes on death
    if (enemy instanceof SlimeEnemy && !enemy.isSmall) {
      this.enemies.push(new SlimeEnemy(enemy.x-18, enemy.y, enemy.waveScale, true));
      this.enemies.push(new SlimeEnemy(enemy.x+18, enemy.y, enemy.waveScale, true));
    }
  }

  // ── Skill Tree ────────────────────────────────
  showSkillTree() {
    this.state='skilltree';
    const overlay=document.getElementById('skilltree-overlay');
    document.getElementById('skilltree-currency').textContent=`Deine Kristalle: ${this.currency} ◆`;
    this.renderSkillCards();
    overlay.classList.add('show');
    // Show reroll button if meta_reroll is active
    if (this.meta.metaLevels['meta_reroll']>0 && this._rerollAvailable) {
      document.getElementById('skilltree-reroll').style.display='';
    }
  }

  hideSkillTree() {
    clearTimeout(this._waveTimeout);
    document.getElementById('skilltree-overlay').classList.remove('show');
    document.getElementById('skilltree-reroll').style.display='none';
    // Check for standard mode victory (100 waves completed)
    if (this.gameMode==='standard' && this.wave >= 100) {
      this._standardVictory();
      return;
    }
    this.state='playing';
    this.autoSave();
    this.saveMeta(0);
    this.beginWave(this.wave);
  }

  _standardVictory() {
    this.state='gameover';
    document.getElementById('boss-hp-panel').classList.remove('show');
    const go=document.getElementById('gameover-screen');
    go.querySelector('h1').textContent='🏆 SIEG!';
    go.querySelector('h1').style.color='#ffdd44';
    go.querySelector('#go-wave').textContent=`Runde 10 · Welle 10 (alle 100 Wellen!)`;
    go.querySelector('#go-kills').textContent=this.totalKills;
    go.querySelector('#go-currency').textContent=this.currency;
    go.querySelector('#go-time').textContent=this._formatPlayTime();
    go.classList.add('show');
    this.runSoulGems+=100; // full clear bonus
    this.saveMeta(this.runSoulGems);
    document.getElementById('go-souls').textContent=this.runSoulGems;
    document.getElementById('continue-endless-btn').style.display='';
    document.getElementById('menu-btn-gameover').style.display='';
    this._clearRunSave();
  }

  // ── Character Selection ─────────────────────────
  showCharSelect() {
    this.state='charselect';
    this.loadMeta();
    document.getElementById('menu-screen').classList.add('hide');
    const overlay=document.getElementById('charselect-overlay');
    document.getElementById('cs-souls').textContent=this.soulGems;
    this.renderCharCards();
    overlay.classList.add('show');
  }

  hideCharSelect() {
    document.getElementById('charselect-overlay').classList.remove('show');
    document.getElementById('menu-screen').classList.remove('hide');
    this.state='menu';
  }

  renderCharCards() {
    const container=document.getElementById('char-cards');
    container.innerHTML='';
    const unlocked=this._getUnlockedChars();

    for (const c of CHARACTERS) {
      const isUnlocked=unlocked.includes(c.id)||!c.locked;
      const isSelected=this.selectedChar===c.id;

      const card=document.createElement('div');
      card.className='char-card';
      if (isSelected) card.classList.add('selected');
      if (!isUnlocked) card.classList.add('locked');
      else card.classList.add('unlocked');

      card.innerHTML=`
        <div class="char-icon">${c.icon}</div>
        <div class="char-name">${c.name}</div>
        <div class="char-stats">
          ❤️ <span>${c.hp}</span> &nbsp;
          💨 <span>${c.speed}</span> &nbsp;
          ⚔️ <span>${c.dmg}</span>
        </div>
        <div class="char-passive"><strong>Passiv:</strong> ${c.passiveDesc}</div>
        <div class="char-sp"><strong>${c.spName}:</strong> ${c.spDesc}</div>
        ${!isUnlocked ? `<div class="char-cost">💎 ${c.cost} Seelenkristalle</div>` : ''}
      `;

      if (isUnlocked) {
        card.addEventListener('click', ()=>{
          this.selectedChar=c.id;
          this.renderCharCards();
          if (this._loadingFromSave) {
            // Continue mode — restore saved game directly
            setTimeout(()=>this.startGame(true), 300);
          } else {
            setTimeout(()=>this.showModeSelect(), 300);
          }
        });
      } else {
        card.addEventListener('click', ()=>{
          if (this.soulGems>=c.cost) {
            this._unlockChar(c.id);
            this.selectedChar=c.id;
            this.renderCharCards();
            setTimeout(()=>this.showModeSelect(), 300);
          }
        });
      }
      container.appendChild(card);
    }
  }

  _getUnlockedChars() {
    if (!this.meta) this.loadMeta();
    const unlocked=this.meta.unlocked||['aether'];
    // Also check meta skill unlocks
    const ml=this.meta.metaLevels||{};
    if (ml['unlock_shadow']&&!unlocked.includes('shadow')) unlocked.push('shadow');
    if (ml['unlock_warrior']&&!unlocked.includes('warrior')) unlocked.push('warrior');
    if (ml['unlock_nature']&&!unlocked.includes('nature')) unlocked.push('nature');
    return unlocked;
  }

  _unlockChar(charId) {
    const cfg=CHARACTERS.find(c=>c.id===charId);
    if (!cfg) return;
    this.loadMeta();
    this.soulGems-=cfg.cost;
    if (!this.meta.unlocked) this.meta.unlocked=['aether'];
    if (!this.meta.unlocked.includes(charId)) this.meta.unlocked.push(charId);
    this.meta.soulGems=this.soulGems;
    this.saveMeta(0);
  }

  // ── Mode Selection ──────────────────────────────
  showModeSelect() {
    this.state='modeselect';
    document.getElementById('charselect-overlay').classList.remove('show');
    const overlay=document.getElementById('modeselect-overlay');
    this._rolledChallengeMods=this._rollChallengeMods();
    this.renderModeCards();
    overlay.classList.add('show');
  }

  hideModeSelect() {
    document.getElementById('modeselect-overlay').classList.remove('show');
    document.getElementById('charselect-overlay').classList.add('show');
    this.state='charselect';
  }

  renderModeCards() {
    const container=document.getElementById('mode-cards');
    if (!container) return;
    container.innerHTML='';

    for (const m of GAME_MODES) {
      const card=document.createElement('div');
      card.className='mode-card';
      card.innerHTML=`
        <div class="mode-icon">${m.icon}</div>
        <div class="mode-name">${m.name}</div>
        <div class="mode-desc">${m.desc}</div>
      `;

      card.addEventListener('click', ()=>{
        this.gameMode=m.id;
        if (m.id==='challenge') {
          // Show challenge modifiers detail
          this._rolledChallengeMods=this._rollChallengeMods();
          this.renderChallengeDetail();
        } else {
          document.getElementById('modeselect-overlay').classList.remove('show');
          this.selectedMode=m.id;
          this.showMapSelect();
        }
      });
      container.appendChild(card);
    }
  }

  renderChallengeDetail() {
    const detail=document.getElementById('challenge-detail');
    const modsList=document.getElementById('challenge-mods');
    const rerollBtn=document.getElementById('challenge-reroll');
    if (!detail||!modsList) return;
    detail.style.display='block';
    modsList.innerHTML='';

    const mods=this._rolledChallengeMods;
    let totalBonus=0;
    for (const mod of mods) {
      totalBonus+=mod.bonus;
      const el=document.createElement('div');
      el.className='challenge-mod';
      el.innerHTML=`${mod.name} <span class="mod-bonus">+${Math.round(mod.bonus*100)}%</span>`;
      modsList.appendChild(el);
    }

    // Show total bonus
    const bonusEl=document.createElement('div');
    bonusEl.className='challenge-mod';
    bonusEl.style.borderColor='rgba(255,200,0,0.5)';
    bonusEl.innerHTML=`Bonus-Multiplikator: <span class="mod-bonus">×${(1+totalBonus).toFixed(1)} Kristalle</span>`;
    modsList.appendChild(bonusEl);

    // Reroll button
    if (rerollBtn) {
      rerollBtn.onclick=()=>{
        this._rolledChallengeMods=this._rollChallengeMods();
        this.renderChallengeDetail();
      };
    }

    // Start button
    let startBtn=document.getElementById('challenge-start');
    if (!startBtn) {
      startBtn=document.createElement('button');
      startBtn.id='challenge-start';
      startBtn.textContent='⚔️ Start mit Modifikatoren';
      startBtn.style.cssText='background:linear-gradient(135deg,#993300,#cc4400);border:none;color:#fff;'
        +'font-size:15px;padding:8px 24px;border-radius:8px;cursor:pointer;margin-top:8px;letter-spacing:1px;transition:all 0.2s;';
      startBtn.onmouseenter=()=>{startBtn.style.transform='scale(1.05)';};
      startBtn.onmouseleave=()=>{startBtn.style.transform='scale(1.0)';};
      detail.appendChild(startBtn);
    }
    startBtn.onclick=()=>{
      this.challengeMods=this._rolledChallengeMods;
      this.bonusMultiplier=1+totalBonus;
      document.getElementById('modeselect-overlay').classList.remove('show');
      this.selectedMode='challenge';
      this.showMapSelect();
    };
  }

  // ── Map Selection ───────────────────────────────
  showMapSelect() {
    this.state='mapselect';
    const overlay=document.getElementById('mapselect-overlay');
    if (!overlay) { this.startGame(false); return; } // fallback
    this.renderMapCards();
    overlay.classList.add('show');
  }

  hideMapSelect() {
    document.getElementById('mapselect-overlay').classList.remove('show');
    document.getElementById('modeselect-overlay').classList.add('show');
    this.state='modeselect';
  }

  renderMapCards() {
    const container=document.getElementById('map-cards');
    if (!container) return;
    container.innerHTML='';

    for (const m of MAPS) {
      const card=document.createElement('div');
      card.className='mode-card';
      card.innerHTML=`
        <div class="mode-icon">${m.icon}</div>
        <div class="mode-name">${m.name}</div>
        <div class="mode-desc">${m.desc}</div>
      `;
      card.addEventListener('click', ()=>{
        this.selectedMap=m.id;
        document.getElementById('mapselect-overlay').classList.remove('show');
        this.startGame(false);
      });
      container.appendChild(card);
    }
  }

  _generateMap() {
    const cfg=MAPS.find(m=>m.id===this.selectedMap)||MAPS[0];
    this.treeStumps=[];
    this.mushrooms=[];

    if (cfg.stumps>0) {
      const margin=60;
      for (let i=0;i<cfg.stumps;i++) {
        let x,y,valid=false;
        let attempts=0;
        while (!valid && attempts<200) {
          x=rand(margin, WORLD-margin);
          y=rand(margin, WORLD-margin);
          // Min distance from player start (WORLD/2, WORLD/2)
          if (dist(x,y,WORLD/2,WORLD/2)<200) { attempts++; continue; }
          // Min distance from other stumps
          let tooClose=false;
          for (const s of this.treeStumps) {
            if (dist(x,y,s.x,s.y)<50) { tooClose=true; break; }
          }
          if (!tooClose) valid=true;
          attempts++;
        }
        if (valid) this.treeStumps.push(new TreeStump(x,y));
      }
    }

    if (cfg.mushrooms>0) {
      for (let i=0;i<cfg.mushrooms;i++) {
        let x,y,valid=false;
        let attempts=0;
        while (!valid && attempts<100) {
          x=rand(100, WORLD-100);
          y=rand(100, WORLD-100);
          if (dist(x,y,WORLD/2,WORLD/2)<180) { attempts++; continue; }
          // Check not inside a stump
          let blocked=false;
          for (const s of this.treeStumps) {
            if (dist(x,y,s.x,s.y)<s.r+20) { blocked=true; break; }
          }
          if (!blocked) valid=true;
          attempts++;
        }
        if (valid) this.mushrooms.push(new MushroomPickup(x,y));
      }
    }
  }

  _rollChallengeMods() {
    // Pick 1-3 random mods
    const count=1+Math.floor(Math.random()*3); // 1..3
    const pool=[...CHALLENGE_MODS];
    for (let i=pool.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [pool[i],pool[j]]=[pool[j],pool[i]];
    }
    // Ensure no conflicting mods (e.g. no_levelup + one_weapon is ok, but permadeath + no_levelup too harsh = ok)
    return pool.slice(0,Math.min(count, pool.length));
  }

  // ── Meta Upgrades Screen ────────────────────────
  showMetaTree() {
    this.state='metatree';
    this.loadMeta();
    document.getElementById('menu-screen').classList.add('hide');
    const overlay=document.getElementById('meta-overlay');
    document.getElementById('meta-souls').textContent=this.soulGems;
    this.renderMetaCards();
    overlay.classList.add('show');
  }

  hideMetaTree() {
    document.getElementById('meta-overlay').classList.remove('show');
    document.getElementById('menu-screen').classList.remove('hide');
    this.state='menu';
  }

  renderMetaCards() {
    const container=document.getElementById('meta-cards');
    if (!container) return;
    container.innerHTML='';
    const ml=this.meta.metaLevels||{};

    for (const s of META_SKILLS) {
      const lv=ml[s.id]||0;
      const isMaxed=lv>=s.max;
      const cost=s.baseCost+lv*s.costScale;
      const canAfford=this.soulGems>=cost;
      const isUnlock=s.id.startsWith('unlock_');
      const alreadyUnlocked=isUnlock&&this.meta.unlocked&&this.meta.unlocked.includes(s.id.replace('unlock_',''));

      const card=document.createElement('div');
      card.className='skill-card meta-card';
      if (isMaxed||alreadyUnlocked) card.classList.add('maxed');
      else if (!canAfford) card.classList.add('locked');

      const cardLabel=alreadyUnlocked?'BEREITS FREI':
        isMaxed?'MAX':
        `💎 ${cost}`;

      card.innerHTML=`
        <div class="skill-icon">${s.icon}</div>
        <div class="skill-name">${s.name}</div>
        <div class="skill-desc">${s.desc}</div>
        <div class="skill-level">Stufe: <span>${lv} / ${s.max}</span></div>
        <div class="skill-cost">${cardLabel}</div>
        ${isMaxed?'<div class="skill-maxed-badge">MAX</div>':''}
      `;

      if (!isMaxed&&!alreadyUnlocked&&canAfford) {
        card.addEventListener('click', ()=>{
          this.soulGems-=cost;
          this.meta.metaLevels[s.id]=lv+1;
          this.meta.soulGems=this.soulGems;
          if (isUnlock) {
            const charId=s.id.replace('unlock_','');
            if (!this.meta.unlocked.includes(charId)) this.meta.unlocked.push(charId);
          }
          this.saveMeta(0);
          this.renderMetaCards();
          document.getElementById('meta-souls').textContent=this.soulGems;
        });
      }
      container.appendChild(card);
    }
    // Make container scrollable if many cards
    container.style.overflowY='auto';
    container.style.maxHeight='60vh';
    container.style.flexWrap='wrap';
  }

  // ── Weapon Selection ───────────────────────────
  showWeaponSelect() {
    if (this.state!=='playing') return;
    this._preWeaponSelectState='playing';
    this.state='weaponselect';
    const overlay=document.getElementById('weaponselect-overlay');
    if (!overlay) return; // fallback if HTML missing
    this.renderWeaponCards();
    overlay.classList.add('show');
  }

  hideWeaponSelect() {
    document.getElementById('weaponselect-overlay').classList.remove('show');
    this.state=this._preWeaponSelectState||'playing';
    this._pendingLevelUps=(this._pendingLevelUps||0)-1;
    if (this._pendingLevelUps>0) {
      // More level-ups pending, show again shortly
      setTimeout(()=>this.showWeaponSelect(), 100);
    }
  }

  // Pick 3 random weapon offers for level-up
  _pickWeaponOffer() {
    const p=this.player;
    const pool=[];
    for (const w of WEAPONS) {
      const existing=p.activeWeapons.find(aw=>aw.id===w.id);
      if (existing && existing.level>=w.maxLevel) continue; // maxed
      const maxSlots=6+(this.meta&&this.meta.metaLevels?this.meta.metaLevels['meta_weapslot']||0:0);
      if (!existing && p.activeWeapons.length>=maxSlots) continue; // max slots, only upgrades
      pool.push(w);
    }
    // shuffle
    for (let i=pool.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [pool[i],pool[j]]=[pool[j],pool[i]];
    }
    const extraOffers=(this.meta&&this.meta.metaLevels?this.meta.metaLevels['meta_offers']||0:0);
    return pool.slice(0,3+extraOffers);
  }

  renderWeaponCards() {
    const container=document.getElementById('weapon-cards');
    if (!container) return;
    container.innerHTML='';
    const offer=this._pickWeaponOffer();
    const p=this.player;

    if (!offer.length) {
      container.innerHTML='<div style="color:#888;font-size:16px;padding:40px">Alle Waffen sind auf MAX!</div>';
      return;
    }

    for (const w of offer) {
      const existing=p.activeWeapons.find(aw=>aw.id===w.id);
      const lv=existing?existing.level:0;
      const nextLv=lv+1;
      const card=document.createElement('div');
      card.className='skill-card';
      if (existing) card.dataset.category='power'; // level-up color
      else card.dataset.category='attack'; // new weapon color

      const dmg=w.baseDmg+(w.scalingPerLv*(nextLv-1));
      card.innerHTML=`
        <div class="skill-icon">${w.icon}</div>
        <div class="skill-name">${w.name} ${existing?'⬆':'(NEU)'}</div>
        <div class="skill-desc">${w.desc}</div>
        <div class="skill-level">Level: <span>${lv} → ${nextLv}</span></div>
        <div class="skill-cost">Schaden: ${dmg}</div>
      `;
      card.addEventListener('click', ()=>{
        p._addWeapon(w.id);
        this.hideWeaponSelect();
        this.updateHUD();
      });
      container.appendChild(card);
    }
  }

  _findNearestEnemy(player) {
    let best=null,bd=Infinity;
    for (const e of this.enemies) {
      const d=dist(player.x,player.y,e.x,e.y);
      if (d<bd){bd=d;best=e;}
    }
    return best;
  }

  _spawnLightningEffect(target) {
    // Add particle effect
    for (let i=0;i<8;i++) {
      const a=rand(0,Math.PI*2);
      this.particles.push(new Particle(target.x,target.y,Math.cos(a)*120,Math.sin(a)*120,'#ffdd00',rand(2,4),rand(0.15,0.35)));
    }
    // Lightning bolt visual
    this._lightningStrikes=this._lightningStrikes||[];
    this._lightningStrikes.push({fx:this.player.x, fy:this.player.y, tx:target.x, ty:target.y, life:0.2});
  }

  // Pick 3 random non-maxed skills for the wave-end offer
  _pickSkillOffer() {
    // Determine available tiers based on current wave
    const maxTier=this.wave>=40?3:this.wave>=20?2:1;
    const pool=SKILLS.filter(s=>this.skills[s.id]<s.max && s.tier<=maxTier);
    // shuffle
    for (let i=pool.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [pool[i],pool[j]]=[pool[j],pool[i]];
    }
    const extraOffers=(this.meta&&this.meta.metaLevels?this.meta.metaLevels['meta_offers']||0:0);
    return pool.slice(0, 4+extraOffers);
  }

  renderSkillCards() {
    const container=document.getElementById('skill-cards');
    container.innerHTML='';
    const offer=this._pickSkillOffer();

    if (!offer.length) {
      container.innerHTML='<div style="color:#888;font-size:16px;padding:40px">Alle Fähigkeiten sind auf MAX!</div>';
      return;
    }

    for (const skill of offer) {
      const lv=this.skills[skill.id];
      const cost=skill.cost + lv*20;
      const canAfford=this.currency>=cost;
      const tierLabel=skill.tier===1?'⬟ Basis':skill.tier===2?'⬡ Mittel':'⬢ Power';
      const tierColor=skill.tier===1?'#88cc88':skill.tier===2?'#cccc44':'#cc88ff';
      const card=document.createElement('div');
      card.className='skill-card'+(!canAfford?' locked':'');
      card.style.borderTop=`3px solid ${tierColor}`;
      card.innerHTML=`
        <div class="skill-icon">${skill.icon}</div>
        <div class="skill-tier" style="font-size:10px;color:${tierColor};margin-bottom:4px;letter-spacing:1px">${tierLabel}</div>
        <div class="skill-name">${skill.name}</div>
        <div class="skill-desc">${skill.desc}</div>
        <div class="skill-level">Stufe: <span>${lv} / ${skill.max}</span></div>
        <div class="skill-cost">${cost}</div>
      `;
      if (canAfford) {
        card.addEventListener('click', ()=>{
          this.skills[skill.id]++;
          this.currency-=cost;
          this.applySkillsToPlayer();
          this.updateHUD();
          this.hideSkillTree();
        });
      }
      container.appendChild(card);
    }
    // Show unlocked tiers
    document.getElementById('skilltree-subtitle').textContent=
      this.wave>=40?'Tiers: ⬟ Basis · ⬡ Mittel · ⬢ Power  (+4-6 Karten)':
      this.wave>=20?'Tiers: ⬟ Basis · ⬡ Mittel  (Tier 3 ab Welle 40)':
      'Tier: ⬟ Basis  (Tier 2 ab Welle 20)';
  }

  applySkillsToPlayer() {
    if (!this.player) return;
    const p=this.player;
    const lv=id=>this.skills[id]||0;

    // Get character base stats
    const cfg=CHARACTERS.find(c=>c.id===p.charId)||CHARACTERS[0];

    // Reset to base (character-specific)
    p.baseSpeed = cfg.speed * (1 + lv('speed')*0.25);
    p.dmg       = cfg.dmg  * (1 + lv('dmg')*0.30);
    p.fireRate  = 1.5 * (1 + lv('firerate')*0.25);
    p.maxHp     = cfg.hp + lv('maxhp')*40;
    p.hp        = Math.min(p.hp, p.maxHp);
    p.regen     = (cfg.id==='nature'?2:0) + lv('regen')*1.5;
    p.lifesteal = lv('lifesteal')*0.08;
    p.extraProj = lv('extraproj'); // additional projectiles
    p.piercing  = lv('piercing')>0;
    p.dmgReduction = lv('armor')*0.12; // armor: 12% per level
    // Warrior passive stacks
    if (cfg.id==='warrior') p.dmgReduction+=0.20;
    p.magnetRadius = 40 + lv('magnet')*50;
    p.superpowerMaxCd = cfg.spCd * (1 - lv('nova_cd')*0.20);
  }

  applyMetaToPlayer() {
    if (!this.player||!this.meta||!this.meta.metaLevels) return;
    const p=this.player;
    const ml=id=>this.meta.metaLevels[id]||0;
    p.maxHp+=ml('meta_hp')*15;
    p.hp=p.maxHp; // full heal on new game
    p.baseSpeed*=(1+ml('meta_speed')*0.08);
    p.dmg*=(1+ml('meta_dmg')*0.10);
    p.regen+=ml('meta_regen')*0.5;
    p.magnetRadius*=(1+ml('meta_magnet')*0.25);
    this.currency+=ml('meta_startgem')*15;

    // Apply challenge modifiers
    if (this.gameMode==='challenge') {
      for (const mod of this.challengeMods) {
        switch (mod.id) {
          case 'no_regen':
            p.regen=0; p.lifesteal=0; break;
          case 'half_hp':
            p.maxHp=Math.floor(p.maxHp*0.5); p.hp=p.maxHp; p.dmg=Math.floor(p.dmg*1.5); break;
          case 'no_levelup':
            this._challengeNoLevelup=true; break;
          case 'one_weapon':
            // Keep only magic_shot
            p.activeWeapons=[{id:'magic_shot',level:1,cdTimer:0}]; break;
          case 'fast_enemies':
            this._challengeFastEnemies=true; break;
          case 'double_enemies':
            this._challengeDoubleEnemies=true; break;
          case 'permadeath':
            this._challengePermadeath=true; break;
          case 'wave_timer':
            this._challengeWaveTimer=90; break;
        }
      }
    }
  }

  // ── Superpower ────────────────────────────────
  activateSuperpower() {
    if (this.state!=='playing') return;
    if (!this.player) return;
    if (this.player.superpowerCd>0) return;

    const p=this.player;
    const lv=id=>this.skills[id]||0;

    switch (p.charId) {
      case 'aether': this._spArcaneNova(lv); break;
      case 'shadow': this._spShadowClones(); break;
      case 'warrior': this._spErderschuetterung(); break;
      case 'nature': this._spNaturgewalt(); break;
    }
  }

  _spArcaneNova(lv) {
    const p=this.player;
    p.superpowerCd=p.superpowerMaxCd;
    const radius=300*(1+lv('nova_size')*0.4);
    const dmg=300*(1+lv('nova_dmg')*0.5);

    this.effects.push(new NovaEffect(p.x, p.y, radius));

    let killed=0;
    // Tree stump collision for enemies
    for (const stump of this.treeStumps) {
      for (const e of this.enemies) {
        if (stump.blocksPoint(e.x, e.y, e.r)) {
          const [nx,ny]=norm(e.x-stump.x, e.y-stump.y);
          e.x=stump.x+nx*(stump.r+e.r+0.5);
          e.y=stump.y+ny*(stump.r+e.r+0.5);
          e.x=clamp(e.x, 0, WORLD); e.y=clamp(e.y, 0, WORLD);
          // Push enemy away from stump
          e.pushX=e.pushX||0; e.pushY=e.pushY||0;
          e.x+=nx*40*0.016; e.y+=ny*40*0.016;
        }
      }
    }

    for (let i=this.enemies.length-1;i>=0;i--) {
      const e=this.enemies[i];
      if (dist(p.x,p.y,e.x,e.y)<radius) {
        spawnBlood(this.particles,e.x,e.y,16,e.bloodColor||'#cc2200');
        e.hp-=dmg;
        if (e.dead()) {
          this.onEnemyKilled(e);
          this.enemies.splice(i,1);
          killed++;
        }
      }
    }
    if (killed>0) this.showFloatText(p.x, p.y-40, `✨ NOVA ×${killed}`, '#cc88ff');
  }

  _spShadowClones() {
    const p=this.player;
    p.superpowerCd=p.superpowerMaxCd;
    this._shadowClones=[];
    // Create 3 clones that orbit player for 5 seconds
    for (let i=0;i<3;i++) {
      this._shadowClones.push({
        angle:(Math.PI*2/3)*i,
        x:p.x+Math.cos((Math.PI*2/3)*i)*40,
        y:p.y+Math.sin((Math.PI*2/3)*i)*40,
      });
    }
    this._shadowCloneTimer=5;
    this.showFloatText(p.x, p.y-40, '🌑 SCHATTENKLONE!', '#cc66ff');
  }

  _spErderschuetterung() {
    const p=this.player;
    p.superpowerCd=p.superpowerMaxCd;
    // Stun all enemies on screen for 2 seconds
    const screenRadius=Math.max(this.canvas.width,this.canvas.height)/1.5;
    let stunned=0;
    for (const e of this.enemies) {
      if (dist(p.x,p.y,e.x,e.y)<screenRadius) {
        e.stunned=2;
        e.stunnedTimer=2;
        stunned++;
      }
    }
    // Also stun tentacles
    for (const t of this.tentacles) {
      if (dist(p.x,p.y,t.x,t.y)<screenRadius) {
        t.stunned=2;
      }
    }
    if (stunned>0) this.showFloatText(p.x, p.y-40, `🛡️ ERDERSCHÜTTERUNG ×${stunned}`, '#ffcc00');
  }

  _spNaturgewalt() {
    const p=this.player;
    p.superpowerCd=p.superpowerMaxCd;
    // 8 rotating vines around player for 6 seconds
    this._natureVines=[];
    for (let i=0;i<8;i++) {
      this._natureVines.push({
        angle:(Math.PI*2/8)*i,
        radius:80+40*i, // varying distances
      });
    }
    this._natureVineTimer=6;
    this.showFloatText(p.x, p.y-40, '🌿 NATURGEWALT!', '#44ff44');
  }

  // ── Save / Load ───────────────────────────────
  _getSlotKey(slot) { return `aethermancer_save_${slot}`; }

  save(slot=0) {
    if (!this.player) return;
    if (this._challengePermadeath) return; // Permadeath modifier
    const p=this.player;
    const data={
      v:5,
      wave:this.wave,
      currency:this.currency,
      kills:this.totalKills,
      hp:Math.ceil(p.hp),
      skills:{...this.skills},
      charId:p.charId,
      level:p.level,
      exp:p.exp,
      weapons:p.activeWeapons.map(w=>({id:w.id,level:w.level})),
      selectedMap:this.selectedMap,
      gameMode:this.gameMode,
      timeAttackTimer:this.timeAttackTimer,
      challengeMods:this.challengeMods.map(m=>m.id),
      bonusMultiplier:this.bonusMultiplier,
      endlessWave:this.endlessWave,
      playTime:this.playTime,
      ts:Date.now(),
    };
    try {
      localStorage.setItem(this._getSlotKey(slot), JSON.stringify(data));
      this._showSaveIndicator('💾 Gespeichert!');
    } catch(e) { this._showSaveIndicator('⚠ Speichern fehlgeschlagen'); }
  }

  saveMeta(earnedGems=0) {
    const key='aethermancer_meta';
    let data=this._loadMetaRaw();
    // Sync in-memory meta state to disk
    if (this.meta) {
      data.metaLevels={...this.meta.metaLevels};
      data.unlocked=[...(this.meta.unlocked||['aether'])];
      this.meta.soulGems=(this.meta.soulGems||0)+earnedGems;
      data.soulGems=this.meta.soulGems;
    } else {
      data.soulGems=(this.soulGems||0)+earnedGems;
    }
    if (!data.metaLevels||Object.keys(data.metaLevels).length===0) {
      data.metaLevels={}; META_SKILLS.forEach(s=>{ data.metaLevels[s.id]=0; });
    }
    if (!data.unlocked||data.unlocked.length===0) data.unlocked=['aether'];
    data.lastWave=this.wave;
    data.lastKills=this.totalKills;
    data.lastPlayTime=this.playTime;
    data.v=1;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch(e) {}
  }

  _loadMetaRaw() {
    const key='aethermancer_meta';
    try {
      const raw=localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return {soulGems:0, unlocked:['aether'], metaLevels:{}};
  }

  loadMeta() {
    const data=this._loadMetaRaw();
    if (!data.metaLevels) { data.metaLevels={}; META_SKILLS.forEach(s=>{ data.metaLevels[s.id]=0; }); }
    if (!data.unlocked) data.unlocked=['aether'];
    this.meta=data;
    this.soulGems=data.soulGems||0;
  }

  _saveEndlessHighscore() {
    try {
      const prev=parseInt(localStorage.getItem('aethermancer_endless_highscore')||'0');
      if (this.wave>prev) {
        localStorage.setItem('aethermancer_endless_highscore', String(this.wave));
      }
    } catch(e) {}
  }

  _loadEndlessHighscore() {
    try { return parseInt(localStorage.getItem('aethermancer_endless_highscore')||'0'); }
    catch(e) { return 0; }
  }

  // ── Save Manager ───────────────────────────────
  showSaveManager() {
    this.state='savemanager';
    this.renderSaveSlots();
    document.getElementById('savemanager-overlay').classList.add('show');
  }

  hideSaveManager() {
    document.getElementById('savemanager-overlay').classList.remove('show');
    this.state='menu';
  }

  renderSaveSlots() {
    const container=document.getElementById('save-slots');
    container.innerHTML='';
    for (let slot=0; slot<3; slot++) {
      const info=this._getSlotInfo(slot);
      const div=document.createElement('div');
      div.className='save-slot';
      const hasData=!!info;
      div.innerHTML=`
        <div class="slot-num">SLOT ${slot+1}</div>
        <div class="slot-info">
          ${hasData ? `
            <strong>${info.charName}</strong><br>
            <span class="slot-wave">Welle ${info.wave} · Runde ${Math.floor((info.wave-1)/10)+1}</span><br>
            <span class="slot-time">${info.playTimeStr} Spielzeit</span><br>
            <span style="font-size:10px;color:#555">${info.dateStr}</span>
          ` : '<span class="slot-empty">— Leer —</span>'}
        </div>
        <div class="slot-btns">
          ${this.player ? `<button class="save-btn" data-slot="${slot}">💾 Speichern</button>` : ''}
          ${hasData ? `
            <button class="load-btn" data-slot="${slot}">📂 Laden</button>
            <button class="export-btn" data-slot="${slot}">📤 Export</button>
            <button class="delete-btn" data-slot="${slot}">🗑 Löschen</button>
          ` : ''}
        </div>
      `;
      container.appendChild(div);
    }

    // Wire up buttons
    document.querySelectorAll('.save-slot .save-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const slot=parseInt(btn.dataset.slot);
        this.save(slot);
        this.renderSaveSlots();
      });
    });
    document.querySelectorAll('.save-slot .load-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const slot=parseInt(btn.dataset.slot);
        document.getElementById('savemanager-overlay').classList.remove('show');
        this.state='menu';
        if (this.load(slot)) {
          this._loadingFromSave=true;
          this.showCharSelect();
        }
      });
    });
    document.querySelectorAll('.save-slot .export-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        this.exportSave(parseInt(btn.dataset.slot));
      });
    });
    document.querySelectorAll('.save-slot .delete-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const slot=parseInt(btn.dataset.slot);
        localStorage.removeItem(this._getSlotKey(slot));
        this.renderSaveSlots();
      });
    });
  }

  _getSlotInfo(slot) {
    try {
      const raw=localStorage.getItem(this._getSlotKey(slot));
      if (!raw) return null;
      const d=JSON.parse(raw);
      const charCfg=CHARACTERS.find(c=>c.id===d.charId);
      const totalSec=Math.floor(d.playTime||0);
      const pm=Math.floor(totalSec/60);
      const ps=totalSec%60;
      const dateStr=new Date(d.ts).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
      return {
        charId:d.charId,
        charName:charCfg?charCfg.name:'Unbekannt',
        wave:d.wave||0,
        playTime:d.playTime||0,
        playTimeStr:`${pm}:${String(ps).padStart(2,'0')}`,
        dateStr,
        ts:d.ts||0,
        version:d.v,
      };
    } catch(e) { return null; }
  }

  exportSave(slot) {
    try {
      const raw=localStorage.getItem(this._getSlotKey(slot));
      if (!raw) { this._showImportStatus('Kein Spielstand in diesem Slot.', 'err'); return; }
      const info=this._getSlotInfo(slot);
      const blob=new Blob([raw],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=`aethermancer_save_slot${slot+1}_${info.charName.replace(/[^a-z0-9]/gi,'_')}_welle${info.wave}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) { this._showImportStatus('Export fehlgeschlagen.', 'err'); }
  }

  _handleImportFile(file) {
    const reader=new FileReader();
    reader.onload=()=>{
      try {
        const data=JSON.parse(reader.result);
        // Validate
        if (!data.v||data.v<1||data.v>5) { this._showImportStatus('Ungültige Save-Version. Nur v1–v5 werden unterstützt.', 'err'); return; }
        if (!data.charId||!data.wave) { this._showImportStatus('Beschädigte Datei — Pflichtfelder fehlen.', 'err'); return; }
        // Find empty slot or use slot 2
        let targetSlot=2;
        for (let i=0;i<3;i++) {
          if (!localStorage.getItem(this._getSlotKey(i))) { targetSlot=i; break; }
        }
        localStorage.setItem(this._getSlotKey(targetSlot), JSON.stringify(data));
        const charCfg=CHARACTERS.find(c=>c.id===data.charId);
        const charName=charCfg?charCfg.name:'Unbekannt';
        this._showImportStatus(`✅ Importiert in Slot ${targetSlot+1}: ${charName}, Welle ${data.wave}`, 'ok');
        this.renderSaveSlots();
      } catch(e) { this._showImportStatus('Kein gültiges JSON.', 'err'); }
    };
    reader.readAsText(file);
  }

  _showImportStatus(msg, cls) {
    const el=document.getElementById('import-status');
    el.textContent=msg;
    el.className=cls;
    clearTimeout(this._importStatusTimer);
    this._importStatusTimer=setTimeout(()=>{ el.textContent=''; el.className=''; }, 5000);
  }

  autoSave() {
    if (this.player) this.save();
  }

  hasSave(slot=0) {
    return !!localStorage.getItem(this._getSlotKey(slot));
  }

  load(slot=0) {
    const raw=localStorage.getItem(this._getSlotKey(slot));
    if (!raw) return false;
    try {
      const data=JSON.parse(raw);
      // Accept v:1 through v:5 saves
      if (data.v<1||data.v>5) return false;
      this.wave=data.wave||0;
      this.currency=data.currency||0;
      this.totalKills=data.kills||0;
      this._savedHp=data.hp||150;
      this.skills={...data.skills};
      this.selectedChar=data.charId||'aether';
      this._savedLevel=data.level||1;
      this._savedExp=data.exp||0;
      this._savedWeapons=data.weapons||null;
      this._savedMode=data.gameMode||'standard';
      this._savedMap=data.selectedMap||'arena';
      this._savedTimeAttack=data.timeAttackTimer||900;
      this._savedChallengeMods=data.challengeMods||[];
      this._savedBonusMul=data.bonusMultiplier||1.0;
      this.endlessWave=data.endlessWave||0;
      this.playTime=data.playTime||0;
      // fill in any missing skills added after save
      SKILLS.forEach(s=>{ if (this.skills[s.id]==null) this.skills[s.id]=0; });
      return true;
    } catch(e) { return false; }
  }

  _showSaveIndicator(msg) {
    const el=document.getElementById('save-indicator');
    el.textContent=msg;
    el.classList.add('show');
    clearTimeout(this._saveIndTimer);
    this._saveIndTimer=setTimeout(()=>el.classList.remove('show'), 2200);
  }

  // ── Main Loop ─────────────────────────────────
  loop(ts) {
    const dt=Math.min((ts-this.lastTime)/1000, 0.08);
    this.lastTime=ts;

    if (this.state==='playing') this.update(dt);
    this.render();
    this.updateBossHPBar();
    requestAnimationFrame(t=>this.loop(t));
  }

  update(dt) {
    const p=this.player;
    this.playTime+=dt;

    p.update(dt, this.keys, this.enemies);

    // Tree stump collision (player)
    for (const stump of this.treeStumps) {
      if (stump.blocksPoint(p.x, p.y, p.r)) {
        const [nx,ny]=norm(p.x-stump.x, p.y-stump.y);
        p.x=stump.x+nx*(stump.r+p.r+0.5);
        p.y=stump.y+ny*(stump.r+p.r+0.5);
        p.x=clamp(p.x, p.r, WORLD-p.r);
        p.y=clamp(p.y, p.r, WORLD-p.r);
      }
    }

    // Time Attack: countdown timer
    if (this.gameMode==='timeattack') {
      this.timeAttackTimer-=dt;
      if (this.timeAttackTimer<=0) {
        this.timeAttackTimer=0;
        // Victory! Survived 15 minutes
        this._timeAttackVictory();
        return;
      }
      // Continuous spawn
      this._processTimeAttack(dt);
    }

    // Camera follows player
    this.camera.x=p.x - this.canvas.width/2;
    this.camera.y=p.y - this.canvas.height/2;

    // Auto-shoot
    if (this.enemies.length) {
      const shots=p.tryShoot(this.enemies);
      if (shots) this.projectiles.push(...shots);
    }

    // Update enemies
    // Tree stump collision for enemies
    for (const stump of this.treeStumps) {
      for (const e of this.enemies) {
        if (stump.blocksPoint(e.x, e.y, e.r)) {
          const [nx,ny]=norm(e.x-stump.x, e.y-stump.y);
          e.x=stump.x+nx*(stump.r+e.r+0.5);
          e.y=stump.y+ny*(stump.r+e.r+0.5);
          e.x=clamp(e.x, 0, WORLD); e.y=clamp(e.y, 0, WORLD);
          // Push enemy away from stump
          e.pushX=e.pushX||0; e.pushY=e.pushY||0;
          e.x+=nx*40*0.016; e.y+=ny*40*0.016;
        }
      }
    }

    for (let i=this.enemies.length-1;i>=0;i--) {
      const e=this.enemies[i];
      e.update(dt, p);
      // Handle enemy projectiles from SkeletonMage
      if (e instanceof SkeletonMageEnemy && e.pendingShot) {
        const shot=e.pendingShot;
        this.enemyProjectiles.push(new EnemyProjectile(shot.x, shot.y, shot.dx, shot.dy, 25, 320));
        e.pendingShot=null;
      }
      if (e.collidesWithPlayer(p)) {
        p.takeDamage(e.dmg*dt);
        if (p.dead()) { this.gameOver(); return; }
      }
    }

    // Update projectiles
    for (let i=this.projectiles.length-1;i>=0;i--) {
      const proj=this.projectiles[i];
      proj.update(dt);
      if (proj.dead()) { this.projectiles.splice(i,1); continue; }
      for (let j=this.enemies.length-1;j>=0;j--) {
        const e=this.enemies[j];
        if (proj.hits(e) && e.canBeHit()) {
          proj.onHit(e);
          const actualDmg=proj.dmg;
          e.takeDamage(actualDmg, this.particles);
          // Lifesteal
          if (p.lifesteal>0) p.heal(actualDmg*p.lifesteal);
          if (e.dead()) {
            this.onEnemyKilled(e);
            this.enemies.splice(j,1);
          }
          if (proj.dead()) { this.projectiles.splice(i,1); break; }
        }
      }
    }

    // Update enemy projectiles
    for (let i=this.enemyProjectiles.length-1;i>=0;i--) {
      const proj=this.enemyProjectiles[i];
      proj.update(dt);
      if (proj.dead()) { this.enemyProjectiles.splice(i,1); continue; }
      // Tree stump collision
      let blocked=false;
      for (const stump of this.treeStumps) {
        if (stump.blocksPoint(proj.x, proj.y, 3)) { blocked=true; break; }
      }
      if (blocked) { this.enemyProjectiles.splice(i,1); continue; }
      if (proj.hitsPlayer(p)) {
        p.takeDamage(proj.dmg);
        if (p.dead()) { this.gameOver(); return; }
        this.enemyProjectiles.splice(i,1);
        continue;
      }
      // Check collision with enemies (enemy projectiles don't hurt enemies)
    }

    // Effects
    for (let i=this.effects.length-1;i>=0;i--) {
      this.effects[i].update(dt);
      if (this.effects[i].dead()) this.effects.splice(i,1);
    }

    // Particles
    for (let i=this.particles.length-1;i>=0;i--) {
      this.particles[i].update(dt);
      if (this.particles[i].dead()) this.particles.splice(i,1);
    }

    // Pickups
    for (let i=this.pickups.length-1;i>=0;i--) {
      const pk=this.pickups[i];
      pk.update(dt);
      if (pk.collectedBy(p)) {
        this.currency+=pk.val;
        this.pickups.splice(i,1);
        this.updateHUD();
      }
    }

    // Process active weapons
    for (const w of p.activeWeapons) {
      const cfg=p._getWeaponCfg(w.id);
      if (!cfg) continue;
      const lv=w.level;
      // Tick cooldown
      const cd=cfg.baseCd + cfg.cdPerLv*(lv-1);
      w.cdTimer-=dt;

      if (cfg.cat==='orbital') {
        // Orbit orbs — processed below (rendered each frame, damage via contact)
        continue;
      }

      if (w.cdTimer<=0) {
        w.cdTimer=Math.max(0.1, cd);

        switch (cfg.id) {
          case 'magic_shot': break; // handled by tryShoot
          case 'frost_arrow': {
            if (!this.enemies.length) break;
            const best=this._findNearestEnemy(p);
            if (best) {
              const [dx,dy]=norm(best.x-p.x,best.y-p.y);
              this.projectiles.push(new FrostProjectile(p.x,p.y,dx,dy,
                cfg.baseDmg+cfg.scalingPerLv*(lv-1), cfg.baseSpeed, cfg.slow, cfg.slowDuration));
            }
            break;
          }
          case 'soul_shard': {
            if (!this.enemies.length) break;
            const best=this._findNearestEnemy(p);
            if (best) {
              const [dx,dy]=norm(best.x-p.x,best.y-p.y);
              const bounces=cfg.bounces;
              this.projectiles.push(new SoulProjectile(p.x,p.y,dx,dy,
                cfg.baseDmg+cfg.scalingPerLv*(lv-1), cfg.baseSpeed, bounces));
            }
            break;
          }
          case 'lightning': {
            const inRange=this.enemies.filter(e=>dist(p.x,p.y,e.x,e.y)<cfg.range);
            if (!inRange.length) break;
            const target=inRange[Math.floor(Math.random()*inRange.length)];
            this._spawnLightningEffect(target);
            target.takeDamage(cfg.baseDmg+cfg.scalingPerLv*(lv-1), this.particles);
            if (target.dead()) {
              this.onEnemyKilled(target);
              const idx=this.enemies.indexOf(target);
              if (idx>=0) this.enemies.splice(idx,1);
            }
            break;
          }
          case 'poison_gas': {
            const gasX=p.x+rand(-40,40);
            const gasY=p.y+rand(-40,40);
            this._poisonClouds=this._poisonClouds||[];
            this._poisonClouds.push({
              x:gasX, y:gasY,
              life:cfg.cloudDuration, maxLife:cfg.cloudDuration,
              radius:cfg.cloudRadius,
              dmg:cfg.baseDmg+cfg.scalingPerLv*(lv-1),
            });
            break;
          }
        }
      }
    }

    // Process poison clouds (continuous damage)
    if (this._poisonClouds) {
      for (let i=this._poisonClouds.length-1;i>=0;i--) {
        const cloud=this._poisonClouds[i];
        cloud.life-=dt;
        if (cloud.life<=0) { this._poisonClouds.splice(i,1); continue; }
        for (let j=this.enemies.length-1;j>=0;j--) {
          const e=this.enemies[j];
          if (dist(cloud.x,cloud.y,e.x,e.y)<cloud.radius+e.r) {
            e.takeDamage(cloud.dmg*dt, this.particles);
            if (e.dead()) {
              this.onEnemyKilled(e);
              this.enemies.splice(j,1);
            }
          }
        }
      }
    }

    // Process orbit orbs (contact damage)
    for (const w of p.activeWeapons) {
      const cfg=p._getWeaponCfg(w.id);
      if (!cfg||cfg.cat!=='orbital') continue;
      const lv=w.level;
      const orbs=cfg.orbs + cfg.scalingPerLv*(lv-1);
      const radius=cfg.orbRadius;
      const speed=cfg.orbSpeed;
      const baseAngle=Date.now()/1000*speed;
      for (let i=0;i<orbs;i++) {
        const angle=baseAngle+(Math.PI*2/orbs)*i;
        const ox=p.x+Math.cos(angle)*radius;
        const oy=p.y+Math.sin(angle)*radius;
        for (let j=this.enemies.length-1;j>=0;j--) {
          const e=this.enemies[j];
          if (dist(ox,oy,e.x,e.y)<e.r+7) {
            e.takeDamage((cfg.baseDmg+cfg.scalingPerLv*(lv-1))*dt*0.5, this.particles);
            if (e.dead()) {
              this.onEnemyKilled(e);
              this.enemies.splice(j,1);
            }
          }
        }
      }
    }

    // Update Tentacles
    for (let i=this.tentacles.length-1;i>=0;i--) {
      const t=this.tentacles[i];
      t.update(dt, p);
      if (t.stunned<=0 && t.collidesWithPlayer(p)) {
        p.takeDamage(25*dt);
        if (p.dead()) { this.gameOver(); return; }
      }
      if (t.dead()) { this.tentacles.splice(i,1); continue; }
      // Tentacles can also be hit by projectiles
      for (let j=this.projectiles.length-1;j>=0;j--) {
        const proj=this.projectiles[j];
        if (proj.hits(t)) {
          proj.onHit(t);
          t.life-=0.5;
          if (proj.dead()) { this.projectiles.splice(j,1); }
        }
      }
    }

    // Update Shadow Clones (Schattenläuferin)
    if (this._shadowClones && this._shadowCloneTimer>0) {
      this._shadowCloneTimer-=dt;
      for (const clone of this._shadowClones) {
        clone.angle+=dt*3;
        clone.x=p.x+Math.cos(clone.angle)*60;
        clone.y=p.y+Math.sin(clone.angle)*60;
        // Clones shoot at nearest enemies
        const enemies=this.enemies;
        if (enemies.length) {
          let best=null,bd=Infinity;
          for (const e of enemies) {
            const d=dist(clone.x,clone.y,e.x,e.y);
            if (d<bd){bd=d;best=e;}
          }
          if (best&&bd<600) {
            // Clone shoots 1.5 shots/sec
            clone.shotTimer=(clone.shotTimer||0)-dt;
            if (clone.shotTimer<=0) {
              clone.shotTimer=0.67;
              const [dx,dy]=norm(best.x-clone.x,best.y-clone.y);
              this.projectiles.push(new Projectile(clone.x,clone.y,dx,dy,p.dmg*0.5,p.projSpeed*0.7,false,'#cc66ff'));
            }
          }
        }
      }
      if (this._shadowCloneTimer<=0) this._shadowClones=null;
    }

    // Update Nature Vines (Naturwächter)
    if (this._natureVines && this._natureVineTimer>0) {
      this._natureVineTimer-=dt;
      for (const vine of this._natureVines) {
        vine.angle+=dt*2.5;
        vine.x=p.x+Math.cos(vine.angle)*vine.radius;
        vine.y=p.y+Math.sin(vine.angle)*vine.radius;
        // Check collision with enemies
        for (let j=this.enemies.length-1;j>=0;j--) {
          const e=this.enemies[j];
          if (dist(vine.x,vine.y,e.x,e.y)<e.r+8) {
            e.takeDamage(p.dmg*0.3*dt,this.particles);
            if (e.dead()) {
              this.onEnemyKilled(e);
              this.enemies.splice(j,1);
            }
          }
        }
        // Check collision with tentacles
        for (let k=this.tentacles.length-1;k>=0;k--) {
          const t=this.tentacles[k];
          if (dist(vine.x,vine.y,t.x,t.y)<t.r+8) {
            t.life-=dt*2;
            if (t.dead()) this.tentacles.splice(k,1);
          }
        }
      }
      if (this._natureVineTimer<=0) this._natureVines=null;
    }

    // Wave
    // Challenge wave timer
    if (this._challengeWaveTimer>0) {
      this._challengeWaveTimer-=dt;
      if (this._challengeWaveTimer<=0) {
        this.player.hp=0; // kill player on timeout
      }
    }

    if (this.waveActive) this.waveUpdate(dt);

    // Announce timer
    if (this.announceTimer>0) {
      this.announceTimer-=dt;
      if (this.announceTimer<=0) this.hideAnnouncement();
    }

    // HUD superpower bar
    const pct=(1-this.player.superpowerCd/this.player.superpowerMaxCd)*100;
    document.getElementById('super-bar').style.width=clamp(pct,0,100)+'%';
    const spLabel=document.getElementById('super-label');
    const cfg=CHARACTERS.find(c=>c.id===this.player.charId)||CHARACTERS[0];
    spLabel.textContent=cfg.spName.toUpperCase();
    const sk=document.getElementById('super-key');
    if (this.player.superpowerCd<=0) { sk.textContent='LEERTASTE — BEREIT!'; sk.classList.add('ready'); }
    else { sk.textContent=`Leertaste (${this.player.superpowerCd.toFixed(1)}s)`; sk.classList.remove('ready'); }

    this.updateHUD();
  }

  // ── Render ────────────────────────────────────
  render() {
    const ctx=this.ctx;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    if (this.state==='menu') return;

    this.drawBackground(ctx);

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    // Pickups
    for (const pk of this.pickups) pk.draw(ctx);
    // Enemies
    for (const e of this.enemies) e.draw(ctx);
    // Player
    if (this.player) this.player.draw(ctx);
    // Projectiles
    for (const pr of this.projectiles) pr.draw(ctx);
    // Enemy projectiles
    for (const ep of this.enemyProjectiles) ep.draw(ctx);
    // Tentacles
    for (const t of this.tentacles) t.draw(ctx);
    // Shadow Clones
    if (this._shadowClones) {
      for (const clone of this._shadowClones) {
        ctx.globalAlpha=0.5;
        ctx.fillStyle='#cc66ff';
        ctx.beginPath(); ctx.arc(clone.x,clone.y,12,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#ff88ff';
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.globalAlpha=1;
      }
    }
    // Tree stumps
    for (const stump of this.treeStumps) stump.draw(ctx);
    // Mushrooms
    for (const mushroom of this.mushrooms) mushroom.draw(ctx);
    // Nature Vines
    if (this._natureVines) {
      for (const vine of this._natureVines) {
        ctx.strokeStyle='#44ff44';
        ctx.lineWidth=3;
        ctx.globalAlpha=0.6;
        ctx.beginPath();
        ctx.moveTo(this.player.x,this.player.y);
        ctx.lineTo(vine.x,vine.y);
        ctx.stroke();
        ctx.fillStyle='#88ff88';
        ctx.beginPath(); ctx.arc(vine.x,vine.y,6,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=1;
      }
    }
    // Poison clouds
    if (this._poisonClouds) {
      for (const cloud of this._poisonClouds) {
        const alpha=cloud.life/cloud.maxLife;
        ctx.globalAlpha=alpha*0.45;
        ctx.fillStyle='#55ff22';
        ctx.beginPath(); ctx.arc(cloud.x,cloud.y,cloud.radius,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=alpha*0.7;
        ctx.strokeStyle='#88ff44';
        ctx.lineWidth=1.5;
        ctx.stroke();
        ctx.globalAlpha=1;
      }
    }
    // Orbit orbs
    if (this.player) {
      for (const w of this.player.activeWeapons) {
      const cfg=this.player._getWeaponCfg(w.id);
      if (!cfg||cfg.cat!=='orbital') continue;
      const lv=w.level;
      const orbCount=cfg.orbs+cfg.scalingPerLv*(lv-1);
      const radius=cfg.orbRadius;
      const speed=cfg.orbSpeed;
      const baseAngle=Date.now()/1000*speed;
      for (let i=0;i<orbCount;i++) {
        const angle=baseAngle+(Math.PI*2/orbCount)*i;
        const ox=this.player.x+Math.cos(angle)*radius;
        const oy=this.player.y+Math.sin(angle)*radius;
        ctx.fillStyle='#cc44ff';
        ctx.globalAlpha=0.8;
        ctx.beginPath(); ctx.arc(ox,oy,7,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#ff88ff';
        ctx.lineWidth=1.5;
        ctx.stroke();
        ctx.globalAlpha=0.25;
        ctx.fillStyle='#cc44ff';
        ctx.beginPath(); ctx.arc(ox,oy,12,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=1;
      }
    }
    }
    // Lightning visuals
    if (this._lightningStrikes) {
      for (let i=this._lightningStrikes.length-1;i>=0;i--) {
        const ls=this._lightningStrikes[i];
        ls.life-=0.016;
        if (ls.life<=0) { this._lightningStrikes.splice(i,1); continue; }
        ctx.strokeStyle='#ffdd00';
        ctx.lineWidth=2.5;
        ctx.globalAlpha=ls.life;
        ctx.beginPath();
        ctx.moveTo(ls.fx,ls.fy);
        const segs=6;
        for (let s=1;s<=segs;s++) {
          const t=s/segs;
          const mx=lerp(ls.fx,ls.tx,t)+rand(-20,20);
          const my=lerp(ls.fy,ls.ty,t)+rand(-20,20);
          ctx.lineTo(mx,my);
        }
        ctx.lineTo(ls.tx,ls.ty);
        ctx.stroke();
        ctx.globalAlpha=1;
      }
    }
    // Effects
    for (const ef of this.effects) ef.draw(ctx);
    // Particles
    for (const pa of this.particles) pa.draw(ctx);

    ctx.restore();

    // Fog vignette for forest map
    if (this.selectedMap==='forest' && this.state!=='menu') {
      this.drawFogVignette(ctx);
    }

    if (this.state==='paused') this.drawPause(ctx);
  }

  drawFogVignette(ctx) {
    const w=this.canvas.width, h=this.canvas.height;
    const grd=ctx.createRadialGradient(w/2, h/2, w*0.35, w/2, h/2, w*0.7);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.5, 'rgba(0,8,0,0.15)');
    grd.addColorStop(1, 'rgba(0,15,0,0.55)');
    ctx.fillStyle=grd;
    ctx.fillRect(0, 0, w, h);
  }

  drawBackground(ctx) {
    if (!this.bgTile) return;
    const pat=ctx.createPattern(this.bgTile,'repeat');
    ctx.fillStyle=pat;
    // Offset by camera
    ctx.save();
    ctx.translate((-this.camera.x % TILE + TILE) % TILE - TILE,
                  (-this.camera.y % TILE + TILE) % TILE - TILE);
    ctx.fillRect(-TILE, -TILE, this.canvas.width+TILE*2, this.canvas.height+TILE*2);
    ctx.restore();
  }

  drawPause(ctx) {
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    ctx.fillStyle='white';
    ctx.font='bold 48px Arial';
    ctx.textAlign='center';
    ctx.fillText('PAUSE', this.canvas.width/2, this.canvas.height/2);
    ctx.font='20px Arial';
    ctx.fillStyle='#aaa';
    ctx.fillText('ESC zum Fortfahren', this.canvas.width/2, this.canvas.height/2+48);
    ctx.textAlign='left';
  }

  // ── UI helpers ────────────────────────────────
  updateHUD() {
    if (this.gameMode==='timeattack') {
      const remaining=Math.max(0,this.timeAttackTimer);
      const m=Math.floor(remaining/60);
      const s=Math.floor(remaining%60);
      document.getElementById('wave-number').textContent=`${m}:${String(s).padStart(2,'0')}`;
      document.getElementById('wave-sub').textContent='Zeitangriff — Überlebe!';
    } else if (this.gameMode==='endless') {
      document.getElementById('wave-number').textContent=`Welle ${this.wave||1}`;
      document.getElementById('wave-sub').textContent='Endlosmodus';
    } else {
      document.getElementById('wave-number').textContent=`Runde ${this.round||1} · Welle ${this.waveInRound||this.wave}`;
      document.getElementById('wave-sub').textContent='Töte alle Feinde!';
    }
    document.getElementById('currency-value').textContent=this.currency;
    document.getElementById('souls-value').textContent=this.soulGems||0;
    this.updateHPBar();
    this.updateExpBar();
    this.updateWeaponSlots();
  }

  updateExpBar() {
    if (!this.player) return;
    const el=document.getElementById('exp-level');
    if (el) el.textContent=this.player.level;
    const bar=document.getElementById('exp-bar');
    if (!bar) return;
    const needed=this.player._expToNext();
    const pct=clamp(this.player.exp/needed*100,0,100);
    bar.style.width=pct+'%';
  }

  updateWeaponSlots() {
    const container=document.getElementById('weapon-slots');
    if (!container||!this.player) return;
    container.innerHTML='';
    for (const w of this.player.activeWeapons) {
      const cfg=this.player._getWeaponCfg(w.id);
      if (!cfg) continue;
      const slot=document.createElement('div');
      slot.className='weapon-slot';
      slot.innerHTML=`${cfg.icon}<span class="wslv">${w.level}</span>`;
      container.appendChild(slot);
    }
  }

  updateBossHPBar() {
    if (this.state==='menu'||this.state==='gameover') return;
    const panel=document.getElementById('boss-hp-panel');
    if (!panel) return;
    // Find active boss (BossEnemy, LichkoningEnemy, KrakenEnemy)
    let boss=null;
    for (const e of this.enemies) {
      if (e.isBoss||e instanceof LichkoningEnemy||e instanceof KrakenEnemy) {
        boss=e; break;
      }
    }
    if (!boss||boss.dead()) {
      panel.classList.remove('show');
      return;
    }
    panel.classList.add('show');
    // Boss name
    const nameEl=document.getElementById('boss-name');
    if (boss instanceof LichkoningEnemy) nameEl.textContent='LICHKÖNIG';
    else if (boss instanceof KrakenEnemy) nameEl.textContent='CHAOSKRAKEN';
    else nameEl.textContent='SCHATTENBOSS';
    // HP bar
    const hpPct=clamp(boss.hp/boss.maxHp*100,0,100);
    document.getElementById('boss-hp-bar').style.width=hpPct+'%';
    // Shield bar (Lichkönig)
    const shieldBar=document.getElementById('boss-shield-bar');
    if (boss.shieldMax!==undefined && boss.shield>0) {
      const shieldPct=clamp(boss.shield/boss.shieldMax*100,0,100);
      shieldBar.style.width=shieldPct+'%';
      shieldBar.style.display='';
    } else {
      shieldBar.style.display='none';
    }
    // Text
    const textEl=document.getElementById('boss-hp-text');
    let txt=`${Math.ceil(boss.hp)} / ${boss.maxHp}`;
    if (boss.shieldMax!==undefined && boss.shield>0) {
      txt+=`  |  Schild: ${Math.ceil(boss.shield)}`;
    }
    if (boss.phase) txt+=`  |  Phase ${boss.phase}`;
    textEl.textContent=txt;
  }

  updateHPBar() {
    if (!this.player) return;
    const pct=clamp(this.player.hp/this.player.maxHp*100,0,100);
    document.getElementById('hp-bar').style.width=pct+'%';
    document.getElementById('hp-text').textContent=
      `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;
  }

  showAnnouncement(title, sub='') {
    const el=document.getElementById('wave-announce');
    el.querySelector('h1').textContent=title;
    el.querySelector('p').textContent=sub;
    el.classList.add('show');
    this.announceTimer=2.5;
  }
  hideAnnouncement() {
    document.getElementById('wave-announce').classList.remove('show');
  }

  showFloatText(worldX, worldY, text, color) {
    const sx=worldX-this.camera.x;
    const sy=worldY-this.camera.y;
    const el=document.createElement('div');
    el.className='float-text';
    el.style.cssText=`left:${sx}px;top:${sy}px;color:${color}`;
    el.textContent=text;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1200);
  }
}

// ── Boot ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', ()=>{ window.game=new Game(); });
