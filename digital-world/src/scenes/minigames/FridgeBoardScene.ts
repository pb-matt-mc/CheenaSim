import Phaser from 'phaser';
import type { HouseRoom, LocationName } from '../../config/rooms';
import PocketBaseService from '../../services/PocketBaseService';

export class FridgeBoardScene extends Phaser.Scene {
  private iframe:      HTMLIFrameElement | null = null;
  private msgHandler:  ((e: MessageEvent) => void) | null = null;
  private returnRoom:  HouseRoom    = 'kitchen';
  private playerRoom:  HouseRoom    = 'kitchen';
  private partnerRoom: LocationName = 'kitchen';

  constructor() { super({ key: 'FridgeBoardScene' }); }

  init(data: { returnRoom?: HouseRoom; playerRoom?: HouseRoom; partnerRoom?: LocationName }): void {
    this.returnRoom  = data?.returnRoom  ?? 'kitchen';
    this.playerRoom  = data?.playerRoom  ?? this.returnRoom;
    this.partnerRoom = data?.partnerRoom ?? 'kitchen';
  }

  create(): void {
    this.game.canvas.style.display = 'none';

    const iframe = document.createElement('iframe');
    iframe.src = 'minigames/fridge-board/index.html';
    iframe.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:none;z-index:9999;';
    document.body.appendChild(iframe);
    this.iframe = iframe;

    this.msgHandler = (e: MessageEvent) => {
      if (e.data?.type === 'MINIGAME_END') this._exit();
    };
    window.addEventListener('message', this.msgHandler);

    this.input.keyboard!.on('keydown-ESC', () => this._exit());
  }

  private _exit(): void {
    this.iframe?.remove();
    this.iframe = null;
    if (this.msgHandler) {
      window.removeEventListener('message', this.msgHandler);
      this.msgHandler = null;
    }
    this.game.canvas.style.display = '';
    PocketBaseService.clearActivity();
    this.scene.start('RoomScene', {
      room:        this.returnRoom,
      playerRoom:  this.playerRoom,
      partnerRoom: this.partnerRoom,
    });
  }

  shutdown(): void {
    this.iframe?.remove();
    this.iframe = null;
    if (this.msgHandler) {
      window.removeEventListener('message', this.msgHandler);
      this.msgHandler = null;
    }
    this.game.canvas.style.display = '';
  }
}
