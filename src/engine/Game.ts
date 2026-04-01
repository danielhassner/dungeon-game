// --- CLASSES & UTILITIES ---

export class Camera {
    x: number = 0; y: number = 0; width: number; height: number;
    constructor(width: number, height: number) { this.width = width; this.height = height; }
    follow(targetX: number, targetY: number) {
        this.x = targetX - this.width / 2;
        this.y = targetY - this.height / 2;
    }
}

interface Item {
    id: string; name: string; type: 'weapon' | 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'potion' | 'spellbook' | 'key';
    value: number; price: number; icon: string; image: string; desc: string; rarity: 'iron' | 'steel' | 'mithril' | 'dragon';
}

interface Spell {
    id: string; name: string; icon: string; image: string; desc: string; type: 'projectile' | 'aoe' | 'buff' | 'utility';
    cooldown: number; damage: number; color: string; projectileShape?: 'circle' | 'star' | 'bolt' | 'wave' | 'pulse' | 'boulder' | 'dart' | 'beam' | 'orb';
    aoeType?: 'circle' | 'cloud' | 'cone' | 'line' | 'rain'; effect?: 'slow' | 'burn' | 'lifesteal' | 'chain' | 'fear' | 'weaken' | 'regen' | 'haste' | 'shield' | 'root' | 'poison' | 'blind' | 'shatter' | 'knockback' | 'curse' | 'purify' | 'enchant' | 'petrify'; mana?: number;
}

// --- DATABASES ---

const ITEM_POOL: Record<string, Item> = {};
const SPELL_DB: Record<string, Spell> = {
    // --- PROJECTILE SPELLS (each has distinct shape + effect) ---
    'magic_missile': { id: 'magic_missile', name: 'Magic Missile', icon: '✨', image: '', desc: 'Fires a seeking bolt of arcane energy.', type: 'projectile', cooldown: 0.5, damage: 20, color: '#4fc3f7', projectileShape: 'orb' },
    'fireball': { id: 'fireball', name: 'Fireball', icon: '🔥', image: '', desc: 'Launches a massive ball of fire that creates a burning explosion.', type: 'projectile', effect: 'burn', cooldown: 3, damage: 80, color: '#e67e22', projectileShape: 'circle' },
    'thunder_bolt': { id: 'thunder_bolt', name: 'Thunder Bolt', icon: '⚡', image: '', desc: 'Strikes a single target with heavy lightning, rooting it in place.', type: 'projectile', effect: 'root', cooldown: 4, damage: 120, color: '#f1c40f', projectileShape: 'bolt' },
    'arcane_bolt': { id: 'arcane_bolt', name: 'Arcane Bolt', icon: '💠', image: '', desc: 'Fires a rapid stream of arcane pulses.', type: 'projectile', cooldown: 0.2, damage: 12, color: '#8e44ad', projectileShape: 'pulse' },
    'chain_lightning': { id: 'chain_lightning', name: 'Chain Lightning', icon: '🌩️', image: '', desc: 'A lightning strike that arcs between multiple targets.', type: 'projectile', effect: 'chain', cooldown: 4, damage: 60, color: '#f1c40f', projectileShape: 'bolt' },
    'ice_spike': { id: 'ice_spike', name: 'Ice Spike', icon: '🧊', image: '', desc: 'Launches a sharp ice dart that slows the target on impact.', type: 'projectile', effect: 'slow', cooldown: 3, damage: 110, color: '#54a0ff', projectileShape: 'dart' },
    'vampiric_touch': { id: 'vampiric_touch', name: 'Vampiric Touch', icon: '🧛', image: '', desc: 'Drains health from enemies and restores it to the caster.', type: 'projectile', effect: 'lifesteal', cooldown: 5, damage: 35, color: '#c0392b', projectileShape: 'pulse' },
    'shadow_bolt': { id: 'shadow_bolt', name: 'Shadow Bolt', icon: '🖤', image: '', desc: 'Launches a bolt of shadow that strikes fear into enemies.', type: 'projectile', effect: 'fear', cooldown: 1.5, damage: 70, color: '#30336b', projectileShape: 'orb' },
    'soul_tear': { id: 'soul_tear', name: 'Soul Tear', icon: '👻', image: '', desc: 'Tears at the enemy soul, making them take 50% more damage.', type: 'projectile', effect: 'curse', cooldown: 8, damage: 120, color: '#95afc0', projectileShape: 'wave' },
    'radiant_beam': { id: 'radiant_beam', name: 'Radiant Beam', icon: '🔆', image: '', desc: 'Fires a holy beam that purifies enemies, removing frenzy and dealing bonus to undead.', type: 'projectile', effect: 'purify', cooldown: 1, damage: 55, color: '#fff', projectileShape: 'beam' },
    'venom_dart': { id: 'venom_dart', name: 'Venom Dart', icon: '🏹', image: '', desc: 'Fires a toxic dart that applies stacking poison.', type: 'projectile', effect: 'poison', cooldown: 1, damage: 8, color: '#badc58', projectileShape: 'dart' },
    'astral_blast': { id: 'astral_blast', name: 'Astral Blast', icon: '🌟', image: '', desc: 'Cold starlight that blinds enemies, making them wander aimlessly.', type: 'projectile', effect: 'blind', cooldown: 1, damage: 45, color: '#f5f6fa', projectileShape: 'star' },
    'storm_strike': { id: 'storm_strike', name: 'Storm Strike', icon: '⛈️', image: '', desc: 'Calls down a lightning strike that arcs to adjacent enemies.', type: 'projectile', effect: 'chain', cooldown: 2.5, damage: 130, color: '#00a8ff', projectileShape: 'bolt' },
    'celestial_beam': { id: 'celestial_beam', name: 'Celestial Beam', icon: '🔦', image: '', desc: 'A focused beam of celestial fire that burns enemies.', type: 'projectile', effect: 'burn', cooldown: 7, damage: 180, color: '#f9ca24', projectileShape: 'beam' },
    'frost_lance': { id: 'frost_lance', name: 'Frost Lance', icon: '🔱', image: '', desc: 'A spear of ice that shatters slowed/rooted enemies for 2x damage.', type: 'projectile', effect: 'shatter', cooldown: 3, damage: 120, color: '#70a1ff', projectileShape: 'bolt' },
    'sun_fire': { id: 'sun_fire', name: 'Sun Fire', icon: '☀️', image: '', desc: 'Launches a miniature sun that blinds enemies on impact.', type: 'projectile', effect: 'blind', cooldown: 6, damage: 95, color: '#f0932b', projectileShape: 'circle' },
    'mind_blast': { id: 'mind_blast', name: 'Mind Blast', icon: '🧠', image: '', desc: 'A psychic shock that roots the target in place.', type: 'projectile', effect: 'root', cooldown: 6, damage: 105, color: '#a55eea', projectileShape: 'wave' },
    'life_drain': { id: 'life_drain', name: 'Life Drain', icon: '🧪', image: '', desc: 'Drains the life force of a target to heal yourself.', type: 'projectile', effect: 'lifesteal', cooldown: 9, damage: 60, color: '#20bf6b', projectileShape: 'orb' },
    'chaos_bolt': { id: 'chaos_bolt', name: 'Chaos Bolt', icon: '🎲', image: '', desc: 'Fires a chaotic projectile that weakens the enemy.', type: 'projectile', effect: 'weaken', cooldown: 0.8, damage: 55, color: '#be2edd', projectileShape: 'star' },
    'soul_reap': { id: 'soul_reap', name: 'Soul Reap', icon: '🪦', image: '', desc: 'Reaps the vitality of a target, stealing health.', type: 'projectile', effect: 'lifesteal', cooldown: 6, damage: 95, color: '#4a4a4a', projectileShape: 'wave' },
    'blood_boil': { id: 'blood_boil', name: 'Blood Boil', icon: '🩸', image: '', desc: 'Boils an enemy blood, chaining burn to nearby foes.', type: 'projectile', effect: 'burn', cooldown: 4, damage: 65, color: '#c0392b', projectileShape: 'pulse' },
    'prismatic_ray': { id: 'prismatic_ray', name: 'Prismatic Ray', icon: '🌈', image: '', desc: 'Fires a piercing beam that applies a random effect.', type: 'projectile', cooldown: 6, damage: 90, color: '#fff', projectileShape: 'beam' },
    'living_bomb': { id: 'living_bomb', name: 'Living Bomb', icon: '💣', image: '', desc: 'Attaches a volatile charge that explodes after a delay.', type: 'projectile', effect: 'burn', cooldown: 10, damage: 150, color: '#e67e22', projectileShape: 'circle' },
    'petrify': { id: 'petrify', name: 'Petrify', icon: '🗿', image: '', desc: 'Turns an enemy to stone for 5 seconds. They cannot move or act.', type: 'projectile', effect: 'petrify', cooldown: 12, damage: 40, color: '#7f8c8d', projectileShape: 'boulder' },
    'midas_touch': { id: 'midas_touch', name: 'Midas Touch', icon: '🪙', image: '', desc: 'Marks an enemy; if killed, they drop 4x more gold.', type: 'projectile', effect: 'weaken', cooldown: 20, damage: 10, color: '#f1c40f', projectileShape: 'orb' },

    // --- AOE SPELLS (only 2 circles, rest are cloud/cone/line/rain) ---
    'frost_nova': { id: 'frost_nova', name: 'Frost Nova', icon: '❄️', image: '', desc: 'Emits a freezing pulse that slows all nearby enemies.', type: 'aoe', aoeType: 'circle', effect: 'slow', cooldown: 5, damage: 40, color: '#a29bfe' },
    'meteor_fall': { id: 'meteor_fall', name: 'Meteor Fall', icon: '☄️', image: '', desc: 'Calls down a meteor to strike a targeted area.', type: 'aoe', aoeType: 'circle', effect: 'burn', cooldown: 12, damage: 250, color: '#d35400' },
    'toxic_mist': { id: 'toxic_mist', name: 'Toxic Mist', icon: '🤢', image: '', desc: 'Creates a lingering cloud of toxic acid.', type: 'aoe', aoeType: 'cloud', effect: 'burn', cooldown: 7, damage: 15, color: '#27ae60' },
    'dragon_breath': { id: 'dragon_breath', name: 'Dragon Breath', icon: '🐲', image: '', desc: 'Breathes fire in a cone in front of the caster.', type: 'aoe', aoeType: 'cone', effect: 'burn', cooldown: 6, damage: 90, color: '#eb4d4b' },
    'curse': { id: 'curse', name: 'Dark Curse', icon: '💀', image: '', desc: 'Creates a dark fog that weakens enemies who enter it.', type: 'aoe', aoeType: 'cloud', effect: 'weaken', cooldown: 15, damage: 0, color: '#2d3436' },
    'void_nova': { id: 'void_nova', name: 'Void Nova', icon: '🌑', image: '', desc: 'A forward blast of void energy causing fear.', type: 'aoe', aoeType: 'cone', effect: 'fear', cooldown: 8, damage: 110, color: '#2c3e50' },
    'earthquake': { id: 'earthquake', name: 'Earthquake', icon: '🌍', image: '', desc: 'Opens a ground fissure toward the cursor, rooting and damaging.', type: 'aoe', aoeType: 'line', effect: 'root', cooldown: 10, damage: 150, color: '#7f8c8d' },
    'wind_burst': { id: 'wind_burst', name: 'Wind Burst', icon: '🌪️', image: '', desc: 'A blast of wind that knocks enemies back and away.', type: 'aoe', aoeType: 'cone', effect: 'knockback', cooldown: 4, damage: 65, color: '#dcdde1' },
    'inferno': { id: 'inferno', name: 'Inferno', icon: '🌋', image: '', desc: 'Ignites a large area, causing continuous fire damage.', type: 'aoe', aoeType: 'cloud', effect: 'burn', cooldown: 15, damage: 200, color: '#e84118' },
    'star_fall': { id: 'star_fall', name: 'Star Fall', icon: '🌠', image: '', desc: 'Calls down falling stars that rain in a targeted area.', type: 'aoe', aoeType: 'rain', effect: 'burn', cooldown: 18, damage: 250, color: '#45aaf2' },
    'spectral_wall': { id: 'spectral_wall', name: 'Spectral Wall', icon: '🧱', image: '', desc: 'Creates a line of spectral energy that knocks enemies back.', type: 'aoe', aoeType: 'line', effect: 'knockback', cooldown: 12, damage: 120, color: '#d1d8e0' },
    'emerald_spores': { id: 'emerald_spores', name: 'Emerald Spores', icon: '🍄', image: '', desc: 'Releases a cloud of spores that poisons enemies over time.', type: 'aoe', aoeType: 'cloud', effect: 'poison', cooldown: 14, damage: 30, color: '#2ecc71' },
    'thunder_clap': { id: 'thunder_clap', name: 'Thunder Clap', icon: '👏', image: '', desc: 'A frontal thunder clap that roots all enemies hit.', type: 'aoe', aoeType: 'cone', effect: 'root', cooldown: 8, damage: 75, color: '#fed330' },
    'burning_vines': { id: 'burning_vines', name: 'Burning Vines', icon: '🎋', image: '', desc: 'Roots enemies in burning vines, causing continuous damage.', type: 'aoe', aoeType: 'cloud', effect: 'root', cooldown: 12, damage: 100, color: '#ff4d4d' },
    'gravity_well': { id: 'gravity_well', name: 'Gravity Well', icon: '🕳️', image: '', desc: 'Creates a void that slows and damages enemies within its reach.', type: 'aoe', aoeType: 'cloud', effect: 'slow', cooldown: 14, damage: 160, color: '#130f40' },
    'arcane_storm': { id: 'arcane_storm', name: 'Arcane Storm', icon: '🔮', image: '', desc: 'Summons a rain of arcane bolts over an area.', type: 'aoe', aoeType: 'rain', cooldown: 20, damage: 300, color: '#a29bfe' },
    'venom_wave': { id: 'venom_wave', name: 'Venom Wave', icon: '🌊', image: '', desc: 'A wave of toxic spit that poisons enemies in a cone.', type: 'aoe', aoeType: 'cone', effect: 'poison', cooldown: 9, damage: 30, color: '#badc58' },

    // --- BUFF SPELLS ---
    'heal': { id: 'heal', name: 'Holy Heal', icon: '💖', image: '', desc: 'Restores a significant amount of health to the caster.', type: 'buff', effect: 'regen', cooldown: 10, damage: 50, color: '#2ecc71' },
    'wind_walk': { id: 'wind_walk', name: 'Wind Walk', icon: '🌬️', image: '', desc: 'Increases movement speed significantly for a short duration.', type: 'buff', effect: 'haste', cooldown: 20, damage: 2, color: '#81ecec' },
    'nova_blast': { id: 'nova_blast', name: 'Nova Blast', icon: '💥', image: '', desc: 'Releases a sudden shockwave ring pushing enemies outward.', type: 'buff', effect: 'shield', cooldown: 2, damage: 45, color: '#fdcb6e' },
    'bless': { id: 'bless', name: 'Blessing', icon: '🕯️', image: '', desc: 'Grants a continuous health regeneration effect.', type: 'buff', effect: 'regen', cooldown: 25, damage: 8, color: '#fab1a0' },
    'nature_touch': { id: 'nature_touch', name: 'Nature Touch', icon: '🌿', image: '', desc: 'Calls upon nature to rapidly regenerate your health.', type: 'buff', effect: 'regen', cooldown: 12, damage: 70, color: '#4cd137' },
    'iron_skin': { id: 'iron_skin', name: 'Iron Skin', icon: '🔩', image: '', desc: 'Hardens your skin, granting a temporary protective shield.', type: 'buff', effect: 'shield', cooldown: 25, damage: 20, color: '#95afc0' },
    'ethereal_form': { id: 'ethereal_form', name: 'Ethereal Form', icon: '🌫️', image: '', desc: 'Become ethereal, increasing your movement speed significantly.', type: 'buff', effect: 'haste', cooldown: 30, damage: 50, color: '#d1d8e0' },
    'arcane_shield': { id: 'arcane_shield', name: 'Mana Shield', icon: '🛡️', image: '', desc: 'Resets all spell cooldowns for 10 seconds.', type: 'buff', effect: 'shield', cooldown: 15, damage: 12, color: '#3498db' },
    'electric_shield': { id: 'electric_shield', name: 'Electric Shield', icon: '⛓️', image: '', desc: 'Surrounds you with chains of lightning that damage nearby attackers.', type: 'buff', effect: 'shield', cooldown: 30, damage: 40, color: '#f1c40f' },
    'soul_harvest': { id: 'soul_harvest', name: 'Soul Harvest', icon: '🏺', image: '', desc: 'Aura drains life from all nearby enemies to heal you.', type: 'buff', effect: 'lifesteal', cooldown: 25, damage: 60, color: '#c0392b' },

    // --- UTILITY SPELLS ---
    'blink': { id: 'blink', name: 'Ether Blink', icon: '🌀', image: '', desc: 'Instantly teleports the caster to a target location.', type: 'utility', cooldown: 4, damage: 350, color: '#9b59b6' },
    'shadow_step': { id: 'shadow_step', name: 'Shadow Step', icon: '👣', image: '', desc: 'Creates two linked portals for rapid movement.', type: 'utility', cooldown: 12, damage: 0, color: '#2f3640' },
    'mirror_image': { id: 'mirror_image', name: 'Mirror Image', icon: '🪞', image: '', desc: 'Summons a mirror clone that distracts and fights enemies.', type: 'utility', cooldown: 40, damage: 0, color: '#a29bfe' },
    'holy_wrath': { id: 'holy_wrath', name: 'Holy Wrath', icon: '⚔️', image: '', desc: 'Crucifies enemies in a golden cross, rooting them with continuous damage.', type: 'utility', cooldown: 12, damage: 140, color: '#ffec8b' },
    'abyssal_pull': { id: 'abyssal_pull', name: 'Abyssal Pull', icon: '🧲', image: '', desc: 'Creates a magnetic rift that pulls all nearby enemies to its center.', type: 'utility', cooldown: 15, damage: 80, color: '#130f40' },
    'chrono_warp': { id: 'chrono_warp', name: 'Chronos Warp', icon: '⏳', image: '', desc: 'Accelerates your time, granting haste and resetting cooldowns.', type: 'buff', effect: 'haste', cooldown: 45, damage: 0, color: '#3498db' },
    'chaos_nova': { id: 'chaos_nova', name: 'Chaos Nova', icon: '🎰', image: '', desc: 'Releases a swirling vortex of chaotic energy with random effects.', type: 'aoe', aoeType: 'cloud', cooldown: 8, damage: 100, color: '#be2edd' },
    'enchant': { id: 'enchant', name: 'Enchant', icon: '🫅', image: '', desc: 'Converts an enemy to fight for you. Recasting kills current minion.', type: 'projectile', effect: 'enchant', cooldown: 20, damage: 0, color: '#e056fd', projectileShape: 'orb' },
    // Skill Tree Specific Spells
    'ignite': { id: 'ignite', name: 'Ignite', icon: '🔥', image: '', desc: 'A quick burst of fire that causes targets to burn.', type: 'projectile', effect: 'burn', cooldown: 1, damage: 30, color: '#ff4d4d', projectileShape: 'circle' },
    'frostbolt': { id: 'frostbolt', name: 'Frostbolt', icon: '❄️', image: '', desc: 'A freezing bolt that slows enemies on impact.', type: 'projectile', effect: 'slow', cooldown: 1.5, damage: 45, color: '#70a1ff', projectileShape: 'bolt' },
    'arcane_missiles': { id: 'arcane_missiles', name: 'Arcane Missiles', icon: '✨', image: '', desc: 'Rapid seeking bolts of arcane energy.', type: 'projectile', cooldown: 0.3, damage: 15, color: '#a29bfe', projectileShape: 'orb' },
    'arcane_power': { id: 'arcane_power', name: 'Arcane Power', icon: '🔮', image: '', desc: 'Briefly empowers the caster, doubling spell damage.', type: 'buff', effect: 'haste', cooldown: 20, damage: 2.0, color: '#6c5ce7' },
    'death_coil': { id: 'death_coil', name: 'Death Coil', icon: '💀', image: '', desc: 'A dark projectile that executes low-health enemies.', type: 'projectile', effect: 'curse', cooldown: 6, damage: 100, color: '#2d3436', projectileShape: 'wave' },
    'ice_nova': { id: 'ice_nova', name: 'Ice Nova', icon: '🧊', image: '', desc: 'A freezing pulse that slows all nearby enemies.', type: 'aoe', aoeType: 'circle', effect: 'slow', cooldown: 5, damage: 40, color: '#a29bfe' }
};

interface MeleeAbility {
    id: string; name: string; icon: string; desc: string;
    cooldown: number; damage: number; color: string; range: number;
    effect?: string;
}

const MELEE_ABILITY_DB: Record<string, MeleeAbility> = {
    'basic_attack': { id: 'basic_attack', name: 'Basic Training', icon: '⚔️', desc: 'Core combat conditioning.', cooldown: 0.1, damage: 0, color: '#fff', range: 0 },
    'quick_strike': { id: 'quick_strike', name: 'Quick Strike', icon: '⚡', desc: 'A rapid flurry of light blows.', cooldown: 3, damage: 35, color: '#f5f6fa', range: 130 },
    'rend': { id: 'rend', name: 'Rend', icon: '🩸', desc: 'A cruel slash that causes persistent bleeding.', cooldown: 6, damage: 40, color: '#c0392b', range: 120 },
    'bloodbath': { id: 'bloodbath', name: 'Bloodbath', icon: '🍷', desc: 'Heal from the blood of your enemies.', cooldown: 15, damage: 0, color: '#c0392b', range: 200 },
    'heavy_slam': { id: 'heavy_slam', name: 'Heavy Slam', icon: '🔨', desc: 'Smash the ground with incredible force.', cooldown: 8, damage: 90, color: '#8d6e63', range: 150 },
    'earthshaker': { id: 'earthshaker', name: 'Earthshaker', icon: '🌋', desc: 'Stun all nearby enemies with a massive stomp.', cooldown: 12, damage: 60, color: '#7f8c8d', range: 250 },
    'shockwave': { id: 'shockwave', name: 'Shockwave', icon: '🌊', desc: 'Release a powerful ring of force pushing foes back.', cooldown: 18, damage: 45, color: '#dcdde1', range: 350 },
    'sweep': { id: 'sweep', name: 'Sweeping Strike', icon: '🧹', desc: 'A wide arc that hits all foes in front of you.', cooldown: 4, damage: 50, color: '#d1d8e0', range: 180 },
    'whirlwind': { id: 'whirlwind', name: 'Whirlwind', icon: '🌪️', desc: 'Spin in a deadly circle, damaging all adjacent enemies.', cooldown: 7, damage: 60, color: '#f5f6fa', range: 160 },
    'bladestorm': { id: 'bladestorm', name: 'Bladestorm', icon: '🌀', desc: 'An unstoppable torrent of steel.', cooldown: 25, damage: 120, color: '#fff', range: 200 },
    'shield_bash': { id: 'shield_bash', name: 'Shield Bash', icon: '🛡️', desc: 'Daze and knock back enemies with your shield.', cooldown: 5, damage: 30, color: '#95afc0', range: 120 },
    'parry': { id: 'parry', name: 'Parry', icon: '🤺', desc: 'Adopt a defensive stance to counter upcoming attacks.', cooldown: 10, damage: 0, color: '#f1c40f', range: 100 },
    'fortress': { id: 'fortress', name: 'Fortress', icon: '🏰', desc: 'Become an immovable object, immune to damage.', cooldown: 40, damage: 0, color: '#95afc0', range: 0 },
    // Legacy support
    'dash_strike': { id: 'dash_strike', name: 'Dash Strike', icon: '💨', desc: 'Dash forward, damaging enemies in your path.', cooldown: 4, damage: 45, color: '#f5f6fa', range: 300 },
    'ground_stomp': { id: 'ground_stomp', name: 'Ground Stomp', icon: '🦶', desc: 'Stomp the ground, stunning nearby enemies.', cooldown: 6, damage: 30, color: '#8d6e63', range: 200, effect: 'petrify' },
    'bleed_slash': { id: 'bleed_slash', name: 'Bleed Slash', icon: '🩸', desc: 'A heavy strike that causes enemies to bleed.', cooldown: 5, damage: 60, color: '#c0392b', range: 120, effect: 'poison' },
    'leap_strike': { id: 'leap_strike', name: 'Leaping Strike', icon: '🦘', desc: 'Jump to a location and deal AOE damage on landing.', cooldown: 10, damage: 70, color: '#f39c12', range: 400 },
    'execute': { id: 'execute', name: 'Execute', icon: '❌', desc: 'Deal massive damage to enemies below 30% health.', cooldown: 12, damage: 150, color: '#e84118', range: 120 },
    'war_cry': { id: 'war_cry', name: 'War Cry', icon: '🗣️', desc: 'Buff yourself with +50% damage and fear nearby enemies.', cooldown: 15, damage: 0, color: '#e67e22', range: 250, effect: 'fear' },
    'hamstring': { id: 'hamstring', name: 'Hamstring', icon: '⛓️', desc: 'Slash their legs, slowing them by 60%.', cooldown: 5, damage: 40, color: '#2f3640', range: 120, effect: 'slow' },
    'cleave': { id: 'cleave', name: 'Cleave', icon: '🪓', desc: 'A wide frontal arc that hits multiple enemies.', cooldown: 4, damage: 45, color: '#d1d8e0', range: 160 }
};

interface SkillNode {
    id: string; name: string; desc: string; icon: string;
    type: 'melee' | 'spell'; cost: number; requires: string[];
    gridPos: { x: number, y: number };
}

interface Quest {
    id: string; name: string; desc: string; type: 'kill' | 'depth' | 'gold' | 'loot' | 'spell' | 'melee';
    target: number; progress: number; reward: number; // skill points
    targetId?: string; // e.g., 'skeleton' or 'fireball'
    completed: boolean;
}

const QUEST_POOL: Omit<Quest, 'progress' | 'completed'>[] = [
    { id: 'slay_skeletons', name: 'Bones to Dust', desc: 'Slay # skeletons in the dark.', type: 'kill', target: 5, targetId: 'skeleton', reward: 1 },
    { id: 'slay_ogres', name: 'Ogre Hunter', desc: 'Slay # ogres to thin the herd.', type: 'kill', target: 3, targetId: 'ogre', reward: 2 },
    { id: 'slay_slimes', name: 'Slime Control', desc: 'Slay # slimes oozing in the halls.', type: 'kill', target: 8, targetId: 'slime', reward: 1 },
    { id: 'slay_lich', name: 'Bane of the Undead', desc: 'Defeat a powerful Lich.', type: 'kill', target: 1, targetId: 'lich', reward: 3 },
    { id: 'reach_depth', name: 'Deep Diver', desc: 'Reach depth # of the dungeon.', type: 'depth', target: 5, reward: 2 },
    { id: 'amass_gold', name: 'Greed is Good', desc: 'Collect # gold coins.', type: 'gold', target: 500, reward: 1 },
    { id: 'loot_chests', name: 'Treasure Hunter', desc: 'Open # dungeon caches.', type: 'loot', target: 3, reward: 1 },
    { id: 'cast_spells', name: 'Arcane Mastery', desc: 'Cast spells # times.', type: 'spell', target: 20, reward: 1 },
    { id: 'melee_kills', name: 'Warrior Path', desc: 'Defeat # foes with melee only.', type: 'melee', target: 5, reward: 2 }
];

const MELEE_SKILL_TREE: Record<string, SkillNode> = {
    'basic_attack': { id: 'basic_attack', name: 'Basic Attack', desc: 'Core combat training. Center root.', icon: '⚔️', type: 'melee', cost: 0, requires: [], gridPos: { x: 3, y: 1 } },
    
    // Speed/Bleed Path
    'quick_strike': { id: 'quick_strike', name: 'Quick Strike', desc: 'Faster attack speed.', icon: '⚡', type: 'melee', cost: 1, requires: ['basic_attack'], gridPos: { x: 1, y: 2 } },
    'rend': { id: 'rend', name: 'Rend', desc: 'Apply bleed on hit.', icon: '🩸', type: 'melee', cost: 2, requires: ['quick_strike'], gridPos: { x: 1, y: 4 } },
    'bloodbath': { id: 'bloodbath', name: 'Bloodbath', desc: 'Bleeds heal you.', icon: '🍷', type: 'melee', cost: 3, requires: ['rend'], gridPos: { x: 1, y: 6 } },
    
    // Slam/AoE Path
    'heavy_slam': { id: 'heavy_slam', name: 'Heavy Slam', desc: 'High damage smash.', icon: '🔨', type: 'melee', cost: 1, requires: ['basic_attack'], gridPos: { x: 2, y: 2 } },
    'earthshaker': { id: 'earthshaker', name: 'Earthshaker', desc: 'Stun enemies.', icon: '🌋', type: 'melee', cost: 2, requires: ['heavy_slam'], gridPos: { x: 2, y: 4 } },
    'shockwave': { id: 'shockwave', name: 'Shockwave', desc: 'Full screen knockback.', icon: '🌊', type: 'melee', cost: 3, requires: ['earthshaker'], gridPos: { x: 2, y: 6 } },
    
    // Spin/Cleave Path
    'sweep': { id: 'sweep', name: 'Sweeping Strike', desc: 'Hit multiple foes.', icon: '🧹', type: 'melee', cost: 1, requires: ['basic_attack'], gridPos: { x: 5, y: 2 } },
    'whirlwind': { id: 'whirlwind', name: 'Whirlwind', desc: 'Spinning attack.', icon: '🌪️', type: 'melee', cost: 2, requires: ['sweep'], gridPos: { x: 5, y: 4 } },
    'bladestorm': { id: 'bladestorm', name: 'Bladestorm', desc: 'Continuous spin.', icon: '🌀', type: 'melee', cost: 3, requires: ['whirlwind'], gridPos: { x: 5, y: 6 } },
    
    // Shield/Counter Path
    'shield_bash': { id: 'shield_bash', name: 'Shield Bash', desc: 'Defensive smash.', icon: '🛡️', type: 'melee', cost: 1, requires: ['basic_attack'], gridPos: { x: 6, y: 2 } },
    'parry': { id: 'parry', name: 'Parry', desc: 'Counter-attack.', icon: '🤺', type: 'melee', cost: 2, requires: ['shield_bash'], gridPos: { x: 6, y: 4 } },
    'fortress': { id: 'fortress', name: 'Fortress', desc: 'Immune to damage briefly.', icon: '🏰', type: 'melee', cost: 3, requires: ['parry'], gridPos: { x: 6, y: 6 } }
};

const SPELL_SKILL_TREE: Record<string, SkillNode> = {
    // Fire School
    'ignite': { id: 'ignite', name: 'Ignite', desc: 'Burns targets. Exclusively in Skill Tree.', icon: '🔥', type: 'spell', cost: 1, requires: [], gridPos: { x: 1, y: 1 } },
    'fireball': { id: 'fireball', name: 'Fireball', desc: 'Explosive blast.', icon: '☄️', type: 'spell', cost: 2, requires: ['ignite'], gridPos: { x: 1, y: 2 } },
    'inferno': { id: 'inferno', name: 'Inferno', desc: 'World of fire.', icon: '🌋', type: 'spell', cost: 3, requires: ['fireball'], gridPos: { x: 1, y: 3 } },
    
    // Ice School
    'frostbolt': { id: 'frostbolt', name: 'Frostbolt', desc: 'Slows targets. Exclusively in Skill Tree.', icon: '❄️', type: 'spell', cost: 1, requires: [], gridPos: { x: 2, y: 1 } },
    'ice_nova': { id: 'ice_nova', name: 'Ice Nova', desc: 'AoE freeze.', icon: '🧊', type: 'spell', cost: 2, requires: ['frostbolt'], gridPos: { x: 2, y: 2 } },
    'blizzard': { id: 'blizzard', name: 'Blizzard', desc: 'Continuous ice storm.', icon: '🧥', type: 'spell', cost: 3, requires: ['ice_nova'], gridPos: { x: 2, y: 3 } },
    
    // Arcane School
    'arcane_missiles': { id: 'arcane_missiles', name: 'Arcane Missiles', desc: 'Seeking bolts. Exclusively in Skill Tree.', icon: '✨', type: 'spell', cost: 1, requires: [], gridPos: { x: 4, y: 1 } },
    'blink': { id: 'blink', name: 'Blink', desc: 'Short teleport.', icon: '🌀', type: 'spell', cost: 2, requires: ['arcane_missiles'], gridPos: { x: 4, y: 2 } },
    'arcane_power': { id: 'arcane_power', name: 'Arcane Power', desc: 'Double damage.', icon: '🔮', type: 'spell', cost: 3, requires: ['blink'], gridPos: { x: 4, y: 3 } },
    
    // Dark School
    'shadow_bolt': { id: 'shadow_bolt', name: 'Shadow Bolt', desc: 'Dark energy. Exclusively in Skill Tree.', icon: '🖤', type: 'spell', cost: 1, requires: [], gridPos: { x: 5, y: 1 } },
    'vampiric_touch': { id: 'vampiric_touch', name: 'Vampiric Touch', desc: 'Life steal.', icon: '🧛', type: 'spell', cost: 2, requires: ['shadow_bolt'], gridPos: { x: 5, y: 2 } },
    'death_coil': { id: 'death_coil', name: 'Death Coil', desc: 'Execute damaged foes.', icon: '💀', type: 'spell', cost: 3, requires: ['vampiric_touch'], gridPos: { x: 5, y: 3 } }
};

const materials = ['Ancient', 'Imperial', 'Mithril', 'Dragonglass', 'Abyssal', 'Celestial', 'Relic'];
const armors = {
    helmet: [
        'Greathelm of Intellect', 'Visage of the Damned', 'Diadem of Light', 'Mithril Guard', 'Crown of Thorns',
        'Iron Mask of Fury', 'Shadow Hood', 'Dragon Scale Helm', 'Cowl of the Deep', 'Greathelm of the Titan',
        'Veil of the Void', 'Circlet of Stars', 'Gaze of the Medusa', 'Skull-Crusher Cap', 'Warden\'s Visor',
        'Mystic Turban', 'Frost-Steel Helm', 'Phoenix Crown', 'Serpent\'s Gaze',
        'Celestial Halo', 'Abyssal Horns', 'Nomad\'s Bandana', 'Gladiator\'s Mask', 'Elder\'s Headdress',
        'Runesteel Guard', 'Darkwood Mask', 'Emerald Circlet', 'Obsidian Casque', 'Hunter\'s Cap'
    ],
    chestplate: [
        'Breastplate of Valor', 'Hauberk of the North', 'Celestial Raiment', 'Abyssal Plate', 'Dragonscale Mantle',
        'Aegis of the Sun', 'Shadow Mail', 'Dragon Scale Breastplate', 'Robe of Arcane Power', 'Titan\'s Shell',
        'Void Armor', 'Guard of the Ancient', 'Heart of the Mountain', 'Wraith-Form Garb', 'Phoenix Vest',
        'Serpent\'s Skin', 'Radiant Plate', 'Blood Moon Armor', 'Gale Force Tunic', 'Ebon Carapace',
        'Celestial Garb', 'Abyssal Hide', 'Nomad\'s Leathers', 'Gladiator\'s Chest', 'Elder\'s Robe',
        'Runesteel Plate', 'Darkwood Bark', 'Emerald Vestments', 'Obsidian Plate', 'Hunter\'s Jerkin'
    ],
    leggings: [
        'Greaves of Elvenkind', 'Legplates of the Giant', 'Warden Chausses', 'Void Treads', 'Slayer Skirt',
        'Greaves of Might', 'Shadow Trousers', 'Dragon Scale Leggings', 'Pants of the Archmage', 'Titan\'s Pillars',
        'Void Leggings', 'Lower Guard of the Ancient', 'Wraith-Step Leggings', 'Phoenix Breeches',
        'Serpent\'s Tail', 'Radiant Greaves', 'Blood Moon Kilt', 'Gale Force Leggings', 'Ebon Chausses',
        'Celestial Skirt', 'Abyssal Legplates', 'Nomad\'s Wraps', 'Gladiator\'s Greaves', 'Elder\'s Skirt',
        'Runesteel Leggings', 'Darkwood Leggings'
    ],
    boots: [
        'Boots of Speed', 'Sabatons of the Iron Guard', 'Wind-Step Strider', 'Treading of the Deep', 'Sandals of Grace',
        'Striders of Speed', 'Shadow Treads', 'Dragon Scale Boots', 'Steps of the Archmage', 'Titan\'s Stomp',
        'Void Boots', 'March of the Ancient', 'Mountain Peak Boots', 'Wraith-Walk Boots', 'Phoenix Talons',
        'Serpent\'s Glide', 'Radiant Sabatons', 'Blood Moon Boots', 'Gale Force Sandals', 'Ebon Boots',
        'Celestial Steps', 'Abyssal Treads', 'Nomad\'s Boots', 'Gladiator\'s Sandals', 'Elder\'s Slippers',
        'Runesteel Boots', 'Darkwood Boots', 'Emerald Shoes', 'Obsidian Sabatons', 'Hunter\'s Boots'
    ]
};
const weapons = [
    'Holy Avenger', 'Sun Blade', 'Staff of Power', 'Vorpal Sword', 'Frostbrand', 'Hammer of Thunderbolts', 'Oathbow', 'Dagger of Venom', 'Soul-Stealer', 'Morningstar of Dawn',
    'Shadowblade', 'Dragon Tooth', 'Stormbringer', 'Void Reaver', 'Aegis Breaker', 'Death Whisper', 'Soul Rend', 'Titan Maul', 'Phoenix Talon', 'Frostbite Axe',
    'Serpent Sting', 'Radiant Dawn', 'Midnight Sorrow', 'Gale Force', 'Earthshaker', 'Blood Moon Spear', 'Arcane Gavel', 'Ebon Dagger', 'Thunder Echo', 'Hellfire Bastard',
    'Lunar Crescent', 'Skyward Spike', 'Demon Bane', 'Reaper Scythe', 'Valkyrie Grace'
];

const MERCHANT_DIALOGUES = [
    "Welcome, traveler. My wares are as sharp as the shadows here.",
    "Steel and magic, both yours for the right price.",
    "I've traveled the nine circles to bring you these relics.",
    "Careful now, the deeper you go, the hungrier they get.",
    "You look like someone who values quality over gold.",
    "May these blades guide your path through the darkness.",
    "A fine day for a trade, wouldn't you say?",
    "Don't let the silence fool you. They are watching.",
    "Everything I sell has a story. Most end in blood.",
    "Take your time. Good equipment is the difference between life and death.",
    "I'm going to tickle you little boy🤪🤪",
    "Go fuck yourself",
    "Praying on your downfall",
    "Some of these ogre chicks been eyeing me recently if you catch my meaning🥴🥴",
    "Not only do I have to sit here, but now your ugly ass is in my face too",
    "You're lucky I'm untrained in medieval arts"
];

function initDB() {
    materials.forEach(mat => {
        weapons.forEach(w => {
            const id = `${mat.toLowerCase()}_${w.toLowerCase().replace(/ /g, '_')}`;
            const rar: Item['rarity'] = mat === 'Ancient' ? 'iron' : (mat === 'Imperial' ? 'steel' : (mat === 'Mithril' ? 'mithril' : 'dragon'));
            const val = 8 + Math.floor(Math.random() * 12) + (mat === 'Mithril' ? 30 : (mat === 'Celestial' ? 80 : 0));
            let range = 64;
            const nl = w.toLowerCase();
            if (nl.includes('spear') || nl.includes('halberd') || nl.includes('pike')) range = 220;
            else if (nl.includes('sword') || nl.includes('claymore') || nl.includes('blade')) range = 130;
            else if (nl.includes('dagger') || nl.includes('knife')) range = 75;
            else if (nl.includes('bow')) range = 600;

            ITEM_POOL[id] = {
                id,
                name: `${mat} ${w}`,
                type: 'weapon',
                value: val,
                price: val * 12,
                icon: '⚔️',
                image: `/items/${w}.png`,
                desc: `A legendary ${w} (Range: ${range}). Known for its terrible power.`,
                rarity: rar
            };
        });
        Object.entries(armors).forEach(([type, names]) => {
            names.forEach(n => {
                const id = `${mat.toLowerCase()}_${type}_${n.toLowerCase().replace(/ /g, '_')}`;
                const rar: Item['rarity'] = mat === 'Ancient' ? 'iron' : (mat === 'Imperial' ? 'steel' : (mat === 'Mithril' ? 'mithril' : 'dragon'));
                const val = 3 + Math.floor(Math.random() * 4) + (mat === 'Mithril' ? 8 : (mat === 'Celestial' ? 18 : 0));
                ITEM_POOL[id] = {
                    id,
                    name: `${mat} ${n}`,
                    type: type as any,
                    value: val,
                    price: val * 35,
                    icon: type === 'helmet' ? '🪖' : (type === 'chestplate' ? '🛡️' : (type === 'leggings' ? '👖' : '🥾')),
                    image: `/items/${n}.png`,
                    desc: `This ${n} is imbued with ${mat} energy, offering superior protection.`,
                    rarity: rar
                };
            });
        });
    });
    ITEM_POOL['health_potion'] = { id: 'health_potion', name: 'Potion of Superior Healing', type: 'potion', value: 80, price: 150, icon: '🧪', image: '/items/Potion of Superior Healing.png', desc: 'Restores a significant amount of vitality.', rarity: 'steel' };
    ITEM_POOL['mana_potion'] = { id: 'mana_potion', name: 'Elixir of Mana', type: 'potion', value: 60, price: 120, icon: '⚗️', image: '/items/Elixir of Mana.png', desc: 'Restores arcane energy.', rarity: 'steel' };
    ITEM_POOL['vault_key'] = { id: 'vault_key', name: 'Ornate Vault Key', type: 'key', value: 1, price: 500, icon: '🔑', image: '/items/Vault Key.png', desc: 'A heavy brass key that likely opens a nearby vault.', rarity: 'mithril' };
    ITEM_POOL['start_dagger'] = { id: 'start_dagger', name: 'Dull Iron Dagger', type: 'weapon', value: 8, price: 10, icon: '🗡️', image: '/items/Common Dagger.png', desc: 'A rusty, chipped blade (Range: 75).', rarity: 'iron' };
    Object.values(SPELL_DB).forEach(s => {
        ITEM_POOL[`spellbook_${s.id}`] = { id: `spellbook_${s.id}`, name: `Grimoire: ${s.name}`, type: 'spellbook', value: 0, price: 1200, icon: '📜', image: `/items/Grimoire ${s.name}.png`, desc: s.desc, rarity: 'mithril' };
    });
}
initDB();

function getRandomLoot(d: number, limit: number, forceKey = false): Item[] {
    const isSandbox = (window as any).game?.isSandbox;
    const items = Object.values(ITEM_POOL).filter(it => {
        if (it.type === 'key') return false;
        if (it.price > limit) return false;
        // Restrict spellbooks if they are in the skill tree
        if (it.type === 'spellbook' && !isSandbox) {
            const spellId = it.id.replace('spellbook_', '');
            if (SPELL_SKILL_TREE[spellId]) return false;
        }
        return true;
    });
    const out: Item[] = [];
    if (forceKey) out.push({ ...ITEM_POOL['vault_key'] });
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
        const it = items[Math.floor(Math.random() * items.length)];
        if (it) out.push({ ...it });
    }
    return out;
}

function getRandomSpellbook(d: number): Item {
    const isSandbox = (window as any).game?.isSandbox;
    const restrictedSpells = Object.keys(SPELL_SKILL_TREE);
    const availableSpells = Object.keys(SPELL_DB).filter(sId => isSandbox || !restrictedSpells.includes(sId));
    const sId = availableSpells[Math.floor(Math.random() * availableSpells.length)];
    return { ...ITEM_POOL[`spellbook_${sId}`] };
}

// --- ENGINE CLASSES ---

class FieldEffect {
    x: number; y: number; radius: number; life: number; type: string; color: string; damage: number;
    timer = 0; owner: any;
    constructor(x: number, y: number, r: number, l: number, t: string, c: string, d: number, o: any) {
        this.x = x; this.y = y; this.radius = r; this.life = l; this.type = t; this.color = c; this.damage = d; this.owner = o;
    }
    update(dt: number, level: Level, game: Game) {
        this.life -= dt; this.timer -= dt;
        if (this.timer <= 0) {
            this.timer = 0.5;
            if (this.type === 'crucifixion') {
                const tiles = [[0, 0], [0, -1], [0, 1], [0, 2], [1, 0], [-1, 0]];
                level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead) {
                        const ex = Math.floor(e.x / 64), ey = Math.floor(e.y / 64);
                        const cx = Math.floor(this.x / 64), cy = Math.floor(this.y / 64);
                        if (tiles.some(t => cx + t[0] === ex && cy + t[1] === ey)) {
                            e.hp -= this.damage; e.rootTimer = 0.6;
                            if (e.hp <= 0) game.killEnemy(e);
                        }
                    }
                });
            } else if (this.type === 'abyssal_pull') {
                level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead) {
                        const dist = Math.hypot(this.x - e.x, this.y - e.y);
                        if (dist < this.radius) {
                            const angle = Math.atan2(this.y - e.y, this.x - e.x);
                            e.x += Math.cos(angle) * 100; e.y += Math.sin(angle) * 100;
                            e.hp -= this.damage; if (e.hp <= 0) game.killEnemy(e);
                        }
                    }
                });
            } else {
                // Look up the spell's effect from SPELL_DB for proper cloud AOE effect application
                const spell = SPELL_DB[this.type];
                const spellEffect = spell ? spell.effect : null;
                level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < this.radius) {
                        e.hp -= this.damage;
                        // Apply the spell's effect
                        if (spellEffect === 'burn') { e.burnTimer = Math.max(e.burnTimer || 0, 2); e.burnDamage = this.damage; }
                        if (spellEffect === 'slow') { e.slowTimer = Math.max(e.slowTimer || 0, 1.5); }
                        if (spellEffect === 'poison') { e.poisonTimer = Math.max(e.poisonTimer || 0, 2); e.poisonDamage = this.damage; }
                        if (spellEffect === 'weaken') { e.weakenTimer = Math.max(e.weakenTimer || 0, 2); }
                        if (spellEffect === 'root') { e.rootTimer = Math.max(e.rootTimer || 0, 1); }
                        if (spellEffect === 'fear') { e.fearTimer = Math.max(e.fearTimer || 0, 1.5); }
                        if (e.hp <= 0) game.killEnemy(e);
                    }
                });
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save(); ctx.globalAlpha = Math.min(1, this.life) * 0.4; ctx.fillStyle = this.color;
        if (this.type === 'crucifixion') {
            const tiles = [[0, 0], [0, -1], [0, 1], [0, 2], [1, 0], [-1, 0]];
            tiles.forEach(t => {
                const tx = (Math.floor(this.x / 64) + t[0]) * 64;
                const ty = (Math.floor(this.y / 64) + t[1]) * 64;
                ctx.fillRect(tx + 2, ty + 2, 60, 60);
                ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2;
                ctx.strokeRect(tx + 2, ty + 2, 60, 60);
            });
        } else if (this.type.includes('cloud')) {
            for (let i = 0; i < 6; i++) {
                const ox = Math.cos(i * 1.1 + this.life) * (this.radius * 0.4);
                const oy = Math.sin(i * 1.3 - this.life) * (this.radius * 0.3);
                ctx.beginPath(); ctx.arc(this.x + ox, this.y + oy, this.radius * 0.7, 0, Math.PI * 2); ctx.fill();
            }
        } else {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}

class Ally {
    x: number; y: number; hp: number; maxHp: number; dead = false; type = 'ally'; color: string; damage: number; ac: number;
    constructor(x: number, y: number, h: number, d: number, a: number, c: string) {
        this.x = x; this.y = y; this.hp = h; this.maxHp = h; this.damage = d; this.ac = a; this.color = c;
    }
    update(dt: number, level: Level, game: Game) {
        if (this.dead) return;
        let nearest: any = null; let minDist = 600;
        level.entities.forEach(e => { if (e.type === 'enemy' && !e.dead) { const d = Math.hypot(this.x - e.x, this.y - e.y); if (d < minDist) { minDist = d; nearest = e; } } });
        if (nearest) {
            const angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
            if (minDist > 40) {
                if (!level.isWall(this.x + Math.cos(angle) * 200 * dt, this.y)) this.x += Math.cos(angle) * 200 * dt;
                if (!level.isWall(this.x, this.y + Math.sin(angle) * 200 * dt)) this.y += Math.sin(angle) * 200 * dt;
            } else {
                nearest.hp -= this.damage * dt; if (nearest.hp <= 0) game.killEnemy(nearest);
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.arc(this.x, this.y, 25, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = '#f44336'; ctx.fillRect(this.x - 20, this.y - 35, 40, 5);
        ctx.fillStyle = '#4caf50'; ctx.fillRect(this.x - 20, this.y - 35, (this.hp / this.maxHp) * 40, 5);
    }
}

class Portal {
    x: number; y: number; tx: number; ty: number; life: number; color: string;
    constructor(x: number, y: number, tx: number, ty: number, col: string) {
        this.x = x; this.y = y; this.tx = tx; this.ty = ty; this.life = 8; this.color = col;
    }
    update(dt: number, player: Player, game: Game) {
        this.life -= dt;
        if (Math.hypot(player.x - this.x, player.y - this.y) < 40) {
            // Add a small cooldown property to player to prevent bouncing
            if ((player as any).portalCooldown <= 0) {
                player.x = this.tx;
                player.y = this.ty;
                (player as any).portalCooldown = 0.5;
                game.log("Teleported through shadow portal!");
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.life) * 0.7;
        ctx.shadowBlur = 15; ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, 35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
    }
}

class InputHandler {
    keys: Set<string> = new Set(); mouse = { x: 0, y: 0, left: false, right: false, clicked: false, rClicked: false }; mousePosWorld = { x: 0, y: 0 };
    constructor(canvas: HTMLCanvasElement) {
        window.addEventListener('keydown', e => this.keys.add(e.code)); window.addEventListener('keyup', e => this.keys.delete(e.code));
        canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top; });
        canvas.addEventListener('mousedown', e => { if (e.button === 0) { this.mouse.left = true; this.mouse.clicked = true; } if (e.button === 2) { this.mouse.right = true; this.mouse.rClicked = true; } });
        canvas.addEventListener('mouseup', e => { if (e.button === 0) this.mouse.left = false; if (e.button === 2) this.mouse.right = false; });
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    }
    isDown(c: string) { return this.keys.has(c); }
    consumeClick(r = false) { if (r) { const c = this.mouse.rClicked; this.mouse.rClicked = false; return c; } const c = this.mouse.clicked; this.mouse.clicked = false; return c; }
}

class Projectile {
    x: number; y: number; vx: number; vy: number; type: string; owner: any; dead = false; damage: number; color: string; shape: string; effect: string | undefined;
    timer: number = 0; attachedTo: any = null;
    constructor(x: number, y: number, a: number, t: string, o: any, d: number, c = '#fff', s = 'circle', e?: string) {
        this.x = x; this.y = y; const spd = t === 'fireball' || t === 'living_bomb' ? 550 : 800; this.vx = Math.cos(a) * spd; this.vy = Math.sin(a) * spd; this.type = t; this.owner = o; this.damage = d; this.color = c; this.shape = s; this.effect = e;
        if (t === 'living_bomb') this.timer = 1.0;
    }
    update(dt: number, level: Level, game: Game) {
        // Slight homing for magic missile
        if (this.type === 'magic_missile') {
            let nearest: any = null, minDist = 400;
            level.entities.forEach(e => { if (e.type === 'enemy' && !e.dead) { const d = Math.hypot(this.x - e.x, this.y - e.y); if (d < minDist) { minDist = d; nearest = e; } } });
            if (nearest) {
                const targetA = Math.atan2(nearest.y - this.y, nearest.x - this.x);
                const currentA = Math.atan2(this.vy, this.vx);
                let diff = targetA - currentA;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                const newA = currentA + diff * dt * 3; // Turn speed
                const spd = Math.hypot(this.vx, this.vy);
                this.vx = Math.cos(newA) * spd;
                this.vy = Math.sin(newA) * spd;
            }
        }

        if (this.attachedTo) {
            this.x = this.attachedTo.x; this.y = this.attachedTo.y;
            this.timer -= dt;
            if (this.timer <= 0 || this.attachedTo.dead) { this.explode(level, game); this.dead = true; }
            return;
        }

        this.x += this.vx * dt; this.y += this.vy * dt;
        if (level.isWall(this.x, this.y)) { if (this.type === 'fireball' || this.type === 'living_bomb') this.explode(level, game); this.dead = true; return; }
        
        // Player Collision (if enemy projectile)
        if (this.owner && this.owner.type === 'enemy') {
            if (Math.hypot(this.x - game.player.x, this.y - game.player.y) < 35) {
                game.damageTarget(game.player, this.owner, this.damage);
                if (this.effect === 'root') game.player.rootTimer = 3;
                if (this.effect === 'slow') game.player.slowTimer = 3;
                if (this.effect === 'burn') { game.player.burnTimer = 3; game.player.burnDamage = 10; }
                if (this.effect === 'poison') { game.player.poisonTimer = (game.player.poisonTimer || 0) + 4; game.player.poisonDamage = 8; }
                if (this.effect === 'weaken') game.player.weakenTimer = 5;
                if (this.effect === 'blind') game.player.blindTimer = 3;
                this.dead = true;
                return;
            }
        }

        level.entities.forEach(e => {
            if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < 35) {
                // Prevent friendly fire: enemies shouldn't damage each other
                if (this.owner && this.owner.type === 'enemy') return;

                if (this.type === 'fireball') this.explode(level, game);
                else if (this.type === 'living_bomb') {
                    this.attachedTo = e;
                    this.vx = 0; this.vy = 0;
                    game.log("Bomb attached!");
                }
                else {
                    let dmg = this.damage;
                    // Shatter: 2x damage to slowed or rooted targets
                    if (this.effect === 'shatter' && (e.slowTimer > 0 || e.rootTimer > 0 || e.petrifiedTimer > 0)) dmg *= 2;
                    // Cursed enemies take 50% more damage
                    if (e.cursedTimer > 0) dmg *= 1.5;
                    e.hp -= dmg;
                    if (this.effect === 'lifesteal') game.player.hp = Math.min(game.player.maxHp, game.player.hp + dmg * 0.3);
                    if (this.effect === 'slow') { e.slowTimer = 4; }
                    if (this.effect === 'burn') { e.burnTimer = 4; e.burnDamage = dmg * 0.2; }
                    if (this.effect === 'fear') { e.fearTimer = 3; }
                    if (this.effect === 'weaken') { e.weakenTimer = 5; }
                    if (this.effect === 'poison') { e.poisonTimer = (e.poisonTimer || 0) + 5; e.poisonDamage = (e.poisonDamage || 0) + dmg * 0.15; }
                    if (this.effect === 'blind') { e.blindTimer = 3; }
                    if (this.effect === 'curse') { e.cursedTimer = 5; }
                    if (this.effect === 'knockback') {
                        const ka = Math.atan2(e.y - this.owner.y, e.x - this.owner.x);
                        e.x += Math.cos(ka) * 150; e.y += Math.sin(ka) * 150;
                    }
                    if (this.effect === 'purify') {
                        e.frenzy = false;
                        if (['Skeleton', 'Wraith', 'Lich'].includes(e.enemyType)) e.hp -= dmg * 0.5; // Bonus to undead
                        game.particles.push({ x: e.x, y: e.y, life: 0.5, type: 'spark', color: '#fff' });
                    }
                    if (this.effect === 'petrify') {
                        e.petrifiedTimer = 5; e.rootTimer = 0; // Petrify overrides root
                        game.particles.push({ x: e.x, y: e.y, life: 0.8, type: 'spark', color: '#7f8c8d' });
                    }
                    if (this.effect === 'enchant') {
                        // Convert enemy to enchanted ally
                        if (game.enchantedAlly) { game.enchantedAlly.dead = true; game.enchantedAlly = null; }
                        e.type = 'enchanted_ally'; e.baseColor = game.player.color === 'rainbow' ? game.player.getDisplayColor() : (game.player.color || '#f39c12');
                        game.enchantedAlly = e;
                        game.log(`${e.enemyType} is now fighting for you!`);
                    }
                    if (this.effect === 'chain') {
                        const target = level.entities.find(other => other.type === 'enemy' && !other.dead && other !== e && Math.hypot(e.x - other.x, e.y - other.y) < 300);
                        if (target) {
                            const angle = Math.atan2(target.y - e.y, target.x - e.x);
                            game.projectiles.push(new Projectile(e.x, e.y, angle, this.type, this.owner, this.damage * 0.7, this.color, this.shape));
                        }
                    }
                    // Prismatic ray: random effect
                    if (this.type === 'prismatic_ray') {
                        const effs = ['slow', 'burn', 'fear', 'root', 'poison', 'blind', 'weaken'];
                        const re = effs[Math.floor(Math.random() * effs.length)];
                        if (re === 'slow') e.slowTimer = 3;
                        else if (re === 'burn') { e.burnTimer = 3; e.burnDamage = 15; }
                        else if (re === 'fear') e.fearTimer = 2;
                        else if (re === 'root') e.rootTimer = 2;
                        else if (re === 'poison') { e.poisonTimer = 4; e.poisonDamage = 10; }
                        else if (re === 'blind') e.blindTimer = 3;
                        else if (re === 'weaken') e.weakenTimer = 4;
                    }
                    if (e.hp <= 0) game.killEnemy(e);
                }
                if (!this.attachedTo) this.dead = true;
            }
        });
    }
    explode(level: Level, game: Game) {
        game.particles.push({ x: this.x, y: this.y, life: 0.6, type: 'explosion', color: this.color });
        level.entities.forEach(e => { if (e.type === 'enemy' && !e.dead) { const d = Math.hypot(this.x - e.x, this.y - e.y); if (d < 200) { e.hp -= this.damage * (1 - d / 220); if (e.hp <= 0) game.killEnemy(e); } } });
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;
        const angle = Math.atan2(this.vy, this.vx);

        if (this.shape === 'bolt') {
            // Lightning zigzag bolt
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.strokeStyle = this.color; ctx.lineWidth = 4; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-20, 0);
            ctx.lineTo(-10, -8); ctx.lineTo(0, 4); ctx.lineTo(10, -6); ctx.lineTo(20, 0);
            ctx.stroke();
            // Glow core
            ctx.globalAlpha = 0.6; ctx.lineWidth = 8;
            ctx.beginPath(); ctx.moveTo(-20, 0);
            ctx.lineTo(-10, -8); ctx.lineTo(0, 4); ctx.lineTo(10, -6); ctx.lineTo(20, 0);
            ctx.stroke();
        } else if (this.shape === 'star') {
            ctx.translate(this.x, this.y);
            ctx.rotate(Date.now() * 0.01);
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const outerA = (i * 2 * Math.PI / 5) - Math.PI / 2;
                const innerA = outerA + Math.PI / 5;
                ctx.lineTo(Math.cos(outerA) * 18, Math.sin(outerA) * 18);
                ctx.lineTo(Math.cos(innerA) * 8, Math.sin(innerA) * 8);
            }
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
        } else if (this.shape === 'pulse') {
            const s = 10 + Math.sin(Date.now() * 0.02) * 5;
            ctx.globalAlpha = 0.4;
            ctx.beginPath(); ctx.arc(this.x, this.y, s + 6, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.arc(this.x, this.y, s, 0, Math.PI * 2); ctx.fill();
        } else if (this.shape === 'wave') {
            ctx.translate(this.x, this.y); ctx.rotate(angle);
            ctx.beginPath(); ctx.moveTo(-10, -15); ctx.quadraticCurveTo(15, 0, -10, 15);
            ctx.lineWidth = 6; ctx.strokeStyle = this.color; ctx.stroke();
            ctx.globalAlpha = 0.3; ctx.lineWidth = 12; ctx.stroke();
        } else if (this.shape === 'boulder') {
            // Irregular rocky polygon
            ctx.translate(this.x, this.y);
            ctx.rotate(Date.now() * 0.003);
            ctx.beginPath();
            const pts = 7;
            for (let i = 0; i < pts; i++) {
                const a = (i / pts) * Math.PI * 2;
                const r = 12 + Math.sin(i * 2.3) * 5;
                if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath(); ctx.fillStyle = '#7f8c8d'; ctx.fill();
            ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 2; ctx.stroke();
            // Crack lines
            ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(3, 2); ctx.lineTo(-1, 8); ctx.stroke();
        } else if (this.shape === 'dart') {
            // Thin pointed triangle
            ctx.translate(this.x, this.y); ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(18, 0); ctx.lineTo(-8, -5); ctx.lineTo(-6, 0); ctx.lineTo(-8, 5);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.stroke();
        } else if (this.shape === 'beam') {
            // Long thin glowing line
            ctx.translate(this.x, this.y); ctx.rotate(angle);
            ctx.globalAlpha = 0.3;
            ctx.fillRect(-40, -6, 80, 12);
            ctx.globalAlpha = 0.7;
            ctx.fillRect(-35, -3, 70, 6);
            ctx.globalAlpha = 1;
            ctx.fillRect(-30, -1.5, 60, 3);
        } else if (this.shape === 'orb') {
            // Spinning inner pattern orb
            const t = Date.now() * 0.005;
            ctx.globalAlpha = 0.2;
            ctx.beginPath(); ctx.arc(this.x, this.y, 20, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.arc(this.x, this.y, 14, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.arc(this.x, this.y, 8, 0, Math.PI * 2); ctx.fill();
            // Inner spinning pattern
            ctx.strokeStyle = this.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.6;
            for (let i = 0; i < 3; i++) {
                const a = t + (i * Math.PI * 2 / 3);
                ctx.beginPath();
                ctx.arc(this.x + Math.cos(a) * 6, this.y + Math.sin(a) * 6, 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else {
            // Default circle (fireball, etc.)
            ctx.globalAlpha = 0.3;
            ctx.beginPath(); ctx.arc(this.x, this.y, 20, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.arc(this.x, this.y, 14, 0, Math.PI * 2); ctx.fill();
            // Fire particle trail
            for (let i = 0; i < 3; i++) {
                const ox = -this.vx * 0.02 * (i + 1) + (Math.random() - 0.5) * 10;
                const oy = -this.vy * 0.02 * (i + 1) + (Math.random() - 0.5) * 10;
                ctx.globalAlpha = 0.3 - i * 0.1;
                ctx.beginPath(); ctx.arc(this.x + ox, this.y + oy, 8 - i * 2, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    }
}

const BIOME_DB: Record<string, any> = {
    'crypt': { name: 'Stone Crypt', floor: '#181818', wall: '#080808', enemyPool: ['Skeleton', 'Zombie'], decor: 'none' },
    'ruins': { name: 'Overgrown Ruins', floor: '#1a2a1a', wall: '#0a1a0a', enemyPool: ['Slime', 'Giant Spider'], decor: 'moss' },
    'magma': { name: 'Magma Chamber', floor: '#2c0d0d', wall: '#1a0505', enemyPool: ['Magma Ogre', 'Fire Elemental'], decor: 'lava' },
    'frozen': { name: 'Frozen Vault', floor: '#1b2631', wall: '#0e1621', enemyPool: ['Frost Golem', 'Ice Wraith'], decor: 'frost' },
    'void': { name: 'Void Cathedral', floor: '#1e0a29', wall: '#0f0515', enemyPool: ['Void Reaver', 'Cultist'], decor: 'void' },
    'golden': { name: 'Golden Treasury', floor: '#2a2205', wall: '#1d1703', enemyPool: ['Mimic', 'Gold Golem'], decor: 'gold' },
    'library': { name: 'Forgotten Library', floor: '#1e1a14', wall: '#0f0d0a', enemyPool: ['Lich', 'Animated Tome'], decor: 'books' },
    'sewers': { name: 'Dank Sewers', floor: '#141e1a', wall: '#0a0f0d', enemyPool: ['Plague Rat', 'Hydromancer'], decor: 'toxic' },
    'workshop': { name: 'Mechanical Workshop', floor: '#1f1b1c', wall: '#121010', enemyPool: ['Clockwork Soldier', 'Scrap Drone'], decor: 'gears' },
    'prison': { name: 'Obsidian Prison', floor: '#111', wall: '#000', enemyPool: ['Chain Fiend', 'Shadow Guard'], decor: 'chains' },
    'spectral': { name: 'Spectral Plane', floor: '#0d1f2d', wall: '#05111b', enemyPool: ['Banshee', 'Phantasm'], decor: 'stars' }
};

class Level {
    width: number; height: number; tiles: number[][]; fog: number[][]; entities: any[] = []; spawnX = 0; spawnY = 0;
    biomeMap: string[][] = [];
    constructor(w: number, h: number, d: number) {
        this.width = w; this.height = h;
        this.tiles = Array(h).fill(0).map(() => Array(w).fill(1));
        this.fog = Array(h).fill(0).map(() => Array(w).fill(0));
        this.biomeMap = Array(h).fill(0).map(() => Array(w).fill('crypt'));
        
        // --- Multi-Biome Generation (Phase 18) ---
        const biomeKeys = Object.keys(BIOME_DB);
        const centerCount = 3 + Math.floor(Math.random() * 3); // 3-5 biome centers
        const centers: {x: number, y: number, b: string}[] = [];
        
        for (let i = 0; i < centerCount; i++) {
            centers.push({
                x: Math.random() * w,
                y: Math.random() * h,
                b: biomeKeys[Math.floor(Math.random() * biomeKeys.length)]
            });
        }

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let nearest = centers[0];
                let minDist = Math.hypot(x - centers[0].x, y - centers[0].y);
                centers.forEach(c => {
                    const dist = Math.hypot(x - c.x, y - c.y);
                    // Add some noise for natural-looking but structured transitions
                    const noise = (Math.random() - 0.5) * 8; 
                    if (dist + noise < minDist) { minDist = dist + noise; nearest = c; }
                });
                this.biomeMap[y][x] = nearest.b;
            }
        }

        // --- Smoothing Pass (Phase 20) ---
        // Simple cellular automata-style smoothing to remove small patches
        const smoothedMap = JSON.parse(JSON.stringify(this.biomeMap));
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const neighbors: Record<string, number> = {};
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const b = this.biomeMap[y + dy][x + dx];
                        neighbors[b] = (neighbors[b] || 0) + 1;
                    }
                }
                // If the current tile's biome is a minority in its 3x3 neighborhood, change it
                let maxCount = 0; let dominantBiome = this.biomeMap[y][x];
                for (const b in neighbors) {
                    if (neighbors[b] > maxCount) { maxCount = neighbors[b]; dominantBiome = b; }
                }
                if (maxCount >= 5) smoothedMap[y][x] = dominantBiome;
            }
        }
        this.biomeMap = smoothedMap;
        
        this.generate(d);
    }
    generate(d: number) {
        let cx = Math.floor(this.width / 2), cy = Math.floor(this.height / 2); this.spawnX = cx * 64; this.spawnY = cy * 64;
        for (let i = 0; i < 2400; i++) { this.tiles[cy][cx] = 0; let dir = Math.floor(Math.random() * 4); if (dir === 0) cx = Math.max(1, Math.min(this.width - 2, cx + 1)); else if (dir === 1) cx = Math.max(1, Math.min(this.width - 2, cx - 1)); else if (dir === 2) cy = Math.max(1, Math.min(this.height - 2, cy + 1)); else cy = Math.max(1, Math.min(this.height - 2, cy - 1)); }
        if (d > 1) this.entities.push({ x: this.spawnX, y: this.spawnY, type: 'stairs-up', dead: false });
        let sx, sy; do { sx = Math.floor(Math.random() * (this.width - 2)) + 1; sy = Math.floor(Math.random() * (this.height - 2)) + 1; } while (this.tiles[sy][sx] === 1 || Math.hypot(sx * 64 - this.spawnX, sy * 64 - this.spawnY) < 600);
        this.entities.push({ x: sx * 64 + 32, y: sy * 64 + 32, type: 'stairs-down', dead: false });

        // Generate Vault
        if (d > 1 && Math.random() < 1.0) { // Set to 1.0 for testing
            console.log(`[Level] Attempting vault generation for depth ${d}`);
            const vx = Math.floor(Math.random() * (this.width - 10)) + 5;
            const vy = Math.floor(Math.random() * (this.height - 10)) + 5;
            
            // Find nearest floor tile OUTSIDE the proposed 5x5 vault enclosure (vx-2..vx+2, vy-2..vy+2)
            let targetX = -1, targetY = -1, minDist = Infinity;
            for (let y = 1; y < this.height - 1; y++) {
                for (let x = 1; x < this.width - 1; x++) {
                    if (this.tiles[y][x] === 0) {
                        if (x < vx - 2 || x > vx + 2 || y < vy - 2 || y > vy + 2) {
                            const dist = Math.abs(x - vx) + Math.abs(y - (vy + 3));
                            if (dist < minDist) {
                                minDist = dist;
                                targetX = x; targetY = y;
                            }
                        }
                    }
                }
            }

            if (targetX !== -1) {
                // 1. Enclosure: Create 5x5 wall boundary
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        this.tiles[vy + dy][vx + dx] = 1; 
                    }
                }
                // 2. Room: Create 3x3 interior floor
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        this.tiles[vy + dy][vx + dx] = 0;
                    }
                }
                
                // 3. Corridor: From outside the door to nearest floor
                let curX = vx, curY = vy + 3;
                while (curX !== targetX) {
                    this.tiles[curY][curX] = 0;
                    curX += Math.sign(targetX - curX);
                }
                while (curY !== targetY) {
                    this.tiles[curY][curX] = 0;
                    curY += Math.sign(targetY - curY);
                }

                // 4. Door: Locked door on the 5x5 boundary (South)
                this.tiles[vy + 2][vx] = 2; 
                // Ensure a path from door to corridor exit (vy+3, vx must be floor)
                this.tiles[vy + 3][vx] = 0;
                
                // 5. Loot: Special vault chest
                this.entities.push({ 
                    x: vx * 64 + 32, 
                    y: (vy - 1) * 64 + 32, 
                    type: 'chest', 
                    isSpecial: true, 
                    inventory: getRandomLoot(d, 2000), 
                    dead: false 
                });
                
                if ((window as any).game) (window as any).game.depthsWithVaults.add(d);
                console.log(`[Level] Enclosed vault generated successfully at ${vx}, ${vy} with corridor to ${targetX}, ${targetY}`);
            } else {
                console.warn(`[Level] Vault generation FAILED: No outside floor found for corridor!`);
            }
        }

        let merchantSpawned = false;
        let keyCarrierSet = false;
        const maxIter = 50; // Lower density
        for (let i = 0; i < maxIter; i++) {
            const rx = Math.floor(Math.random() * (this.width - 2)) + 1, ry = Math.floor(Math.random() * (this.height - 2)) + 1;
            if (this.tiles[ry][rx] === 0 && Math.hypot(rx * 64 - this.spawnX, ry * 64 - this.spawnY) > 300) {
                const r = Math.random();
                if (r < 0.35) { // Spawn chance
                    const localBiome = this.biomeMap[ry][rx];
                    const b = BIOME_DB[localBiome];
                    const pool = b.enemyPool.length > 0 ? [...b.enemyPool] : ['Skeleton', 'Skeleton'];
                    if (d > 3 && !pool.includes('Ogre')) pool.push('Ogre');
                    if (d > 8 && !pool.includes('Lich')) pool.push('Lich');
                    const eType = pool[Math.floor(Math.random() * pool.length)];

                    const game = (window as any).game;
                    const carriesKey = (game?.depthsWithVaults.has(d) || game?.depthsWithVaults.has(d + 1) || game?.depthsWithVaults.has(d - 1)) && !keyCarrierSet && Math.random() < 0.35;

                    let hpMult = 1, color = '#ff4757';
                    if (eType === 'Skeleton') color = '#f1f2f6';
                    else if (eType === 'Zombie') { color = '#7bed9f'; hpMult = 1.8; }
                    else if (eType === 'Ogre' || eType === 'Magma Ogre') color = '#a38148';
                    else if (eType === 'Slime') color = '#2ecc71';
                    else if (eType === 'Giant Spider') { color = '#2c3e50'; hpMult = 1.2; }
                    else if (eType === 'Fire Elemental') { color = '#f39c12'; hpMult = 1.3; }
                    else if (eType === 'Frost Golem') { color = '#70a1ff'; hpMult = 2.0; }
                    else if (eType === 'Ice Wraith') { color = '#a29bfe'; hpMult = 0.9; }
                    else if (eType === 'Wraith') color = '#747d8c';
                    else if (eType === 'Void Reaver') { color = '#1e0a29'; hpMult = 1.4; }
                    else if (eType === 'Cultist') color = '#30336b';
                    else if (eType === 'Mimic') { color = '#e67e22'; hpMult = 1.5; }
                    else if (eType === 'Gold Golem') { color = '#f1c40f'; hpMult = 3.0; }
                    else if (eType === 'Lich') color = '#9b59b6';
                    else if (eType === 'Animated Tome') { color = '#3498db'; hpMult = 0.8; }
                    else if (eType === 'Plague Rat') { color = '#badc58'; hpMult = 0.6; }
                    else if (eType === 'Hydromancer') { color = '#00a8ff'; hpMult = 1.1; }
                    else if (eType === 'Clockwork Soldier') { color = '#d35400', hpMult = 1.6; }
                    else if (eType === 'Scrap Drone') { color = '#95afc0'; hpMult = 0.5; }
                    else if (eType === 'Chain Fiend') { color = '#2d3436'; hpMult = 1.7; }
                    else if (eType === 'Shadow Guard') { color = '#000'; hpMult = 2.2; }
                    else if (eType === 'Banshee') { color = '#ecf0f1'; hpMult = 1.0; }
                    else if (eType === 'Phantasm') { color = '#bdc3c7'; hpMult = 0.9; }
                    else if (eType === 'Earth Golem') { hpMult = 2.5; color = '#57606f'; }
                    if (eType === 'Lich') color = '#a29bfe';

                    this.entities.push({ x: rx * 64 + 32, y: ry * 64 + 32, type: 'enemy', enemyType: eType, hp: (100 + d * 50) * hpMult, maxHp: (100 + d * 50) * hpMult, dead: false, carriesKey, baseColor: color, abilityCd: 3 });
                    if (carriesKey) keyCarrierSet = true;
                } else if (r < 0.48) {
                    this.entities.push({ x: rx * 64 + 32, y: ry * 64 + 32, type: 'chest', inventory: getRandomLoot(d, 500 + d * 50), dead: false });
                } else if (r < 0.52) { // Increased merchant rare spawn range
                    this.spawnMerchant(rx, ry, d);
                    merchantSpawned = true;
                }
            }
        }
        if (!merchantSpawned) {
            let mx, my;
            do { mx = Math.floor(Math.random() * (this.width - 2)) + 1; my = Math.floor(Math.random() * (this.height - 2)) + 1; } while (this.tiles[my][mx] !== 0 || Math.hypot(mx * 64 - this.spawnX, my * 64 - this.spawnY) < 400);
            this.spawnMerchant(mx, my, d);
        }

        // Spawn Lost Adventurer
        const game = (window as any).game as Game | undefined;
        if (d > 1 && game && game.hasAvailableLostAdventurer() && Math.random() < 0.7) {
            const template = game.getLostAdventurerTemplate();
            const name = game.getLostAdventurerName();
            const gear = game.getStarterGear(template.role);
            let rx, ry;
            do { rx = Math.floor(Math.random() * (this.width - 2)) + 1; ry = Math.floor(Math.random() * (this.height - 2)) + 1; }
            while (this.tiles[ry][rx] !== 0 || Math.hypot(rx * 64 - this.spawnX, ry * 64 - this.spawnY) < 500);
            this.entities.push({
                x: rx * 64 + 32,
                y: ry * 64 + 32,
                type: 'recruitable_npc',
                name,
                role: template.role,
                hp: template.hp,
                maxHp: template.hp,
                damage: template.damage,
                color: template.color,
                icon: template.icon,
                story: template.story,
                dead: false,
                inventory: gear.inventory.slice(),
                equipment: { ...gear.equipment }
            });
        }
    }
    update(dt: number, player: Player, game: Game) {
        const px = player.x, py = player.y;

        // Smart Fog of War (Line of Sight Raycasting)
        // Reset visible tiles to fog 1 (explored but not visible)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.fog[y][x] === 2) this.fog[y][x] = 1;
            }
        }

        const rays = 120;
        const viewDist = 12; // tiles
        for (let i = 0; i < rays; i++) {
            const angle = (i / rays) * Math.PI * 2;
            for (let d = 0; d < viewDist; d += 0.5) {
                const rx = Math.floor((px + Math.cos(angle) * d * 64) / 64);
                const ry = Math.floor((py + Math.sin(angle) * d * 64) / 64);
                if (rx < 0 || rx >= this.width || ry < 0 || ry >= this.height) break;
                this.fog[ry][rx] = 2;
                if (this.tiles[ry][rx] === 1 || this.tiles[ry][rx] === 2) break; // Walls/Doors block vision
            }
        }

        this.entities.forEach(e => {
            if (e.dead && !['corpse', 'item_drop'].includes(e.type) && !e.isCorpse) return;
            const d = Math.hypot(px - e.x, py - e.y);
            if (e.type === 'item_drop' && !e.dead && d < 50) {
                if (player.addItem(e.item)) {
                    e.dead = true;
                    game.log(`Picked up: ${e.item.name}`);
                    game.particles.push({ x: e.x, y: e.y, life: 0.4, type: 'spark', color: '#f9ca24' });
                }
            }
            if (e.type === 'enemy' && !e.dead) {
                if (e.burnTimer > 0) { e.burnTimer -= dt; e.hp -= (e.burnDamage || 5) * dt; if (e.hp <= 0) game.killEnemy(e); }
                if (e.slowTimer > 0) { e.slowTimer -= dt; }
                if (e.fearTimer > 0) { e.fearTimer -= dt; }
                if (e.weakenTimer > 0) { e.weakenTimer -= dt; }
                if (e.rootTimer > 0) { e.rootTimer -= dt; }
                if (e.petrifiedTimer > 0) { e.petrifiedTimer -= dt; }
                if (e.blindTimer > 0) { e.blindTimer -= dt; }
                if (e.cursedTimer > 0) { e.cursedTimer -= dt; }
                if (e.poisonTimer > 0) { e.poisonTimer -= dt; e.hp -= (e.poisonDamage || 5) * dt; if (e.hp <= 0) game.killEnemy(e); }

                let spd = 170;
                if (e.enemyType === 'Wraith') spd = 270;
                else if (e.enemyType === 'Ogre') spd = 130;
                else if (e.enemyType === 'Slime') spd = 150;
                else if (e.enemyType === 'Earth Golem') spd = 80;
                else if (e.enemyType === 'Cultist') spd = 200;

                if (e.frenzy) spd *= 1.8;
                if (e.slowTimer > 0) spd *= 0.4;
                if (e.fearTimer > 0) spd *= -1.2; // Run away
                if (e.petrifiedTimer > 0) spd = 0; // Petrified = total stun
                if (e.rootTimer > 0) spd = 0; // Rooted
                // Blind: wander randomly instead of chasing
                if (e.blindTimer > 0) {
                    const blindAngle = Math.random() * Math.PI * 2;
                    if (!this.isWall(e.x + Math.cos(blindAngle) * spd * dt, e.y)) e.x += Math.cos(blindAngle) * spd * 0.5 * dt;
                    if (!this.isWall(e.x, e.y + Math.sin(blindAngle) * spd * dt)) e.y += Math.sin(blindAngle) * spd * 0.5 * dt;
                    spd = 0; // Don't do normal movement
                }

                let target: any = player;
                let targetDist = Math.hypot(player.x - e.x, player.y - e.y);
                this.entities.forEach((ent: any) => {
                    if ((ent.type === 'ally' || ent.type === 'enchanted_ally' || ent.type === 'mirror_image') && !ent.dead) {
                        const dist = Math.hypot(ent.x - e.x, ent.y - e.y);
                        if (dist < targetDist) { targetDist = dist; target = ent; }
                    }
                });

                if (targetDist < 450 && targetDist > 45) {
                    const a = Math.atan2(target.y - e.y, target.x - e.x);
                    if (!this.isWall(e.x + Math.cos(a) * spd * dt, e.y)) e.x += Math.cos(a) * spd * dt;
                    if (!this.isWall(e.x, e.y + Math.sin(a) * spd * dt)) e.y += Math.sin(a) * spd * dt;

                    // Cultist Ranged Attack
                    if (e.enemyType === 'Cultist' && !e.dead && Math.random() < 0.02) {
                        game.projectiles.push(new Projectile(e.x, e.y, a, 'dark_missile', e, 15 + targetDist * 0.1, '#30336b', 'pulse', 'weaken'));
                    }
                }
                
                if (e.abilityCd > 0) e.abilityCd -= dt;
                else if (targetDist < 400) {
                    const ang = Math.atan2(target.y - e.y, target.x - e.x);
                    if (e.enemyType === 'Ogre' || e.enemyType === 'Magma Ogre') {
                        if (Math.random() < 0.5) { 
                            game.particles.push({ x: e.x, y: e.y, life: 0.5, type: 'explosion', color: e.baseColor }); 
                            if (targetDist < 160) game.damageTarget(target, e, 35);
                            game.log(`${e.enemyType} Stomp!`); e.abilityCd = 5; 
                            if (e.enemyType === 'Magma Ogre') game.fieldEffects.push(new FieldEffect(e.x, e.y, 100, 3, 'fire_cloud', '#e67e22', 15, e));
                        } else { e.frenzy = true; setTimeout(() => e.frenzy = false, 2000); e.abilityCd = 6; game.log(`${e.enemyType} Rages!`); }
                    } else if (e.enemyType === 'Lich') {
                        if (Math.random() < 0.7) { 
                            game.projectiles.push(new Projectile(e.x, e.y, ang, 'shadowbolt', e, 30, '#9b59b6')); 
                            e.abilityCd = 3; 
                        } else { 
                            this.entities.push({ x: e.x + 50, y: e.y + 50, type: 'enemy', enemyType: 'Skeleton', hp: 70, maxHp: 70, dead: false, abilityCd: 2, baseColor: '#f1f2f6' }); 
                            game.log("Lich Summons!"); e.abilityCd = 10; 
                        }
                    } else if (e.enemyType === 'Ice Wraith') {
                        game.projectiles.push(new Projectile(e.x, e.y, ang, 'ice_spike', e, 25, '#70a1ff', 'dart', 'slow'));
                        e.abilityCd = 3;
                    } else if (e.enemyType === 'Giant Spider') {
                        game.projectiles.push(new Projectile(e.x, e.y, ang, 'web', e, 10, '#ecf0f1', 'orb', 'root'));
                        game.log("Spider Webs!"); e.abilityCd = 6;
                    } else if (e.enemyType === 'Void Reaver') {
                        e.x = target.x - Math.cos(ang) * 100; e.y = target.y - Math.sin(ang) * 100;
                        game.damageTarget(target, e, 20); game.log("Void Warp!"); e.abilityCd = 5;
                    } else if (e.enemyType === 'Chain Fiend') {
                        game.particles.push({ x: target.x, y: target.y, life: 0.5, type: 'spark', color: '#555' });
                        const intendedX = e.x + Math.cos(ang) * 80;
                        const intendedY = e.y + Math.sin(ang) * 80;
                        const safeDest = game.getSafePullDestination(e.x, e.y, intendedX, intendedY);
                        if (safeDest.x === e.x && safeDest.y === e.y) {
                            game.log('Chain Pull blocked by walls!');
                        } else {
                            target.x = safeDest.x;
                            target.y = safeDest.y;
                            game.log('Chain Pull!');
                        }
                        e.abilityCd = 7;
                        game.particles.push({ x: target.x, y: target.y, life: 0.5, type: 'spark', color: '#555' });
                    } else if (e.enemyType === 'Hydromancer') {
                        game.projectiles.push(new Projectile(e.x, e.y, ang, 'water_blast', e, 30, '#3498db', 'wave', 'knockback'));
                        e.abilityCd = 4;
                    } else if (e.enemyType === 'Banshee') {
                        game.particles.push({ x: e.x, y: e.y, life: 0.8, type: 'shockwave', color: '#ecf0f1' });
                        if (targetDist < 200) { target.fearTimer = 3; game.damageTarget(target, e, 15); }
                        game.log("Banshee Scream!"); e.abilityCd = 8;
                    } else if (e.enemyType === 'Animated Tome') {
                        game.projectiles.push(new Projectile(e.x, e.y, ang, 'arcane_missile', e, 12, '#a29bfe', 'pulse'));
                        e.abilityCd = 1.2;
                    } else if (e.enemyType === 'Fire Elemental') {
                        game.fieldEffects.push(new FieldEffect(e.x, e.y, 60, 4, 'fire_cloud', '#e67e22', 10, e));
                        e.abilityCd = 2;
                    } else if (e.enemyType === 'Scrap Drone') {
                        if (target && !target.dead && targetDist < 80) {
                            const targetHp = typeof target.hp === 'number' ? Math.max(0, target.hp) : 0;
                            const explosionDamage = Math.min(30, Math.max(10, Math.floor(targetHp * 0.4)));
                            if (explosionDamage > 0) {
                                game.damageTarget(target, e, explosionDamage);
                            }
                            e.hp = 0;
                            game.killEnemy(e);
                            game.log("Drone Explosion!");
                        } else {
                            spd *= 2.5;
                            e.abilityCd = 0.1;
                        }
                    } else if (e.enemyType === 'Wraith') { 
                        if (targetDist < 110) { 
                            game.damageTarget(target, e, 12);
                            e.hp = Math.min(e.maxHp, e.hp + 15); game.log("Soul Drain!"); e.abilityCd = 4; 
                        } else { 
                            e.x = target.x + Math.random() * 120 - 60; e.y = target.y + Math.random() * 120 - 60; e.abilityCd = 6; 
                        } 
                    }
                    else if (e.enemyType === 'Ghoul') { e.frenzy = true; setTimeout(() => e.frenzy = false, 3000); e.abilityCd = 10; game.log("Ghoul Frenzy!"); }
                }
                
                if (targetDist < 50 && Math.random() < 0.1) {
                    game.damageTarget(target, e, (e.frenzy ? 35 : 18) * dt);
                }
            }

            // Enchanted ally AI
            if (e.type === 'enchanted_ally' && !e.dead) {
                let nearest: any = null; let minDist = 600;
                this.entities.forEach(other => {
                    if (other.type === 'enemy' && !other.dead) {
                        const d2 = Math.hypot(other.x - e.x, other.y - e.y);
                        if (d2 < minDist) { minDist = d2; nearest = other; }
                    }
                });

                let spd = 170;
                if (e.enemyType === 'Wraith') spd = 270;
                else if (e.enemyType === 'Ogre') spd = 130;
                else if (e.enemyType === 'Slime') spd = 150;
                else if (e.enemyType === 'Earth Golem') spd = 80;
                else if (e.enemyType === 'Cultist') spd = 200;
                if (e.frenzy) spd *= 1.8;

                if (nearest) {
                    const ang = Math.atan2(nearest.y - e.y, nearest.x - e.x);
                    if (minDist > 45) {
                        if (!this.isWall(e.x + Math.cos(ang) * spd * dt, e.y)) e.x += Math.cos(ang) * spd * dt;
                        if (!this.isWall(e.x, e.y + Math.sin(ang) * spd * dt)) e.y += Math.sin(ang) * spd * dt;
                    }

                    // Ally Abilities
                    if (e.abilityCd > 0) e.abilityCd -= dt;
                    else if (minDist < 350) {
                        if (e.enemyType === 'Ogre') {
                            if (Math.random() < 0.5) { 
                                game.particles.push({ x: e.x, y: e.y, life: 0.5, type: 'explosion', color: '#8d6e63' }); 
                                if (minDist < 160) { nearest.hp -= 35; if (nearest.hp <= 0) game.killEnemy(nearest); }
                                e.abilityCd = 5; 
                            } else { e.frenzy = true; setTimeout(() => e.frenzy = false, 1500); e.abilityCd = 6; }
                        } else if (e.enemyType === 'Lich') {
                            if (Math.random() < 0.7) { 
                                game.projectiles.push(new Projectile(e.x, e.y, ang, 'shadowbolt', e, 25, '#9b59b6')); 
                                e.abilityCd = 3; 
                            } else { 
                                this.entities.push({ x: e.x + 50, y: e.y + 50, type: 'enchanted_ally', enemyType: 'Skeleton', hp: 60, maxHp: 60, dead: false, abilityCd: 2, baseColor: '#4caf50' }); 
                                e.abilityCd = 9; 
                            }
                        } else if (e.enemyType === 'Cultist' && Math.random() < 0.05) {
                            game.projectiles.push(new Projectile(e.x, e.y, ang, 'dark_missile', e, 15, '#30336b', 'pulse', 'weaken'));
                            e.abilityCd = 1;
                        } else if (e.enemyType === 'Wraith') { 
                            if (minDist < 110) { 
                                nearest.hp -= 12; if (nearest.hp <= 0) game.killEnemy(nearest);
                                e.hp = Math.min(e.maxHp, e.hp + 15); e.abilityCd = 4; 
                            } else { 
                                e.x = nearest.x + Math.random() * 120 - 60; e.y = nearest.y + Math.random() * 120 - 60; e.abilityCd = 6; 
                            } 
                        } else if (e.enemyType === 'Ghoul') { e.frenzy = true; setTimeout(() => e.frenzy = false, 3000); e.abilityCd = 10; }
                    }

                    if (minDist < 50 && Math.random() < 0.1) {
                        nearest.hp -= (e.frenzy ? 35 : 18) * dt;
                        if (nearest.hp <= 0) game.killEnemy(nearest);
                    }

                } else {
                    // Follow player if no enemies
                    const ang = Math.atan2(game.player.y - e.y, game.player.x - e.x);
                    const followDist = Math.hypot(game.player.x - e.x, game.player.y - e.y);
                    if (followDist > 80) {
                        if (!this.isWall(e.x + Math.cos(ang) * spd * dt, e.y)) e.x += Math.cos(ang) * spd * dt;
                        if (!this.isWall(e.x, e.y + Math.sin(ang) * spd * dt)) e.y += Math.sin(ang) * spd * dt;
                    }
                }
            }

            // Party member AI
            if (e.type === 'party_member' && !e.dead) {
                let nearest: any = null; let minDist = 600;
                this.entities.forEach(other => { if (other.type === 'enemy' && !other.dead) { const d2 = Math.hypot(other.x - e.x, other.y - e.y); if (d2 < minDist) { minDist = d2; nearest = other; } } });
                
                const spd = 200;
                if (nearest) {
                    const ang = Math.atan2(nearest.y - e.y, nearest.x - e.x);
                    if (minDist > 50) {
                        if (!this.isWall(e.x + Math.cos(ang) * spd * dt, e.y)) e.x += Math.cos(ang) * spd * dt;
                        if (!this.isWall(e.x, e.y + Math.sin(ang) * spd * dt)) e.y += Math.sin(ang) * spd * dt;
                    } else {
                        nearest.hp -= e.damage * dt; if (nearest.hp <= 0) game.killEnemy(nearest);
                    }
                } else {
                    const ang = Math.atan2(game.player.y - e.y, game.player.x - e.x);
                    const d3 = Math.hypot(game.player.x - e.x, game.player.y - e.y);
                    if (d3 > 100) {
                        if (!this.isWall(e.x + Math.cos(ang) * spd * dt, e.y)) e.x += Math.cos(ang) * spd * dt;
                        if (!this.isWall(e.x, e.y + Math.sin(ang) * spd * dt)) e.y += Math.sin(ang) * spd * dt;
                    }
                }
            }

            // Mirror image AI
            if (e.type === 'mirror_image' && !e.dead) {
                e.lifeTimer -= dt;
                if (e.lifeTimer <= 0) { e.dead = true; game.mirrorImage = null; game.log('Mirror Image fades...'); return; }
                let nearest: any = null; let minDist = 600;
                this.entities.forEach(other => {
                    if (other.type === 'enemy' && !other.dead) {
                        const d2 = Math.hypot(other.x - e.x, other.y - e.y);
                        if (d2 < minDist) { minDist = d2; nearest = other; }
                    }
                });
                if (nearest) {
                    const ang = Math.atan2(nearest.y - e.y, nearest.x - e.x);
                    if (minDist > 40) {
                        if (!this.isWall(e.x + Math.cos(ang) * 280 * dt, e.y)) e.x += Math.cos(ang) * 280 * dt;
                        if (!this.isWall(e.x, e.y + Math.sin(ang) * 280 * dt)) e.y += Math.sin(ang) * 280 * dt;
                    } else {
                        nearest.hp -= e.damage * dt; if (nearest.hp <= 0) game.killEnemy(nearest);
                    }
                } else {
                    // Wander randomly
                    const ang = Math.random() * Math.PI * 2;
                    if (!this.isWall(e.x + Math.cos(ang) * 150 * dt, e.y)) e.x += Math.cos(ang) * 150 * dt;
                }
            }
        });
    }
    draw(ctx: CanvasRenderingContext2D) {
        for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
            const f = this.fog[y][x]; if (f === 0) continue;
            const t = this.tiles[y][x];
            const localBiome = this.biomeMap[y][x];
            const b = BIOME_DB[localBiome];
            
            // Biome specific colors
            if (t === 1) ctx.fillStyle = b.wall; // Solid wall
            else if (t === 2) ctx.fillStyle = '#4e342e'; // Locked door
            else if (t === 3) ctx.fillStyle = b.floor; // Unlocked door
            else ctx.fillStyle = b.floor; // Floor
            
            if (f === 1) ctx.globalAlpha = 0.4;
            ctx.fillRect(x * 64, y * 64, 64, 64);
            
            // Biome Decorations (Phase 20: Stable Seeds)
            if (f === 2 && t === 1) { // Visible walls
                const seed = (x * 7 + y * 13) % 100;
                if (b.decor === 'moss') {
                    if (seed % 5 === 0) { ctx.fillStyle = '#2d4a22'; ctx.fillRect(x * 64 + 10, y * 64 + 10, 20, 10); }
                } else if (b.decor === 'lava') {
                    if (seed % 7 === 0) { ctx.fillStyle = '#e74c3c'; ctx.globalAlpha = 0.6; ctx.fillRect(x * 64, y * 64 + 32, 64, 4); ctx.globalAlpha = 1; }
                } else if (b.decor === 'frost') {
                    if (seed % 4 === 0) { ctx.fillStyle = '#ebf5fb'; ctx.globalAlpha = 0.3; ctx.fillRect(x * 64 + 40, y * 64, 4, 32); ctx.globalAlpha = 1; }
                } else if (b.decor === 'void') {
                    if (Math.sin(Date.now() * 0.002 + x) > 0.8) { ctx.fillStyle = '#8e44ad'; ctx.globalAlpha = 0.2; ctx.fillRect(x * 64, y * 64, 64, 64); ctx.globalAlpha = 1; }
                } else if (b.decor === 'books') {
                    ctx.fillStyle = '#5d4037'; ctx.fillRect(x * 64 + 4, y * 64 + 4, 56, 8);
                    ctx.fillStyle = '#8b4513'; ctx.fillRect(x * 64 + 4, y * 64 + 16, 56, 8);
                } else if (b.decor === 'gold') {
                    if (seed % 6 === 0) { ctx.fillStyle = '#f1c40f'; ctx.fillRect(x * 64 + 20, y * 64 + 20, 8, 8); }
                } else if (b.decor === 'gears') {
                    if (seed % 6 === 0) { ctx.strokeStyle = '#d35400'; ctx.beginPath(); ctx.arc(x * 64 + 32, y * 64 + 32, 10, 0, Math.PI * 2); ctx.stroke(); }
                } else if (b.decor === 'chains') {
                    if (x % 4 === 0) { ctx.fillStyle = '#555'; ctx.fillRect(x * 64 + 30, y * 64, 4, 64); }
                } else if (b.decor === 'toxic') {
                    if (seed % 10 === 0) { ctx.fillStyle = '#2ecc71'; ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(x * 64 + 32, y * 64 + 32, 15, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
                } else if (b.decor === 'stars') {
                    if (seed % 8 === 0) { ctx.fillStyle = '#fff'; ctx.fillRect(x * 64 + (seed % 60), y * 64 + (seed % 60), 2, 2); }
                }
            }

            if (t === 2) { ctx.strokeStyle = '#c5a059'; ctx.lineWidth = 4; ctx.strokeRect(x * 64 + 8, y * 64 + 8, 48, 48); ctx.fillStyle = '#c5a059'; ctx.font = '24px Arial'; ctx.fillText('🔒', x * 64 + 18, y * 64 + 40); }
            ctx.globalAlpha = 1;
        }
        this.entities.forEach(e => {
            if (this.fog[Math.floor(e.y / 64)][Math.floor(e.x / 64)] !== 2 || (e.dead && e.type !== 'corpse')) return;
            if (e.type === 'enemy' || e.type === 'enchanted_ally') {
                // Enhanced color fallback to prevent reverting to red
                if (!e.baseColor) {
                    if (e.enemyType === 'Skeleton') e.baseColor = '#f1f2f6';
                    else if (e.enemyType === 'Ogre') e.baseColor = '#a38148';
                    else if (e.enemyType === 'Slime') e.baseColor = '#7bed9f';
                    else if (e.enemyType === 'Wraith') e.baseColor = '#747d8c';
                    else if (e.enemyType === 'Cultist') e.baseColor = '#30336b';
                    else if (e.enemyType === 'Lich') e.baseColor = '#a29bfe';
                    else e.baseColor = '#ff4757';
                }
                // Petrified: override color to gray stone
                if (e.petrifiedTimer > 0) {
                    ctx.fillStyle = '#6b6b6b';
                } else {
                    ctx.fillStyle = e.baseColor;
                }
                if (e.hp < e.maxHp) {
                    ctx.save();
                    ctx.fillStyle = '#000'; ctx.fillRect(e.x - 30, e.y - 55, 60, 9);
                    ctx.fillStyle = e.type === 'enchanted_ally' ? '#4caf50' : '#f44336';
                    ctx.fillRect(e.x - 30, e.y - 55, (e.hp / e.maxHp) * 60, 9);
                    ctx.restore();
                }

                // Status effects rings
                if (e.slowTimer > 0) { ctx.strokeStyle = '#3498db'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(e.x, e.y, 35, 0, Math.PI * 2); ctx.stroke(); }
                if (e.fearTimer > 0) { ctx.strokeStyle = '#a29bfe'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e.x, e.y, 40, 0, Math.PI * 2); ctx.stroke(); }
                if (e.rootTimer > 0) { ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(e.x, e.y, 30, 0, Math.PI * 2); ctx.stroke(); }
                if (e.burnTimer > 0) { ctx.strokeStyle = '#e67e22'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, 45, 0, Math.PI * 2); ctx.stroke(); }
                if (e.poisonTimer > 0) { ctx.strokeStyle = '#27ae60'; ctx.lineWidth = 3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(e.x, e.y, 38, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
                if (e.blindTimer > 0) { ctx.strokeStyle = '#f5f6fa'; ctx.lineWidth = 2; ctx.setLineDash([8, 4]); ctx.beginPath(); ctx.arc(e.x, e.y, 42, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
                if (e.cursedTimer > 0) { ctx.strokeStyle = '#95afc0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, 33, 0, Math.PI * 2); ctx.stroke(); }
                // Petrified: stone cracks hexagonal outline
                if (e.petrifiedTimer > 0) {
                    ctx.strokeStyle = '#444'; ctx.lineWidth = 3;
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const a = (i / 6) * Math.PI * 2;
                        const px = e.x + Math.cos(a) * 32, py = e.y + Math.sin(a) * 32;
                        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                    ctx.closePath(); ctx.stroke();
                    // Crack lines
                    ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(e.x - 8, e.y - 12); ctx.lineTo(e.x + 4, e.y); ctx.lineTo(e.x - 2, e.y + 10); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(e.x + 6, e.y - 8); ctx.lineTo(e.x + 12, e.y + 6); ctx.stroke();
                }
                if (e.carriesKey) { ctx.fillStyle = '#f9ca24'; ctx.beginPath(); ctx.arc(e.x, e.y - 40, 6, 0, Math.PI * 2); ctx.fill(); }
            } else if (e.type === 'party_member' || e.type === 'recruitable_npc') {
                ctx.fillStyle = e.color || '#f1c40f';
                ctx.beginPath(); ctx.arc(e.x, e.y, 25, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                // Draw Icon
                ctx.fillStyle = '#fff'; ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(e.icon || '👤', e.x, e.y);
                // HP Bar
                ctx.fillStyle = '#000'; ctx.fillRect(e.x - 25, e.y - 45, 50, 6);
                ctx.fillStyle = '#4caf50'; ctx.fillRect(e.x - 25, e.y - 45, (e.hp / e.maxHp) * 50, 6);
            } else if (e.type === 'mirror_image') {
                // Draw as a translucent copy of the player
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = e.color || '#f39c12'; ctx.beginPath(); ctx.arc(e.x, e.y, 25, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#a29bfe'; ctx.lineWidth = 2; ctx.stroke();
                ctx.globalAlpha = 1;
                // HP bar
                if (e.hp < e.maxHp) {
                    ctx.fillStyle = '#000'; ctx.fillRect(e.x - 20, e.y - 40, 40, 5);
                    ctx.fillStyle = '#a29bfe'; ctx.fillRect(e.x - 20, e.y - 40, (e.hp / e.maxHp) * 40, 5);
                }
            } else if (e.type === 'npc') ctx.fillStyle = '#43a047';
            else if (e.type === 'item_drop') ctx.fillStyle = '#f9ca24';
            else if (e.isCorpse) ctx.fillStyle = '#3e2723';
            else if (e.type === 'chest') ctx.fillStyle = e.isSpecial ? '#f9ca24' : '#ffa000';
            else ctx.fillStyle = '#fff';

            if (e.type.includes('stairs')) ctx.fillRect(e.x - 32, e.y - 32, 64, 64);
            else {
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.type === 'item_drop' ? 12 : (e.isCorpse ? 20 : 28), 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    spawnMerchant(rx: number, ry: number, d: number) {
        const stock: Item[] = [];
        for (let j = 0; j < 8; j++) stock.push(...getRandomLoot(d, 1200 + d * 150));
        if (Math.random() < 0.7) stock.push(getRandomSpellbook(d));
        const sortedStock = stock.slice(0, 10).sort((a, b) => {
            const types = ['weapon', 'helmet', 'chestplate', 'leggings', 'boots', 'potion', 'spellbook'];
            return types.indexOf(a.type) - types.indexOf(b.type);
        });
        this.entities.push({ x: rx * 64 + 32, y: ry * 64 + 32, type: 'npc', name: 'Merchant', inventory: sortedStock, dead: false });
    }
    spawnGodMerchant() {
        // Find a clear spot near spawn
        const gx = Math.floor(this.spawnX / 64) + 2;
        const gy = Math.floor(this.spawnY / 64);
        if (this.tiles[gy][gx] === 1) this.tiles[gy][gx] = 0; // Force clear floor

        const allItems = Object.values(ITEM_POOL).filter(it => it.id !== 'start_dagger');
        // Sort items by type for better shop organization
        allItems.sort((a, b) => {
            const types = ['weapon', 'helmet', 'chestplate', 'leggings', 'boots', 'potion', 'spellbook', 'key'];
            return types.indexOf(a.type) - types.indexOf(b.type);
        });

        this.entities.push({
            x: gx * 64 + 32,
            y: gy * 64 + 32,
            type: 'npc',
            name: 'God Merchant',
            inventory: allItems,
            dead: false
        });
    }
    isWall(x: number, y: number) { const tx = Math.floor(x / 64), ty = Math.floor(y / 64); if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return true; return this.tiles[ty][tx] === 1 || this.tiles[ty][tx] === 2; }
}

class Player {
    x: number; y: number; hp: number; maxHp: number; xp: number; level: number; gold: number; ac: number;
    color: string = '#f39c12';
    manaShieldTimer: number = 0;
    portalCooldown: number = 0;
    hasteTimer: number = 0;
    etherealTimer: number = 0;
    parryTimer: number = 0;
    warCryTimer: number = 0;
    skillPoints: number = 0;
    activeQuest: Quest | null = null;
    unlockedSkills: Set<string> = new Set(['basic_attack']);
    meleeSlots: { [action: string]: string | null } = { 'melee1': null, 'melee2': null, 'melee3': null, 'melee4': null };
    meleeCooldowns: { [key: string]: number } = {};
    equipment: { helmet: Item | null, chestplate: Item | null, leggings: Item | null, boots: Item | null, weapon: Item | null } = { helmet: null, chestplate: null, leggings: null, boots: null, weapon: null };
    inventory: (Item | null)[] = Array(20).fill(null);
    hotbar: (string | null)[] = ['magic_missile', null, null, null, null, null, null, null];
    learnedSpells: Set<string> = new Set(['magic_missile']); cooldowns: { [key: string]: number } = {};
    swingTime: number = 0; swingAngle: number = 0;
    rootTimer: number = 0; slowTimer: number = 0; burnTimer: number = 0; burnDamage: number = 0;
    poisonTimer: number = 0; poisonDamage: number = 0; weakenTimer: number = 0; blindTimer: number = 0;
    constructor(x: number, y: number, color: string = '#f39c12') {
        this.x = x; this.y = y; this.hp = 100; this.maxHp = 100; this.xp = 0; this.level = 1; this.gold = 50; this.ac = 0;
        this.color = color;
        this.addItem({ ...ITEM_POOL['start_dagger'] });
        const it = this.inventory[0]; if (it) { (this.equipment as any).weapon = it; this.inventory[0] = null; }
    }
    addItem(it: Item) { const idx = this.inventory.findIndex(s => s === null); if (idx !== -1) { this.inventory[idx] = it; return true; } return false; }
    useItem(idx: number, game: Game) {
        const it = this.inventory[idx]; if (!it) return;
        if (it.id === 'gold_pile') {
            this.gold += it.value;
            game.trackQuestProgress('gold', undefined, it.value);
            this.inventory[idx] = null;
            game.log(`Collected ${it.value} gold!`);
        }
        else if (it.type === 'potion') {
            if (it.id === 'health_potion') this.hp = Math.min(this.maxHp, this.hp + it.value);
            else if (it.id === 'mana_potion') Object.keys(this.cooldowns).forEach(k => this.cooldowns[k] = Math.max(0, this.cooldowns[k] - it.value));
            this.inventory[idx] = null;
        }
        else if (it.type === 'spellbook') {
            const sId = it.id.replace('spellbook_', '');
            if (sId === 'fireball' && this.level < 3) { game.log("You must be Level 3 to learn Fireball."); return; }
            if (!this.learnedSpells.has(sId)) {
                this.learnedSpells.add(sId);
                const empty = this.hotbar.indexOf(null);
                if (empty !== -1) this.hotbar[empty] = sId;
                game.log(`Learned ${sId}!`);
            }
            this.inventory[idx] = null;
        }
        else if (it.type === 'key') {
            game.log(`This is the ${it.name}. Use it near a locked vault door to unlock it.`);
        }
        else if (['helmet', 'chestplate', 'leggings', 'boots', 'weapon'].includes(it.type)) {
            const key = it.type as keyof Player['equipment'];
            const old = this.equipment[key];
            this.equipment[key] = it;
            this.inventory[idx] = null;
            if (old) this.addItem(old);
            this.calculateAC();
        }
        game.hideTT();
    }
    unlockSkill(skillId: string, tree: 'melee' | 'spell', game: Game) {
        const treeData = tree === 'melee' ? MELEE_SKILL_TREE : SPELL_SKILL_TREE;
        const node = treeData[skillId];
        if (!node) return;

        // Validation
        if (this.unlockedSkills.has(skillId)) return;
        if (this.skillPoints < node.cost) { game.log("Not enough skill points!"); return; }
        const hasReqs = node.requires.every(req => this.unlockedSkills.has(req));
        if (!hasReqs) { game.log("Prerequisites not met!"); return; }

        // Unlock
        this.skillPoints -= node.cost;
        this.unlockedSkills.add(skillId);
        game.log(`Unlocked Skill: ${node.name}!`);
        
        // Assign if applicable
        if (node.type === 'spell' && !this.learnedSpells.has(skillId)) {
            if (SPELL_DB[skillId]) {
                this.learnedSpells.add(skillId);
                const empty = this.hotbar.indexOf(null);
                if (empty !== -1) this.hotbar[empty] = skillId;
            }
        } else if (node.type === 'melee') {
            const emptyAction = Object.keys(this.meleeSlots).find(a => this.meleeSlots[a] === null);
            if (emptyAction) {
                this.meleeSlots[emptyAction] = skillId;
                game.updateHUD(); // Ensure UI updates
            }
        }

        game.renderSkillTree(tree);
    }



    unequip(t: string, game: Game) {
        const key = t as keyof Player['equipment'];
        const it = this.equipment[key];
        if (it && this.addItem(it)) {
            this.equipment[key] = null;
            this.calculateAC();
            game.renderInventory();
        }
    }
    calculateAC() { let n = 10; Object.values(this.equipment).forEach(v => { if (v && v.type !== 'weapon') n += v.value; }); this.ac = n; }
    update(dt: number, input: InputHandler, level: Level, game: Game) {
        if (this.hp <= 0) return;
        
        // Status Timers (Phase 20)
        if (this.rootTimer > 0) this.rootTimer -= dt;
        if (this.slowTimer > 0) this.slowTimer -= dt;
        if (this.burnTimer > 0) { this.burnTimer -= dt; this.hp -= this.burnDamage * dt; }
        if (this.poisonTimer > 0) { this.poisonTimer -= dt; this.hp -= this.poisonDamage * dt; }
        if (this.weakenTimer > 0) this.weakenTimer -= dt;
        if (this.blindTimer > 0) this.blindTimer -= dt;

        if (this.manaShieldTimer > 0) {
            this.manaShieldTimer -= dt;
            // Continuous cooldown reset during Mana Shield
            Object.keys(this.cooldowns).forEach(k => this.cooldowns[k] = 0);
        }
        if (this.portalCooldown > 0) this.portalCooldown -= dt;
        if (this.hasteTimer > 0) this.hasteTimer -= dt;
        if (this.etherealTimer > 0) this.etherealTimer -= dt;
        if (this.parryTimer > 0) this.parryTimer -= dt;
        if (this.warCryTimer > 0) this.warCryTimer -= dt;
        Object.keys(this.cooldowns).forEach(k => { if (this.cooldowns[k] > 0) this.cooldowns[k] -= dt; });
        Object.keys(this.meleeCooldowns).forEach(k => { if (this.meleeCooldowns[k] > 0) this.meleeCooldowns[k] -= dt; });
        if (this.swingTime > 0) this.swingTime -= dt;

        let dx = 0, dy = 0;
        if (input.isDown(game.keyBinds['moveUp'])) { dx--; dy--; }
        if (input.isDown(game.keyBinds['moveDown'])) { dx++; dy++; }
        if (input.isDown(game.keyBinds['moveLeft'])) { dx--; dy++; }
        if (input.isDown(game.keyBinds['moveRight'])) { dx++; dy--; }
        
        // Base Speed Adjustments
        let moveSpeed = 450;
        if (this.hasteTimer > 0) moveSpeed *= 1.8;
        if (this.etherealTimer > 0) moveSpeed *= 2.2;
        if (this.slowTimer > 0) moveSpeed *= 0.5;
        if (this.rootTimer > 0) moveSpeed = 0;

        if (dx !== 0 || dy !== 0) { const m = Math.hypot(dx, dy), mx = (dx / m) * moveSpeed * dt, my = (dy / m) * moveSpeed * dt; if (!level.isWall(this.x + mx, this.y)) this.x += mx; if (!level.isWall(this.x, this.y + my)) this.y += my; }

        for (let i = 0; i < 8; i++) {
            if (input.isDown(game.keyBinds[`spell${i + 1}`])) {
                const sId = this.hotbar[i];
                if (sId && !this.cooldowns[sId]) {
                    const s = SPELL_DB[sId];
                    if (s.type === 'projectile') game.projectiles.push(new Projectile(this.x, this.y, Math.atan2(input.mousePosWorld.y - this.y, input.mousePosWorld.x - this.x), s.id, this, s.damage, s.color, s.projectileShape, s.effect));
                    else if (s.id === 'heal') this.hp = Math.min(this.maxHp, this.hp + s.damage);
                    this.cooldowns[sId] = s.cooldown;
                }
            }
        }

        // --- MELEE ABILITY INPUT HANDLING ---
        ['melee1', 'melee2', 'melee3', 'melee4'].forEach(action => {
            if (input.isDown(game.keyBinds[action])) {
                const aId = this.meleeSlots[action];
                if (aId && (!this.meleeCooldowns[aId] || this.meleeCooldowns[aId] <= 0)) {
                    this.useMeleeAbility(aId, input, level, game);
                }
            }
        });

        const lClick = input.consumeClick();
        const rClick = input.consumeClick(true);
        if (lClick || rClick) {
            const tx = Math.floor(input.mousePosWorld.x / 64), ty = Math.floor(input.mousePosWorld.y / 64);
            if (rClick && level.tiles[ty][tx] === 2 && Math.hypot(this.x - input.mousePosWorld.x, this.y - input.mousePosWorld.y) < 150) {
                const keyIdx = this.inventory.findIndex(it => it && it.type === 'key');
                if (keyIdx !== -1) { level.tiles[ty][tx] = 3; this.inventory[keyIdx] = null; game.log("Door unlocked!"); }
                else game.log("This door is locked. You need a key.");
                return;
            }

            const t = level.entities.find(e => {
                const dist = Math.hypot(e.x - input.mousePosWorld.x, e.y - input.mousePosWorld.y);
                const clickRange = (e.type === 'corpse' || e.isCorpse) ? 40 : 75;
                return dist < clickRange && (!e.dead || e.isCorpse || e.type === 'corpse');
            });

            if (t && Math.hypot(this.x - t.x, this.y - t.y) < 180 && rClick) {
                if (['npc', 'recruitable_npc', 'chest', 'stairs-down', 'stairs-up'].includes(t.type) || t.isCorpse) {
                    if (t.type === 'stairs-down') game.goToLevel(game.currentDepth + 1, true);
                    else if (t.type === 'stairs-up') game.goToLevel(game.currentDepth - 1, false);
                    else game.openInteraction(t);
                    return;
                }
            }

            if (lClick && this.swingTime <= 0 && !game.isPaused) {
                const weapon = this.equipment.weapon;
                if (weapon && weapon.name.includes('Oathbow')) {
                    const angle = Math.atan2(input.mousePosWorld.y - this.y, input.mousePosWorld.x - this.x);
                    game.projectiles.push(new Projectile(this.x, this.y, angle, 'player', this, weapon.value, '#f1c40f', 'bolt'));
                    this.swingTime = 0.5;
                } else {
                    let range = 64;
                    if (weapon) {
                        const n = weapon.name.toLowerCase();
                        if (n.includes('spear') || n.includes('halberd') || n.includes('pike')) range = 220;
                        else if (n.includes('sword') || n.includes('claymore') || n.includes('blade')) range = 130;
                        else if (n.includes('dagger') || n.includes('knife')) range = 75;
                    }
                    this.swingTime = 0.3;
                    this.swingAngle = Math.atan2(input.mousePosWorld.y - this.y, input.mousePosWorld.x - this.x);
                    level.entities.forEach(e => {
                        if (e.type === 'enemy' && !e.dead) {
                            const dist = Math.hypot(this.x - e.x, this.y - e.y);
                            if (dist < range) {
                                let blocked = false;
                                for (let i = 0.2; i <= 1.0; i += 0.2) if (level.isWall(this.x + (e.x - this.x) * i, this.y + (e.y - this.y) * i)) { blocked = true; break; }
                                if (!blocked) {
                                    let diff = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - this.swingAngle);
                                    if (diff > Math.PI) diff = 2 * Math.PI - diff;
                                    if (diff < 0.8) { e.hp -= (weapon?.value || 10) + this.level * 3; game.particles.push({ x: e.x, y: e.y, life: 0.3, type: 'spark', color: '#ff5252' }); if (e.hp <= 0) game.killEnemy(e); }
                                }
                            }
                        }
                    });
                }
            }
        }
        if (this.xp >= this.level * 1000) {
            this.level++;
            this.skillPoints++; // Grant Skill Point
            this.maxHp += 20;
            this.hp = this.maxHp;
            game.log(`Level ${this.level}! You gained a Skill Point!`);
            if (this.level === 3) {
                const book = { ...ITEM_POOL['spellbook_fireball'] };
                this.addItem(book);
                game.log("Level 3 achievement: A Fireball spellbook!");
            }
        }
    }
    getDisplayColor() {
        if (this.color === 'rainbow') {
            const hue = (performance.now() / 15) % 360;
            return `hsl(${hue}, 100%, 70%)`;
        }
        return this.color;
    }
    draw(ctx: CanvasRenderingContext2D, game: Game) {
        ctx.save();
        // Ethereal form glow
        if (this.etherealTimer > 0) {
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.15;
            ctx.shadowBlur = 40; ctx.shadowColor = '#d1d8e0';
            ctx.fillStyle = '#d1d8e0'; ctx.beginPath(); ctx.arc(this.x, this.y, 35, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 0.7;
        }
        // Haste speed lines
        if (this.hasteTimer > 0) {
            ctx.strokeStyle = '#81ecec'; ctx.lineWidth = 2; ctx.globalAlpha = 0.4;
            for (let i = 0; i < 4; i++) {
                const ox = (Math.random() - 0.5) * 30, oy = (Math.random() - 0.5) * 30;
                ctx.beginPath(); ctx.moveTo(this.x + ox - 20, this.y + oy); ctx.lineTo(this.x + ox + 20, this.y + oy); ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = this.getDisplayColor(); ctx.beginPath(); ctx.arc(this.x, this.y, 25, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
        const weapon = this.equipment.weapon;
        const isBow = weapon && weapon.name.toLowerCase().includes('bow');
        if (this.swingTime > 0 && !isBow) {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.swingTime / 0.3})`;
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 80, this.swingAngle - 1, this.swingAngle + 1);
            ctx.stroke();
            ctx.restore();
        }
    }

    useMeleeAbility(id: string, input: InputHandler, level: Level, game: Game) {
        const a = MELEE_ABILITY_DB[id];
        if (!a) return;
        this.meleeCooldowns[id] = a.cooldown;
        
        const m = input.mousePosWorld;
        const angleToMouse = Math.atan2(m.y - this.y, m.x - this.x);

        if (id === 'quick_strike') {
            this.swingTime = 0.15; // Rapid swing
            this.swingAngle = angleToMouse;
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    let diff = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - angleToMouse);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff;
                    if (diff < 0.8) {
                        e.hp -= a.damage + this.level * 2;
                        game.particles.push({ x: e.x, y: e.y, life: 0.2, type: 'spark', color: a.color });
                        if (e.hp <= 0) game.killEnemy(e);
                    }
                }
            });
            game.log("Quick Strike!");
        }
        else if (id === 'rend') {
            this.swingTime = 0.3;
            this.swingAngle = angleToMouse;
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    let diff = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - angleToMouse);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff;
                    if (diff < 0.8) {
                        e.hp -= a.damage;
                        e.poisonTimer = 6; // Bleed effect
                        e.poisonDamage = 15;
                        game.particles.push({ x: e.x, y: e.y, life: 0.4, type: 'spark', color: a.color });
                        if (e.hp <= 0) game.killEnemy(e);
                    }
                }
            });
            game.log("Rend!");
        }
        else if (id === 'bloodbath') {
            game.particles.push({ x: this.x, y: this.y, life: 1.0, type: 'explosion', color: '#c0392b' });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    e.hp -= 30; // Direct damage
                    const heal = 15;
                    this.hp = Math.min(this.maxHp, this.hp + heal);
                    game.particles.push({ x: this.x, y: this.y, life: 0.5, type: 'spark', color: '#2ecc71' });
                    if (e.hp <= 0) game.killEnemy(e);
                }
            });
            game.log("Bloodbath! Healing initiated.");
        }
        else if (id === 'heavy_slam') {
            this.swingTime = 0.4;
            this.swingAngle = angleToMouse;
            game.particles.push({ x: this.x + Math.cos(angleToMouse) * 100, y: this.y + Math.sin(angleToMouse) * 100, life: 0.6, type: 'shockwave', color: a.color });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x + Math.cos(angleToMouse) * 100 - e.x, this.y + Math.sin(angleToMouse) * 100 - e.y) < a.range) {
                    e.hp -= a.damage;
                    const ka = Math.atan2(e.y - this.y, e.x - this.x);
                    e.x += Math.cos(ka) * 100; e.y += Math.sin(ka) * 100;
                    if (e.hp <= 0) game.killEnemy(e);
                }
            });
            game.log("Heavy Slam!");
        }
        else if (id === 'earthshaker') {
            game.particles.push({ x: this.x, y: this.y, life: 0.8, type: 'star_fissure', color: a.color });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    e.hp -= a.damage;
                    e.petrifiedTimer = 3; // Long stun
                    if (e.hp <= 0) game.killEnemy(e);
                }
            });
            game.log("EARTHSHAKER!");
        }
        else if (id === 'shockwave') {
            game.particles.push({ x: this.x, y: this.y, life: 0.5, type: 'explosion', color: a.color });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    e.hp -= a.damage;
                    const ka = Math.atan2(e.y - this.y, e.x - this.x);
                    e.x += Math.cos(ka) * 400; e.y += Math.sin(ka) * 400;
                    if (e.hp <= 0) game.killEnemy(e);
                }
            });
            game.log("Shockwave!");
        }
        else if (id === 'sweep') {
            this.swingTime = 0.3;
            this.swingAngle = angleToMouse;
            game.particles.push({ x: this.x, y: this.y, life: 0.4, type: 'cone', color: a.color, angle: angleToMouse });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    let diff = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - angleToMouse);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff;
                    if (diff < 1.2) {
                        e.hp -= a.damage;
                        if (e.hp <= 0) game.killEnemy(e);
                    }
                }
            });
            game.log("Sweeping Strike!");
        }
        else if (id === 'bladestorm') {
            this.swingTime = 1.0;
            const interval = setInterval(() => {
                if (!this.swingTime || this.swingTime <= 0) { clearInterval(interval); return; }
                this.swingAngle += 0.5;
                game.particles.push({ x: this.x, y: this.y, life: 0.2, type: 'spark', color: '#fff' });
                level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                        e.hp -= 20;
                        if (e.hp <= 0) game.killEnemy(e);
                    }
                });
            }, 100);
            game.log("Bladestorm unleashed!");
        }
        else if (id === 'fortress') {
            this.etherealTimer = 4.0; // Reuse ethereal for invulnerability
            game.log("FORTRESS! Damage immunity active.");
            game.particles.push({ x: this.x, y: this.y, life: 1.0, type: 'shockwave', color: a.color });
        }
        else if (id === 'dash_strike') {
            const dist = a.range;
            let targetX = this.x; let targetY = this.y;
            // Raycast dash to stop at walls
            for (let i = 0; i < dist; i += 10) {
                const nx = this.x + Math.cos(angleToMouse) * i;
                const ny = this.y + Math.sin(angleToMouse) * i;
                if (level.isWall(nx, ny)) break;
                targetX = nx; targetY = ny;
            }
            
            // Damage enemies in path
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead) {
                    const d = Math.hypot(e.x - this.x, e.y - this.y);
                    const enemyAngle = Math.atan2(e.y - this.y, e.x - this.x);
                    let diff = Math.abs(enemyAngle - angleToMouse);
                    while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
                    if (d < dist && diff < 0.3) {
                        let dmg = a.damage;
                        if (this.warCryTimer > 0) dmg *= 1.5;
                        e.hp -= dmg;
                        game.particles.push({ x: e.x, y: e.y, life: 0.3, type: 'spark', color: a.color });
                        if (e.hp <= 0) game.killEnemy(e);
                    }
                }
            });
            this.x = targetX; this.y = targetY;
            game.particles.push({ x: this.x, y: this.y, life: 0.5, type: 'explosion', color: a.color });
            game.log("Dash Strike!");
        }
        else if (id === 'ground_stomp') {
            game.particles.push({ x: this.x, y: this.y, life: 0.6, type: 'star_fissure', color: a.color });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    let dmg = a.damage;
                    if (this.warCryTimer > 0) dmg *= 1.5;
                    e.hp -= dmg;
                    e.petrifiedTimer = 2; // Stun for 2s
                    e.rootTimer = 0; // Override root
                    if (e.hp <= 0) game.killEnemy(e);
                }
            });
            game.log("Ground Stomp!");
        }
        else if (id === 'bleed_slash') {
            this.swingTime = 0.4;
            this.swingAngle = angleToMouse;
            game.particles.push({ x: this.x, y: this.y, life: 0.4, type: 'cone', color: a.color, angle: angleToMouse });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead) {
                    const dist = Math.hypot(this.x - e.x, this.y - e.y);
                    let diff = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - angleToMouse);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff;
                    if (dist < a.range && diff < 0.8) {
                        let dmg = a.damage;
                        if (this.warCryTimer > 0) dmg *= 1.5;
                        e.hp -= dmg;
                        e.poisonTimer = 4; // Use poisonTimer for bleed
                        e.poisonDamage = 15;
                        game.particles.push({ x: e.x, y: e.y, life: 0.5, type: 'spark', color: a.color });
                        if (e.hp <= 0) game.killEnemy(e);
                    }
                }
            });
            game.log("Bleed Slash!");
        }
        else if (id === 'whirlwind') {
            this.swingTime = 0.6;
            this.swingAngle = angleToMouse + Math.PI; // Full circle visual sweep implies spin
            game.particles.push({ x: this.x, y: this.y, life: 0.5, type: 'explosion', color: a.color });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    let dmg = a.damage;
                    if (this.warCryTimer > 0) dmg *= 1.5;
                    e.hp -= dmg;
                    game.particles.push({ x: e.x, y: e.y, life: 0.4, type: 'spark', color: '#fff' });
                    if (e.hp <= 0) game.killEnemy(e);
                }
            });
            game.log("Whirlwind!");
        }
        else if (id === 'shield_bash') {
            game.particles.push({ x: this.x + Math.cos(angleToMouse)*30, y: this.y + Math.sin(angleToMouse)*30, life: 0.5, type: 'explosion', color: a.color });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    let diff = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - angleToMouse);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff;
                    if (diff < 1.0) {
                        let dmg = a.damage;
                        if (this.warCryTimer > 0) dmg *= 1.5;
                        e.hp -= dmg;
                        const ka = Math.atan2(e.y - this.y, e.x - this.x);
                        e.x += Math.cos(ka) * 250; e.y += Math.sin(ka) * 250;
                        if (e.hp <= 0) game.killEnemy(e);
                    }
                }
            });
            game.log("Shield Bash!");
        }
        else if (id === 'leap_strike') {
            let targetX = m.x; let targetY = m.y;
            const dist = Math.hypot(m.x - this.x, m.y - this.y);
            const actualDist = Math.min(dist, a.range);
            targetX = this.x + Math.cos(angleToMouse) * actualDist;
            targetY = this.y + Math.sin(angleToMouse) * actualDist;
            
            if (!level.isWall(targetX, targetY)) {
                this.x = targetX; this.y = targetY;
            }
            game.particles.push({ x: this.x, y: this.y, life: 0.7, type: 'shockwave', color: a.color });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < 200) {
                    let dmg = a.damage;
                    if (this.warCryTimer > 0) dmg *= 1.5;
                    e.hp -= dmg;
                    if (e.hp <= 0) game.killEnemy(e);
                }
            });
            game.log("Leaping Strike!");
        }
        else if (id === 'execute') {
            this.swingTime = 0.3;
            this.swingAngle = angleToMouse;
            let hits = 0;
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead) {
                    if (Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                        let diff = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - angleToMouse);
                        if (diff > Math.PI) diff = 2 * Math.PI - diff;
                        if (diff < 0.6) {
                            let dmg = a.damage;
                            if (this.warCryTimer > 0) dmg *= 1.5;
                            if (e.hp < e.maxHp * 0.3) dmg *= 4; // Execute bonus
                            e.hp -= dmg;
                            game.particles.push({ x: e.x, y: e.y, life: 0.5, type: 'spark', color: a.color });
                            if (e.hp <= 0) game.killEnemy(e);
                            hits++;
                        }
                    }
                }
            });
            if (hits > 0) game.log("Execute!");
        }
        else if (id === 'parry') {
            this.parryTimer = 1.0; // 1 second parry window
            game.particles.push({ x: this.x, y: this.y, life: 1.0, type: 'shield_burst', color: a.color });
            game.log("Parry Stance!");
        }
        else if (id === 'war_cry') {
            this.warCryTimer = 5.0; // 5 seconds buff
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const runes = ['ᚱ', 'ᛏ', 'ᚢ', 'ᚨ', 'ᚲ', 'ᚷ'];
                    game.particles.push({ x: this.x + (Math.random()-0.5)*80, y: this.y + (Math.random()-0.5)*80, life: 1.0, type: 'rune_float', color: a.color, runeChar: runes[Math.floor(Math.random()*runes.length)] });
                }, i * 100);
            }
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                    e.fearTimer = 3;
                }
            });
            game.log("War Cry! Damage boosted!");
        }
        else if (id === 'hamstring') {
            this.swingTime = 0.3;
            this.swingAngle = angleToMouse;
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead) {
                    if (Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                        let diff = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - angleToMouse);
                        if (diff > Math.PI) diff = 2 * Math.PI - diff;
                        if (diff < 0.8) {
                            let dmg = a.damage;
                            if (this.warCryTimer > 0) dmg *= 1.5;
                            e.hp -= dmg;
                            e.slowTimer = 4; // Slow
                            game.particles.push({ x: e.x, y: e.y, life: 0.5, type: 'spark', color: a.color });
                            if (e.hp <= 0) game.killEnemy(e);
                        }
                    }
                }
            });
            game.log("Hamstring!");
        }
        else if (id === 'cleave') {
            this.swingTime = 0.5;
            this.swingAngle = angleToMouse;
            game.particles.push({ x: this.x, y: this.y, life: 0.5, type: 'cone', color: a.color, angle: angleToMouse });
            level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead) {
                    if (Math.hypot(this.x - e.x, this.y - e.y) < a.range) {
                        let diff = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - angleToMouse);
                        if (diff > Math.PI) diff = 2 * Math.PI - diff;
                        if (diff < 1.0) { // Wide arc
                            let dmg = a.damage;
                            if (this.warCryTimer > 0) dmg *= 1.5;
                            e.hp -= dmg;
                            game.particles.push({ x: e.x, y: e.y, life: 0.4, type: 'spark', color: '#fff' });
                            if (e.hp <= 0) game.killEnemy(e);
                        }
                    }
                }
            });
            game.log("Cleave!");
        }
    }
}

export class Game {
    canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; lastTime = 0; player: Player; level!: Level; camera: Camera; input: InputHandler; projectiles: Projectile[] = []; particles: any[] = []; fieldEffects: FieldEffect[] = []; isPaused = false;    isGameOver = false;
    mapZoom = 1;
    mapOffset = { x: 0, y: 0 };
    mapPins: { x: number, y: number }[] = [];
    isPanningMap = false;
    lastMousePos = { x: 0, y: 0 };
    keyBinds: Record<string, string> = {
        'moveUp': 'KeyW',
        'moveDown': 'KeyS',
        'moveLeft': 'KeyA',
        'moveRight': 'KeyD',
        'inventory': 'Tab',
        'map': 'KeyM',
        'skills': 'KeyK',
        'melee1': 'KeyQ',
        'melee2': 'KeyF',
        'melee3': 'KeyR',
        'melee4': 'KeyV',
        'pause': 'Space',
        'spell1': 'Digit1',
        'spell2': 'Digit2',
        'spell3': 'Digit3',
        'spell4': 'Digit4',
        'spell5': 'Digit5',
        'spell6': 'Digit6',
        'spell7': 'Digit7',
        'spell8': 'Digit8',
    };
 currentDepth = 1; levels: Map<number, Level> = new Map(); messageLog: string[] = ["Grand Expansion Initialized..."]; activeInteractingEntity: any = null; bufferedSpellSlot: number | null = null; selectedInvIdx: number | null = null;
    depthsWithVaults: Set<number> = new Set();
    activeMerchant: any = null;
    currentDialogue: string = "";
    shadowStepState: { p1: { x: number, y: number } | null } = { p1: null };
    portals: Portal[] = [];
    isSandbox: boolean = false;
    enchantedAlly: any = null;
    mirrorImage: any = null;
    party: any[] = [];
    availableLostAdventurerNames: string[] = [
        'Garrick Stormshield',
        'Elora Moonshadow',
        'Thane Emberfall',
        'Lyssa Vale',
        'Maera Frostgarde',
        'Derran Windrider',
        'Sabra Nightbloom',
        'Roland Ashwood',
        'Mira Spellwynn',
        'Tobin Ironhand'
    ];
    usedLostAdventurerNames: Set<string> = new Set();
    lostAdventurerTemplates: any[] = [
        {
            role: 'Wounded Vanguard',
            hp: 190,
            damage: 24,
            color: '#bdc3c7',
            icon: '🛡️',
            story: '“The eastern ramparts collapsed while we were retreating. I was the last to fall back, and I can still fight if you’ll have me.”',
            dialogueOptions: [
                { label: 'How did this happen?', response: '“Shadows swarmed us when the bridge broke. I barely escaped with my shield, but the rest are gone.”' },
                { label: 'Can you still hold the line?', response: '“Yes. My armor is cracked, but I can still stand fast and keep foes away from you.”' }
            ]
        },
        {
            role: 'Runic Initiate',
            hp: 130,
            damage: 32,
            color: '#3498db',
            icon: '🪄',
            story: '“I was tracing a failed spell circle when something ancient reached through the stones. I fled into these halls to hide.”',
            dialogueOptions: [
                { label: 'What did you summon?', response: '“Not a creature, but a memory. The circle cracked and something cold followed me; I barely escaped its gaze.”' },
                { label: 'Can you cast for us?', response: '“I can still call flames and wards. I need a bodyguard while I focus.”' }
            ]
        },
        {
            role: 'Shadow Strider',
            hp: 150,
            damage: 28,
            color: '#2c3e50',
            icon: '🗡️',
            story: '“I cut through patrols beneath the catacombs, but the maze turned against me. I can move unseen if you let me.”',
            dialogueOptions: [
                { label: 'What do you know of these halls?', response: '“The walls shift, but the old servants still listen. I can find traps and hidden doors.”' },
                { label: 'Will you fight with us?', response: '“I prefer the shadows, but I will strike from them to protect you.”' }
            ]
        },
        {
            role: 'Forest Warden',
            hp: 170,
            damage: 20,
            color: '#27ae60',
            icon: '🏹',
            story: '“The forest guard sent me in to recover a lost relic, but the undergrowth of stone grew too dense. I can still shoot true.”',
            dialogueOptions: [
                { label: 'What did you lose?', response: '“A wardstone that binds the grove. I need help finding it and escaping this place.”' },
                { label: 'How good is your aim?', response: '“Sharp. One arrow can stop a charging brute before it reaches you.”' }
            ]
        },
        {
            role: 'Boneguard Squire',
            hp: 180,
            damage: 22,
            color: '#95a5a6',
            icon: '⚔️',
            story: '“My squad was torn apart by the dead. I limped away to this dead corridor, but I am not finished yet.”',
            dialogueOptions: [
                { label: 'Do you have a mission?', response: '“I swore to avenge them. If you are willing to fight, I will stand with you.”' },
                { label: 'What are your strengths?', response: '“I can take hits and keep pressure on the enemy while you strike from behind.”' }
            ]
        }
    ];
    getLostAdventurerName() {
        const candidates = this.availableLostAdventurerNames.filter(name => !this.usedLostAdventurerNames.has(name));
        const name = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : `Wanderer ${Math.floor(Math.random() * 1000)}`;
        if (candidates.length) this.usedLostAdventurerNames.add(name);
        return name;
    }
    hasAvailableLostAdventurer() {
        return this.availableLostAdventurerNames.some(name => !this.usedLostAdventurerNames.has(name));
    }
    getLostAdventurerTemplate() {
        return this.lostAdventurerTemplates[Math.floor(Math.random() * this.lostAdventurerTemplates.length)];
    }
    getStarterGear(role: string) {
        const gear: Record<string, { equipment: any, inventory: Item[] }> = {
            'Wounded Vanguard': {
                equipment: {
                    helmet: { id: 'vanguard_helm', name: 'Vanguard Helm', type: 'helmet', value: 4, price: 40, icon: '⛑️', image: '', desc: 'A battered helm that still guards the head.', rarity: 'iron' },
                    chestplate: { id: 'vanguard_plate', name: 'Vanguard Plate', type: 'chestplate', value: 6, price: 60, icon: '🛡️', image: '', desc: 'A cracked breastplate with battle scars.', rarity: 'iron' },
                    leggings: null,
                    boots: { id: 'vanguard_boots', name: 'Vanguard Boots', type: 'boots', value: 3, price: 30, icon: '🥾', image: '', desc: 'Heavy boots that keep the wearer planted.', rarity: 'iron' },
                    weapon: { id: 'rusted_sword', name: 'Rusted Sword', type: 'weapon', value: 18, price: 70, icon: '🗡️', image: '', desc: 'A dull blade that still cuts deep.', rarity: 'iron' }
                },
                inventory: [{ id: 'health_potion', name: 'Health Potion', type: 'potion', value: 40, price: 30, icon: '🧪', image: '', desc: 'Restores health when used.', rarity: 'steel' }]
            },
            'Runic Initiate': {
                equipment: {
                    helmet: { id: 'initiate_cowl', name: 'Initiate Cowl', type: 'helmet', value: 2, price: 35, icon: '🧙', image: '', desc: 'A mystic cowl fit for a spellcaster.', rarity: 'iron' },
                    chestplate: { id: 'runic_robe', name: 'Runic Robe', type: 'chestplate', value: 5, price: 65, icon: '🧥', image: '', desc: 'A robe inscribed with fading runes.', rarity: 'steel' },
                    leggings: null,
                    boots: { id: 'arcane_boots', name: 'Arcane Boots', type: 'boots', value: 2, price: 30, icon: '👢', image: '', desc: 'Boots that hum with latent power.', rarity: 'iron' },
                    weapon: { id: 'runic_staff', name: 'Runic Staff', type: 'weapon', value: 22, price: 90, icon: '🪄', image: '', desc: 'A staff carved with glowing glyphs.', rarity: 'steel' }
                },
                inventory: [{ id: 'mana_potion', name: 'Mana Potion', type: 'potion', value: 30, price: 40, icon: '🔵', image: '', desc: 'Reduces spell cooldowns when used.', rarity: 'steel' }]
            },
            'Shadow Strider': {
                equipment: {
                    helmet: { id: 'shadow_mask', name: 'Shadow Mask', type: 'helmet', value: 3, price: 45, icon: '🥷', image: '', desc: 'A mask that hides the wearer in the dark.', rarity: 'iron' },
                    chestplate: { id: 'night_leather', name: 'Night Leather', type: 'chestplate', value: 4, price: 55, icon: '🧥', image: '', desc: 'Light armor made for silent movement.', rarity: 'steel' },
                    leggings: { id: 'shadow_leggings', name: 'Shadow Leggings', type: 'leggings', value: 3, price: 40, icon: '🩳', image: '', desc: 'Leggings that blend with the shadows.', rarity: 'iron' },
                    boots: { id: 'silent_boots', name: 'Silent Boots', type: 'boots', value: 3, price: 35, icon: '🥾', image: '', desc: 'Soft-soled boots for stealthy travel.', rarity: 'iron' },
                    weapon: { id: 'shadow_dagger', name: 'Shadow Dagger', type: 'weapon', value: 20, price: 75, icon: '🗡️', image: '', desc: 'A wicked dagger that strikes from darkness.', rarity: 'iron' }
                },
                inventory: [{ id: 'health_potion', name: 'Health Potion', type: 'potion', value: 30, price: 30, icon: '🧪', image: '', desc: 'Restores health when used.', rarity: 'steel' }]
            },
            'Forest Warden': {
                equipment: {
                    helmet: { id: 'warden_hood', name: 'Warden Hood', type: 'helmet', value: 3, price: 45, icon: '🥾', image: '', desc: 'A moss-lined hood from the woods.', rarity: 'iron' },
                    chestplate: { id: 'warden_hide', name: 'Warden Hide', type: 'chestplate', value: 5, price: 60, icon: '🛡️', image: '', desc: 'Hide armor reinforced with bark.', rarity: 'steel' },
                    leggings: { id: 'forest_leggings', name: 'Forest Leggings', type: 'leggings', value: 3, price: 40, icon: '🩳', image: '', desc: 'Flexible leggings for quick movement.', rarity: 'iron' },
                    boots: { id: 'warden_boots', name: 'Warden Boots', type: 'boots', value: 3, price: 35, icon: '🥾', image: '', desc: 'Boots made for gliding through foliage.', rarity: 'iron' },
                    weapon: { id: 'longbow', name: 'Longbow', type: 'weapon', value: 21, price: 85, icon: '🏹', image: '', desc: 'A bow that fires true across the darkness.', rarity: 'steel' }
                },
                inventory: [{ id: 'health_potion', name: 'Health Potion', type: 'potion', value: 35, price: 35, icon: '🧪', image: '', desc: 'Restores health when used.', rarity: 'steel' }]
            },
            'Boneguard Squire': {
                equipment: {
                    helmet: { id: 'squire_helm', name: 'Squire Helm', type: 'helmet', value: 3, price: 45, icon: '🪖', image: '', desc: 'A sturdy helm fit for a veteran squire.', rarity: 'iron' },
                    chestplate: { id: 'boneguard_plate', name: 'Boneguard Plate', type: 'chestplate', value: 6, price: 70, icon: '🛡️', image: '', desc: 'A heavy plate forged for battlefield service.', rarity: 'steel' },
                    leggings: { id: 'squire_leggings', name: 'Squire Leggings', type: 'leggings', value: 3, price: 40, icon: '🩳', image: '', desc: 'Reinforced leggings for steady footing.', rarity: 'iron' },
                    boots: { id: 'squire_boots', name: 'Squire Boots', type: 'boots', value: 3, price: 35, icon: '🥾', image: '', desc: 'Boots built to withstand long patrols.', rarity: 'iron' },
                    weapon: { id: 'bone_spear', name: 'Bone Spear', type: 'weapon', value: 20, price: 80, icon: '⚔️', image: '', desc: 'A spear pulled from a fallen guard.', rarity: 'iron' }
                },
                inventory: [{ id: 'health_potion', name: 'Health Potion', type: 'potion', value: 40, price: 30, icon: '🧪', image: '', desc: 'Restores health when used.', rarity: 'steel' }]
            }
        };
        return gear[role] || {
            equipment: { helmet: null, chestplate: null, leggings: null, boots: null, weapon: null },
            inventory: []
        };
    }
    constructor(canvas: HTMLCanvasElement, sandbox = false, playerColor: string = '#f39c12') {
        this.canvas = canvas; this.ctx = canvas.getContext('2d')!;
        this.isSandbox = sandbox;
        this.camera = new Camera(canvas.width, canvas.height);
        this.input = new InputHandler(canvas);
        (window as any).game = this; // Set before level generation to allow depth tracking
        this.goToLevel(1, true);
        this.player = new Player(this.level.spawnX, this.level.spawnY, playerColor);
        this.generateQuest(); // Initial quest
        if (this.isSandbox) {
            this.player.gold = 999999;
            this.player.skillPoints = 99;
            this.log("SANDBOX MODE ACTIVE: Infinite items, free shopping, and 99 SP!");
            this.level.spawnGodMerchant();
        }
        // Unlock first spell tree node if not already
        this.player.unlockedSkills.add('ignite'); 
        this.player.learnedSpells.add('ignite');
        const empty = this.player.hotbar.indexOf(null);
        if (empty !== -1) this.player.hotbar[empty] = 'ignite';
        
        this.generateQuest(); // Initial quest
        this.setupUI();
        this.loadKeyBinds();
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.camera.width = this.canvas.width;
            this.camera.height = this.canvas.height;
        });
    }
    start() {
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }
    setupUI() {
        window.addEventListener('keydown', e => {
            if (e.code === 'Escape') {
                e.preventDefault();
                let closed = false;
                const panels = ['inventory-panel', 'interaction-panel', 'skill-tree-panel', 'map-panel', 'controls-panel'];
                panels.forEach(id => {
                    const p = document.getElementById(id);
                    if (p && p.style.display !== 'none' && p.style.display !== '') {
                        if (id === 'inventory-panel') this.toggleInventory(false);
                        else if (id === 'interaction-panel') this.closeInteraction();
                        else if (id === 'skill-tree-panel') this.toggleSkillTree(false);
                        else if (id === 'map-panel') this.toggleMap(false);
                        else if (id === 'controls-panel') p.style.display = 'none';
                        closed = true;
                    }
                });

                if (!closed) {
                    this.toggleGameMenu();
                } else {
                    // If we closed a panel, ensure game menu is hidden
                    this.toggleGameMenu(false);
                }
            }
            if (e.code === this.keyBinds['inventory']) {
                e.preventDefault();
                this.toggleInventory();
            }
            if (e.code === this.keyBinds['map']) {
                e.preventDefault();
                this.toggleMap();
            }
            if (e.code === this.keyBinds['skills']) {
                e.preventDefault();
                this.toggleSkillTree();
            }
            if (e.code === this.keyBinds['pause']) {
                this.isPaused = !this.isPaused;
                if (!this.isPaused && this.bufferedSpellSlot !== null) this.fireHotbarSpell(this.bufferedSpellSlot);
            }
            for (let i = 0; i < 8; i++) {
                if (e.code === this.keyBinds[`spell${i+1}`] && !this.isPaused) {
                    this.fireHotbarSpell(i);
                }
            }
        });
        document.getElementById('resume-btn')?.addEventListener('click', () => this.toggleGameMenu(false));
        document.getElementById('main-menu-btn')?.addEventListener('click', () => location.reload());
        document.getElementById('inventory-toggle')?.addEventListener('click', () => this.toggleInventory());
        document.getElementById('close-inventory')?.addEventListener('click', () => this.toggleInventory(false));
        document.getElementById('close-interaction')?.addEventListener('click', () => this.closeInteraction());
        document.getElementById('close-skill-tree')?.addEventListener('click', () => this.toggleSkillTree(false));
        document.getElementById('close-map')?.addEventListener('click', () => this.toggleMap(false));
        document.getElementById('restart-btn')?.addEventListener('click', () => location.reload());
        
        document.getElementById('tab-melee')?.addEventListener('click', () => this.switchSkillTab('melee'));
        document.getElementById('tab-spell')?.addEventListener('click', () => this.switchSkillTab('spell'));
        document.getElementById('tab-quest-view')?.addEventListener('click', () => this.switchSkillTab('quest'));
        
        const mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;
        mapCanvas?.addEventListener('mousedown', (e) => this.handleMapMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMapMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMapMouseUp());
        mapCanvas?.addEventListener('contextmenu', (e) => this.handleMapContextMenu(e));
        document.getElementById('map-panel')?.addEventListener('wheel', (e) => this.handleMapZoom(e as WheelEvent), { passive: false });

        this.setupDraggableWindows();
    }
    toggleMap(show?: boolean) {
        const p = document.getElementById('map-panel');
        if (!p) return;
        const isShowing = show !== undefined ? show : p.style.display === 'none' || p.style.display === '';
        p.style.display = isShowing ? 'flex' : 'none';
        this.isPaused = isShowing;
        if (isShowing) {
            console.log('Map opening...');
            this.renderMap();
        }
    }
    handleMapZoom(e: WheelEvent) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.mapZoom = Math.max(0.5, Math.min(5, this.mapZoom * delta));
        this.renderMap();
    }
    handleMapMouseDown(e: MouseEvent) {
        if (e.button === 0) { // Left click for panning
            this.isPanningMap = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            (e.target as HTMLElement).style.cursor = 'grabbing';
        }
    }
    handleMapMouseMove(e: MouseEvent) {
        if (this.isPanningMap) {
            const dx = e.clientX - this.lastMousePos.x;
            const dy = e.clientY - this.lastMousePos.y;
            this.mapOffset.x += dx;
            this.mapOffset.y += dy;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.renderMap();
        }
    }
    handleMapMouseUp() {
        this.isPanningMap = false;
        const canvas = document.getElementById('map-canvas');
        if (canvas) canvas.style.cursor = 'grab';
    }
    handleMapContextMenu(e: MouseEvent) {
        e.preventDefault();
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        
        // Use consistent scale factors
        const isoScaleY = 0.85; // Increased from 0.7 to be less "condensed"
        const isoRotate = Math.PI / 4;
        const cosR = Math.cos(isoRotate);
        
        // Calculate tileSize exactly as in renderMap
        const diagonalPoints = this.level.width + this.level.height;
        const baseScale = Math.min(
            (canvas.width * 0.9) / (diagonalPoints * cosR),
            (canvas.height * 0.9) / (diagonalPoints * cosR * isoScaleY)
        );
        const tileSize = baseScale * this.mapZoom;

        // 1. Get mouse position relative to canvas content (accounting for any CSS scaling)
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

        // 2. Center the mouse relative to canvas center + mapOffset
        let x = mouseX - (canvas.width / 2 + this.mapOffset.x);
        let y = mouseY - (canvas.height / 2 + this.mapOffset.y);
        
        // 3. Reverse ISO Scale
        y /= isoScaleY;
        
        // 4. Reverse Rotation (Standard rotation inverse)
        const rx = x * Math.cos(-isoRotate) - y * Math.sin(-isoRotate);
        const ry = x * Math.sin(-isoRotate) + y * Math.cos(-isoRotate);
        
        // 5. Reverse Grid Translation
        const gridX = (rx + (this.level.width * tileSize / 2)) / tileSize;
        const gridY = (ry + (this.level.height * tileSize / 2)) / tileSize;

        if (gridX >= 0 && gridX < this.level.width && gridY >= 0 && gridY < this.level.height) {
            const gx = Math.floor(gridX);
            const gy = Math.floor(gridY);
            
            const existingPinIdx = this.mapPins.findIndex(p => p.x === gx && p.y === gy);
            if (existingPinIdx !== -1) {
                this.mapPins.splice(existingPinIdx, 1);
            } else {
                this.mapPins.push({x: gx, y: gy});
            }
            this.renderMap();
        }
    }
    renderMap() {
        const canvas = document.getElementById('map-canvas') as HTMLCanvasElement;
        const container = canvas?.parentElement;
        if (!canvas || !container || !this.level) return;
        
        const ctx = canvas.getContext('2d')!;
        const level = this.level;
        if (!level.width || !level.height || !level.fog || !level.tiles) return;

        // Fit canvas to container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Map transformation settings
        const isoRotate = Math.PI / 4;
        const isoScaleY = 0.85; // Increased from 0.7 to be less "condensed"
        const cosR = Math.cos(isoRotate);

        // Calculate dynamic tile size to fit the level
        const diagonalPoints = level.width + level.height;
        const scale = Math.min(
            (canvas.width * 0.9) / (diagonalPoints * cosR),
            (canvas.height * 0.9) / (diagonalPoints * cosR * isoScaleY)
        );
        const tileSize = scale * this.mapZoom;

        ctx.save();
        // Center the whole level + Apply Drag Offset
        ctx.translate(canvas.width / 2 + this.mapOffset.x, canvas.height / 2 + this.mapOffset.y);
        ctx.scale(1, isoScaleY);
        ctx.rotate(isoRotate);
        
        // Offset to align (0,0) so the entire grid is centered
        ctx.translate(-level.width * tileSize / 2, -level.height * tileSize / 2);

        // Render tiles
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                if (level.fog[y][x] > 0) {
                    const tile = level.tiles[y][x];
                    // Walls/Doors
                    if (tile === 1 || tile === 2) {
                        ctx.fillStyle = '#444'; 
                    } else {
                        ctx.fillStyle = '#c2b280'; // Floor
                    }
                    // Draw tile slightly overlapping to avoid gaps
                    ctx.fillRect(x * tileSize - 0.5, y * tileSize - 0.5, tileSize + 1, tileSize + 1);
                    
                    // Add subtle border to floors for definition
                    if (tile !== 1 && tile !== 2) {
                        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
                        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                }
            }
        }

        // Enlarged Marker sizes
        const markerSize = Math.max(tileSize * 1.5, 12);

        // Render special entities if explored
        level.entities.forEach(e => {
            const ex = Math.floor(e.x / 64);
            const ey = Math.floor(e.y / 64);
            if (level.fog[ey] && level.fog[ey][ex] > 0) {
                if (e.type === 'stairs-down') {
                    ctx.fillStyle = '#ff4757';
                    ctx.fillRect(ex * tileSize - markerSize/4, ey * tileSize - markerSize/4, tileSize + markerSize/2, tileSize + markerSize/2);
                } else if (e.type === 'stairs-up') {
                    ctx.fillStyle = '#2f3542';
                    ctx.fillRect(ex * tileSize - markerSize/4, ey * tileSize - markerSize/4, tileSize + markerSize/2, tileSize + markerSize/2);
                } else if (e.type === 'chest' && !e.dead) {
                    ctx.fillStyle = '#ffa502';
                    ctx.fillRect(ex * tileSize + 1, ey * tileSize + 1, tileSize - 2, tileSize - 2);
                    // Glowing effect for chests
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ffa502';
                    ctx.strokeRect(ex * tileSize, ey * tileSize, tileSize, tileSize);
                    ctx.shadowBlur = 0;
                } else if (e.type === 'npc') {
                    ctx.fillStyle = '#3742fa';
                    ctx.fillRect(ex * tileSize + 1, ey * tileSize + 1, tileSize - 2, tileSize - 2);
                } else if (e.type === 'enemy' && !e.dead) {
                    ctx.fillStyle = '#ff4757';
                    ctx.beginPath();
                    ctx.arc(ex * tileSize + tileSize/2, ey * tileSize + tileSize/2, tileSize/3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // Render Pins (Subtle)
        this.mapPins.forEach(p => {
            ctx.fillStyle = '#3498db';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#3498db';
            ctx.beginPath();
            ctx.arc(p.x * tileSize + tileSize/2, p.y * tileSize + tileSize/2, tileSize/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Render player (Green dot)
        const px = this.player.x / 64;
        const py = this.player.y / 64;
        
        ctx.fillStyle = '#2ed573';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#2ed573';
        ctx.beginPath();
        ctx.arc(px * tileSize, py * tileSize, markerSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Player direction indicator
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px * tileSize, py * tileSize);
        ctx.lineTo(px * tileSize + Math.cos(-Math.PI/4) * markerSize, py * tileSize + Math.sin(-Math.PI/4) * markerSize);
        ctx.stroke();

        ctx.restore();
    }
    renderMiniMap() {
        const canvas = document.getElementById('mini-map-canvas') as HTMLCanvasElement;
        if (!canvas || !this.level) return;
        const ctx = canvas.getContext('2d')!;
        const level = this.level;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const tileSize = 16;
        const radius = 15; // Slightly larger radius for better overview
        const px = this.player.x / 64;
        const py = this.player.y / 64;
 
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        
        // Subtle isometric look but less "condensed"
        ctx.scale(1, 0.8); 
        ctx.rotate(Math.PI / 4);
        
        ctx.translate(-px * tileSize, -py * tileSize);

        const startX = Math.max(0, Math.floor(px - radius));
        const endX = Math.min(level.width, Math.ceil(px + radius));
        const startY = Math.max(0, Math.floor(py - radius));
        const endY = Math.min(level.height, Math.ceil(py + radius));

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (level.fog[y][x] > 0) {
                    const tile = level.tiles[y][x];
                    ctx.fillStyle = (tile === 1 || tile === 2) ? '#3d2e1e' : '#d2c290';
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize + 0.5, tileSize + 0.5);
                }
            }
        }

        level.entities.forEach(e => {
            const ex = e.x / 64;
            const ey = e.y / 64;
            if (ex >= startX && ex <= endX && ey >= startY && ey <= endY) {
                if (level.fog[Math.floor(ey)] && level.fog[Math.floor(ey)][Math.floor(ex)] > 0) {
                    if (e.type === 'enemy' && !e.dead) ctx.fillStyle = '#ff4757';
                    else if (e.type === 'chest' && !e.dead) ctx.fillStyle = '#ffa502';
                    else if (e.type === 'stairs-down') ctx.fillStyle = '#ff4757';
                    else if (e.type === 'stairs-up') ctx.fillStyle = '#2f3542';
                    else return;
                    
                    ctx.beginPath();
                    ctx.arc(ex * tileSize, ey * tileSize, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // Player icon
        ctx.fillStyle = '#2ed573';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px * tileSize, py * tileSize, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
    setupDraggableWindows() {
        let isDragging = false;
        let draggedEl: HTMLElement | null = null;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;

        const onMouseDown = (e: MouseEvent) => {
            const handle = (e.target as HTMLElement).closest('.drag-handle');
            if (!handle) return;
            
            draggedEl = handle.closest('.draggable-window') as HTMLElement;
            if (!draggedEl) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = draggedEl.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;

            // Reset dynamic positioning to absolute pixel values
            draggedEl.style.position = 'fixed';
            draggedEl.style.left = `${initialX}px`;
            draggedEl.style.top = `${initialY}px`;
            draggedEl.style.transform = 'none';
            draggedEl.style.margin = '0';
            
            // Bring to front
            document.querySelectorAll('.draggable-window').forEach(el => (el as HTMLElement).style.zIndex = '1000');
            draggedEl.style.zIndex = '3000';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging || !draggedEl) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            draggedEl.style.left = `${initialX + dx}px`;
            draggedEl.style.top = `${initialY + dy}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
            draggedEl = null;
        };

        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
    toggleSkillTree(show?: boolean) {
        const p = document.getElementById('skill-tree-panel')!;
        const isShowing = show !== undefined ? show : p.style.display === 'none';
        p.style.display = isShowing ? 'flex' : 'none';
        this.isPaused = isShowing;
        if (isShowing) this.switchSkillTab('melee');
    }
    switchSkillTab(tab: 'melee' | 'spell' | 'quest') {
        document.getElementById('tab-melee')?.classList.toggle('active', tab === 'melee');
        document.getElementById('tab-spell')?.classList.toggle('active', tab === 'spell');
        document.getElementById('tab-quest-view')?.classList.toggle('active', tab === 'quest');
        
        const skillCont = document.getElementById('skill-tree-container')!;
        const questCont = document.getElementById('quest-tab-content')!;
        
        if (tab === 'quest') {
            skillCont.style.display = 'none';
            questCont.style.display = 'block';
            this.renderQuestTab();
        } else {
            skillCont.style.display = 'block';
            questCont.style.display = 'none';
            this.renderSkillTree(tab as 'melee' | 'spell');
        }
    }
    renderQuestInSkillTree() { // Helper name from user request intent
        this.renderQuestTab();
    }
    renderQuestTab() {
        const cont = document.getElementById('quest-tab-content')!;
        const q = this.player.activeQuest;
        
        if (!q) {
            cont.innerHTML = '<div class="quest-tab-empty">No active quest. Visit a merchant to begin!</div>';
            return;
        }
        
        cont.innerHTML = `
            <div class="quest-log parchment">
                <h4 class="quest-title">ACTIVE OBJECTIVE</h4>
                <div class="quest-details">
                    <span class="q-name">${q.name}</span>
                    <p class="q-desc">${q.desc}</p>
                    <div class="quest-progress-container">
                        <div class="quest-progress-bar" style="width: ${(q.progress / q.target) * 100}%"></div>
                        <span class="q-progress">${Math.floor(q.progress)} / ${q.target}</span>
                    </div>
                    <div class="q-reward">Potential Reward: ${q.reward} Skill Points</div>
                </div>
            </div>
        `;
    }
    renderSkillTree(type: 'melee' | 'spell') {
        const panel = document.getElementById('skill-tree-panel')!;
        document.getElementById('skill-points-display')!.innerText = this.player.skillPoints.toString();
        
        const container = document.getElementById('skill-tree-container')!;
        container.innerHTML = '<svg id="skill-connections"></svg>';
        const svg = document.getElementById('skill-connections') as unknown as SVGSVGElement;
        
        const tree = type === 'melee' ? MELEE_SKILL_TREE : SPELL_SKILL_TREE;
        
        const cellWidth = 140; // Increased spacing for clarity
        const cellHeight = 160;
        const paddingLeft = 60;
        const paddingTop = 60;
        const nodeSize = 64;
        const halfNode = nodeSize / 2;
        
        let maxX = 0; let maxY = 0;
        Object.values(tree).forEach(n => {
            maxX = Math.max(maxX, n.gridPos.x);
            maxY = Math.max(maxY, n.gridPos.y);
        });
        
        const contentWidth = maxX * cellWidth + paddingLeft * 2;
        const contentHeight = maxY * cellHeight + paddingTop * 2;
        
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';
        container.style.overflow = 'auto';
        
        const contentArea = document.createElement('div');
        contentArea.style.width = `${contentWidth}px`;
        contentArea.style.height = `${contentHeight}px`;
        contentArea.style.position = 'absolute';
        contentArea.style.top = '0';
        contentArea.style.left = '50%';
        contentArea.style.transform = 'translateX(-50%)';
        contentArea.className = 'skill-content-area';
        container.appendChild(contentArea);
        
        svg.setAttribute("width", contentWidth.toString());
        svg.setAttribute("height", contentHeight.toString());
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.zIndex = '1';
        contentArea.appendChild(svg);
        
        Object.values(tree).forEach(node => {
            node.requires.forEach(reqId => {
                const parent = tree[reqId];
                if (parent) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    const startX = (parent.gridPos.x - 1) * cellWidth + paddingLeft + halfNode;
                    const startY = (parent.gridPos.y - 1) * cellHeight + paddingTop + halfNode;
                    const endX = (node.gridPos.x - 1) * cellWidth + paddingLeft + halfNode;
                    const endY = (node.gridPos.y - 1) * cellHeight + paddingTop + halfNode;
                    
                    line.setAttribute("x1", startX.toString());
                    line.setAttribute("y1", startY.toString());
                    line.setAttribute("x2", endX.toString());
                    line.setAttribute("y2", endY.toString());
                    line.setAttribute("class", `skill-line ${this.player.unlockedSkills.has(reqId) && this.player.unlockedSkills.has(node.id) ? 'active' : ''}`);
                    svg.appendChild(line);
                }
            });
        });

        Object.values(tree).forEach(node => {
            const el = document.createElement('div');
            const isUnlocked = this.player.unlockedSkills.has(node.id);
            const canUnlock = !isUnlocked && (node.requires.length === 0 || node.requires.every(r => this.player.unlockedSkills.has(r)));
            
            el.className = `skill-node ${isUnlocked ? 'unlocked' : (canUnlock ? 'unlockable' : 'locked')}`;
            el.style.position = 'absolute';
            el.style.left = `${(node.gridPos.x - 1) * cellWidth + paddingLeft}px`;
            el.style.top = `${(node.gridPos.y - 1) * cellHeight + paddingTop}px`;
            
            el.innerHTML = `<span class="node-icon">${node.icon}</span>`;
            
            el.onmouseenter = (ev) => this.showSkillTT(node, ev.clientX, ev.clientY);
            el.onmouseleave = () => this.hideTT();
            
            if (canUnlock) {
                el.onclick = () => this.player.unlockSkill(node.id, type, this);
            }
            
            contentArea.appendChild(el);
        });
    }
    toggleGameMenu(s?: boolean) {
        const m = document.getElementById('game-menu');
        if (!m) return;
        const show = s !== undefined ? s : m.style.display !== 'block';
        m.style.display = show ? 'block' : 'none';
        this.isPaused = show;
        
        // Ensure other panels are hidden when menu is shown
        if (show) {
            this.toggleInventory(false);
            this.closeInteraction();
            this.toggleSkillTree(false);
            this.toggleMap(false);
        }
    }
    fireHotbarSpell(idx: number) {
        const sId = this.player.hotbar[idx]; if (!sId) return;
        const s = SPELL_DB[sId];
        if (this.player.cooldowns[sId] > 0 && this.player.manaShieldTimer <= 0) return;

        // Custom Effect: Mana Shield
        if (sId === 'arcane_shield') {
            this.player.manaShieldTimer = 10;
            this.log("MANA SHIELD ACTIVE: Cooldowns reset for 10 seconds!");
            this.particles.push({ x: this.player.x, y: this.player.y, life: 1, type: 'explosion', color: '#3498db' });
        }

        const a = Math.atan2(this.input.mousePosWorld.y - this.player.y, this.input.mousePosWorld.x - this.player.x);
        if (s.type === 'projectile') {
            this.projectiles.push(new Projectile(this.player.x, this.player.y, a, s.id, this.player, s.damage + this.player.level * 5, s.color, s.projectileShape, s.effect));
        }
        else if (s.type === 'aoe') {
            if (s.aoeType === 'cloud') {
                this.fieldEffects.push(new FieldEffect(this.input.mousePosWorld.x, this.input.mousePosWorld.y, 180, 5, s.id, s.color, s.damage / 5, this.player));
            } else if (s.aoeType === 'cone') {
                this.particles.push({ x: this.player.x, y: this.player.y, life: 0.4, type: 'cone', color: s.color, angle: a });
                this.level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead) {
                        const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                        const enemyAngle = Math.atan2(e.y - this.player.y, e.x - this.player.x);
                        let diff = Math.abs(enemyAngle - a); while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
                        if (dist < 300 && diff < 0.6) {
                            e.hp -= s.damage;
                            if (s.effect === 'slow') e.slowTimer = 4;
                            if (s.effect === 'burn') { e.burnTimer = 4; e.burnDamage = s.damage * 0.2; }
                            if (s.effect === 'fear') e.fearTimer = 3;
                            if (s.effect === 'root') e.rootTimer = 2;
                            if (s.effect === 'poison') { e.poisonTimer = 5; e.poisonDamage = s.damage * 0.15; }
                            if (s.effect === 'knockback') {
                                const ka = Math.atan2(e.y - this.player.y, e.x - this.player.x);
                                e.x += Math.cos(ka) * 200; e.y += Math.sin(ka) * 200;
                            }
                            if (e.hp <= 0) this.killEnemy(e);
                        }
                    }
                });
            } else if (s.aoeType === 'line') {
                // Line AOE: fissure from player toward cursor
                this.particles.push({ x: this.player.x, y: this.player.y, life: 0.6, type: 'line_fissure', color: s.color, angle: a });
                const lineLen = 400;
                this.level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead) {
                        // Check if enemy is near the line
                        const dx = e.x - this.player.x, dy = e.y - this.player.y;
                        const proj = dx * Math.cos(a) + dy * Math.sin(a);
                        const perp = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a));
                        if (proj > 0 && proj < lineLen && perp < 60) {
                            e.hp -= s.damage;
                            if (s.effect === 'root') e.rootTimer = 3;
                            if (s.effect === 'knockback') {
                                const ka = Math.atan2(e.y - this.player.y, e.x - this.player.x);
                                e.x += Math.cos(ka + Math.PI/2) * 100; e.y += Math.sin(ka + Math.PI/2) * 100;
                            }
                            if (e.hp <= 0) this.killEnemy(e);
                        }
                    }
                });
            } else if (s.aoeType === 'rain') {
                // Rain AOE: multiple small projectiles fall over time in targeted area
                const m = this.input.mousePosWorld;
                const rainCount = 8;
                for (let i = 0; i < rainCount; i++) {
                    setTimeout(() => {
                        const rx = m.x + (Math.random() - 0.5) * 200;
                        const ry = m.y + (Math.random() - 0.5) * 200;
                        this.particles.push({ x: rx, y: ry, life: 0.5, type: 'explosion', color: s.color });
                        this.level.entities.forEach(e => {
                            if (e.type === 'enemy' && !e.dead && Math.hypot(rx - e.x, ry - e.y) < 80) {
                                e.hp -= s.damage / rainCount;
                                if (s.effect === 'burn') { e.burnTimer = 3; e.burnDamage = s.damage * 0.1; }
                                if (e.hp <= 0) this.killEnemy(e);
                            }
                        });
                    }, i * 300);
                }
            } else {
                // Reworked AOE types
                const m = this.input.mousePosWorld;
                
                if (s.id === 'frost_nova') {
                    // Frost Nova: 8-way directional ice burst
                    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                        this.projectiles.push(new Projectile(this.player.x, this.player.y, a, 'ice_burst', this.player, s.damage, s.color, 'dart', s.effect));
                    }
                    this.particles.push({ x: this.player.x, y: this.player.y, life: 0.6, type: 'explosion', color: '#fff' });
                }
                else if (s.id === 'chaos_nova') {
                    // Chaos Nova: Asynchronous chaos geysers
                    const geyserCount = 5;
                    for (let i = 0; i < geyserCount; i++) {
                        setTimeout(() => {
                            const rx = this.player.x + (Math.random() - 0.5) * 400;
                            const ry = this.player.y + (Math.random() - 0.5) * 400;
                            this.particles.push({ x: rx, y: ry, life: 1.0, type: 'chaos_geyser', color: s.color });
                            this.level.entities.forEach(e => {
                                if (e.type === 'enemy' && !e.dead && Math.hypot(rx - e.x, ry - e.y) < 100) {
                                    e.hp -= s.damage;
                                    e.weakenTimer = 5; // chaos weaken
                                    if (e.hp <= 0) this.killEnemy(e);
                                }
                            });
                        }, i * 150);
                    }
                }
                else if (s.id === 'meteor_fall') {
                    // Meteor Fall: Lingering Fire Crater
                    this.particles.push({ x: m.x, y: m.y, life: 1.5, type: 'fire_crater', color: s.color });
                    this.level.entities.forEach(e => {
                        if (e.type === 'enemy' && !e.dead && Math.hypot(m.x - e.x, m.y - e.y) < 200) {
                            e.hp -= s.damage;
                            e.burnTimer = 4; e.burnDamage = s.damage * 0.2;
                            if (e.hp <= 0) this.killEnemy(e);
                        }
                    });
                }
                else {
                    // Default / Legacy Circle AOE (used by Nova Blast only now)
                    let originX = this.player.x, originY = this.player.y;
                    this.particles.push({ x: originX, y: originY, life: 0.5, type: 'explosion', color: s.color });
                    this.level.entities.forEach(e => {
                        if (e.type === 'enemy' && !e.dead && Math.hypot(originX - e.x, originY - e.y) < 280) {
                            e.hp -= s.damage;
                            if (s.effect === 'knockback') {
                                const ka = Math.atan2(e.y - originY, e.x - originX);
                                e.x += Math.cos(ka) * 200; e.y += Math.sin(ka) * 200;
                            }
                            if (e.hp <= 0) this.killEnemy(e);
                        }
                    });
                }
            }
        }
        else if (s.type === 'buff') {
            if (s.effect === 'regen') {
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + s.damage);
                this.particles.push({ x: this.player.x, y: this.player.y, life: 0.8, type: 'heal_burst', color: s.color });
                this.log(`Healed for ${s.damage} HP!`);
            }
            if (s.effect === 'haste') {
                if (s.id === 'ethereal_form') {
                    // Ethereal Form: massive speed boost + ghostly invulnerability frames
                    this.player.etherealTimer = 8;
                    this.player.hasteTimer = 8;
                    this.particles.push({ x: this.player.x, y: this.player.y, life: 1.2, type: 'ethereal_burst', color: '#d1d8e0' });
                    this.log("ETHEREAL FORM! You phase through reality!");
                } else if (s.id === 'chrono_warp') {
                    // Chrono: haste + reset all cooldowns
                    this.player.hasteTimer = 6;
                    this.player.manaShieldTimer = 6;
                    this.particles.push({ x: this.player.x, y: this.player.y, life: 0.8, type: 'chrono_burst', color: '#3498db' });
                    this.log("TIME BENDS TO YOUR WILL!");
                } else {
                    // Wind Walk: normal haste
                    this.player.hasteTimer = 8;
                    this.particles.push({ x: this.player.x, y: this.player.y, life: 0.6, type: 'haste_burst', color: '#81ecec' });
                    this.log("HASTE! You move with supernatural speed!");
                }
            }
            if (s.effect === 'shield') {
                this.player.ac += s.damage; setTimeout(() => this.player.ac -= s.damage, 10000);
                this.particles.push({ x: this.player.x, y: this.player.y, life: 0.8, type: 'shield_burst', color: s.color });
                this.log("Armor hardened!");
            }
            // Soul Harvest: lifesteal aura buff
            if (s.effect === 'lifesteal' && s.id === 'soul_harvest') {
                let hits = 0;
                this.level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead && Math.hypot(this.player.x - e.x, this.player.y - e.y) < 250) {
                        e.hp -= s.damage; hits++;
                        if (e.hp <= 0) this.killEnemy(e);
                        this.particles.push({ x: e.x, y: e.y, life: 0.4, type: 'soul_drain', color: '#c0392b' });
                    }
                });
                if (hits > 0) {
                    const heal = hits * 15;
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
                    this.log(`Harvested ${hits} souls, restored ${heal} HP!`);
                }
            }
            // Nova Blast: shockwave push
            if (s.id === 'nova_blast') {
                this.particles.push({ x: this.player.x, y: this.player.y, life: 0.8, type: 'shockwave', color: '#fdcb6e' });
                this.level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead) {
                        const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                        if (dist < 250) {
                            e.hp -= s.damage;
                            const ka = Math.atan2(e.y - this.player.y, e.x - this.player.x);
                            e.x += Math.cos(ka) * 180; e.y += Math.sin(ka) * 180;
                            if (e.hp <= 0) this.killEnemy(e);
                        }
                    }
                });
            }
        }
        else if (s.type === 'utility' && s.id === 'blink') { const dx = this.player.x + Math.cos(a) * s.damage, dy = this.player.y + Math.sin(a) * s.damage; if (!this.level.isWall(dx, dy)) { this.player.x = dx; this.player.y = dy; } }
        else if (s.type === 'utility' && s.id === 'shadow_step') {
            const m = this.input.mousePosWorld;
            if (!this.shadowStepState.p1) {
                this.shadowStepState.p1 = { x: m.x, y: m.y };
                this.log("First portal location marked. Click again to place second portal.");
                this.particles.push({ x: m.x, y: m.y, life: 1, type: 'explosion', color: '#2f3640' });
                return; // Don't trigger cooldown yet
            } else {
                const p1 = this.shadowStepState.p1;
                const p2 = { x: m.x, y: m.y };
                this.portals.push(new Portal(p1.x, p1.y, p2.x, p2.y, '#2f3640'));
                this.portals.push(new Portal(p2.x, p2.y, p1.x, p1.y, '#2f3640'));
                this.shadowStepState.p1 = null;
                this.log("Shadow Portals active!");
                this.particles.push({ x: p2.x, y: p2.y, life: 1, type: 'explosion', color: '#2f3640' });
            }
        }
        else if (s.id === 'holy_wrath') {
            const m = this.input.mousePosWorld;
            this.fieldEffects.push(new FieldEffect(m.x, m.y, 64, 5, 'crucifixion', '#f1c40f', s.damage / 10, this.player));
            this.log("CRUCIFIXION!");
        }
        else if (s.id === 'abyssal_pull') {
            const m = this.input.mousePosWorld;
            this.particles.push({ x: m.x, y: m.y, life: 0.8, type: 'explosion', color: '#130f40' });
            this.level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(m.x - e.x, m.y - e.y) < 350) {
                    const angle = Math.atan2(m.y - e.y, m.x - e.x);
                    e.x += Math.cos(angle) * 150; e.y += Math.sin(angle) * 150; // Violent pull
                    e.hp -= s.damage; if (e.hp <= 0) this.killEnemy(e);
                }
            });
            this.log("THE ABYSS PULLS!");
        }
        else if (s.id === 'chrono_warp') {
            this.player.manaShieldTimer = 6; // Reuse mana shield for cooldown reset
            this.log("TIME BENDS TO YOUR WILL!");
            this.particles.push({ x: this.player.x, y: this.player.y, life: 0.5, type: 'explosion', color: '#3498db' });
        }
        else if (s.id === 'chaos_nova') {
            const m = this.input.mousePosWorld;
            const effects: Spell['effect'][] = ['burn', 'slow', 'fear', 'root'];
            const eff = effects[Math.floor(Math.random() * effects.length)];
            this.particles.push({ x: m.x, y: m.y, life: 0.6, type: 'explosion', color: '#be2edd' });
            this.level.entities.forEach(e => {
                if (e.type === 'enemy' && !e.dead && Math.hypot(m.x - e.x, m.y - e.y) < 280) {
                    e.hp -= s.damage;
                    if (eff === 'slow') e.slowTimer = 5;
                    if (eff === 'burn') { e.burnTimer = 5; e.burnDamage = 20; }
                    if (eff === 'fear') e.fearTimer = 4;
                    if (eff === 'root') e.rootTimer = 3;
                    if (e.hp <= 0) this.killEnemy(e);
                }
            });
            this.log(`CHAOS! Effect applied: ${eff}`);
        }
        else if (s.id === 'soul_harvest') {
            // Handled in buff section above
        }
        else if (s.id === 'mirror_image') {
            // Kill existing mirror image if any
            if (this.mirrorImage) { this.mirrorImage.dead = true; this.mirrorImage = null; }
            const mi = {
                x: this.player.x + (Math.random() - 0.5) * 60,
                y: this.player.y + (Math.random() - 0.5) * 60,
                type: 'mirror_image' as const,
                hp: this.player.maxHp * 0.3,
                maxHp: this.player.maxHp * 0.3,
                dead: false,
                color: this.player.color,
                damage: 15 + this.player.level * 3,
                lifeTimer: 15
            };
            this.level.entities.push(mi as any);
            this.mirrorImage = mi;
            this.log("Mirror Image summoned!");
            this.particles.push({ x: mi.x, y: mi.y, life: 0.5, type: 'spark', color: '#a29bfe' });
        }
        else if (s.id === 'electric_shield') {
            this.log("STATIC CHARGE ACTIVE!");
            this.particles.push({ x: this.player.x, y: this.player.y, life: 1, type: 'explosion', color: '#f1c40f' });
            // Implementation: Simple temporary buff handled by shield effect naturally
            this.player.ac += 10;
            setTimeout(() => {
                this.player.ac -= 10;
                this.log("Electric shield dissipated.");
            }, 10000);
        }
        this.log(`Casting ${s.name}`);
        this.trackQuestProgress('spell', s.id);
        this.player.cooldowns[sId] = s.cooldown; this.bufferedSpellSlot = null;
    }
    toggleInventory(s?: boolean) {
        const p = document.getElementById('inventory-panel')!;
        const side = document.querySelector('.sidebar-right') as HTMLElement;
        const main = document.getElementById('main-container') || document.body;
        const sp = (s === undefined ? p.style.display === 'none' : s);
        p.style.display = sp ? 'block' : 'none';
        if (side) side.classList.toggle('visible', sp);
        main.classList.toggle('inventory-active', sp);
        if (sp) this.renderInventory();
    }
    renderInventory() {
        const g = document.getElementById('inventory-grid')!; g.innerHTML = ''; const sh = this.activeInteractingEntity?.type === 'npc';
        for (let i = 0; i < 20; i++) {
            const it = this.player.inventory[i];
            const sl = document.createElement('div'); sl.className = 'item-slot';
            if (!it) sl.classList.add('empty');
            else {
                sl.innerHTML = `<img src="${it.image}" class="item-icon" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>${it.icon}</text></svg>';">`;
                sl.classList.add(`rarity-${it.rarity}`);
                sl.onmouseenter = ev => this.showTT(it, ev.clientX, ev.clientY);
                sl.onmouseleave = () => this.hideTT();
                sl.oncontextmenu = e => { e.preventDefault(); this.transferToContainer(i); };
            }

            if (this.selectedInvIdx === i) sl.classList.add('selected');

            sl.onclick = () => {
                if (sh) { this.sellItem(i); return; }
                if (this.selectedInvIdx === null) {
                    if (it) { this.selectedInvIdx = i; this.renderInventory(); }
                } else {
                    if (this.selectedInvIdx === i) {
                        this.player.useItem(i, this);
                        this.selectedInvIdx = null;
                    } else {
                        const temp = this.player.inventory[this.selectedInvIdx];
                        this.player.inventory[this.selectedInvIdx] = this.player.inventory[i];
                        this.player.inventory[i] = temp;
                        this.selectedInvIdx = null;
                    }
                    this.renderInventory();
                }
            };
            g.appendChild(sl);
        }
        this.updateHUD();
    }
    sellItem(idx: number) { const it = this.player.inventory[idx]; if (it) { this.player.gold += Math.floor(it.price * 0.4); this.player.inventory[idx] = null; this.hideTT(); this.renderInventory(); } }
    transferToContainer(idx: number) {
        if (!this.activeInteractingEntity || this.activeInteractingEntity.type === 'npc') return;
        const it = this.player.inventory[idx];
        if (it) {
            this.activeInteractingEntity.inventory.push(it);
            this.player.inventory[idx] = null;
            this.hideTT();
            this.openInteraction(this.activeInteractingEntity);
            this.renderInventory();
        }
    }
    showTT(it: Item, x: number, y: number) {
        const tt = document.getElementById('game-tooltip')!; tt.style.display = 'block';
        const offsetX = 20;
        const offsetY = 20;
        let realX = x + offsetX;
        let realY = y + offsetY;
        
        // Bounds checking
        if (realX + 320 > window.innerWidth) realX = x - 340;
        if (realY + 280 > window.innerHeight) realY = window.innerHeight - 280;
        if (realX < 0) realX = 10;
        if (realY < 0) realY = 10;

        tt.style.left = `${realX}px`; tt.style.top = `${realY}px`;
        document.getElementById('tt-name')!.innerText = it.name; document.getElementById('tt-name')!.className = `rarity-${it.rarity}`;
        document.getElementById('tt-type')!.innerText = it.type.toUpperCase(); document.getElementById('tt-desc')!.innerText = it.desc;
        const isShop = this.activeInteractingEntity && this.activeInteractingEntity.type === 'npc';
        const priceMult = isShop ? (1 + this.currentDepth * 0.05) : 1;
        const displayPrice = isShop ? Math.floor(it.price * priceMult) : it.price;
        document.getElementById('tt-price')!.innerText = `Market Value: ${displayPrice} Gold`;
        let s = ''; if (it.type === 'weapon') s = `Power: ${it.value}`; else if (['helmet', 'chestplate', 'leggings', 'boots'].includes(it.type)) s = `Armor: ${it.value}`; document.getElementById('tt-stats')!.innerText = s;

        // Armor Comparison
        const ctt = document.getElementById('comparison-tooltip')!;
        if (['helmet', 'chestplate', 'leggings', 'boots', 'weapon'].includes(it.type)) {
            const equipped = this.player.equipment[it.type as keyof Player['equipment']];
            if (equipped && equipped.id !== it.id) {
                ctt.style.display = 'block';
                // Offset comparison tooltip to the side of the main one
                const offset = 330;
                if (realX + offset + 320 < window.innerWidth) {
                    ctt.style.left = `${realX + offset}px`;
                } else {
                    ctt.style.left = `${realX - offset}px`;
                }
                ctt.style.top = `${y}px`;
                document.getElementById('ctt-name')!.innerText = equipped.name; document.getElementById('ctt-name')!.className = `rarity-${equipped.rarity}`;
                document.getElementById('ctt-type')!.innerText = equipped.type.toUpperCase(); document.getElementById('ctt-desc')!.innerText = equipped.desc;
                let cs = ''; if (equipped.type === 'weapon') cs = `Power: ${equipped.value}`; else cs = `Armor: ${equipped.value}`;
                document.getElementById('ctt-stats')!.innerText = cs;
            } else { ctt.style.display = 'none'; }
        } else { ctt.style.display = 'none'; }
    }
    hideTT() { document.getElementById('game-tooltip')!.style.display = 'none'; document.getElementById('comparison-tooltip')!.style.display = 'none'; }
    showSpellTT(s: Spell, x: number, y: number) {
        const tt = document.getElementById('game-tooltip')!; tt.style.display = 'block';
        const offsetX = 20;
        const offsetY = 20;
        let realX = x + offsetX;
        let realY = y + offsetY;

        // Bounds checking
        if (realX + 320 > window.innerWidth) realX = x - 340;
        if (realY + 220 > window.innerHeight) realY = window.innerHeight - 220;
        if (realX < 0) realX = 10;
        if (realY < 0) realY = 10;

        tt.style.left = `${realX}px`; tt.style.top = `${realY}px`;
        document.getElementById('tt-name')!.innerText = s.name; document.getElementById('tt-name')!.className = `rarity-mithril`;
        document.getElementById('tt-type')!.innerText = `SPELL (${s.type.toUpperCase()})`; document.getElementById('tt-desc')!.innerText = s.desc;
        document.getElementById('tt-price')!.innerText = `Cooldown: ${s.cooldown}s`;
        document.getElementById('tt-stats')!.innerText = `Magnitude: ${s.damage}`;
    }
    openInteraction(e: any) {
        this.activeInteractingEntity = e;
        const panel = document.getElementById('interaction-panel')!,
            uiShop = document.getElementById('shop-ui')!,
            uiLoot = document.getElementById('loot-ui')!,
            uiDiag = document.getElementById('dialogue-ui')!;
        const shopBtn = document.getElementById('open-shop-btn')!;
        const optionBtn = document.getElementById('dialogue-option-btn')!;
        const optionBtn2 = document.getElementById('dialogue-option-btn-2')!;

        panel.style.display = 'block';
        uiShop.style.display = 'none';
        uiLoot.style.display = 'none';
        uiDiag.style.display = 'none';
        shopBtn.style.display = 'none';
        optionBtn.style.display = 'none';
        optionBtn2.style.display = 'none';

        if (e.type === 'recruitable_npc') {
            uiDiag.style.display = 'block';
            const diagText = document.getElementById('dialogue-text')!;
            document.getElementById('merchant-name')!.innerText = `${e.name} the ${e.role}`;
            diagText.innerHTML = `"${e.story}"`;

            shopBtn.style.display = 'inline-block';
            shopBtn.innerText = 'INVITE TO PARTY';
            shopBtn.onclick = () => {
                if (this.party.length >= 3) {
                    this.log('Your party is full! (Max 3)');
                    return;
                }
                this.party.push(e);
                e.type = 'party_member';
                e.dead = false;
                e.hp = e.maxHp;
                this.log(`${e.name} joined your party!`);
                this.closeInteraction();
                this.updateHUD();
            };

            const options = e.dialogueOptions || [];
            if (options[0]) {
                optionBtn.style.display = 'inline-block';
                optionBtn.innerText = options[0].label;
                optionBtn.onclick = () => {
                    diagText.innerHTML = `"${options[0].response}"`;
                };
            }
            if (options[1]) {
                optionBtn2.style.display = 'inline-block';
                optionBtn2.innerText = options[1].label;
                optionBtn2.onclick = () => {
                    diagText.innerHTML = `"${options[1].response}"`;
                };
            }

            const questUI = document.getElementById('quest-ui');
            if (questUI) questUI.style.display = 'none';
            return;
        }

        if (e.type === 'npc') {
            uiDiag.style.display = 'block';
            const diagText = document.getElementById('dialogue-text')!;
            document.getElementById('merchant-name')!.innerText = e.name || 'Master Merchant';
            this.currentDialogue = MERCHANT_DIALOGUES[Math.floor(Math.random() * MERCHANT_DIALOGUES.length)];
            diagText.innerHTML = `"${this.currentDialogue}"`;

            shopBtn.style.display = 'inline-block';
            shopBtn.innerText = 'VIEW MERCHANDISE';
            shopBtn.onclick = () => {
                uiDiag.style.display = 'none';
                uiShop.style.display = 'block';
                this.toggleInventory(true); // Open inventory with shop
                this.renderShop(e);
            };

            optionBtn.style.display = 'none';
            this.renderQuestUI();

            document.getElementById('reroll-quest-btn')!.onclick = () => {
                this.rerollQuest();
                this.renderQuestUI();
            };

            document.getElementById('claim-quest-reward-btn')!.onclick = () => {
                this.claimQuestReward();
                this.renderQuestUI();
            };
            return;
        }

        if (e.type === 'chest' || e.isCorpse) {
            uiLoot.style.display = 'block';
            this.toggleInventory(true); // Open inventory with loot as requested
            const cont = document.getElementById('loot-content')!;
            cont.innerHTML = '';
            e.inventory.forEach((it: Item | null, idx: number) => {
                if (!it) return;
                const sl = document.createElement('div');
                sl.className = `item-slot rarity-${it.rarity}`;
                sl.innerHTML = `<img src="${it.image}" class="item-icon" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>${it.icon}</text></svg>';">`;
                sl.onmouseenter = ev => this.showTT(it, ev.clientX, ev.clientY);
                sl.onmouseleave = () => this.hideTT();
                sl.onclick = () => {
                    if (it.id === 'gold_pile') {
                        this.player.gold += it.value;
                        this.trackQuestProgress('gold', undefined, it.value);
                        e.inventory.splice(idx, 1);
                        this.hideTT();
                        this.openInteraction(e);
                        this.log(`Collected ${it.value} gold from container.`);
                        return;
                    }
                    if (this.player.addItem(it)) {
                        e.inventory.splice(idx, 1);
                        this.hideTT();
                        this.openInteraction(e);
                        this.renderInventory();
                    } else this.log("Inventory full!");
                };
                cont.appendChild(sl);
            });
        }
    }
    renderShop(e: any) {
        const cont = document.getElementById('shop-content')!;
        const p = this.player;
        cont.innerHTML = '';
        document.getElementById('shop-gold-count')!.innerText = p.gold.toString();
        e.inventory.forEach((it: Item | null, idx: number) => {
            if (!it) return;
            const sl = document.createElement('div');
            sl.className = `item-slot rarity-${it.rarity}`;
            sl.innerHTML = `<img src="${it.image}" class="item-icon" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>${it.icon}</text></svg>';">`;
            sl.onmouseenter = ev => this.showTT(it, ev.clientX, ev.clientY);
            sl.onmouseleave = () => this.hideTT();
            const priceMult = 1 + this.currentDepth * 0.05;
            const finalPrice = this.isSandbox ? 0 : Math.floor(it.price * priceMult);
            sl.onclick = () => {
                if (this.isSandbox || p.gold >= finalPrice) {
                    if (p.addItem({ ...it })) {
                        if (!this.isSandbox) {
                            p.gold -= finalPrice;
                            e.inventory.splice(idx, 1);
                        }
                        this.hideTT();
                        this.renderShop(e);
                        this.renderInventory();
                    } else this.log("Inventory full!");
                } else this.log("Not enough gold!");
            };
            cont.appendChild(sl);
        });
    }
    closeInteraction() { document.getElementById('interaction-panel')!.style.display = 'none'; this.activeInteractingEntity = null; this.toggleInventory(false); }
    log(m: string) { this.messageLog.unshift(m); if (this.messageLog.length > 10) this.messageLog.pop(); document.getElementById('log-content')!.innerHTML = this.messageLog.join('<br>'); }
    damageTarget(target: any, source: any, dmg: number) {
        if (!target || !source || target === source || typeof dmg !== 'number' || dmg <= 0) return;
        if (target.dead || (source && source.dead)) return;
        if (target === this.player) {
            if (this.player.etherealTimer > 0) return; // Fortress/Ethereal Immunity
            if (this.player.parryTimer > 0) {
                source.hp -= dmg * 3;
                this.particles.push({x: source.x, y: source.y, life: 0.4, type: 'shield_burst', color: '#f1c40f'});
                this.log("Parried! Counter-attack!");
                if (source.hp <= 0 && source.type === 'enemy') this.killEnemy(source);
                return;
            }
        }
        target.hp -= dmg;
        if (target === this.player && target.hp <= 0) {
            target.hp = 0;
            if (!this.isGameOver) {
                this.isGameOver = true;
                const deathScreen = document.getElementById('death-screen');
                if (deathScreen) deathScreen.style.display = 'block';
                this.log('You have been eviscerated...');
            }
            return;
        }
        if (target !== this.player && target.hp <= 0) {
            target.dead = true;
            if (target === this.enchantedAlly) this.enchantedAlly = null;
            if (target === this.mirrorImage) this.mirrorImage = null;
        }
    }
    getSafePullDestination(originX: number, originY: number, destX: number, destY: number) {
        const maxSteps = 12;
        let lastFree = { x: originX, y: originY };
        for (let i = 1; i <= maxSteps; i++) {
            const t = i / maxSteps;
            const ix = originX + (destX - originX) * t;
            const iy = originY + (destY - originY) * t;
            if (this.level.isWall(ix, iy)) break;
            lastFree = { x: ix, y: iy };
        }
        return lastFree;
    }
    killEnemy(e: any) {
        e.dead = true; this.player.xp += 200; this.log(`${e.enemyType} vanquished.`);
        if (e.enemyType === 'Slime' && !e.isSmall) {
            for (let i = 0; i < 2; i++) {
                this.level.entities.push({
                    x: e.x + (Math.random() - 0.5) * 40,
                    y: e.y + (Math.random() - 0.5) * 40,
                    type: 'enemy',
                    enemyType: 'Slime',
                    isSmall: true,
                    hp: e.maxHp / 3,
                    maxHp: e.maxHp / 3,
                    dead: false,
                    baseColor: e.baseColor || '#7bed9f'
                });
            }
        }
        if (e.enemyType === 'Zombie' && Math.random() < 0.5) {
            this.log("The zombie lurches... it may rise again!");
            setTimeout(() => {
                const corpse = this.level.entities.find(ent => ent.type === 'corpse' && Math.hypot(ent.x - e.x, ent.y - e.y) < 5);
                if (corpse) {
                    corpse.dead = true; // Remove corpse
                    this.level.entities.push({
                        x: e.x, y: e.y, type: 'enemy', enemyType: 'Zombie',
                        hp: e.maxHp * 0.4, maxHp: e.maxHp, dead: false, abilityCd: 5, baseColor: '#7bed9f'
                    });
                    this.log("A zombie has reanimated!");
                }
            }, 5000);
        }
        if (e.enemyType === 'Scrap Drone') {
            this.particles.push({ x: e.x, y: e.y, life: 1.0, type: 'explosion', color: '#f39c12' });
        }
        const loot = getRandomLoot(this.currentDepth, 20 + this.currentDepth * 15);
        if (e.carriesKey) {
            loot.push({ ...ITEM_POOL['vault_key'] });
            this.log("The enemy carried a gleaming key!");
        }

        // Dynamic Gold Drop
        const gMult = e.enemyType === 'Ogre' ? 3 : (e.enemyType === 'Lich' ? 5 : 1);
        let goldVal = Math.floor((10 + Math.random() * 20) * (1 + this.currentDepth * 0.2) * gMult);
        if (e.weakenTimer > 0) goldVal *= 4; // Midas Touch effect: 4x gold if weakened (proxy for Midas effect)
        loot.push({
            id: 'gold_pile',
            name: `${goldVal} Gold Coins`,
            type: 'potion',
            value: goldVal,
            price: 0,
            icon: '🪙',
            image: '',
            desc: 'A small pile of gold coins.',
            rarity: 'mithril'
        });

        this.level.entities.push({ x: e.x, y: e.y, type: 'chest', isCorpse: true, inventory: loot, dead: false });
        
        // --- QUEST TRACKING: Kill ---
        this.trackQuestProgress('kill', e.enemyType?.toLowerCase());
        this.trackQuestProgress('melee'); // Generic kill tracking if we want to distinguish melee later
    }

    generateQuest() {
        const pool = QUEST_POOL;
        const template = pool[Math.floor(Math.random() * pool.length)];
        const scale = 1 + Math.floor(this.currentDepth / 3);
        
        const quest: Quest = {
            ...template,
            target: template.target * scale,
            progress: 0,
            completed: false,
            reward: template.reward * scale
        };
        
        // Resolve description placeholders
        quest.desc = quest.desc.replace('#', quest.target.toString());
        if (quest.targetId) quest.desc = quest.desc.replace('#node', quest.targetId);
        
        this.player.activeQuest = quest;
        this.log(`New Quest: ${quest.name}`);
    }

    trackQuestProgress(type: Quest['type'], targetId?: string, amount: number = 1) {
        if (!this.player) return; // Prevent crash during early initialization
        const q = this.player.activeQuest;
        if (!q || q.completed || q.type !== type) return;
        
        if (q.targetId && q.targetId !== targetId) return;
        
        q.progress += amount;
        if (q.progress >= q.target) {
            q.progress = q.target;
            q.completed = true;
            this.log(`Quest Complete: ${q.name}! Visit a merchant for your reward.`);
            this.particles.push({ x: this.player.x, y: this.player.y, life: 1, type: 'spark', color: '#f1c40f' });
        }
    }

    claimQuestReward() {
        const q = this.player.activeQuest;
        if (!q || !q.completed) return;
        
        this.player.skillPoints += q.reward;
        this.log(`Claimed ${q.reward} Skill Points!`);
        this.player.activeQuest = null;
        this.generateQuest(); // Auto-assign next quest
    }

    rerollQuest() {
        const cost = 100 * this.currentDepth;
        if (this.player.gold < cost) { this.log("Not enough gold to reroll quest!"); return; }
        this.player.gold -= cost;
        this.generateQuest();
        this.log("Quest rerolled.");
    }

    renderQuestUI() {
        const q = this.player.activeQuest;
        if (!q) return;

        document.getElementById('quest-name')!.innerText = q.name;
        document.getElementById('quest-description')!.innerText = q.desc;
        
        const prog = (q.progress / q.target) * 100;
        document.getElementById('quest-progress-bar')!.style.width = `${prog}%`;
        document.getElementById('quest-progress-text')!.innerText = `${Math.floor(q.progress)} / ${q.target}`;
        
        document.getElementById('quest-reward')!.innerText = `Reward: ${q.reward} SP`;
        
        const claimBtn = document.getElementById('claim-quest-reward-btn')!;
        const rerollBtn = document.getElementById('reroll-quest-btn')!;
        
        if (q.completed) {
            claimBtn.style.display = 'block';
            rerollBtn.style.display = 'none';
        } else {
            claimBtn.style.display = 'none';
            rerollBtn.style.display = 'block';
            rerollBtn.innerText = `REROLL (${100 * this.currentDepth}G)`;
        }
    }
    goToLevel(d: number, down: boolean) {
        if (d < 1) return;
        this.currentDepth = d;
        this.trackQuestProgress('depth', undefined, d);
        if (!this.levels.has(d)) this.levels.set(d, new Level(40 + d * 2, 40 + d * 2, d)); 
        this.level = this.levels.get(d)!; 
        this.projectiles = []; 
        this.log(`Floor ${d}...`);

        if (this.isSandbox && d === 1) {
            this.level.spawnGodMerchant();
        }

        if (this.player) {
            const t = down ? 'stairs-up' : 'stairs-down', sts = this.level.entities.find(ent => ent.type === t);
            if (sts) { const os = [[0, 80], [0, -80], [80, 0], [-80, 0]]; let f = false; for (let o of os) if (!this.level.isWall(sts.x + o[0], sts.y + o[1])) { this.player.x = sts.x + o[0]; this.player.y = sts.y + o[1]; f = true; break; } if (!f) { this.player.x = sts.x; this.player.y = sts.y; } }
            else { this.player.x = this.level.spawnX; this.player.y = this.level.spawnY; }
            
            // Bring living party members along
            this.party = this.party.filter(m => !m.dead && m.hp > 0);
            this.party.forEach((m, i) => {
                m.x = this.player.x + (Math.random() - 0.5) * 64;
                m.y = this.player.y + (Math.random() - 0.5) * 64;
                if (!this.level.entities.includes(m)) this.level.entities.push(m);
            });
        }
    }
    loop(t: number) { const dt = Math.min((t - this.lastTime) / 1000, 0.1); this.lastTime = t; if (!this.isPaused && !this.isGameOver) this.update(dt); this.draw(); this.input.mousePosWorld = this.screenToWorld(this.input.mouse.x, this.input.mouse.y); requestAnimationFrame(this.loop.bind(this)); }
    update(dt: number) {
        if (this.isPaused || this.isGameOver) return;

        // Auto-close interaction if player moves too far
        if (this.activeInteractingEntity) {
            const dist = Math.hypot(this.player.x - this.activeInteractingEntity.x, this.player.y - this.activeInteractingEntity.y);
            if (dist > 300) this.closeInteraction();
        }

        this.player.update(dt, this.input, this.level, this);
        this.camera.follow(this.player.x, this.player.y);
        this.level.update(dt, this.player, this);
        this.portals = this.portals.filter(p => p.life > 0);
        this.portals.forEach(p => p.update(dt, this.player, this));
        this.projectiles = this.projectiles.filter(p => !p.dead);
        this.projectiles.forEach(p => p.update(dt, this.level, this));
        this.fieldEffects = this.fieldEffects.filter(f => f.life > 0);
        this.fieldEffects.forEach(f => f.update(dt, this.level, this));
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.life -= dt);
    }
    draw() {
        this.ctx.fillStyle = '#050505'; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save(); this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2); this.ctx.scale(1, 0.7); this.ctx.rotate(Math.PI / 4); this.ctx.translate(-this.player.x, -this.player.y);
        this.level.draw(this.ctx);
        this.portals.forEach(p => p.draw(this.ctx));
        this.fieldEffects.forEach(f => f.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color || 'orange';
            if (p.type === 'cone') {
                this.ctx.save(); this.ctx.translate(p.x, p.y); this.ctx.rotate(p.angle); this.ctx.globalAlpha = p.life * 2;
                this.ctx.beginPath(); this.ctx.moveTo(0, 0); this.ctx.arc(0, 0, 400, -0.6, 0.6); this.ctx.fill(); this.ctx.restore();
            } else if (p.type === 'line_fissure') {
                // Ground fissure line from origin toward angle
                this.ctx.save();
                this.ctx.translate(p.x, p.y); this.ctx.rotate(p.angle);
                this.ctx.globalAlpha = p.life;
                this.ctx.strokeStyle = p.color; this.ctx.lineWidth = 8;
                this.ctx.beginPath(); this.ctx.moveTo(0, 0);
                for (let j = 0; j < 6; j++) {
                    this.ctx.lineTo(j * 70 + 35, (Math.random() - 0.5) * 20);
                }
                this.ctx.stroke();
                // Wider glow
                this.ctx.globalAlpha = p.life * 0.3; this.ctx.lineWidth = 24;
                this.ctx.stroke();
                this.ctx.restore();
            } else if (p.type === 'star_fissure') {
                this.ctx.save(); this.ctx.translate(p.x, p.y);
                this.ctx.globalAlpha = p.life * 1.5;
                this.ctx.strokeStyle = p.color; this.ctx.lineWidth = 6;
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                    this.ctx.beginPath(); this.ctx.moveTo(0, 0);
                    let dist = (1 - p.life) * 200; // expand outwards
                    this.ctx.lineTo(Math.cos(a) * dist, Math.sin(a) * dist);
                    this.ctx.stroke();
                }
                this.ctx.restore();
            } else if (p.type === 'rune_float') {
                this.ctx.save(); this.ctx.translate(p.x, p.y);
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color; this.ctx.font = '24px monospace';
                this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
                // Float up slightly over time
                const floatY = (1 - p.life) * -50;
                this.ctx.fillText(p.runeChar || 'ᚱ', 0, floatY);
                this.ctx.restore();
            } else if (p.type === 'chaos_geyser') {
                this.ctx.save(); this.ctx.translate(p.x, p.y);
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                // Random spiky blob
                for (let a = 0; a < Math.PI * 2; a += 0.5) {
                    const r = 20 + Math.random() * 40 * (1 - p.life);
                    const tx = Math.cos(a) * r, ty = Math.sin(a) * r;
                    if (a === 0) this.ctx.moveTo(tx, ty); else this.ctx.lineTo(tx, ty);
                }
                this.ctx.closePath(); this.ctx.fill();
                this.ctx.restore();
            } else if (p.type === 'fire_crater') {
                this.ctx.save(); this.ctx.translate(p.x, p.y);
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = '#111'; // scorched earth
                this.ctx.beginPath(); this.ctx.arc(0, 0, 80, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.strokeStyle = p.color; this.ctx.lineWidth = 4;
                for(let i=0; i<5; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc((Math.random()-0.5)*40, (Math.random()-0.5)*40, 10 + Math.random()*20, 0, Math.PI*2);
                    this.ctx.stroke();
                }
                this.ctx.restore();
            } else {
                this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.type === 'explosion' ? (0.6 - p.life) * 180 : 6, 0, Math.PI * 2); this.ctx.fill();
            }
        });
        this.player.draw(this.ctx, this); this.ctx.restore(); 
        
        this.renderMiniMap();
        this.updateHUD();
    }
    updateHUD() {
        const p = this.player; document.getElementById('hp-bar')!.style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`; document.getElementById('hp-text')!.innerText = `${Math.ceil(p.hp)} / ${p.maxHp}`; document.getElementById('gold-count')!.innerText = `Gold: ${p.gold}`; document.getElementById('stat-level')!.innerText = `Lv: ${p.level}`; document.getElementById('stat-depth')!.innerText = `D: ${this.currentDepth}`; document.getElementById('stat-ac')!.innerText = `AC: ${p.ac}`;
        ['helmet', 'chestplate', 'leggings', 'boots', 'weapon'].forEach(t => {
            const it = (p.equipment as any)[t], el = document.getElementById(`slot-${t}`)!;
            if (it) {
                el.innerHTML = `<img src="${it.image}" class="item-icon" onerror="this.outerHTML='<span class=%22item-icon%22 style=%22font-size:32px;display:flex;align-items:center;justify-content:center;height:100%%22>${it.icon}</span>';">`;
                el.classList.add('equipped'); el.onmouseenter = ev => this.showTT(it, ev.clientX, ev.clientY);
            } else { el.innerText = t[0].toUpperCase(); el.classList.remove('equipped'); el.onmouseenter = null; }
            el.onmouseleave = () => this.hideTT();
        });
        for (let i = 0; i < 8; i++) {
            const sl = document.querySelectorAll('.hotbar-slot')[i] as HTMLElement, sId = p.hotbar[i];
            if (sId && SPELL_DB[sId]) {
                const s = SPELL_DB[sId];
                sl.innerHTML = `<img src="${s.image}" class="item-icon" onerror="this.outerHTML='<span class=%22item-icon%22 style=%22font-size:32px;display:flex;align-items:center;justify-content:center;height:100%%22>${s.icon}</span>';">`;
                sl.style.opacity = p.cooldowns[sId] > 0 ? '0.4' : '1';
                sl.onmouseenter = ev => this.showSpellTT(s, ev.clientX, ev.clientY);
                sl.onmouseleave = () => this.hideTT();
            } else { 
                sl.innerHTML = `<div class="empty-slot-placeholder">${i + 1}</div>`; 
                sl.style.opacity = '1';
                sl.onmouseenter = null; 
            }
        }
        // Update Melee Hotbar
        ['melee1', 'melee2', 'melee3', 'melee4'].forEach((action, i) => {
            const sl = document.getElementById(`melee-slot-${i}`)!;
            if (!sl) return;
            const aId = p.meleeSlots[action];
            const keyName = this.keyBinds[action].replace('Key', '').replace('Digit', '');
            if (aId && MELEE_ABILITY_DB[aId]) {
                const a = MELEE_ABILITY_DB[aId];
                sl.innerHTML = `<img src="/abilities/${aId}.png" class="item-icon" onerror="this.outerHTML='<span class=%22item-icon%22 style=%22font-size:32px;display:flex;align-items:center;justify-content:center;height:100%%22>${a.icon}</span>';">`;
                sl.style.opacity = p.meleeCooldowns[aId] > 0 ? '0.4' : '1';
                sl.onmouseenter = ev => this.showMeleeTT(a, ev.clientX, ev.clientY);
                sl.onmouseleave = () => this.hideTT();
            } else {
                sl.innerHTML = `<div class="empty-slot-placeholder">${keyName}</div>`;
                sl.style.opacity = '1';
                sl.onmouseenter = null;
            }
        });

        // Update Party HUD
        const partyHud = document.getElementById('party-hud');
        if (partyHud) {
            partyHud.innerHTML = this.party.map(m => {
                const nameSafe = (m.name || m.role || 'Adventurer').replace(/"/g, '&quot;');
                const safeIcon = (m.icon || '👤').replace(/'/g, '&#39;');
                const avatarSeed = m.name || m.role || 'Adventurer';
                const avatarSrc = m.image || m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;
                const weaponName = m.equipment?.weapon?.name || 'No Weapon';
                const armorPieces = ['helmet', 'chestplate', 'leggings', 'boots'].map(slot => m.equipment?.[slot]?.name || null).filter(Boolean);
                const armorText = armorPieces.length ? armorPieces.join(' • ') : 'No Armor';
                const invCount = Array.isArray(m.inventory) ? m.inventory.filter((it: any) => it).length : 0;
                const currentHp = typeof m.hp === 'number' ? m.hp : 0;
                const maxHp = typeof m.maxHp === 'number' ? m.maxHp : Math.max(100, currentHp);
                const hpPercent = maxHp > 0 ? Math.min(100, Math.max(0, (currentHp / maxHp) * 100)) : 0;
                return `
                <div class="party-member-card">
                    <div class="party-member-portrait">
                        <img src="${avatarSrc}" alt="${nameSafe}" onerror="this.style.display='none'; this.parentNode.insertAdjacentHTML('beforeend', '<div class=\'party-avatar-fallback\'>${safeIcon}</div>');" />
                    </div>
                    <div class="pm-header">
                        <span>${m.name || m.role || 'Party Member'}</span>
                        <span>${Math.ceil(currentHp)} / ${Math.ceil(maxHp)}</span>
                    </div>
                    <div class="pm-hp-container">
                        <div class="pm-hp-bar" style="width: ${hpPercent}%"></div>
                    </div>
                    <div class="pm-equipment">
                        <div><strong>Weapon:</strong> ${weaponName}</div>
                        <div><strong>Armor:</strong> ${armorText}</div>
                        <div><strong>Inventory:</strong> ${invCount} item(s)</div>
                    </div>
                </div>
            `;
            }).join('');
        }
    }
    showMeleeTT(a: MeleeAbility, x: number, y: number) {
        const tt = document.getElementById('game-tooltip')!; tt.style.display = 'block';
        const offsetX = 20;
        const offsetY = 20;
        let realX = x + offsetX;
        let realY = y + offsetY;
        
        // Bounds checking
        if (realX + 320 > window.innerWidth) realX = x - 340;
        if (realY + 220 > window.innerHeight) realY = window.innerHeight - 220;
        if (realX < 0) realX = 10;
        if (realY < 0) realY = 10;

        tt.style.left = `${realX}px`; tt.style.top = `${realY}px`;
        document.getElementById('tt-name')!.innerText = a.name; document.getElementById('tt-name')!.className = `rarity-dragon`;
        document.getElementById('tt-type')!.innerText = `MELEE ABILITY`; document.getElementById('tt-desc')!.innerText = a.desc;
        document.getElementById('tt-price')!.innerText = `Cooldown: ${a.cooldown}s`;
        document.getElementById('tt-stats')!.innerText = `Damage: ${a.damage}`;
    }
    showSkillTT(node: SkillNode, x: number, y: number) {
        const tt = document.getElementById('game-tooltip')!; tt.style.display = 'block';
        const offsetX = 20;
        const offsetY = 20;
        let realX = x + offsetX;
        let realY = y + offsetY;

        // Bounds checking
        if (realX + 320 > window.innerWidth) realX = x - 340;
        if (realY + 200 > window.innerHeight) realY = window.innerHeight - 200;
        if (realX < 0) realX = 10;
        if (realY < 0) realY = 10;

        tt.style.left = `${realX}px`; tt.style.top = `${realY}px`;
        
        const isUnlocked = this.player.unlockedSkills.has(node.id);
        const canUnlock = !isUnlocked && (node.requires.length === 0 || node.requires.every(r => this.player.unlockedSkills.has(r)));
        let status = isUnlocked ? 'UNLOCKED' : (canUnlock ? `Available: ${node.cost} SP` : 'LOCKED');

        document.getElementById('tt-name')!.innerText = node.name;
        document.getElementById('tt-name')!.className = isUnlocked ? 'rarity-mithril' : (canUnlock ? 'rarity-steel' : 'rarity-iron');
        document.getElementById('tt-type')!.innerText = `${node.type.toUpperCase()} SKILL`;
        document.getElementById('tt-desc')!.innerText = node.desc;
        document.getElementById('tt-price')!.innerText = status;
        document.getElementById('tt-stats')!.innerText = "";
    }
    screenToWorld(mx: number, my: number) { 
        const cx = this.canvas.width / 2, cy = this.canvas.height / 2; 
        let x = mx - cx, y = (my - cy) / 0.7, a = -Math.PI / 4; 
        const rx = x * Math.cos(a) - y * Math.sin(a), ry = x * Math.sin(a) + y * Math.cos(a); 
        return { x: rx + this.player.x, y: ry + this.player.y }; 
    }

    setKeyBind(action: string, code: string) {
        this.keyBinds[action] = code;
        this.saveKeyBinds();
        this.updateHUD(); // Refresh hotbar icons if keys changed
    }

    saveKeyBinds() {
        localStorage.setItem('dungeon_game_keybinds', JSON.stringify(this.keyBinds));
    }

    loadKeyBinds() {
        const saved = localStorage.getItem('dungeon_game_keybinds');
        if (saved) {
            try {
                const binds = JSON.parse(saved);
                Object.assign(this.keyBinds, binds);
            } catch (e) {
                console.error("Failed to load keybinds:", e);
            }
        }
    }
}
