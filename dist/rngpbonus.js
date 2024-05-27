import React, { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef, } from 'react';
import { View, Share, Linking, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Clipboard from '@react-native-clipboard/clipboard';
import { URL } from 'react-native-url-polyfill';
import { MobileEventType } from './types';
import { getUrlWithParams, getCircularReplacer } from './utils';
import styles from './gpbonus.style';
const widgetScript = ' (function(){ ' +
    '    window.PNWidget = window.PNWidget || {}; ' +
    '    window.PNWidget._listeners = new Set(); ' +
    '    window.PNWidget.version = "(2.0.1) ((1))"; ' +
    `    window.PNWidget.platform = "${Platform.OS === 'android' ? 'Android' : 'iOS'}"; ` +
    '    window.PNWidget.features = { auth: false }; ' +
    '    window.PNWidget.sendMobileEvent = function sendMobileEvent(event) { ' +
    '        window.ReactNativeWebView.postMessage(JSON.stringify(event)); ' +
    '    }; ' +
    '    window.PNWidget.onMobileEvent = function onMobileEvent(listener) { ' +
    '        window.PNWidget._listeners.add(listener); ' +
    '        return function unsubscribe() { ' +
    '            window.PNWidget._listeners.delete(listener); ' +
    '        }; ' +
    '    }; ' +
    '    if (window.PNWidget.onready) { ' +
    '        window.PNWidget.onready(); ' +
    '   } ' +
    '})()';
const defaultWidgetUlr = 'https://widget.gazprombonus.ru';
const RNGPBonus = forwardRef(({ widgetUrl = defaultWidgetUlr, token = '', webviewDebuggingEnabled = false, basicAuthCredential = { username: '', password: '' }, checkExternalUrl = true, startInLoadingState = true, printDebugInfo = false, onWidgetClose = () => null, ...props }, ref) => {
    let webview = useRef(null);
    const [widgetUlrWithParams, setWidgetUrlWithParams] = useState('');
    const [webNavigationState, setWebNavigationState] = useState({ url: '', canGoBack: false });
    // const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        if (printDebugInfo) {
            console.log(`openUrl: ${widgetUrl} with token: ${token}`);
        }
        setWidgetUrlWithParams(getUrlWithParams(widgetUrl, token));
    }, [token, widgetUrl]);
    const handleWebViewNavigationStateChange = (newNavState) => {
        const { url } = newNavState;
        setWebNavigationState(newNavState);
        if (!url) {
            return;
        }
        if (webview && url.includes('escape')) {
            webview.current?.goBack;
            onWidgetClose();
        }
    };
    const onMobileEvent = useCallback((event) => {
        const mobileEvent = JSON.parse(event?.nativeEvent?.data);
        if (printDebugInfo) {
            console.log(`Got Event from widget: ${JSON.stringify(event.nativeEvent.data, getCircularReplacer())}`);
        }
        switch (mobileEvent?.type) {
            case MobileEventType.CLIPBOARDWRITE:
                if (printDebugInfo) {
                    console.log(`${MobileEventType.CLIPBOARDWRITE} text: ${mobileEvent?.clipboard_write}`);
                }
                Clipboard.setString(mobileEvent?.clipboard_write);
                break;
            case MobileEventType.SHAREURLREQUEST:
                if (printDebugInfo) {
                    console.log(`${MobileEventType.SHAREURLREQUEST} link: ${mobileEvent?.share_url_request}`);
                }
                Share.share({
                    url: mobileEvent?.share_url_request,
                });
                break;
            case MobileEventType.OPENURLREQUEST:
                if (printDebugInfo) {
                    console.log(`${MobileEventType.OPENURLREQUEST} link: ${mobileEvent?.open_url_request}`);
                }
                // Targeting Android 11 (SDK 30) requires you to update your AndroidManifest.xml and include a list of applications you're querying
                // <queries>
                //     <intent>
                //         <action android:name="android.intent.action.VIEW" />
                //         <data android:scheme="https" android:host="*" />
                //     </intent>
                // </queries>
                Linking.canOpenURL(mobileEvent?.open_url_request).then(supported => {
                    if (!checkExternalUrl || supported) {
                        Linking.openURL(mobileEvent?.open_url_request);
                    }
                    else {
                        if (printDebugInfo) {
                            console.log("Can't open URI: " + mobileEvent?.open_url_request);
                        }
                    }
                    return false;
                });
                break;
            default:
                console.log('Unsupported event');
        }
    }, [checkExternalUrl]);
    const isWidgetUrl = useCallback((url) => {
        const getDomainName = (currentUrl) => {
            if (currentUrl) {
                const uri = new URL(currentUrl);
                const domain = uri.hostname.replace('www.', '');
                // console.log(`domain ${domain} url ${currentUrl}`);
                return domain;
            }
            else {
                return '';
            }
        };
        const domain = getDomainName(url);
        if (url.startsWith(widgetUrl) ||
            domain.includes('widget.gazprombonus.ru') ||
            domain.includes('widget.ogon.ru')) {
            return true;
        }
        return false;
    }, [widgetUrl]);
    useImperativeHandle(ref, () => ({
        goBack: () => {
            if (!webview || !webview?.current) {
                return false;
            }
            const webView = webview?.current;
            if (isWidgetUrl(webNavigationState?.url)) {
                const MOBILE_EVENT_BACK = {
                    type: MobileEventType.BACK,
                };
                const mobileEvent = `
            (function() {
                const event = ${JSON.stringify(MOBILE_EVENT_BACK)};
                for (let listener of window.PNWidget._listeners.values()) {
                    listener(event);
                }
            })()
          `;
                webView.injectJavaScript(mobileEvent);
                return true;
            }
            if (webNavigationState.canGoBack) {
                webView.goBack();
                return true;
            }
            console.log("RNGPBWidget can't process goBack");
            return false;
        },
    }), [isWidgetUrl, webNavigationState.canGoBack, webNavigationState?.url]);
    const displayLoader = () => (React.createElement(View, { style: styles.loaderContainer },
        React.createElement(ActivityIndicator, { size: "large" })));
    return (React.createElement(View, { style: styles.container }, !!widgetUlrWithParams && (React.createElement(WebView, { ref: webview, source: { uri: widgetUlrWithParams }, style: styles.content, onNavigationStateChange: handleWebViewNavigationStateChange, onMessage: onMobileEvent, injectedJavaScriptBeforeContentLoaded: widgetScript, webviewDebuggingEnabled: webviewDebuggingEnabled, onShouldStartLoadWithRequest: request => {
            if (printDebugInfo) {
                console.log(request.url);
                // console.log(JSON.stringify(request));
            }
            return true;
        }, basicAuthCredential: basicAuthCredential, startInLoadingState: startInLoadingState, renderLoading: displayLoader, onHttpError: syntheticEvent => {
            const { nativeEvent } = syntheticEvent;
            console.log('WebView received error status code: ', nativeEvent.statusCode);
        }, originWhitelist: ['http://*', 'https://*', 'about:srcdoc'], ...props }))));
});
export default RNGPBonus;
