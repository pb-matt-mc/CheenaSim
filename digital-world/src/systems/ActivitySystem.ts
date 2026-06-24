import type Phaser from 'phaser';
import type { LocationName } from '../config/rooms';
import { ACTIVITIES } from '../config/activities';
import type { PoiOverlay } from '../ui/PoiOverlay';
import PocketBaseService from '../services/PocketBaseService';

export class ActivitySystem {
  private currentActivity: string | null = null;

  constructor(private scene: Phaser.Scene, private poiOverlay: PoiOverlay) {
    document.addEventListener('cheena:start-activity', this._onStartActivity as EventListener);
    document.addEventListener('cheena:stop-activity',  this._onStopActivity  as EventListener);
    document.addEventListener('cheena:work-arrived',   this._onWorkArrived   as EventListener);
    document.addEventListener('cheena:leave-work',     this._onLeaveWork     as EventListener);
  }

  onRoomChange(newRoom: LocationName): void {
    if (newRoom === 'work') {
      this.poiOverlay.hide();
      PocketBaseService.publishActivity(null, 'driving');
      this.scene.scene.start('DrivingScene');
    } else {
      this.poiOverlay.showForRoom(newRoom);
    }
  }

  destroy(): void {
    document.removeEventListener('cheena:start-activity', this._onStartActivity as EventListener);
    document.removeEventListener('cheena:stop-activity',  this._onStopActivity  as EventListener);
    document.removeEventListener('cheena:work-arrived',   this._onWorkArrived   as EventListener);
    document.removeEventListener('cheena:leave-work',     this._onLeaveWork     as EventListener);
  }

  private _onStartActivity = (e: CustomEvent<{ activityId: string }>): void => {
    const def = ACTIVITIES[e.detail.activityId];
    if (!def) return;
    this.currentActivity = def.id;
    PocketBaseService.publishActivity(def.id, null);
    this.scene.scene.start(def.selfSceneKey);
  };

  private _onStopActivity = (): void => {
    this.currentActivity = null;
    PocketBaseService.clearActivity();
    this.scene.scene.start('HomeScene');
  };

  private _onWorkArrived = (): void => {
    PocketBaseService.publishActivity(null, 'at_work');
    this.scene.scene.start('WorkScene');
  };

  private _onLeaveWork = (): void => {
    PocketBaseService.publishActivity(null, null);
    PocketBaseService.publishPosition('garden', 'digital');
    this.scene.scene.start('HomeScene');
  };
}
