import '../style.css'
import { Game } from './engine/Game'

document.addEventListener('DOMContentLoaded', () => {
    let gameInstance: Game | null = null;

    let pendingSandbox = false;
    let selectedColor = '#f39c12';
    let isRainbow = false;

    window.addEventListener('keydown', (e) => {
        if (e.key === '_') {
            const overlay = document.getElementById('color-picker-overlay');
            if (overlay && overlay.style.display !== 'none') {
                isRainbow = true;
                selectedColor = 'rainbow';
            }
        }
    });

    const animateRainbow = () => {
        if (isRainbow && document.getElementById('color-picker-overlay')?.style.display !== 'none') {
            const time = (Date.now() / 15) % 360;
            const c = `hsl(${time}, 100%, 50%)`;
            const swatch = document.getElementById('color-swatch-preview');
            const hex = document.getElementById('color-hex-display');
            const ring = document.getElementById('color-preview-ring');
            if (swatch) swatch.style.background = c;
            if (hex) hex.textContent = "RAINBOW";
            if (ring) ring.style.boxShadow = `0 0 30px 8px ${c}, inset 0 0 20px ${c}`;
            selectedColor = 'rainbow';
        }
        requestAnimationFrame(animateRainbow);
    };
    requestAnimationFrame(animateRainbow);

    // ── Color Wheel ────────────────────────────────────────────────────────────
    const drawColorWheel = () => {
        const canvas = document.getElementById('color-wheel-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = cx - 4;

        // Hue ring
        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 1) * Math.PI / 180;
            const endAngle = (angle + 1) * Math.PI / 180;
            const gradient = ctx.createRadialGradient(cx, cy, radius * 0.35, cx, cy, radius);
            gradient.addColorStop(0, `hsla(${angle}, 100%, 50%, 0)`);
            gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
            ctx.fill();
        }

        // White center fade
        const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.55);
        centerGrad.addColorStop(0, 'rgba(255,255,255,1)');
        centerGrad.addColorStop(0.6, 'rgba(255,255,255,0.6)');
        centerGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = centerGrad;
        ctx.fill();

        // Dark ring at edge
        const darkRing = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius);
        darkRing.addColorStop(0, 'rgba(0,0,0,0)');
        darkRing.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = darkRing;
        ctx.fill();
    };

    const getColorFromWheel = (canvas: HTMLCanvasElement, x: number, y: number): string => {
        const ctx = canvas.getContext('2d')!;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        return `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
    };

    const updateColorPreview = (color: string) => {
        selectedColor = color;
        const swatch = document.getElementById('color-swatch-preview');
        const hex = document.getElementById('color-hex-display');
        const ring = document.getElementById('color-preview-ring');
        if (swatch) swatch.style.background = color;
        if (hex) hex.textContent = color;
        if (ring) ring.style.boxShadow = `0 0 30px 8px ${color}, inset 0 0 20px ${color}`;
    };

    // ── Game Start Flow ────────────────────────────────────────────────────────
    const launchGame = (sandbox: boolean, color: string) => {
        const homeView = document.getElementById('home-view');
        const colorOverlay = document.getElementById('color-picker-overlay');
        const gameView = document.getElementById('game-view');
        const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        const deathScreen = document.getElementById('death-screen');

        if (colorOverlay) colorOverlay.style.display = 'none';
        if (homeView) homeView.style.display = 'none';
        if (deathScreen) deathScreen.style.display = 'none';

        if (gameView && gameCanvas) {
            gameView.style.display = 'block';
            gameCanvas.width = window.innerWidth;
            gameCanvas.height = window.innerHeight;
            gameInstance = new Game(gameCanvas, sandbox, color);
            gameInstance.start();
        }
    };

    const showColorPicker = (sandbox: boolean) => {
        pendingSandbox = sandbox;
        const homeView = document.getElementById('home-view');
        const overlay = document.getElementById('color-picker-overlay');

        if (homeView) {
            homeView.style.opacity = '0';
            homeView.style.transition = 'opacity 0.4s ease';
            setTimeout(() => {
                homeView.style.display = 'none';
                if (overlay) {
                    overlay.style.display = 'flex';
                    isRainbow = false;
                    selectedColor = '#f39c12';
                    updateColorPreview(selectedColor);
                    drawColorWheel();
                }
            }, 400);
        }
    };

    // Button wiring
    document.getElementById('start-btn')?.addEventListener('click', () => showColorPicker(false));
    document.getElementById('sandbox-btn')?.addEventListener('click', () => showColorPicker(true));

    // Color wheel interaction
    const wheelCanvas = document.getElementById('color-wheel-canvas') as HTMLCanvasElement;
    let isPicking = false;

    const pickColor = (e: MouseEvent | TouchEvent) => {
        const canvas = wheelCanvas;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        let clientX: number, clientY: number;
        if (e instanceof TouchEvent) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist > cx) return; // outside wheel
        const color = getColorFromWheel(canvas, Math.round(x), Math.round(y));
        if (color !== '#000000' && color !== '#ffffff') {
            isRainbow = false;
            updateColorPreview(color);
        }
    };

    wheelCanvas?.addEventListener('mousedown', (e) => { isPicking = true; pickColor(e); });
    wheelCanvas?.addEventListener('mousemove', (e) => { if (isPicking) pickColor(e); });
    window.addEventListener('mouseup', () => { isPicking = false; });
    wheelCanvas?.addEventListener('touchstart', (e) => { e.preventDefault(); pickColor(e); });
    wheelCanvas?.addEventListener('touchmove', (e) => { e.preventDefault(); pickColor(e); });

    // Confirm / Back
    document.getElementById('color-confirm-btn')?.addEventListener('click', () => {
        launchGame(pendingSandbox, selectedColor);
    });

    document.getElementById('color-back-btn')?.addEventListener('click', () => {
        const overlay = document.getElementById('color-picker-overlay');
        const homeView = document.getElementById('home-view');
        if (overlay) overlay.style.display = 'none';
        if (homeView) {
            homeView.style.display = 'block';
            homeView.style.opacity = '0';
            requestAnimationFrame(() => {
                homeView.style.transition = 'opacity 0.4s ease';
                homeView.style.opacity = '1';
            });
        }
    });

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
