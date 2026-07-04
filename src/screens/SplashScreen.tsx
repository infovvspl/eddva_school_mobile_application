import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text, useWindowDimensions } from 'react-native';

export function SplashScreen({
  theme,
  onFinish,
}: {
  theme: { background: string; surface: string; text: string; subtext: string; primary: string; primarySoft: string; border: string; accent: string };
  onFinish: () => void;
}) {
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image 
          source={require('../../assets/LOGO 2.png')} 
          style={{ width: width * 0.8, height: height * 0.5 }} 
          resizeMode="contain" 
        />
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Eddva</Text>
        <Text style={styles.subtitle}>Empowering your learning journey</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomContainer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#0F172A',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
});
