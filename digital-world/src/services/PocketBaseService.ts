import PocketBase from 'pocketbase';
import type { LocationName, HouseRoom } from '../config/rooms';

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

  async loadInitialPositions(): Promise<{
    myRoom: LocationName; partnerRoom: LocationName;
    myActivity: string | null; partnerActivity: string | null;
    myActivityState: string | null; partnerActivityState: string | null;
  }> {
    const [myPos, partnerPos] = await Promise.all([
      pb.collection('positions').getOne(this.myRecordId!),
      pb.collection('positions').getOne(this.partnerRecordId!),
    ]);
    return {
      myRoom:               myPos['room'] as LocationName,
      partnerRoom:          partnerPos['room'] as LocationName,
      myActivity:           (myPos['activity'] as string) || null,
      partnerActivity:      (partnerPos['activity'] as string) || null,
      myActivityState:      (myPos['activity_state'] as string) || null,
      partnerActivityState: (partnerPos['activity_state'] as string) || null,
    };
  }

  async publishPosition(room: LocationName, source: 'digital' | 'physical'): Promise<void> {
    if (!this.myRecordId) return;
    await pb.collection('positions').update(this.myRecordId, { room, source });
  }

  async publishActivity(activityId: string | null, state: string | null): Promise<void> {
    if (!this.myRecordId) return;
    await pb.collection('positions').update(this.myRecordId, {
      activity:       activityId,
      activity_state: state,
    });
  }

  async subscribeToPartner(cb: (payload: {
    room: LocationName;
    activity: string | null;
    activity_state: string | null;
  }) => void): Promise<void> {
    if (!this.partnerRecordId) return;
    await pb.collection('positions').subscribe(this.partnerRecordId, (e) => {
      cb({
        room:           e.record['room'] as LocationName,
        activity:       (e.record['activity'] as string) || null,
        activity_state: (e.record['activity_state'] as string) || null,
      });
    });
  }

  // Convenience: update only activity fields without changing room
  async clearActivity(): Promise<void> {
    await this.publishActivity(null, null);
  }

  isHouseRoom(loc: LocationName): loc is HouseRoom {
    return loc !== 'work';
  }

  async unsubscribeAll(): Promise<void> {
    await pb.collection('positions').unsubscribe('*');
  }
}

export default new PocketBaseService();
