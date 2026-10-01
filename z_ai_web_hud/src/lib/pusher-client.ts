import PusherClient from 'pusher-js';

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
