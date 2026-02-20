
const fs = require('fs');
const content = fs.readFileSync('c:/Users/danie/.gemini/antigravity/scratch/dungeon-game/src/engine/Game.ts', 'utf8');
const spellDbMatch = content.match(/const SPELL_DB: Record<string, Spell> = \{([\s\S]*?)\};/);
if (spellDbMatch) {
    const spellDbLines = spellDbMatch[1].split('\n');
    const icons = [];
    spellDbLines.forEach(line => {
        const iconMatch = line.match(/icon: '(.+?)'/);
        if (iconMatch) {
            icons.push(iconMatch[1]);
        }
    });
    const counts = {};
    icons.forEach(icon => {
        counts[icon] = (counts[icon] || 0) + 1;
    });
    const duplicates = Object.keys(counts).filter(icon => counts[icon] > 1);
    if (duplicates.length > 0) {
        console.log('Duplicate icons found:', duplicates);
        duplicates.forEach(icon => {
            console.log(`Icon ${icon} appears ${counts[icon]} times.`);
        });
    } else {
        console.log('No duplicate icons found! Total unique icons:', icons.length);
    }
} else {
    console.log('SPELL_DB not found');
}
