import Phaser from 'phaser';
import PocketBaseService from '../services/PocketBaseService';
import { Sim } from '../entities/Sim';
import { ROOMS, roomAtPointer, type LocationName, type HouseRoom } from '../config/rooms';
import { WORK_DRIVING_ANIM } from '../config/room-enter-anims';
import { ACTIVITIES } from '../config/activities';
import { AnimationPlayer } from '../systems/AnimationPlayer';
import { ActivitySystem } from '../systems/ActivitySystem';

export class HomeScene extends Phaser.Scene {
  private mySim!: Sim;
  private partnerSim!: Sim;
  private partnerAnimPlayer!: AnimationPlayer;
  private activitySystem!: ActivitySystem;
  private _currentRoom: HouseRoom = 'living_room';
  private _partnerRoom: LocationName = 'living_room';
  private _navigating = false;

  constructor() { super({ key: 'HomeScene' }); }

  async create(): Promise<void> {
    this.cameras.main.fadeIn(250, 0, 0, 0);
    this.add.image(0, 0, 'house').setOrigin(0);

    const start = ROOMS.living_room;
    this.mySim      = new Sim(this, start.p1.x, start.p1.y, 'boy',  'You');
    this.partnerSim = new Sim(this, start.p2.x, start.p2.y, 'girl', 'Partner');

    this.partnerAnimPlayer = new AnimationPlayer(this, this.partnerSim);
    this.activitySystem    = new ActivitySystem(this);

    const initial = await PocketBaseService.loadInitialPositions();

    const myRoom = PocketBaseService.isHouseRoom(initial.myRoom)
      ? initial.myRoom : 'garden' as HouseRoom;
    this._currentRoom = myRoom;

    const partnerRoom = initial.partnerRoom;

    // My sim: at p1 unless partner is also there (then use offset naturally via p1/p2 distinction)
    this.mySim.setPosition(ROOMS[myRoom].p1.x, ROOMS[myRoom].p1.y);
    this.mySim.playAnim('idle');

    if (!PocketBaseService.isHouseRoom(initial.myRoom)) this.mySim.setVisible(false);

    this._applyPartnerState(partnerRoom, initial.partnerActivity, initial.partnerActivityState);

    await PocketBaseService.subscribeToPartner((payload) => {
      this._applyPartnerState(payload.room, payload.activity, payload.activity_state);
    });

    // Click → zoom into that room (independent of sim position)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const room = roomAtPointer(p.x, p.y);
      if (!room) return;
      this._zoomInto(room);
    });

    // 1-6 → simulate physical NFC board: move sim only, no zoom
    const hotkeys: Record<string, HouseRoom> = {
      ONE: 'bedroom', TWO: 'bathroom', THREE: 'kitchen',
      FOUR: 'living_room', FIVE: 'garden', SIX: 'study',
    };
    for (const [code, room] of Object.entries(hotkeys)) {
      this.input.keyboard!.on(`keydown-${code}`, () => {
        if (this._navigating) return;
        PocketBaseService.publishPosition(room, 'digital');
        this._navigateToRoom(room);
      });
    }
  }

  /** Zoom camera into a room — does NOT move the sim */
  private _zoomInto(room: HouseRoom): void {
    this.mySim.stopWalk();
    this._navigating = false;
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('RoomScene', { room, playerRoom: this._currentRoom, partnerRoom: this._partnerRoom });
    });
  }

  /** Walk sim through the corridor to target room (physical board simulation) */
  private _navigateToRoom(target: HouseRoom): void {
    this._navigating = true;
    const from = ROOMS[this._currentRoom];
    const to   = ROOMS[target];

    const waypoints: { x: number; y: number }[] = [];
    if (target !== this._currentRoom) {
      waypoints.push(from.door);
      if (from.door.x !== to.door.x) waypoints.push({ x: to.door.x, y: from.door.y });
      waypoints.push(to.door);
    }
    waypoints.push(to.p1);

    this._walkPath(this.mySim, waypoints, () => {
      this._currentRoom = target;
      this._navigating = false;
    });
  }

  /** Chain walkTo calls through a list of waypoints, firing onDone after the last */
  private _walkPath(
    sim: Sim,
    waypoints: { x: number; y: number }[],
    onDone?: () => void,
  ): void {
    const [first, ...rest] = waypoints;
    if (!first) { onDone?.(); return; }
    const isLast = rest.length === 0;
    sim.walkTo(
      first.x, first.y,
      /* skipIdleOnComplete */ !isLast,
      /* duration */ 550,
      isLast ? onDone : () => this._walkPath(sim, rest, onDone),
    );
  }

  private _applyPartnerState(
    room: LocationName,
    activity: string | null,
    activityState: string | null,
  ): void {
    this._partnerRoom = room;
    if (room === 'work') {
      if (activityState === 'driving') {
        this.partnerSim.setVisible(true);
        this.partnerAnimPlayer.play(WORK_DRIVING_ANIM);
      } else {
        this.partnerSim.setVisible(false);
        this.partnerAnimPlayer.stop();
      }
      return;
    }

    this.partnerSim.setVisible(true);
    const rd = ROOMS[room as HouseRoom];

    // Use p2 position if partner is in same room as me, else p1
    const pos = (room as HouseRoom) === this._currentRoom ? rd.p2 : rd.p1;
    this.partnerSim.setPosition(pos.x, pos.y);

    if (activity && ACTIVITIES[activity]) {
      this.partnerAnimPlayer.play(ACTIVITIES[activity].partnerAnim);
    } else {
      this.partnerSim.playAnim('idle');
      this.partnerAnimPlayer.stop();
    }
  }

  shutdown(): void {
    this.activitySystem.destroy();
    PocketBaseService.unsubscribeAll();
  }
}
