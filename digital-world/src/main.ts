import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HomeScene } from './scenes/HomeScene';
import { RoomScene } from './scenes/RoomScene';
import { PreloadScene } from './scenes/PreloadScene';
import { DrivingScene } from './scenes/DrivingScene';
import { WorkScene } from './scenes/WorkScene';
import { MagazineMayhemScene } from './scenes/minigames/MagazineMayhemScene';
import { FridgeBoardScene } from './scenes/minigames/FridgeBoardScene';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  backgroundColor: '#1a1a2e',
  pixelArt: true,
  scene: [BootScene, PreloadScene, HomeScene, RoomScene, DrivingScene, WorkScene, MagazineMayhemScene, FridgeBoardScene],
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
