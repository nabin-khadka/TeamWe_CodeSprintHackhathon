// Global type fixes for React 19 compatibility
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Fix for React Native style type conflicts
declare module 'react-native' {
  interface ViewStyle {
    cursor?: any;
  }
  interface TextStyle {
    cursor?: any;
  }
  interface ImageStyle {
    cursor?: any;
  }
}

export {};
