/**
 * Babel config used only by jest (`pnpm test`). Strips JSX + TS without
 * pulling in the Tamagui/Reanimated/Expo plugins, which choke in a node
 * test environment. Keep this minimal.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
