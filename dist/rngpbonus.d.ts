import React from 'react';
export type GPBonusHandle = {
    goBack: () => boolean;
};
export interface GPBonusProps {
    widgetUrl?: string;
    token?: string;
    checkExternalUrl?: boolean;
    printDebugInfo?: boolean;
    onWidgetClose: () => void;
}
declare const RNGPBonus: React.ForwardRefExoticComponent<GPBonusProps & import("react-native-webview/lib/WebViewTypes").IOSWebViewProps & import("react-native-webview/lib/WebViewTypes").AndroidWebViewProps & import("react-native-webview/lib/WebViewTypes").WindowsWebViewProps & React.RefAttributes<GPBonusHandle>>;
export default RNGPBonus;
