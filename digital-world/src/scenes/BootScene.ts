import Phaser from 'phaser';
import PocketBaseService from '../services/PocketBaseService';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.image('house', 'assets/house.png');
    this.load.spritesheet('boy',  'assets/boy.png',  { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('girl', 'assets/girl.png', { frameWidth: 64, frameHeight: 64 });
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
    this._createIdleAnim('boy');
    this._createIdleAnim('girl');

    if (PocketBaseService.isLoggedIn()) {
      PocketBaseService.restoreSession().then((ok) => {
        if (ok) {
          this.scene.start('HomeScene');
        } else {
          this._showLogin();
        }
      }).catch(() => {
        this._showLogin();
      });
    } else {
      this._showLogin();
    }
  }

  private _createIdleAnim(key: string): void {
    this.anims.create({
      key:       `${key}_idle`,
      frames:    this.anims.generateFrameNumbers(key, { start: 0, end: 0 }),
      frameRate: 1,
      repeat:    -1,
    });
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
