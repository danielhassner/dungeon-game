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
    cooldown: number; damage: number; color: string; projectileShape?: 'circle' | 'star' | 'bolt' | 'wave' | 'pulse';
    aoeType?: 'circle' | 'cloud' | 'cone'; effect?: 'slow' | 'burn' | 'lifesteal' | 'chain' | 'fear' | 'weaken' | 'regen' | 'haste' | 'shield' | 'root'; mana?: number;
}

// --- DATABASES ---

const ITEM_POOL: Record<string, Item> = {};
const SPELL_DB: Record<string, Spell> = {
    'magic_missile': { id: 'magic_missile', name: 'Magic Missile', icon: '✨', image: '/spells/Magic Missile.png', desc: 'Fires a seeking bolt of arcane energy.', type: 'projectile', cooldown: 0.5, damage: 20, color: '#4fc3f7', projectileShape: 'bolt' },
    'fireball': { id: 'fireball', name: 'Fireball', icon: '🔥', image: '/spells/Fireball.png', desc: 'Launches a massive ball of fire that creates a burning explosion.', type: 'projectile', effect: 'burn', cooldown: 3, damage: 80, color: '#e67e22', projectileShape: 'circle' },
    'frost_nova': { id: 'frost_nova', name: 'Frost Nova', icon: '❄️', image: '/spells/Frost Nova.png', desc: 'Emits a freezing pulse that slows all nearby enemies.', type: 'aoe', aoeType: 'circle', effect: 'slow', cooldown: 5, damage: 40, color: '#a29bfe' },
    'heal': { id: 'heal', name: 'Holy Heal', icon: '💖', image: '/spells/Holy Heal.png', desc: 'Restores a significant amount of health to the caster.', type: 'buff', effect: 'regen', cooldown: 10, damage: 50, color: '#2ecc71' },
    'blink': { id: 'blink', name: 'Ether Blink', icon: '🌀', image: '/spells/Ether Blink.png', desc: 'Instantly teleports the caster to a target location.', type: 'utility', cooldown: 4, damage: 350, color: '#9b59b6' },
    'poison_cloud': { id: 'poison_cloud', name: 'Toxic Mist', icon: '🤢', image: '/spells/Toxic Mist.png', desc: 'Creates a lingering cloud of toxic acid that burns enemies.', type: 'aoe', aoeType: 'cloud', effect: 'burn', cooldown: 7, damage: 15, color: '#27ae60' },
    'thunder_bolt': { id: 'thunder_bolt', name: 'Thunder Bolt', icon: '⚡', image: '/spells/Thunder Bolt.png', desc: 'Strikes a single target with heavy lightning, rooting it.', type: 'projectile', effect: 'root', cooldown: 4, damage: 120, color: '#f1c40f', projectileShape: 'bolt' },
    'arcane_bolt': { id: 'arcane_bolt', name: 'Arcane Bolt', icon: '💠', image: '/spells/Arcane Bolt.png', desc: 'Fires a rapid stream of weak but weakening arcane pulses.', type: 'projectile', effect: 'weaken', cooldown: 0.2, damage: 12, color: '#8e44ad', projectileShape: 'pulse' },
    'chain_lightning': { id: 'chain_lightning', name: 'Chain Lightning', icon: '⚡', image: '/spells/Chain Lightning.png', desc: 'A lightning strike that arcs between multiple targets.', type: 'projectile', effect: 'chain', cooldown: 4, damage: 60, color: '#f1c40f', projectileShape: 'bolt' },
    'meteor_fall': { id: 'meteor_fall', name: 'Meteor Fall', icon: '☄️', image: '/spells/Meteor Fall.png', desc: 'Calls down a meteor to strike a targeted area for high damage.', type: 'aoe', aoeType: 'circle', effect: 'burn', cooldown: 12, damage: 250, color: '#d35400' },
    'ice_spike': { id: 'ice_spike', name: 'Ice Spike', icon: '🧊', image: '/spells/Ice Spike.png', desc: 'Launches a sharp ice dart that slows the target on impact.', type: 'projectile', effect: 'slow', cooldown: 3, damage: 110, color: '#54a0ff', projectileShape: 'bolt' },
    'vampiric_touch': { id: 'vampiric_touch', name: 'Vampiric Touch', icon: '🧛', image: '/spells/Vampiric Touch.png', desc: 'Drains health from enemies and restores it to the caster.', type: 'projectile', effect: 'lifesteal', cooldown: 5, damage: 35, color: '#c0392b', projectileShape: 'pulse' },
    'wind_walk': { id: 'wind_walk', name: 'Wind Walk', icon: '🌬️', image: '/spells/Wind Walk.png', desc: 'Increases movement speed significantly for a short duration.', type: 'buff', effect: 'haste', cooldown: 20, damage: 2, color: '#81ecec' },
    'nova_blast': { id: 'nova_blast', name: 'Nova Blast', icon: '💥', image: '/spells/Nova Blast.png', desc: 'Releases a sudden burst of energy around the caster.', type: 'aoe', aoeType: 'circle', cooldown: 2, damage: 45, color: '#fdcb6e' },
    'bless': { id: 'bless', name: 'Blessing', icon: '✨', image: '/spells/Blessing.png', desc: 'Grants a continuous health regeneration effect.', type: 'buff', effect: 'regen', cooldown: 25, damage: 8, color: '#fab1a0' },
    'curse': { id: 'curse', name: 'Dark Curse', icon: '💀', image: '/spells/Dark Curse.png', desc: 'Weakens enemies in an area, reducing their effectiveness.', type: 'aoe', aoeType: 'circle', effect: 'weaken', cooldown: 15, damage: 0, color: '#2d3436' },
    'radiant_beam': { id: 'radiant_beam', name: 'Radiant Beam', icon: '🔆', image: '/spells/Radiant Beam.png', desc: 'Fires a beam of holy light that burns enemies.', type: 'projectile', effect: 'burn', cooldown: 1, damage: 55, color: '#fff' },
    'arcane_shield': { id: 'arcane_shield', name: 'Mana Shield', icon: '🛡️', image: '/spells/Mana Shield.png', desc: 'Resets all spell cooldowns for 10 seconds.', type: 'buff', effect: 'shield', cooldown: 15, damage: 12, color: '#3498db' },
    'venom_dart': { id: 'venom_dart', name: 'Venom Dart', icon: '🏹', image: '/spells/Venom Dart.png', desc: 'Fires a toxic dart that poisons and burns enemies.', type: 'projectile', effect: 'burn', cooldown: 1, damage: 8, color: '#badc58' },
    'shadow_bolt': { id: 'shadow_bolt', name: 'Shadow Bolt', icon: '🖤', image: '/spells/Shadow Bolt.png', desc: 'Launches a bolt of shadow that strikes fear into enemies.', type: 'projectile', effect: 'fear', cooldown: 1.5, damage: 70, color: '#30336b' },
    'soul_tear': { id: 'soul_tear', name: 'Soul Tear', icon: '👻', image: '/spells/Soul Tear.png', desc: 'Tears at the target\'s soul, weakening their defenses.', type: 'projectile', effect: 'weaken', cooldown: 8, damage: 120, color: '#95afc0' },
    'dragon_breath': { id: 'dragon_breath', name: 'Dragon Breath', icon: '🐲', image: '/spells/Dragon Breath.png', desc: 'Breathes fire in a cone in front of the caster.', type: 'aoe', aoeType: 'cone', effect: 'burn', cooldown: 6, damage: 90, color: '#eb4d4b' },
    'void_nova': { id: 'void_nova', name: 'Void Nova', icon: '🌑', image: '/spells/Void Nova.png', desc: 'An explosion of void energy that causes fear in all nearby enemies.', type: 'aoe', aoeType: 'circle', effect: 'fear', cooldown: 8, damage: 110, color: '#2c3e50' },
    'soul_reap': { id: 'soul_reap', name: 'Soul Reap', icon: '💀', image: '/spells/Soul Reap.png', desc: 'Reaps the vitality of a target, stealing health.', type: 'projectile', effect: 'lifesteal', cooldown: 6, damage: 95, color: '#4a4a4a' },
    'astral_blast': { id: 'astral_blast', name: 'Astral Blast', icon: '✨', image: '/spells/Astral Blast.png', desc: 'Cold starlight that slows enemies in their tracks.', type: 'projectile', effect: 'slow', cooldown: 1, damage: 45, color: '#f5f6fa' },
    'inferno': { id: 'inferno', name: 'Inferno', icon: '🌋', image: '/spells/Inferno.png', desc: 'Ignites a large area, causing continuous fire damage.', type: 'aoe', aoeType: 'cloud', effect: 'burn', cooldown: 15, damage: 200, color: '#e84118' },
    'storm_strike': { id: 'storm_strike', name: 'Storm Strike', icon: '🌩️', image: '/spells/Storm Strike.png', desc: 'Calls down a lightning strike that arcs to adjacent enemies.', type: 'projectile', effect: 'chain', cooldown: 2.5, damage: 130, color: '#00a8ff' },
    'earth_quake': { id: 'earth_quake', name: 'Earthquake', icon: '🌍', image: '/spells/Earthquake.png', desc: 'Shakes the ground to slow and damage all nearby enemies.', type: 'aoe', aoeType: 'circle', effect: 'slow', cooldown: 10, damage: 150, color: '#7f8c8d' },
    'nature_touch': { id: 'nature_touch', name: 'Nature Touch', icon: '🌿', image: '/spells/Nature Touch.png', desc: 'Calls upon nature to rapidly regenerate your health.', type: 'buff', effect: 'regen', cooldown: 12, damage: 70, color: '#4cd137' },
    'wind_burst': { id: 'wind_burst', name: 'Wind Burst', icon: '🌪️', image: '/spells/Wind Burst.png', desc: 'A blast of wind that causes enemies to flee in panic.', type: 'aoe', aoeType: 'cone', effect: 'fear', cooldown: 4, damage: 65, color: '#dcdde1' },
    'shadow_step': { id: 'shadow_step', name: 'Shadow Step', icon: '👣', image: '/spells/Shadow Step.png', desc: 'Creates two linked portals for rapid movement.', type: 'utility', cooldown: 12, damage: 0, color: '#2f3640' },
    'celestial_beam': { id: 'celestial_beam', name: 'Celestial Beam', icon: '🔦', image: '/spells/Celestial Beam.png', desc: 'A focused beam of celestial energy that burns targets.', type: 'projectile', effect: 'burn', cooldown: 7, damage: 180, color: '#f9ca24', projectileShape: 'bolt' },
    'venom_wave': { id: 'venom_wave', name: 'Venom Wave', icon: '🌊', image: '/spells/Venom Wave.png', desc: 'A wave of toxic spit that poisons enemies in a cone.', type: 'aoe', aoeType: 'cone', effect: 'burn', cooldown: 9, damage: 30, color: '#badc58' },
    'arcane_storm': { id: 'arcane_storm', name: 'Arcane Storm', icon: '🌀', image: '/spells/Arcane Storm.png', desc: 'Summons an arcane storm that continuously damages an area.', type: 'aoe', aoeType: 'cloud', cooldown: 20, damage: 300, color: '#a29bfe' },
    'holy_wrath': { id: 'holy_wrath', name: 'Holy Wrath', icon: '⚔️', image: '/spells/Holy Wrath.png', desc: 'Crucifies enemies in a golden cross, rooting them and dealing continuous damage.', type: 'aoe', aoeType: 'circle', cooldown: 12, damage: 140, color: '#ffec8b' },
    'blood_boil': { id: 'blood_boil', name: 'Blood Boil', icon: '🩸', image: '/spells/Blood Boil.png', desc: 'Heats the blood of nearby enemies to cause burning damage.', type: 'aoe', aoeType: 'circle', effect: 'burn', cooldown: 11, damage: 85, color: '#c0392b' },
    'iron_skin': { id: 'iron_skin', name: 'Iron Skin', icon: '🔩', image: '/spells/Iron Skin.png', desc: 'Hardens your skin, granting a temporary protective shield.', type: 'buff', effect: 'shield', cooldown: 25, damage: 20, color: '#95afc0' },
    'gravity_well': { id: 'gravity_well', name: 'Gravity Well', icon: '🕳️', image: '/spells/Gravity Well.png', desc: 'Creates a void that slows and damages enemies within its reach.', type: 'aoe', aoeType: 'cloud', effect: 'slow', cooldown: 14, damage: 160, color: '#130f40' },
    'chaos_bolt': { id: 'chaos_bolt', name: 'Chaos Bolt', icon: '💠', image: '/spells/Chaos Bolt.png', desc: 'Fires a chaotic projectile that weakens the enemy\'s spirit.', type: 'projectile', effect: 'weaken', cooldown: 0.8, damage: 55, color: '#be2edd' },
    'frost_lance': { id: 'frost_lance', name: 'Frost Lance', icon: '🔱', image: '/spells/Frost Lance.png', desc: 'A spear of ice that pierces and slows enemies.', type: 'projectile', effect: 'slow', cooldown: 3, damage: 120, color: '#70a1ff', projectileShape: 'bolt' },
    'sun_fire': { id: 'sun_fire', name: 'Sun Fire', icon: '☀️', image: '/spells/Sun Fire.png', desc: 'Launches a miniature sun that burns and damages enemies.', type: 'projectile', effect: 'burn', cooldown: 6, damage: 95, color: '#f0932b' },
    'mind_blast': { id: 'mind_blast', name: 'Mind Blast', icon: '🧠', image: '/spells/Mind Blast.png', desc: 'A psychic shock that roots the target in place.', type: 'projectile', effect: 'root', cooldown: 6, damage: 105, color: '#a55eea' },
    'life_drain': { id: 'life_drain', name: 'Life Drain', icon: '🧪', image: '/spells/Life Drain.png', desc: 'Drains the life force of a target to heal yourself.', type: 'projectile', effect: 'lifesteal', cooldown: 9, damage: 60, color: '#20bf6b' },
    'thunder_clap': { id: 'thunder_clap', name: 'Thunder Clap', icon: '👏', image: '/spells/Thunder Clap.png', desc: 'A clap of thunder that roots all nearby enemies.', type: 'aoe', aoeType: 'circle', effect: 'root', cooldown: 8, damage: 75, color: '#fed330' },
    'ethereal_form': { id: 'ethereal_form', name: 'Ethereal Form', icon: '👻', image: '/spells/Ethereal Form.png', desc: 'Become ethereal, increasing your movement speed significantly.', type: 'buff', effect: 'haste', cooldown: 30, damage: 50, color: '#d1d8e0' },
    'star_fall': { id: 'star_fall', name: 'Star Fall', icon: '🌠', image: '/spells/Star Fall.png', desc: 'Calls down falling stars that burn all enemies in the area.', type: 'aoe', aoeType: 'circle', effect: 'burn', cooldown: 18, damage: 250, color: '#45aaf2' },
    'burning_vines': { id: 'burning_vines', name: 'Burning Vines', icon: '🎋', image: '/spells/Burning Vines.png', desc: 'Roots enemies in burning vines, causing continuous damage.', type: 'aoe', aoeType: 'cloud', effect: 'root', cooldown: 12, damage: 100, color: '#ff4d4d' },
    'mirror_image': { id: 'mirror_image', name: 'Mirror Image', icon: '🪞', image: '/spells/Mirror Image.png', desc: 'Summons a mirror image to distract and confuse enemies.', type: 'utility', cooldown: 40, damage: 0, color: '#a29bfe' }
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
    "Go fuck yourself"
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
    const items = Object.values(ITEM_POOL).filter(it => it.type !== 'key' && it.price <= limit);
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
    const sId = Object.keys(SPELL_DB)[Math.floor(Math.random() * Object.keys(SPELL_DB).length)];
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
                            e.hp -= this.damage; e.rootTimer = 0.6; // Keep rooted during effect
                            if (e.hp <= 0) game.killEnemy(e);
                        }
                    }
                });
            } else {
                level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < this.radius) {
                        e.hp -= this.damage;
                        if (this.type === 'poison') { e.burnTimer = 3; e.burnDamage = this.damage / 2; }
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
    constructor(x: number, y: number, a: number, t: string, o: any, d: number, c = '#fff', s = 'circle', e?: string) {
        this.x = x; this.y = y; const spd = t === 'fireball' ? 550 : 800; this.vx = Math.cos(a) * spd; this.vy = Math.sin(a) * spd; this.type = t; this.owner = o; this.damage = d; this.color = c; this.shape = s; this.effect = e;
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

        this.x += this.vx * dt; this.y += this.vy * dt;
        if (level.isWall(this.x, this.y)) { if (this.type === 'fireball') this.explode(level, game); this.dead = true; return; }
        level.entities.forEach(e => {
            if (e.type === 'enemy' && !e.dead && Math.hypot(this.x - e.x, this.y - e.y) < 35) {
                // Prevent friendly fire: enemies shouldn't damage each other
                if (this.owner && this.owner.type === 'enemy') return;
                if (this.type === 'fireball') this.explode(level, game);
                else {
                    e.hp -= this.damage;
                    if (this.effect === 'lifesteal') game.player.hp = Math.min(game.player.maxHp, game.player.hp + this.damage * 0.3);
                    if (this.effect === 'slow') { e.slowTimer = 4; }
                    if (this.effect === 'burn') { e.burnTimer = 4; e.burnDamage = this.damage * 0.2; }
                    if (this.effect === 'fear') { e.fearTimer = 3; }
                    if (this.effect === 'weaken') { e.weakenTimer = 5; }
                    if (this.effect === 'chain') {
                        const target = level.entities.find(other => other.type === 'enemy' && !other.dead && other !== e && Math.hypot(e.x - other.x, e.y - other.y) < 300);
                        if (target) {
                            const angle = Math.atan2(target.y - e.y, target.x - e.x);
                            game.projectiles.push(new Projectile(e.x, e.y, angle, this.type, this.owner, this.damage * 0.7, this.color, this.shape));
                        }
                    }
                    // Lich ability logic remains (if any was here, it's not in the provided original snippet)
                    if (e.hp <= 0) game.killEnemy(e);
                }
                this.dead = true;
            }
        });
    }
    explode(level: Level, game: Game) {
        game.particles.push({ x: this.x, y: this.y, life: 0.6, type: 'explosion', color: this.color });
        level.entities.forEach(e => { if (e.type === 'enemy' && !e.dead) { const d = Math.hypot(this.x - e.x, this.y - e.y); if (d < 200) { e.hp -= this.damage * (1 - d / 220); if (e.hp <= 0) game.killEnemy(e); } } });
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;
        const angle = Math.atan2(this.vy, this.vx);

        if (this.shape === 'bolt') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.fillRect(-15, -4, 30, 8);
            ctx.fillRect(5, -10, 5, 20);
            ctx.restore();
        } else if (this.shape === 'star') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Date.now() * 0.01);
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((i * 4 * Math.PI) / 5) * 20, Math.sin((i * 4 * Math.PI) / 5) * 20);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else if (this.shape === 'pulse') {
            const s = 10 + Math.sin(Date.now() * 0.02) * 5;
            ctx.beginPath(); ctx.arc(this.x, this.y, s, 0, Math.PI * 2); ctx.fill();
        } else if (this.shape === 'wave') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(-10, -15);
            ctx.quadraticCurveTo(15, 0, -10, 15);
            ctx.lineWidth = 6;
            ctx.strokeStyle = this.color;
            ctx.stroke();
            ctx.restore();
        } else {
            ctx.beginPath(); ctx.arc(this.x, this.y, 14, 0, Math.PI * 2); ctx.fill();
        }
    }
}

class Level {
    width: number; height: number; tiles: number[][]; fog: number[][]; entities: any[] = []; spawnX = 0; spawnY = 0;
    constructor(w: number, h: number, d: number) {
        this.width = w; this.height = h; this.tiles = Array(h).fill(0).map(() => Array(w).fill(1)); this.fog = Array(h).fill(0).map(() => Array(w).fill(0));
        this.generate(d);
    }
    generate(d: number) {
        let cx = Math.floor(this.width / 2), cy = Math.floor(this.height / 2); this.spawnX = cx * 64; this.spawnY = cy * 64;
        for (let i = 0; i < 2400; i++) { this.tiles[cy][cx] = 0; let dir = Math.floor(Math.random() * 4); if (dir === 0) cx = Math.max(1, Math.min(this.width - 2, cx + 1)); else if (dir === 1) cx = Math.max(1, Math.min(this.width - 2, cx - 1)); else if (dir === 2) cy = Math.max(1, Math.min(this.height - 2, cy + 1)); else cy = Math.max(1, Math.min(this.height - 2, cy - 1)); }
        if (d > 1) this.entities.push({ x: this.spawnX, y: this.spawnY, type: 'stairs-up', dead: false });
        let sx, sy; do { sx = Math.floor(Math.random() * (this.width - 2)) + 1; sy = Math.floor(Math.random() * (this.height - 2)) + 1; } while (this.tiles[sy][sx] === 1 || Math.hypot(sx * 64 - this.spawnX, sy * 64 - this.spawnY) < 600);
        this.entities.push({ x: sx * 64 + 32, y: sy * 64 + 32, type: 'stairs-down', dead: false });

        // Generate Vault
        let vaultCreated = false;
        if (d > 1 && Math.random() < 0.7) { // Increased probability
            const vx = Math.floor(Math.random() * (this.width - 6)) + 3, vy = Math.floor(Math.random() * (this.height - 6)) + 3;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) this.tiles[vy + dy][vx + dx] = 0;
            this.tiles[vy][vx] = 2; // Locked door
            this.entities.push({ x: vx * 64 + 32, y: (vy - 1) * 64 + 32, type: 'chest', isSpecial: true, inventory: getRandomLoot(d, 2000), dead: false });
            vaultCreated = true;
            if ((window as any).game) (window as any).game.depthsWithVaults.add(d);
        }

        let merchantSpawned = false;
        let keyCarrierSet = false;
        const maxIter = 50; // Lower density
        for (let i = 0; i < maxIter; i++) {
            const rx = Math.floor(Math.random() * (this.width - 2)) + 1, ry = Math.floor(Math.random() * (this.height - 2)) + 1;
            if (this.tiles[ry][rx] === 0 && Math.hypot(rx * 64 - this.spawnX, ry * 64 - this.spawnY) > 300) {
                const r = Math.random();
                if (r < 0.35) { // Spawn chance
                    const pool = ['Skeleton', 'Skeleton'];
                    if (d > 2) pool.push('Ogre', 'Slime');
                    if (d > 5) pool.push('Wraith', 'Cultist');
                    if (d > 8) pool.push('Lich', 'Earth Golem');
                    const eType = pool[Math.floor(Math.random() * pool.length)];

                    const game = (window as any).game;
                    const carriesKey = (game?.depthsWithVaults.has(d) || game?.depthsWithVaults.has(d + 1) || game?.depthsWithVaults.has(d - 1)) && !keyCarrierSet && Math.random() < 0.35;

                    let hpMult = 1, color = '#ff4757';
                    if (eType === 'Skeleton') color = '#f1f2f6';
                    if (eType === 'Ogre') color = '#a38148'; // Ogre Brown
                    if (eType === 'Slime') color = '#7bed9f';
                    if (eType === 'Wraith') color = '#747d8c';
                    if (eType === 'Cultist') color = '#30336b';
                    if (eType === 'Earth Golem') { hpMult = 2.5; color = '#57606f'; }
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
                if (e.burnTimer > 0) { e.burnTimer -= dt; e.hp -= e.burnDamage * dt; if (e.hp <= 0) game.killEnemy(e); }
                if (e.slowTimer > 0) { e.slowTimer -= dt; }
                if (e.fearTimer > 0) { e.fearTimer -= dt; }
                if (e.weakenTimer > 0) { e.weakenTimer -= dt; }
                if (e.rootTimer > 0) { e.rootTimer -= dt; }

                let spd = 170;
                if (e.enemyType === 'Wraith') spd = 270;
                else if (e.enemyType === 'Ogre') spd = 130;
                else if (e.enemyType === 'Slime') spd = 150;
                else if (e.enemyType === 'Earth Golem') spd = 80;
                else if (e.enemyType === 'Cultist') spd = 200;

                if (e.frenzy) spd *= 1.8;
                if (e.slowTimer > 0) spd *= 0.4;
                if (e.fearTimer > 0) spd *= -1.2; // Run away
                if (e.rootTimer > 0) spd = 0; // Rooted

                if (d < 450 && d > 45) {
                    // Target nearest ally if closer than player
                    let targetX = game.player.x, targetY = game.player.y;
                    let targetDist = Math.hypot(game.player.x - e.x, game.player.y - e.y);
                    this.entities.forEach((ent: any) => {
                        if (ent.type === 'ally' && !ent.dead) {
                            const dist = Math.hypot(ent.x - e.x, ent.y - e.y);
                            if (dist < targetDist) { targetDist = dist; targetX = ent.x; targetY = ent.y; }
                        }
                    });

                    const a = Math.atan2(targetY - e.y, targetX - e.x);
                    if (!this.isWall(e.x + Math.cos(a) * spd * dt, e.y)) e.x += Math.cos(a) * spd * dt;
                    if (!this.isWall(e.x, e.y + Math.sin(a) * spd * dt)) e.y += Math.sin(a) * spd * dt;

                    // Cultist Ranged Attack
                    if (e.enemyType === 'Cultist' && !e.dead && Math.random() < 0.02) {
                        game.projectiles.push(new Projectile(e.x, e.y, a, 'dark_missile', e, 15 + d * 2, '#30336b', 'pulse', 'weaken'));
                    }
                }
                if (e.abilityCd > 0) e.abilityCd -= dt;
                else if (d < 350) {
                    if (e.enemyType === 'Ogre') {
                        if (Math.random() < 0.5) { game.particles.push({ x: e.x, y: e.y, life: 0.5, type: 'explosion', color: '#8d6e63' }); if (d < 160) player.hp -= 35; game.log("Ogre Stomp!"); e.abilityCd = 5; }
                        else { e.frenzy = true; setTimeout(() => e.frenzy = false, 1500); e.abilityCd = 6; game.log("Ogre Charges!"); }
                    } else if (e.enemyType === 'Lich') {
                        if (Math.random() < 0.7) { game.projectiles.push(new Projectile(e.x, e.y, Math.atan2(player.y - e.y, player.x - e.x), 'shadowbolt', e, 25, '#9b59b6')); e.abilityCd = 3; }
                        else { this.entities.push({ x: e.x + 50, y: e.y + 50, type: 'enemy', enemyType: 'Skeleton', hp: 60, maxHp: 60, dead: false, abilityCd: 2, baseColor: '#f1f2f6' }); game.log("Lich Summons!"); e.abilityCd = 9; }
                    } else if (e.enemyType === 'Skeleton') { /* Skeleton has no ranged attack now */ }
                    else if (e.enemyType === 'Wraith') { if (d < 110) { player.hp -= 12; e.hp = Math.min(e.maxHp, e.hp + 15); game.log("Soul Drain!"); e.abilityCd = 4; } else { e.x = player.x + Math.random() * 120 - 60; e.y = player.y + Math.random() * 120 - 60; e.abilityCd = 6; } }
                    else if (e.enemyType === 'Ghoul') { e.frenzy = true; setTimeout(() => e.frenzy = false, 3000); e.abilityCd = 10; game.log("Ghoul Frenzy!"); }
                }
                if (d < 50 && Math.random() < 0.1) player.hp -= (e.frenzy ? 35 : 18) * dt;
            }
        });
    }
    draw(ctx: CanvasRenderingContext2D) {
        for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
            const f = this.fog[y][x]; if (f === 0) continue;
            const t = this.tiles[y][x];
            ctx.fillStyle = t === 1 ? '#080808' : (t === 2 ? '#4e342e' : (t === 3 ? '#1b1b1b' : '#181818'));
            if (f === 1) ctx.globalAlpha = 0.4;
            ctx.fillRect(x * 64, y * 64, 64, 64);
            if (t === 2) { ctx.strokeStyle = '#c5a059'; ctx.lineWidth = 4; ctx.strokeRect(x * 64 + 8, y * 64 + 8, 48, 48); ctx.fillStyle = '#c5a059'; ctx.font = '24px Arial'; ctx.fillText('🔒', x * 64 + 18, y * 64 + 40); }
            ctx.globalAlpha = 1;
        }
        this.entities.forEach(e => {
            if (this.fog[Math.floor(e.y / 64)][Math.floor(e.x / 64)] !== 2 || (e.dead && e.type !== 'corpse')) return;
            if (e.type === 'enemy') {
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
                ctx.fillStyle = e.baseColor;
                if (e.hp < e.maxHp) {
                    ctx.save();
                    ctx.fillStyle = '#000'; ctx.fillRect(e.x - 30, e.y - 55, 60, 9);
                    ctx.fillStyle = '#f44336'; ctx.fillRect(e.x - 30, e.y - 55, (e.hp / e.maxHp) * 60, 9);
                    ctx.restore();
                }

                // Status effects rings
                if (e.slowTimer > 0) { ctx.strokeStyle = '#3498db'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(e.x, e.y, 35, 0, Math.PI * 2); ctx.stroke(); }
                if (e.fearTimer > 0) { ctx.strokeStyle = '#a29bfe'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e.x, e.y, 40, 0, Math.PI * 2); ctx.stroke(); }
                if (e.rootTimer > 0) { ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(e.x, e.y, 30, 0, Math.PI * 2); ctx.stroke(); }
                if (e.burnTimer > 0) { ctx.strokeStyle = '#e67e22'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, 45, 0, Math.PI * 2); ctx.stroke(); }
                if (e.carriesKey) { ctx.fillStyle = '#f9ca24'; ctx.beginPath(); ctx.arc(e.x, e.y - 40, 6, 0, Math.PI * 2); ctx.fill(); }
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
    isWall(x: number, y: number) { const tx = Math.floor(x / 64), ty = Math.floor(y / 64); if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return true; return this.tiles[ty][tx] === 1 || this.tiles[ty][tx] === 2; }
}

class Player {
    x: number; y: number; hp: number; maxHp: number; xp: number; level: number; gold: number; ac: number;
    manaShieldTimer: number = 0;
    portalCooldown: number = 0;
    equipment: { helmet: Item | null, chestplate: Item | null, leggings: Item | null, boots: Item | null, weapon: Item | null } = { helmet: null, chestplate: null, leggings: null, boots: null, weapon: null };
    inventory: (Item | null)[] = Array(20).fill(null);
    hotbar: (string | null)[] = ['magic_missile', null, null, null, null, null, null, null];
    learnedSpells: Set<string> = new Set(['magic_missile', 'arcane_bolt']); cooldowns: { [key: string]: number } = {};
    swingTime: number = 0; swingAngle: number = 0;
    constructor(x: number, y: number) {
        this.x = x; this.y = y; this.hp = 100; this.maxHp = 100; this.xp = 0; this.level = 1; this.gold = 50; this.ac = 0;
        this.addItem({ ...ITEM_POOL['start_dagger'] });
        const it = this.inventory[0]; if (it) { (this.equipment as any).weapon = it; this.inventory[0] = null; }
    }
    addItem(it: Item) { const idx = this.inventory.findIndex(s => s === null); if (idx !== -1) { this.inventory[idx] = it; return true; } return false; }
    useItem(idx: number, game: Game) {
        const it = this.inventory[idx]; if (!it) return;
        if (it.id === 'gold_pile') {
            this.gold += it.value;
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
        game.renderInventory();
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
        if (this.manaShieldTimer > 0) {
            this.manaShieldTimer -= dt;
            // Continuous cooldown reset during Mana Shield
            Object.keys(this.cooldowns).forEach(k => this.cooldowns[k] = 0);
        }
        if (this.portalCooldown > 0) this.portalCooldown -= dt;
        Object.keys(this.cooldowns).forEach(k => { if (this.cooldowns[k] > 0) this.cooldowns[k] -= dt; });
        if (this.swingTime > 0) this.swingTime -= dt;

        let dx = 0, dy = 0;
        if (input.isDown('KeyW')) { dx--; dy--; }
        if (input.isDown('KeyS')) { dx++; dy++; }
        if (input.isDown('KeyA')) { dx--; dy++; }
        if (input.isDown('KeyD')) { dx++; dy--; }
        if (dx !== 0 || dy !== 0) { const m = Math.hypot(dx, dy), mx = (dx / m) * 450 * dt, my = (dy / m) * 450 * dt; if (!level.isWall(this.x + mx, this.y)) this.x += mx; if (!level.isWall(this.x, this.y + my)) this.y += my; }

        for (let i = 0; i < 8; i++) {
            if (input.isDown(`Digit${i + 1}`)) {
                const sId = this.hotbar[i];
                if (sId && !this.cooldowns[sId]) {
                    const s = SPELL_DB[sId];
                    if (s.type === 'projectile') game.projectiles.push(new Projectile(this.x, this.y, Math.atan2(input.mousePosWorld.y - this.y, input.mousePosWorld.x - this.x), s.id, this, s.damage, s.color, s.projectileShape, s.effect));
                    else if (s.id === 'heal') this.hp = Math.min(this.maxHp, this.hp + s.damage);
                    this.cooldowns[sId] = s.cooldown;
                }
            }
        }

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
                if (['npc', 'chest', 'stairs-down', 'stairs-up'].includes(t.type) || t.isCorpse) {
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
            this.maxHp += 20;
            this.hp = this.maxHp;
            game.log(`Level ${this.level}!`);
            if (this.level === 3) {
                const book = { ...ITEM_POOL['spellbook_fireball'] };
                this.addItem(book);
                game.log("Level 3 achievement: A Fireball spellbook!");
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D, game: Game) {
        ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(this.x, this.y, 25, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
        if (this.swingTime > 0) {
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
}

export class Game {
    canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; lastTime = 0; player: Player; level!: Level; camera: Camera; input: InputHandler; projectiles: Projectile[] = []; particles: any[] = []; fieldEffects: FieldEffect[] = []; isPaused = false; isGameOver = false; currentDepth = 1; levels: Map<number, Level> = new Map(); messageLog: string[] = ["Grand Expansion Initialized..."]; activeInteractingEntity: any = null; bufferedSpellSlot: number | null = null; selectedInvIdx: number | null = null;
    depthsWithVaults: Set<number> = new Set();
    activeMerchant: any = null;
    currentDialogue: string = "";
    shadowStepState: { p1: { x: number, y: number } | null } = { p1: null };
    portals: Portal[] = [];
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d')!;
        this.camera = new Camera(canvas.width, canvas.height);
        this.input = new InputHandler(canvas);
        (window as any).game = this; // Set before level generation to allow depth tracking
        this.goToLevel(1, true);
        this.player = new Player(this.level.spawnX, this.level.spawnY);
        this.setupUI();
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
            if (e.key === 'Escape') {
                let closed = false;
                if (document.getElementById('inventory-panel')?.style.display === 'block') { this.toggleInventory(false); closed = true; }
                if (document.getElementById('interaction-panel')?.style.display === 'block') { this.closeInteraction(); closed = true; }

                if (!closed) { this.toggleGameMenu(); }
                else if (document.getElementById('game-menu')?.style.display === 'block') { this.toggleGameMenu(false); }
            }
            if (e.code === 'KeyI' && !this.isPaused) this.toggleInventory();
            if (e.code === 'KeyE' && !this.isPaused) { const mIdx = this.player.hotbar.indexOf('magic_missile'); if (mIdx !== -1) this.fireHotbarSpell(mIdx); }
            if (e.code === 'Space') {
                this.isPaused = !this.isPaused;
                if (!this.isPaused && this.bufferedSpellSlot !== null) this.fireHotbarSpell(this.bufferedSpellSlot);
            }
            if (e.key >= '1' && e.key <= '8' && !this.isPaused) { const s = parseInt(e.key) - 1; this.fireHotbarSpell(s); }
        });
        document.getElementById('resume-btn')?.addEventListener('click', () => this.toggleGameMenu(false));
        document.getElementById('main-menu-btn')?.addEventListener('click', () => location.reload());
        document.getElementById('inventory-toggle')?.addEventListener('click', () => this.toggleInventory());
        document.getElementById('close-inventory')?.addEventListener('click', () => this.toggleInventory(false));
        document.getElementById('close-interaction')?.addEventListener('click', () => this.closeInteraction());
        document.getElementById('restart-btn')?.addEventListener('click', () => location.reload());
    }
    toggleGameMenu(s?: boolean) {
        const m = document.getElementById('game-menu')!;
        const show = s !== undefined ? s : m.style.display !== 'block';
        m.style.display = show ? 'block' : 'none';
        this.isPaused = show; // Corrected from this.paused to this.isPaused
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
                            if (e.hp <= 0) this.killEnemy(e);
                        }
                    }
                });
            } else {
                this.particles.push({ x: this.player.x, y: this.player.y, life: 0.5, type: 'explosion', color: s.color });
                this.level.entities.forEach(e => {
                    if (e.type === 'enemy' && !e.dead && Math.hypot(this.input.mousePosWorld.x - e.x, this.input.mousePosWorld.y - e.y) < 280) {
                        e.hp -= s.damage;
                        if (s.effect === 'slow') e.slowTimer = 4;
                        if (s.effect === 'fear') e.fearTimer = 3;
                        if (s.effect === 'weaken') e.weakenTimer = 5;
                        if (s.effect === 'root') e.rootTimer = 2;
                        if (e.hp <= 0) this.killEnemy(e);
                    }
                });
            }
        }
        else if (s.type === 'buff') {
            if (s.effect === 'regen') { this.player.hp = Math.min(this.player.maxHp, this.player.hp + s.damage); }
            if (s.effect === 'haste') { /* Handled in spd naturally */ this.log("You feel faster!"); }
            if (s.effect === 'shield') { this.player.ac += s.damage; setTimeout(() => this.player.ac -= s.damage, 10000); this.log("Armor hardened!"); }
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
        this.log(`Casting ${s.name}`);
        this.player.cooldowns[sId] = s.cooldown; this.bufferedSpellSlot = null;
    }
    toggleInventory(s?: boolean) {
        const p = document.getElementById('inventory-panel')!;
        const side = document.querySelector('.sidebar-right') as HTMLElement;
        const sp = (s === undefined ? p.style.display === 'none' : s);
        p.style.display = sp ? 'block' : 'none';
        if (side) side.classList.toggle('visible', sp);
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
        const realX = Math.min(x, window.innerWidth - 320);
        let realY = y; if (realY + 280 > window.innerHeight) realY = window.innerHeight - 280;
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
        const realX = Math.min(x, window.innerWidth - 320);
        let realY = y; if (realY + 220 > window.innerHeight) realY = window.innerHeight - 220;
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

        panel.style.display = 'block';
        uiShop.style.display = 'none';
        uiLoot.style.display = 'none';
        uiDiag.style.display = 'none';

        if (e.type === 'npc') {
            uiDiag.style.display = 'block';
            const diagText = document.getElementById('dialogue-text')!;
            this.currentDialogue = MERCHANT_DIALOGUES[Math.floor(Math.random() * MERCHANT_DIALOGUES.length)];
            diagText.innerHTML = `"${this.currentDialogue}"`;

            document.getElementById('open-shop-btn')!.onclick = () => {
                uiDiag.style.display = 'none';
                uiShop.style.display = 'block';
                this.toggleInventory(true); // Open inventory with shop
                this.renderShop(e);
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
            const finalPrice = Math.floor(it.price * priceMult);
            sl.onclick = () => {
                if (p.gold >= finalPrice) {
                    if (p.addItem(it)) {
                        p.gold -= finalPrice;
                        e.inventory.splice(idx, 1);
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
        const loot = getRandomLoot(this.currentDepth, 20 + this.currentDepth * 15);
        if (e.carriesKey) {
            loot.push({ ...ITEM_POOL['vault_key'] });
            this.log("The enemy carried a gleaming key!");
        }

        // Dynamic Gold Drop
        const gMult = e.enemyType === 'Ogre' ? 3 : (e.enemyType === 'Lich' ? 5 : 1);
        const goldVal = Math.floor((10 + Math.random() * 20) * (1 + this.currentDepth * 0.2) * gMult);
        loot.push({
            id: 'gold_pile',
            name: `${goldVal} Gold Coins`,
            type: 'potion',
            value: goldVal,
            price: 0,
            icon: '💰',
            image: '',
            desc: 'A small pile of gold coins.',
            rarity: 'mithril'
        });

        this.level.entities.push({ x: e.x, y: e.y, type: 'chest', isCorpse: true, inventory: loot, dead: false });
    }
    goToLevel(d: number, down: boolean) {
        this.currentDepth = d; if (!this.levels.has(d)) this.levels.set(d, new Level(40 + d * 2, 40 + d * 2, d)); this.level = this.levels.get(d)!; this.projectiles = []; this.log(`Floor ${d}...`);
        if (this.player) {
            const t = down ? 'stairs-up' : 'stairs-down', sts = this.level.entities.find(ent => ent.type === t);
            if (sts) { const os = [[0, 80], [0, -80], [80, 0], [-80, 0]]; let f = false; for (let o of os) if (!this.level.isWall(sts.x + o[0], sts.y + o[1])) { this.player.x = sts.x + o[0]; this.player.y = sts.y + o[1]; f = true; break; } if (!f) { this.player.x = sts.x; this.player.y = sts.y; } }
            else { this.player.x = this.level.spawnX; this.player.y = this.level.spawnY; }
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
            } else {
                this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.type === 'explosion' ? (0.6 - p.life) * 180 : 6, 0, Math.PI * 2); this.ctx.fill();
            }
        });
        this.player.draw(this.ctx, this); this.ctx.restore(); this.updateHUD();
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
            if (sId) {
                const s = SPELL_DB[sId];
                sl.innerHTML = `<img src="${s.image}" class="item-icon" onerror="this.outerHTML='<span class=%22item-icon%22 style=%22font-size:32px;display:flex;align-items:center;justify-content:center;height:100%%22>${s.icon}</span>';">`;
                sl.style.opacity = p.cooldowns[sId] > 0 ? '0.4' : '1';
                sl.onmouseenter = ev => this.showSpellTT(s, ev.clientX, ev.clientY);
                sl.onmouseleave = () => this.hideTT();
            } else { sl.innerText = ''; sl.onmouseenter = null; }
        }
    }
    screenToWorld(mx: number, my: number) { const cx = this.canvas.width / 2, cy = this.canvas.height / 2; let x = mx - cx, y = (my - cy) / 0.7, a = -Math.PI / 4; const rx = x * Math.cos(a) - y * Math.sin(a), ry = x * Math.sin(a) + y * Math.cos(a); return { x: rx + this.player.x, y: ry + this.player.y }; }
}
