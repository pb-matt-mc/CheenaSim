import Phaser from 'phaser';
import PocketBaseService from '../services/PocketBaseService';
import { Sim } from '../entities/Sim';
import { ROOMS, roomAtPointer, type RoomName } from '../config/rooms';

export class HomeScene extends Phaser.Scene {
  private mySim!: Sim;
  private partnerSim!: Sim;

  constructor() {
    super({ key: 'HomeScene' });
  }

  async create(): Promise<void> {
    this.add.image(0, 0, 'house').setOrigin(0);

    const start = ROOMS.living_room;
    this.mySim      = new Sim(this, start.x, start.y, 'sim-violet', 'You');
    this.partnerSim = new Sim(this, start.x, start.y, 'sim-cyan',   'Partner');

    const { myRoom, partnerRoom } = await PocketBaseService.loadInitialPositions();
    this.mySim.setPosition(ROOMS[myRoom].x, ROOMS[myRoom].y);
    this.partnerSim.setPosition(ROOMS[partnerRoom].x, ROOMS[partnerRoom].y);

    await PocketBaseService.subscribeToPartner((room: RoomName) => {
      const coords = ROOMS[room];
      if (coords) this.partnerSim.walkTo(coords.x, coords.y);
    });

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const room = roomAtPointer(p.x, p.y);
      if (room) {
        this.mySim.walkTo(ROOMS[room].x, ROOMS[room].y);
        PocketBaseService.publishPosition(room, 'digital');
      }
    });
  }

  shutdown(): void {
    PocketBaseService.unsubscribeAll();
  }
}
