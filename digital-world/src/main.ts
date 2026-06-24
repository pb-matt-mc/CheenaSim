import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HomeScene } from './scenes/HomeScene';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  backgroundColor: '#1a1a2e',
  scene: [BootScene, HomeScene],
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
