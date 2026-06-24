import Phaser from 'phaser';

export class DrivingScene extends Phaser.Scene {
  private road!: Phaser.GameObjects.Rectangle;
  private stripes: Phaser.GameObjects.Rectangle[] = [];
  private statusText!: Phaser.GameObjects.Text;
  private arrivedBtn!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'DrivingScene' }); }

  create(): void {
    this.add.rectangle(480, 320, 960, 640, 0x1a1a2e);

    this.road = this.add.rectangle(480, 380, 960, 180, 0x2D3748);

    for (let i = 0; i < 10; i++) {
      const stripe = this.add.rectangle(i * 120 - 60, 380, 60, 12, 0xF5B547);
      this.stripes.push(stripe);
    }

    this.add.text(480, 100, '🚗', { fontSize: '64px' }).setOrigin(0.5);

    this.statusText = this.add.text(480, 200, 'Driving to work...', {
      fontSize: '28px', color: '#8B7FF7', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(480, 250, 'Tap "Arrived" when you get there', {
      fontSize: '14px', color: '#9AA7BD', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.arrivedBtn = this.add.text(480, 520, '[ Arrived at Work ]', {
      fontSize: '22px', color: '#4ADE80', fontFamily: 'monospace',
      backgroundColor: '#0D1117', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.arrivedBtn.on('pointerover', () => this.arrivedBtn.setColor('#8B7FF7'));
    this.arrivedBtn.on('pointerout',  () => this.arrivedBtn.setColor('#4ADE80'));
    this.arrivedBtn.on('pointerdown', () => {
      document.dispatchEvent(new CustomEvent('cheena:work-arrived'));
    });

    this.time.addEvent({
      delay: 16,
      callback: this._scrollRoad,
      callbackScope: this,
      loop: true,
    });
  }

  private _scrollRoad(): void {
    for (const s of this.stripes) {
      s.x += 4;
      if (s.x > 1020) s.x -= 1080;
    }
  }
}
