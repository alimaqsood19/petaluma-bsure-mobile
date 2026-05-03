import React from 'react';
import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { TamaguiProvider } from 'tamagui';

import config from '../tamagui.config';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0A1816' },
        { name: 'light', value: '#FFFFFF' },
      ],
    },
    layout: 'centered',
    a11y: {
      // Run axe-core on every story.
      element: '#root',
      config: { rules: [{ id: 'color-contrast', enabled: true }] },
    },
  },
  decorators: [
    (Story, ctx) => {
      const theme = ctx.parameters.theme ?? ctx.globals.theme ?? 'dark';
      return (
        <TamaguiProvider config={config} defaultTheme={theme}>
          <div
            style={{
              padding: 24,
              minWidth: 320,
              backgroundColor: theme === 'dark' ? '#0A1816' : '#FFFFFF',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <Story />
          </div>
        </TamaguiProvider>
      );
    },
    withThemeByDataAttribute({
      themes: { dark: 'dark', light: 'light' },
      defaultTheme: 'dark',
      attributeName: 'data-theme',
    }),
  ],
  globalTypes: {
    theme: {
      description: 'B-Sure theme',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
      },
    },
  },
};

export default preview;
