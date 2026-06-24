import Phaser from 'phaser';
import { Sim } from '../entities/Sim';
import { ROOMS, type HouseRoom } from '../config/rooms';
import { ROOM_POIS } from '../config/room-pois';
import { ACTIVITIES } from '../config/activities';
import PocketBaseService from '../services/PocketBaseService';

export class RoomScene extends Phaser.Scene {
  private room!: HouseRoom;
  private mySim!: Sim;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private wasMoving = false;

  constructor() { super({ key: 'RoomScene' }); }

  init(data: { room: HouseRoom }): void {
    this.room = data.room;
  }

  create(): void {
    this.cameras.main.fadeIn(250, 0, 0, 0);

    const rd = ROOMS[this.room];
    this.add.image(0, 0, rd.bgKey).setOrigin(0);

    // Sim enters from doorway, walks to default room position
    this.mySim = new Sim(this, rd.sceneEntry.x, rd.sceneEntry.y, 'sim-violet', 'You');
    this.mySim.setScale(2.5);
    this.mySim.walkTo(rd.sceneP1.x, rd.sceneP1.y, false, 900);

    this._buildPoiCards();
    this._buildExitButton();

    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.input.keyboard!.on('keydown-ESC', () => this._exitRoom());
  }

  update(): void {
    const speed = 3;
    let dx = 0, dy = 0;
    if (this.wasd.A?.isDown) dx -= speed;
    if (this.wasd.D?.isDown) dx += speed;
    if (this.wasd.W?.isDown) dy -= speed;
    if (this.wasd.S?.isDown) dy += speed;

    const moving = dx !== 0 || dy !== 0;

    if (moving) {
      this.mySim.moveBy(dx, dy, 24, 936, 24, 616);
      if (!this.wasMoving) this.mySim.playAnim('walk');
    } else if (this.wasMoving) {
      this.mySim.playAnim('idle');
    }
    this.wasMoving = moving;
  }

  private _buildPoiCards(): void {
    const pois = ROOM_POIS[this.room] ?? [];
    for (const poi of pois) {
      const def = ACTIVITIES[poi.activityId];
      if (!def) continue;
      this._createCard(poi.x, poi.y, poi.cardTitle, poi.cardIcon, poi.cardColor, poi.activityId);
    }
  }

  private _createCard(
    poiX: number, poiY: number,
    title: string, icon: string, color: number,
    activityId: string,
  ): void {
    const cardW = 196, cardH = 52;
    const cardX = poiX, cardY = poiY - 100;

    // Dot marker at POI
    const dot = this.add.graphics();
    dot.fillStyle(color, 1);
    dot.fillCircle(0, 0, 7);
    dot.setPosition(poiX, poiY);
    this.tweens.add({ targets: dot, alpha: 0.25, duration: 900, yoyo: true, repeat: -1 });

    // Connector line
    const line = this.add.graphics();
    line.lineStyle(1, color, 0.45);
    line.lineBetween(poiX, cardY + cardH / 2 + 4, poiX, poiY - 8);

    // Card background
    const bg = this.add.graphics();
    const drawBg = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(0x0D1117, 0.93);
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      bg.lineStyle(hover ? 2.5 : 1.5, color, hover ? 1 : 0.8);
      bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
    };
    drawBg(false);
    bg.setPosition(cardX, cardY);
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH),
      Phaser.Geom.Rectangle.Contains,
    );

    const lbl = this.add.text(cardX, cardY, `${icon}  ${title}`, {
      fontSize: '15px',
      color: '#E6EAF2',
      fontFamily: 'ui-monospace, monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Float animation on card + connector
    this.tweens.add({
      targets: [bg, lbl, line],
      y: '+=7',
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    bg.on('pointerover', () => { drawBg(true); this.game.canvas.style.cursor = 'pointer'; });
    bg.on('pointerout',  () => { drawBg(false); this.game.canvas.style.cursor = ''; });
    bg.on('pointerdown', () => {
      this.game.canvas.style.cursor = '';
      PocketBaseService.publishActivity(activityId, null);
      this.scene.start(ACTIVITIES[activityId].selfSceneKey, { returnRoom: this.room });
    });
  }

  private _buildExitButton(): void {
    const btn = this.add.text(18, 16, '◀  Back', {
      fontSize: '13px',
      color: '#9AA7BD',
      fontFamily: 'ui-monospace, monospace',
      backgroundColor: 'rgba(13,17,23,0.82)',
      padding: { x: 10, y: 6 },
    }).setInteractive({ useHandCursor: true }).setDepth(10);

    btn.on('pointerover', () => btn.setColor('#E6EAF2'));
    btn.on('pointerout',  () => btn.setColor('#9AA7BD'));
    btn.on('pointerdown', () => this._exitRoom());
  }

  private _exitRoom(): void {
    this.game.canvas.style.cursor = '';
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HomeScene');
    });
  }

  shutdown(): void {
    this.game.canvas.style.cursor = '';
  }
}
