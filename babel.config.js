module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ✅ react-native-dotenv: reads your .env and exposes vars via @env
      // safe: true  → throws if a variable is missing (recommended for production)
      // allowUndefined: false → warns if you import a var that doesn't exist in .env
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,           // set to true in production to catch missing vars early
          allowUndefined: false, // ✅ changed from true — prevents silent undefined bugs
        },
      ],
      // ✅ module-resolver: clean import aliases (e.g. import X from '@components/X')
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@api': './src/api',
            '@store': './src/store',
            '@utils': './src/utils',
            '@assets': './src/assets',
          },
        },
      ],
    ],
  };
};