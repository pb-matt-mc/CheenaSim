import Phaser from 'phaser';
import PocketBaseService from '../services/PocketBaseService';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.image('house', 'assets/house.png');
    this.load.spritesheet('sim-violet', 'assets/sim-violet.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('sim-cyan',   'assets/sim-cyan.png',   { frameWidth: 32, frameHeight: 48 });
    // Room plate backgrounds (core rooms loaded at boot; work+driving lazy-loaded via PreloadScene)
    this.load.image('rooms/bedroom-bg',     'assets/rooms/bedroom-bg.png');
    this.load.image('rooms/bathroom-bg',    'assets/rooms/bathroom-bg.png');
    this.load.image('rooms/kitchen-bg',     'assets/rooms/kitchen-bg.png');
    this.load.image('rooms/living-room-bg', 'assets/rooms/living-room-bg.png');
    this.load.image('rooms/garden-bg',      'assets/rooms/garden-bg.png');
    this.load.image('rooms/study-bg',       'assets/rooms/study-bg.png');
    this.load.image('rooms/work-bg',        'assets/rooms/work-bg.png');
    this.load.image('rooms/driving-bg',     'assets/rooms/driving-bg.png');
  }

  create(): void {
    this._createAnims('sim-violet');
    this._createAnims('sim-cyan');

    if (PocketBaseService.isLoggedIn()) {
      PocketBaseService.restoreSession().then((ok) => {
        if (ok) {
          this.scene.start('HomeScene');
        } else {
          this._showLogin();
        }
      });
    } else {
      this._showLogin();
    }
  }

  private _createAnims(key: string): void {
    const defs = [
      { suffix: '_idle',             start:  0, end:  3, rate: 4, repeat: -1 },
      { suffix: '_walk',             start:  4, end:  7, rate: 8, repeat: -1 },
      { suffix: '_sit_couch',        start:  8, end: 10, rate: 6, repeat:  0 },
      { suffix: '_idle_sitting',     start: 11, end: 12, rate: 2, repeat: -1 },
      { suffix: '_sit_desk',         start: 13, end: 15, rate: 6, repeat:  0 },
      { suffix: '_reading_magazine', start: 16, end: 19, rate: 4, repeat: -1 },
      { suffix: '_driving',          start: 20, end: 21, rate: 4, repeat: -1 },
    ] as const;

    for (const d of defs) {
      this.anims.create({
        key:       `${key}${d.suffix}`,
        frames:    this.anims.generateFrameNumbers(key, { start: d.start, end: d.end }),
        frameRate: d.rate,
        repeat:    d.repeat,
      });
    }
  }

  private _showLogin(): void {
    const overlay = document.getElementById('login-overlay')!;
    const btn     = document.getElementById('login-btn')!;
    const errEl   = document.getElementById('login-error')!;

    overlay.classList.add('visible');

    btn.addEventListener('click', async () => {
      const email    = (document.getElementById('login-email') as HTMLInputElement).value.trim();
      const password = (document.getElementById('login-password') as HTMLInputElement).value;
      errEl.style.display = 'none';
      btn.textContent = 'signing in…';

      try {
        await PocketBaseService.signIn(email, password);
        overlay.classList.remove('visible');
        this.scene.start('HomeScene');
      } catch {
        errEl.textContent = 'invalid email or password';
        errEl.style.display = 'block';
        btn.textContent = 'sign in';
      }
    });
  }
}
