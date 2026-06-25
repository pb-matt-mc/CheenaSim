export class Sim {
  sprite: Phaser.GameObjects.Sprite;
  label:  Phaser.GameObjects.Text;
  private _scale = 1;
  private _activeTween: Phaser.Tweens.Tween | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    name: string,
  ) {
    const labelColor = textureKey === 'boy' ? '#b794c8' : '#00c8c8';

    this.sprite = scene.add.sprite(x, y, textureKey);
    this.sprite.play(`${textureKey}_idle`);
    this.label = scene.add
      .text(x, y + this._labelOffsetY, name, {
        fontSize: '11px',
        color: labelColor,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);
  }

  private get _labelOffsetY(): number {
    return 32 * this._scale + 4;
  }

  walkTo(x: number, y: number, skipIdleOnComplete = false, duration = 700, onComplete?: () => void): void {
    this.stopWalk();
    this.sprite.play(`${this.sprite.texture.key}_walk`, true);
    this._activeTween = this.sprite.scene.tweens.add({
      targets: this.sprite,
      x, y,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.label.setPosition(this.sprite.x, this.sprite.y + this._labelOffsetY);
      },
      onComplete: () => {
        this._activeTween = null;
        this.label.setPosition(x, y + this._labelOffsetY);
        if (!skipIdleOnComplete) this.sprite.play(`${this.sprite.texture.key}_idle`);
        onComplete?.();
      },
    });
  }

  stopWalk(): void {
    this._activeTween?.stop();
    this._activeTween = null;
  }

  /** Direct WASD movement — stops any ongoing walk tween */
  moveBy(dx: number, dy: number, minX = 20, maxX = 940, minY = 20, maxY = 620): void {
    this.stopWalk();
    const nx = Phaser.Math.Clamp(this.sprite.x + dx, minX, maxX);
    const ny = Phaser.Math.Clamp(this.sprite.y + dy, minY, maxY);
    this.sprite.setPosition(nx, ny);
    this.label.setPosition(nx, ny + this._labelOffsetY);
  }

  playAnim(key: string): void {
    this.sprite.play(`${this.sprite.texture.key}_${key}`, true);
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.label.setPosition(x, y + this._labelOffsetY);
  }

  setVisible(visible: boolean): void {
    this.sprite.setVisible(visible);
    this.label.setVisible(visible);
  }

  setScale(s: number): void {
    this._scale = s;
    this.sprite.setScale(s);
    this.label.setPosition(this.sprite.x, this.sprite.y + this._labelOffsetY);
    this.label.setFontSize(Math.round(11 * s));
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
}
