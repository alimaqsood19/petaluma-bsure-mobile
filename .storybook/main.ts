import type { StorybookConfig } from '@storybook/react-native-web-vite';

const config: StorybookConfig = {
  stories: ['../src/ui/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      pluginReactOptions: {
        babel: {
          plugins: [
            ['@tamagui/babel-plugin', {
              components: ['tamagui'],
              config: './tamagui.config.ts',
              logTimings: false,
            }],
          ],
        },
      },
    },
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
