import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WEB_APP_BASE } from '../../config/appConfig';

type Props = {
  lectureId: string;
  liveSessionId?: string;
  batchId?: string;
  topicId?: string;
  style?: object;
  fullscreen?: boolean;
};

function buildLiveClassUrl(
  lectureId: string,
  liveSessionId?: string,
  batchId?: string,
  topicId?: string,
): string {
  const params = new URLSearchParams({ embed: '1', app: 'mobile', native: '1' });
  if (liveSessionId) params.set('sessionId', liveSessionId);
  if (batchId) params.set('batchId', batchId);
  if (topicId) params.set('topicId', topicId);
  return `${WEB_APP_BASE}/live-class/${lectureId}?${params.toString()}`;
}

/**
 * Full web live room (Agora WebRTC, chat, polls, reactions) — same as browser.
 */
const LiveClassWebPlayer: React.FC<Props> = ({
  lectureId,
  liveSessionId,
  batchId,
  topicId,
  style,
  fullscreen = false,
}) => {
  const [authReady, setAuthReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const pairs = await AsyncStorage.multiGet(['accessToken', 'refreshToken']);
      if (!mounted) return;
      setAccessToken(pairs[0]?.[1] ?? null);
      setRefreshToken(pairs[1]?.[1] ?? null);
      setAuthReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const uri = useMemo(
    () => buildLiveClassUrl(lectureId, liveSessionId, batchId, topicId),
    [lectureId, liveSessionId, batchId, topicId],
  );

  const injectedBefore = useMemo(() => {
    if (!accessToken) return undefined;
    const payload = JSON.stringify({
      accessToken,
      refreshToken: refreshToken || '',
      token: accessToken,
    });
    return `(function(){
      try {
        var p=${payload};
        for (var k in p) {
          if (p[k]) {
            localStorage.setItem(k, p[k]);
            sessionStorage.setItem(k, p[k]);
          }
        }
        localStorage.setItem('accessToken', p.accessToken);
        localStorage.setItem('token', p.accessToken);
      } catch(e) {}
      true;
    })();`;
  }, [accessToken, refreshToken]);

  if (!authReady || !accessToken) {
    return (
      <View style={[styles.center, style]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <WebView
      source={{
        uri,
        headers: { Authorization: `Bearer ${accessToken}` },
      }}
      style={[fullscreen ? styles.full : styles.web, style]}
      injectedJavaScriptBeforeContentLoaded={injectedBefore}
      javaScriptEnabled
      domStorageEnabled
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback
      allowsFullscreenVideo
      setSupportMultipleWindows={false}
      mixedContentMode="always"
      androidLayerType="hardware"
      userAgent={
        Platform.OS === 'android'
          ? 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
          : undefined
      }
      onPermissionRequest={request => request.grant(request.resources)}
    />
  );
};

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: '#000' },
  full: { flex: 1, width: '100%', height: '100%', backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
});

export default LiveClassWebPlayer;
