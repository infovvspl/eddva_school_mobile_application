/**
 * @format
 */

import {AppRegistry} from 'react-native';
// Must run before any screen renders so every <Text> picks up Poppins.
import {applyPoppins} from './src/utils/fonts';

applyPoppins();
try {
  const App = require('./App').default;
  const {name: appName} = require('./app.json');
  AppRegistry.registerComponent(appName, () => App);
} catch (e) {
  console.error("INITIALIZATION ERROR:", e);
}
