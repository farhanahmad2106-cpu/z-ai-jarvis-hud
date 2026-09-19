import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Setup Pusher Server Instance (used in API routes)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});

// Setup Pusher Client Instance (used in frontend components)
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (!pusherClientInstance && process.env.NEXT_PUBLIC_PUSHER_KEY) {
    pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
    });
  }
  return pusherClientInstance;
};
