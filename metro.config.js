<<<<<<< HEAD
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
=======
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
>>>>>>> 19c8277 (Initial commit)

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
<<<<<<< HEAD
 * @type {import('@react-native/metro-config').MetroConfig}
=======
 * @type {import('metro-config').MetroConfig}
>>>>>>> 19c8277 (Initial commit)
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
