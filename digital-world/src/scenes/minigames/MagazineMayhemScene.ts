import Phaser from 'phaser';

export class MagazineMayhemScene extends Phaser.Scene {
  private score = 0;
  private timeLeft = 30;
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private magazines: Phaser.GameObjects.Text[] = [];
  private countdownTimer!: Phaser.Time.TimerEvent;

  constructor() { super({ key: 'MagazineMayhemScene' }); }

  create(): void {
    this.score = 0;
    this.timeLeft = 30;
    this.magazines = [];

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
  }

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
    this.add.text(480, 240, 'Time\'s Up!', {
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
      document.dispatchEvent(new CustomEvent('cheena:stop-activity'));
    });
  }
}
