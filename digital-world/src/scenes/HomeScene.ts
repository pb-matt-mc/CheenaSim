import Phaser from 'phaser';
import PocketBaseService from '../services/PocketBaseService';
import { Sim } from '../entities/Sim';
import { ROOMS, roomAtPointer, type LocationName, type HouseRoom } from '../config/rooms';
import { ROOM_ENTER_ANIMS, WORK_DRIVING_ANIM } from '../config/room-enter-anims';
import { ACTIVITIES } from '../config/activities';
import { AnimationPlayer } from '../systems/AnimationPlayer';
import { ActivitySystem } from '../systems/ActivitySystem';
import { PoiOverlay } from '../ui/PoiOverlay';

export class HomeScene extends Phaser.Scene {
  private mySim!: Sim;
  private partnerSim!: Sim;
  private myAnimPlayer!: AnimationPlayer;
  private partnerAnimPlayer!: AnimationPlayer;
  private activitySystem!: ActivitySystem;
  private poiOverlay!: PoiOverlay;

  constructor() {
    super({ key: 'HomeScene' });
  }

  async create(): Promise<void> {
    this.add.image(0, 0, 'house').setOrigin(0);

    const start = ROOMS.living_room;
    this.mySim      = new Sim(this, start.x, start.y, 'sim-violet', 'You');
    this.partnerSim = new Sim(this, start.x, start.y, 'sim-cyan',   'Partner');

    this.myAnimPlayer      = new AnimationPlayer(this, this.mySim);
    this.partnerAnimPlayer = new AnimationPlayer(this, this.partnerSim);

    const container = this.game.canvas.parentElement ?? document.body;
    this.poiOverlay     = new PoiOverlay(container);
    this.activitySystem = new ActivitySystem(this, this.poiOverlay);

    const initial = await PocketBaseService.loadInitialPositions();

    // Place my sim
    const myRoom = initial.myRoom;
    if (PocketBaseService.isHouseRoom(myRoom)) {
      this.mySim.setPosition(ROOMS[myRoom].x, ROOMS[myRoom].y);
      this.myAnimPlayer.play(ROOM_ENTER_ANIMS[myRoom]);
    } else {
      // 'work' — hide from house view
      this.mySim.setVisible(false);
    }

    // Place partner sim
    this._applyPartnerState(
      initial.partnerRoom,
      initial.partnerActivity,
      initial.partnerActivityState,
    );

    // Show poi overlay for current room
    if (PocketBaseService.isHouseRoom(myRoom)) {
      this.poiOverlay.showForRoom(myRoom);
    }

    await PocketBaseService.subscribeToPartner((payload) => {
      this._applyPartnerState(payload.room, payload.activity, payload.activity_state);
    });

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const room = roomAtPointer(p.x, p.y);
      if (!room) return;

      const loc: LocationName = room;
      this.myAnimPlayer.play(ROOM_ENTER_ANIMS[room as HouseRoom]);
      this.poiOverlay.showForRoom(room as HouseRoom);
      PocketBaseService.publishPosition(loc, 'digital');
      this.activitySystem.onRoomChange(loc);
    });
  }

  private _applyPartnerState(
    room: LocationName,
    activity: string | null,
    activityState: string | null,
  ): void {
    if (room === 'work') {
      if (activityState === 'driving') {
        this.partnerSim.setVisible(true);
        this.partnerAnimPlayer.play(WORK_DRIVING_ANIM);
      } else {
        // at_work — hide from house
        this.partnerSim.setVisible(false);
        this.partnerAnimPlayer.stop();
      }
      return;
    }

    this.partnerSim.setVisible(true);

    if (activity && ACTIVITIES[activity]) {
      this.partnerAnimPlayer.play(ACTIVITIES[activity].partnerAnim);
    } else {
      this.partnerAnimPlayer.play(ROOM_ENTER_ANIMS[room as HouseRoom]);
    }
  }

  shutdown(): void {
    this.activitySystem.destroy();
    this.poiOverlay.hide();
    PocketBaseService.unsubscribeAll();
  }
}
