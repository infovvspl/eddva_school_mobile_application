import { AGORA_APP_ID } from '../config/appConfig';

export type AgoraJoinConfig = {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
};

function pickString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function flattenToken(tokenPayload: unknown): Record<string, unknown> {
  if (!tokenPayload || typeof tokenPayload !== 'object') return {};
  const obj = tokenPayload as Record<string, unknown>;
  const inner = obj.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return { ...obj, ...(inner as Record<string, unknown>) };
  }
  return obj;
}

/** Build Agora audience join config from /live-class/session + /live-class/token. */
export function parseAgoraJoinConfig(
  session: Record<string, unknown> | null,
  tokenPayload?: unknown,
): AgoraJoinConfig | null {
  const tokenObj = flattenToken(tokenPayload);
  const merged = { ...tokenObj, ...(session ?? {}) };

  const appId = pickString(
    merged.appId,
    merged.agoraAppId,
    merged.agora_app_id,
    AGORA_APP_ID,
  );
  const channelName = pickString(
    merged.agoraChannelName,
    merged.channelName,
    merged.channel,
  );
  const token = pickString(merged.token, merged.rtcToken, merged.agoraToken);
  const uidRaw = merged.uid ?? merged.userId ?? merged.agoraUid ?? 0;
  const uid = typeof uidRaw === 'number' ? uidRaw : Number(uidRaw) || 0;

  if (!appId || !channelName || !token) return null;
  return { appId, channelName, token, uid };
}

export function isAgoraStreamType(record?: Record<string, unknown> | null): boolean {
  if (!record) return false;
  return pickString(record.streamType, record.provider).toLowerCase() === 'agora';
}
