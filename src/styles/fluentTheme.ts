import { webLightTheme, webDarkTheme, Theme } from '@fluentui/react-components';

/**
 * Custom Microsoft Word–inspired Fluent 2 themes extending webLightTheme / webDarkTheme
 * with clean neutral canvas contrast and subtle elevation.
 */
export const wordLightTheme: Theme = {
  ...webLightTheme,
  colorNeutralBackground3: '#f3f3f3',
  colorNeutralBackground2: '#fafafa',
  colorNeutralBackground1: '#ffffff',
  colorNeutralStroke1: '#e0e0e0',
  colorNeutralStroke2: '#ebebeb',
};

export const wordDarkTheme: Theme = {
  ...webDarkTheme,
  colorNeutralBackground3: '#181818',
  colorNeutralBackground2: '#202020',
  colorNeutralBackground1: '#292929',
  colorNeutralStroke1: '#3d3d3d',
  colorNeutralStroke2: '#333333',
};
