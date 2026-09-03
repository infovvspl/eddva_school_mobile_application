import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text, useWindowDimensions } from 'react-native';
import { vs, ms } from '../utils/responsive';
import { useAppTheme } from '../context/ThemeContext';

export function SplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const { theme } = useAppTheme();
const styles = getStyles(theme);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={{ width: width * 0.8, height: height * 0.5 }} 
          resizeMode="contain" 
        />
      </View>
      <View style={styles.bottomContainer}>

        <Text style={styles.subtitle}>Empowering your learning journey</Text>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomContainer: {
    paddingBottom: vs(60),
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(24),
    color: theme.text,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: ms(14),
    color: theme.subtext,
    marginTop: vs(8),
  },
});
