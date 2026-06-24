import type { Sim } from '../entities/Sim';
import type { AnimSequence } from '../config/room-enter-anims';

export class AnimationPlayer {
  private _timer: Phaser.Time.TimerEvent | null = null;

  constructor(private scene: Phaser.Scene, private sim: Sim) {}

  play(seq: AnimSequence, stepIndex = 0): void {
    this.stop();
    const step = seq[stepIndex];
    if (!step) return;
    if (step.moveTo) this.sim.walkTo(step.moveTo.x, step.moveTo.y, true);
    this.sim.playAnim(step.anim);
    if (step.loop) return;
    this._timer = this.scene.time.delayedCall(step.duration, () => {
      this.play(seq, stepIndex + 1);
    });
  }

  stop(): void {
    this._timer?.destroy();
    this._timer = null;
  }
}
