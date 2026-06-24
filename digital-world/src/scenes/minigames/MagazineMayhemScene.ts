import Phaser from 'phaser';
import type { HouseRoom } from '../../config/rooms';
import PocketBaseService from '../../services/PocketBaseService';

export class MagazineMayhemScene extends Phaser.Scene {
  private score = 0;
  private timeLeft = 30;
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private magazines: Phaser.GameObjects.Text[] = [];
  private countdownTimer!: Phaser.Time.TimerEvent;
  private returnRoom: HouseRoom = 'living_room';
  private playerRoom: HouseRoom = 'living_room';

  private paused = false;
  private pauseOverlay: Phaser.GameObjects.GameObject[] = [];

  constructor() { super({ key: 'MagazineMayhemScene' }); }

  init(data: { returnRoom?: HouseRoom; playerRoom?: HouseRoom }): void {
    this.returnRoom = data?.returnRoom ?? 'living_room';
    this.playerRoom = data?.playerRoom ?? this.returnRoom;
  }

  create(): void {
    this.score = 0;
    this.timeLeft = 30;
    this.magazines = [];
    this.paused = false;

    this.add.rectangle(480, 320, 960, 640, 0x1a1a2e);

    this.add.text(480, 60, 'Magazine Mayhem', {
      fontSize: '36px', color: '#8B7FF7', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(480, 110, 'Tap the magazines before time runs out!', {
      fontSize: '14px', color: '#9AA7BD', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.scoreText = this.add.text(80, 30, 'Score: 0', {
      fontSize: '20px', color: '#4ADE80', fontFamily: 'monospace',
    });

    this.timerText = this.add.text(800, 30, 'Time: 30', {
      fontSize: '20px', color: '#F5B547', fontFamily: 'monospace',
    });

    for (let i = 0; i < 5; i++) this._spawnMagazine();

    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: this._tick,
      callbackScope: this,
      repeat: 29,
    });

    this.input.keyboard!.on('keydown-ESC', () => {
      if (this.timeLeft <= 0) return; // already in end screen
      if (this.paused) this._resume(); else this._openPause();
    });
  }

  // ── Pause ──────────────────────────────────────────────────────────────────

  private _openPause(): void {
    this.paused = true;
    this.countdownTimer.paused = true;
    this.tweens.pauseAll();

    const dim = this.add.rectangle(480, 320, 960, 640, 0x000000, 0.55).setDepth(20);

    const panel = this.add.graphics().setDepth(21);
    panel.fillStyle(0x161B22, 1);
    panel.fillRoundedRect(330, 210, 300, 260, 16);
    panel.lineStyle(2, 0x8B7FF7, 0.9);
    panel.strokeRoundedRect(330, 210, 300, 260, 16);

    const title = this.add.text(480, 255, 'Paused', {
      fontSize: '28px', color: '#8B7FF7', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(22);

    const resume  = this._pauseBtn(480, 310, 'Resume',  '#4ADE80', () => this._resume());
    const restart = this._pauseBtn(480, 365, 'Restart', '#F5B547', () => {
      this._clearPause();
      this.scene.restart({ returnRoom: this.returnRoom, playerRoom: this.playerRoom });
    });
    const quit    = this._pauseBtn(480, 420, 'Quit',    '#F87171', () => {
      PocketBaseService.clearActivity();
      this.scene.start('RoomScene', { room: this.returnRoom, playerRoom: this.playerRoom });
    });

    this.pauseOverlay = [dim, panel, title, resume, restart, quit];
  }

  private _resume(): void {
    this._clearPause();
    this.paused = false;
    this.countdownTimer.paused = false;
    this.tweens.resumeAll();
  }

  private _clearPause(): void {
    this.pauseOverlay.forEach(o => o.destroy());
    this.pauseOverlay = [];
  }

  private _pauseBtn(
    x: number, y: number,
    label: string, color: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.add.text(x, y, label, {
      fontSize: '20px', color, fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(22).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setAlpha(0.75));
    btn.on('pointerout',  () => btn.setAlpha(1));
    btn.on('pointerdown', onClick);
    return btn;
  }

  // ── Game loop ──────────────────────────────────────────────────────────────

  private _spawnMagazine(): void {
    const emojis = ['📰', '📖', '📗', '📘', '📙'];
    const em = emojis[Phaser.Math.Between(0, emojis.length - 1)];
    const x = Phaser.Math.Between(80, 880);
    const y = Phaser.Math.Between(160, 560);
    const mag = this.add.text(x, y, em, { fontSize: '40px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: mag,
      x: x + Phaser.Math.Between(-60, 60),
      y: y + Phaser.Math.Between(-40, 40),
      duration: Phaser.Math.Between(1200, 2400),
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    mag.on('pointerdown', () => {
      if (this.paused) return;
      this.score++;
      this.scoreText.setText(`Score: ${this.score}`);
      this.tweens.add({
        targets: mag, alpha: 0, scaleX: 1.5, scaleY: 1.5,
        duration: 200,
        onComplete: () => {
          mag.destroy();
          this.magazines = this.magazines.filter(m => m !== mag);
          this._spawnMagazine();
        },
      });
    });

    this.magazines.push(mag);
  }

  private _tick(): void {
    this.timeLeft--;
    this.timerText.setText(`Time: ${this.timeLeft}`);
    if (this.timeLeft <= 0) this._endGame();
  }

  private _endGame(): void {
    this.countdownTimer.destroy();
    this.magazines.forEach(m => m.destroy());
    this.magazines = [];

    this.add.rectangle(480, 320, 600, 300, 0x161B22).setStrokeStyle(2, 0x8B7FF7);
    this.add.text(480, 240, "Time's Up!", {
      fontSize: '32px', color: '#8B7FF7', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.add.text(480, 300, `Final Score: ${this.score}`, {
      fontSize: '24px', color: '#4ADE80', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const backBtn = this.add.text(480, 370, '[ Back ]', {
      fontSize: '20px', color: '#2DD4BF', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#8B7FF7'));
    backBtn.on('pointerout',  () => backBtn.setColor('#2DD4BF'));
    backBtn.on('pointerdown', () => {
      PocketBaseService.clearActivity();
      this.scene.start('RoomScene', { room: this.returnRoom, playerRoom: this.playerRoom });
    });
  }
}
