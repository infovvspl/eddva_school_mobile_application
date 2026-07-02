const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname, '..');

// Packages that need to be compiled (they ship untranspiled ES modules / JSX)
const compileNodeModules = [
  'react-native',
  'react-native-web',
  '@react-navigation',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-svg',
  '@react-native-vector-icons',
].map(m => path.resolve(appDirectory, `node_modules/${m}`));

module.exports = {
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: path.resolve(appDirectory, 'web-build'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      // stub out native-only modules that don't have web implementations
      'react-native-linear-gradient': path.join(__dirname, 'stubs/LinearGradient.js'),
      'react-native-vector-icons/FontAwesome5': path.join(__dirname, 'stubs/Icon.js'),
      '@react-native-vector-icons/fontawesome5': path.join(__dirname, 'stubs/Icon.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        include: [
          path.resolve(appDirectory, 'src'),
          path.resolve(appDirectory, 'App.tsx'),
          path.resolve(appDirectory, 'web'),
          ...compileNodeModules,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['module:@react-native/babel-preset'],
            plugins: ['react-native-web'],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|ttf|otf|woff2?)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.join(__dirname, 'index.html') }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    open: true,
  },
};
