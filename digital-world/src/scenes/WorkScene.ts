import Phaser from 'phaser';

export class WorkScene extends Phaser.Scene {
  constructor() { super({ key: 'WorkScene' }); }

  create(): void {
    this.add.rectangle(480, 320, 960, 640, 0x0D1117);

    this.add.text(480, 80, '💼 At Work', {
      fontSize: '36px', color: '#8B7FF7', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(480, 140, 'Your partner is at work right now.', {
      fontSize: '16px', color: '#9AA7BD', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.rectangle(480, 320, 700, 240, 0x161B22).setStrokeStyle(1, 0x2D3748);
    this.add.text(480, 280, '🖥️', { fontSize: '72px' }).setOrigin(0.5);
    this.add.text(480, 360, 'Working hard...', {
      fontSize: '20px', color: '#4ADE80', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const leaveBtn = this.add.text(480, 540, '[ Head Home ]', {
      fontSize: '22px', color: '#2DD4BF', fontFamily: 'monospace',
      backgroundColor: '#0D1117', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    leaveBtn.on('pointerover', () => leaveBtn.setColor('#8B7FF7'));
    leaveBtn.on('pointerout',  () => leaveBtn.setColor('#2DD4BF'));
    leaveBtn.on('pointerdown', () => {
      document.dispatchEvent(new CustomEvent('cheena:leave-work'));
    });
  }
}
