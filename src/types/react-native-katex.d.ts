declare module 'react-native-katex' {
  import type { ComponentType } from 'react';
  import type { WebViewProps } from 'react-native-webview';

  export interface KatexProps extends WebViewProps {
    expression?: string;
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: Record<string, string>;
    colorIsTextColor?: boolean;
    inlineStyle?: string;
  }

  const Katex: ComponentType<KatexProps>;
  export default Katex;
}
