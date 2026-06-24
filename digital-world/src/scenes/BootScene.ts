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
    this.anims.create({
      key: `${key}_idle`,
      frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
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
