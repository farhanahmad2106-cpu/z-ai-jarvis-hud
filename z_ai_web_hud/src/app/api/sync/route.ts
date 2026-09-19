import { pusherServer } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { action, payload, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId for sync' }, { status: 400 });
    }

    // Broadcast the state change to all devices subscribed to the user's channel
    await pusherServer.trigger(`private-user-${userId}`, 'state-sync', {
      action,
      payload,
      timestamp: Date.now()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Sync API] Failed to broadcast state:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
