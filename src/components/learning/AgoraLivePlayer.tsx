import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  RtcSurfaceView,
} from 'react-native-agora';
import type { AgoraJoinConfig } from '../../utils/agoraLive';
import { font, ms, vs } from '../../utils/responsive';

type Props = {
  config: AgoraJoinConfig;
  style?: object;
};

const AgoraLivePlayer: React.FC<Props> = ({ config, style }) => {
  const engineRef = useRef(createAgoraRtcEngine());
  const [remoteUid, setRemoteUid] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const engine = engineRef.current;
    let mounted = true;

    engine.registerEventHandler({
      onJoinChannelSuccess: () => {
        /* joined as audience */
      },
      onUserJoined: (_connection, uid) => {
        if (mounted) setRemoteUid(uid);
      },
      onUserOffline: (_connection, uid) => {
        if (mounted) setRemoteUid(prev => (prev === uid ? 0 : prev));
      },
      onError: (err, msg) => {
        if (mounted) setError(msg || `Stream error (${err})`);
      },
    });

    try {
      engine.initialize({ appId: config.appId });
      engine.enableVideo();
      engine.enableAudio();
      engine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
      engine.setClientRole(ClientRoleType.ClientRoleAudience);
      engine.joinChannel(config.token, config.channelName, config.uid, {
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        clientRoleType: ClientRoleType.ClientRoleAudience,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });
    } catch {
      if (mounted) setError('Could not join live class channel.');
    }

    return () => {
      mounted = false;
      try {
        engine.leaveChannel();
        engine.release();
      } catch {
        /* ignore cleanup errors */
      }
    };
  }, [config.appId, config.channelName, config.token, config.uid]);

  if (error) {
    return (
      <View style={[styles.center, style]}>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      {remoteUid > 0 ? (
        <RtcSurfaceView style={styles.video} canvas={{ uid: remoteUid }} />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.message}>Waiting for teacher to start video…</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1, width: '100%', height: '100%' },
  center: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(24),
    gap: vs(12),
  },
  message: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: font.caption,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AgoraLivePlayer;
