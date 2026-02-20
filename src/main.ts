import '../style.css'
import { Game } from './engine/Game'

document.addEventListener('DOMContentLoaded', () => {
    let gameInstance: Game | null = null;

    const startAdventure = () => {
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

                gameInstance = new Game(canvas);
                gameInstance.start();
            }, 500);
        }
    };

    // Start Game
    const startBtn = document.getElementById('start-btn');
    startBtn?.addEventListener('click', startAdventure);

    // Restart Logic
    const restartBtn = document.getElementById('restart-btn');
    restartBtn?.addEventListener('click', () => {
        window.location.reload(); // Simplest way to restart for now
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
