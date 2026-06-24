import type Phaser from 'phaser';
import type { LocationName } from '../config/rooms';
import PocketBaseService from '../services/PocketBaseService';

export class ActivitySystem {
  constructor(private scene: Phaser.Scene) {
    document.addEventListener('cheena:work-arrived', this._onWorkArrived as EventListener);
    document.addEventListener('cheena:leave-work',   this._onLeaveWork   as EventListener);
  }

  /** Call when the player's location changes (e.g. NFC trigger) */
  onRoomChange(newRoom: LocationName): void {
    if (newRoom === 'work') {
      PocketBaseService.publishActivity(null, 'driving');
      this.scene.scene.start('DrivingScene');
    }
    // House rooms: RoomScene handles POI display — nothing to do here
  }

  destroy(): void {
    document.removeEventListener('cheena:work-arrived', this._onWorkArrived as EventListener);
    document.removeEventListener('cheena:leave-work',   this._onLeaveWork   as EventListener);
  }

  private _onWorkArrived = (): void => {
    PocketBaseService.publishActivity(null, 'at_work');
    this.scene.scene.start('WorkScene');
  };

  private _onLeaveWork = (): void => {
    PocketBaseService.clearActivity();
    PocketBaseService.publishPosition('garden', 'digital');
    this.scene.scene.start('HomeScene');
  };
}
