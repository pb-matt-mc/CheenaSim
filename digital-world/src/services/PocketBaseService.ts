import PocketBase from 'pocketbase';
import type { RoomName } from '../config/rooms';

const pb = new PocketBase(import.meta.env.VITE_PB_URL);

export interface UserSession {
  id: string;
  email: string;
  partnerId: string;
  avatarHue: number;
}

class PocketBaseService {
  session: UserSession | null = null;
  private myRecordId: string | null = null;
  private partnerRecordId: string | null = null;

  isLoggedIn(): boolean {
    return pb.authStore.isValid;
  }

  async restoreSession(): Promise<boolean> {
    if (!pb.authStore.isValid) return false;
    await this._loadRecordIds(pb.authStore.model!['id'] as string, pb.authStore.model!['partner'] as string);
    this.session = {
      id: pb.authStore.model!['id'] as string,
      email: pb.authStore.model!['email'] as string,
      partnerId: pb.authStore.model!['partner'] as string,
      avatarHue: (pb.authStore.model!['avatar_hue'] as number) ?? 260,
    };
    return true;
  }

  async signIn(email: string, password: string): Promise<void> {
    const auth = await pb.collection('users').authWithPassword(email, password);
    const u = auth.record;
    this.session = {
      id: u['id'] as string,
      email: u['email'] as string,
      partnerId: u['partner'] as string,
      avatarHue: (u['avatar_hue'] as number) ?? 260,
    };
    await this._loadRecordIds(u['id'] as string, u['partner'] as string);
  }

  private async _loadRecordIds(userId: string, partnerId: string): Promise<void> {
    const [myPos, partnerPos] = await Promise.all([
      pb.collection('positions').getFirstListItem(`user="${userId}"`),
      pb.collection('positions').getFirstListItem(`user="${partnerId}"`),
    ]);
    this.myRecordId = myPos['id'] as string;
    this.partnerRecordId = partnerPos['id'] as string;
  }

  async loadInitialPositions(): Promise<{ myRoom: RoomName; partnerRoom: RoomName }> {
    const [myPos, partnerPos] = await Promise.all([
      pb.collection('positions').getOne(this.myRecordId!),
      pb.collection('positions').getOne(this.partnerRecordId!),
    ]);
    return {
      myRoom: myPos['room'] as RoomName,
      partnerRoom: partnerPos['room'] as RoomName,
    };
  }

  async publishPosition(room: RoomName, source: 'digital' | 'physical'): Promise<void> {
    if (!this.myRecordId) return;
    await pb.collection('positions').update(this.myRecordId, { room, source });
  }

  async subscribeToPartner(cb: (room: RoomName) => void): Promise<void> {
    if (!this.partnerRecordId) return;
    await pb.collection('positions').subscribe(this.partnerRecordId, (e) => {
      cb(e.record['room'] as RoomName);
    });
  }

  async unsubscribeAll(): Promise<void> {
    await pb.collection('positions').unsubscribe('*');
  }
}

export default new PocketBaseService();
