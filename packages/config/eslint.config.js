const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    // eslint-plugin-react's version auto-detection crashes on ESLint 10, so pin it.
    settings: { react: { version: '19.2' } },
  },
  {
    ignores: ['dist/*', '.expo/*', 'ios/*', 'android/*'],
  },
];
