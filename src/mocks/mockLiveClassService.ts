import { mockDelay } from './delay';

/** Reliable HTTPS sample used for demo lecture playback (mock mode). */
export const DEMO_LECTURE_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const mockLiveClassService = {
  getToken: async (_payload: { lectureId: string; role?: string }) => {
    await mockDelay();
    return {
      data: {
        token: 'mock-live-token',
        appId: 'mock-agora-app-id',
        channelName: 'eddva-demo',
        agoraChannelName: 'eddva-demo',
        uid: 1001,
      },
    };
  },

  start: async (_lectureId: string) => {
    await mockDelay();
    return { data: { status: 'started' } };
  },

  getStreamStatus: async (lectureId: string) => {
    await mockDelay();
    return {
      data: {
        lectureId,
        isLive: true,
        streamType: 'agora',
        agoraChannelName: 'eddva-demo',
        hlsUrl: null,
        viewerCount: 12,
        status: 'live',
      },
    };
  },

  end: async (_lectureId: string) => {
    await mockDelay();
    return { data: { status: 'ended' } };
  },

  getSession: async (lectureId: string) => {
    await mockDelay();
    return {
      data: {
        id: `session-${lectureId}`,
        liveSessionId: `session-${lectureId}`,
        lectureId,
        status: 'live',
        streamType: 'agora',
        agoraChannelName: 'eddva-demo',
        durationSeconds: 596,
        thumbnailUrl: null,
      },
    };
  },

  getAttendance: async (_lectureId: string) => {
    await mockDelay();
    return { data: { present: true } };
  },

  getChat: async (liveSessionId: string) => {
    await mockDelay();
    return {
      data: {
        messages: [
          { id: '1', senderName: 'Faculty', message: 'Welcome! Tap play to start the lecture.' },
        ],
      },
    };
  },
  getPolls: async (_liveSessionId: string) => {
    await mockDelay();
    return { data: { polls: [] } };
  },

  sendChat: async (_liveSessionId: string, message: string) => {
    await mockDelay();
    return {
      data: {
        id: Date.now().toString(),
        message,
        senderName: 'You',
        isMe: true,
      },
    };
  },
};
