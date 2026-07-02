import React from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

/** Official EDDVA brand mark */
const EddvaLogo: React.FC<Props> = ({ size = 48, style, imageStyle }) => (
  <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
    <Image
      source={require('../assets/eddva_logo.png')}
      style={[{ width: size, height: size }, imageStyle]}
      resizeMode="contain"
    />
  </View>
);

export default EddvaLogo;
