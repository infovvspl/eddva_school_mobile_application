/**
 * @format
 */

import {AppRegistry} from 'react-native';
try {
  const App = require('./App').default;
  const {name: appName} = require('./app.json');
  AppRegistry.registerComponent(appName, () => App);
} catch (e) {
  console.error("INITIALIZATION ERROR:", e);
}
