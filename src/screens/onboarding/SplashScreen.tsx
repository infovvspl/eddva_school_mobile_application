import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EddvaAnimatedSplash from '../../components/EddvaAnimatedSplash';
import { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => (
  <EddvaAnimatedSplash onFinish={() => navigation.replace('Intro')} />
);

export default SplashScreen;
