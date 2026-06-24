export class Sim {
  sprite: Phaser.GameObjects.Sprite;
  label:  Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    name: string,
  ) {
    const labelColor = textureKey === 'sim-violet' ? '#b794c8' : '#00c8c8';

    this.sprite = scene.add.sprite(x, y, textureKey);
    this.sprite.play(`${textureKey}_idle`);
    this.label = scene.add
      .text(x, y + 28, name, {
        fontSize: '11px',
        color: labelColor,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);
  }

  walkTo(x: number, y: number, skipIdleOnComplete = false): void {
    this.sprite.scene.tweens.add({
      targets: [this.sprite, this.label],
      x, y,
      duration: 800,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (!skipIdleOnComplete) {
          this.sprite.play(`${this.sprite.texture.key}_idle`);
        }
      },
    });
  }

  playAnim(key: string): void {
    this.sprite.play(`${this.sprite.texture.key}_${key}`, true);
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.label.setPosition(x, y + 28);
  }

  setVisible(visible: boolean): void {
    this.sprite.setVisible(visible);
    this.label.setVisible(visible);
  }
}
