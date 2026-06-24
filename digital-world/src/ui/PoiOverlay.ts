import type { HouseRoom } from '../config/rooms';
import { ACTIVITIES } from '../config/activities';

export class PoiOverlay {
  private el: HTMLElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'poi-overlay';
    container.appendChild(this.el);
  }

  showForRoom(room: HouseRoom): void {
    this.el.innerHTML = '';
    const matching = Object.values(ACTIVITIES).filter(a => a.rooms.includes(room));
    if (matching.length === 0) { this.hide(); return; }

    for (const act of matching) {
      const btn = document.createElement('button');
      btn.className = 'poi-btn';
      btn.textContent = `${act.icon} ${act.label}`;
      btn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('cheena:start-activity', { detail: { activityId: act.id } }));
      });
      this.el.appendChild(btn);
    }

    const stop = document.createElement('button');
    stop.className = 'poi-btn poi-stop';
    stop.textContent = '✕ Stop';
    stop.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('cheena:stop-activity'));
    });
    this.el.appendChild(stop);

    this.el.style.display = 'flex';
  }

  hide(): void {
    this.el.style.display = 'none';
    this.el.innerHTML = '';
  }
}
