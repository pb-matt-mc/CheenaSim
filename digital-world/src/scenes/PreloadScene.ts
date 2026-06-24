import Phaser from 'phaser';
import { assetPath } from '../config/asset-manifest';

export interface PreloadSceneData {
  assets:      string[];
  targetScene: string;
  targetData?: object;
}

export class PreloadScene extends Phaser.Scene {
  private sceneData!: PreloadSceneData;

  constructor() { super({ key: 'PreloadScene' }); }

  init(data: PreloadSceneData): void { this.sceneData = data; }

  preload(): void {
    for (const key of this.sceneData.assets) {
      if (!this.textures.exists(key)) {
        this.load.image(key, assetPath(key));
      }
    }
    this._drawProgress();
  }

  create(): void {
    this.scene.start(this.sceneData.targetScene, this.sceneData.targetData);
  }

  private _drawProgress(): void {
    const bar = this.add.graphics();
    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0x8b7ff7);
      bar.fillRect(180, 310, 600 * v, 20);
    });
  }
}
