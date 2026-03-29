import '../style.css'
import { Game } from './engine/Game'

document.addEventListener('DOMContentLoaded', () => {
    let gameInstance: Game | null = null;

    const startAdventure = (sandbox = false) => {
        const homeView = document.getElementById('home-view');
        const gameView = document.getElementById('game-view');
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        const deathScreen = document.getElementById('death-screen');

        if (homeView && gameView && canvas) {
            homeView.style.opacity = '0';
            homeView.style.transition = 'opacity 0.5s ease';
            if (deathScreen) deathScreen.style.display = 'none';

            setTimeout(() => {
                homeView.style.display = 'none';
                gameView.style.display = 'block';

                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                const colorPicker = document.getElementById('player-color-picker') as HTMLInputElement;
                const selectedColor = colorPicker?.value || '#f39c12';

                gameInstance = new Game(canvas, sandbox, selectedColor);
                gameInstance.start();
            }, 500);
        }
    };

    // Start Game
    const startBtn = document.getElementById('start-btn');
    startBtn?.addEventListener('click', () => startAdventure(false));

    const sandboxBtn = document.getElementById('sandbox-btn');
    sandboxBtn?.addEventListener('click', () => startAdventure(true));

    // Restart Logic
    const restartBtn = document.getElementById('restart-btn');
    restartBtn?.addEventListener('click', () => {
        window.location.reload(); // Simplest way to restart for now
    });

    // Controls Toggle Logic
    const controlsPanel = document.getElementById('controls-panel');
    const closeControls = document.getElementById('close-controls');
    const controlsBtn = document.getElementById('controls-btn');
    const gameControlsBtn = document.getElementById('game-controls-btn');

    let waitingForBind: string | null = null;

    const updateControlsUI = () => {
        const saved = localStorage.getItem('dungeon_game_keybinds');
        const currentBinds = saved ? JSON.parse(saved) : (gameInstance ? gameInstance.keyBinds : {
            'moveUp': 'KeyW', 'moveDown': 'KeyS', 'moveLeft': 'KeyA', 'moveRight': 'KeyD',
            'inventory': 'Tab', 'map': 'KeyM', 'skills': 'KeyK',
            'melee1': 'KeyQ', 'melee2': 'KeyF', 'melee3': 'KeyR', 'melee4': 'KeyV',
            'pause': 'Space',
            'spell1': 'Digit1', 'spell2': 'Digit2', 'spell3': 'Digit3', 'spell4': 'Digit4',
            'spell5': 'Digit5', 'spell6': 'Digit6', 'spell7': 'Digit7', 'spell8': 'Digit8'
        });

        document.querySelectorAll('.controls-table tr[data-action]').forEach(tr => {
            const action = tr.getAttribute('data-action');
            if (action && currentBinds[action]) {
                const valEl = tr.querySelector('.key-bind-val');
                if (valEl) valEl.textContent = currentBinds[action].replace('Key', '').replace('Digit', '');
            }
        });
    };

    const toggleControls = (show?: boolean) => {
        if (!controlsPanel) return;
        const isShowing = show !== undefined ? show : controlsPanel.style.display === 'none';
        controlsPanel.style.display = isShowing ? 'block' : 'none';
        
        if (isShowing) {
            updateControlsUI();
            // Hide game menu if it's open
            const gameMenu = document.getElementById('game-menu');
            if (gameMenu) gameMenu.style.display = 'none';
        } else {
            // Cancel any active rebinding
            waitingForBind = null;
            document.querySelectorAll('.rebinding-row').forEach(r => r.classList.remove('rebinding-row'));
        }

        // If playing, sync pause state
        if (gameInstance) {
            gameInstance.isPaused = isShowing;
        }
    };

    controlsBtn?.addEventListener('click', () => toggleControls(true));
    gameControlsBtn?.addEventListener('click', () => toggleControls(true));
    closeControls?.addEventListener('click', () => toggleControls(false));

    // Rebinding Logic
    document.querySelectorAll('.controls-table tr[data-action]').forEach(tr => {
        tr.addEventListener('click', () => {
            if (waitingForBind) {
                document.querySelector('.rebinding-row')?.classList.remove('rebinding-row');
            }
            const action = tr.getAttribute('data-action');
            if (action) {
                waitingForBind = action;
                tr.classList.add('rebinding-row');
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        if (!waitingForBind) return;
        
        e.preventDefault();
        const newKey = e.code;

        // Allow Escape to cancel rebinding
        if (newKey === 'Escape') {
            waitingForBind = null;
            document.querySelectorAll('.rebinding-row').forEach(r => r.classList.remove('rebinding-row'));
            return;
        }

        // Prevent duplicate keys
        const saved = localStorage.getItem('dungeon_game_keybinds');
        const currentBinds = saved ? JSON.parse(saved) : (gameInstance?.keyBinds || {});
        
        // Find if this key is already used by another action
        let duplicateAction = null;
        for (const action in currentBinds) {
            if (currentBinds[action] === newKey && action !== waitingForBind) {
                duplicateAction = action;
                break;
            }
        }

        if (duplicateAction) {
            console.warn(`Key ${newKey} already bound to ${duplicateAction}!`);
            // Flash red on the row or something? 
            // For now just cancel and return to prevent bug
            waitingForBind = null;
            document.querySelectorAll('.rebinding-row').forEach(r => r.classList.remove('rebinding-row'));
            return;
        }

        if (gameInstance) {
            gameInstance.setKeyBind(waitingForBind, newKey);
        } else {
            // Temporary update if game hasn't started
            const binds = currentBinds;
            binds[waitingForBind] = newKey;
            localStorage.setItem('dungeon_game_keybinds', JSON.stringify(binds));
        }

        waitingForBind = null;
        document.querySelectorAll('.rebinding-row').forEach(r => r.classList.remove('rebinding-row'));
        updateControlsUI();
    });

    // Bat Spawner
    const batContainer = document.getElementById('bat-container');
    const spawnBat = () => {
        if (!batContainer) return;
        const bat = document.createElement('div');
        bat.style.position = 'absolute';
        bat.style.width = '15px';
        bat.style.height = '15px';
        bat.style.background = '#000';
        bat.style.clipPath = 'polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)';
        batContainer.appendChild(bat);

        const duration = 3000 + Math.random() * 4000;
        const startTop = Math.random() * 80 + 10;
        bat.animate([
            { left: '-50px', top: `${startTop}%` },
            { left: '110%', top: `${startTop - 10}%` }
        ], { duration });
        setTimeout(() => bat.remove(), duration);
    };
    setInterval(spawnBat, 4000);

    // Mouse Parallax
    document.addEventListener('mousemove', (e) => {
        const homeView = document.getElementById('home-view');
        if (homeView && homeView.style.display !== 'none') {
            const x = (e.clientX / window.innerWidth - 0.5) * 15;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;
            const container = document.querySelector('.dungeon-container') as HTMLElement;
            if (container) {
                container.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
            }
        }
    });
});
