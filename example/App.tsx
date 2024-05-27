import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Pressable,
  Text,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  BackHandler,
  Alert,
  TextInput,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import RNGPBonus, {GPBonusHandle} from 'react-native-gpbonus-sdk';

const url = 'https://widget.gazprombonus.ru';

const tokenFull = 'testToken';

const tokenDefault = false ? tokenFull : '';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  let gpbWidgetRef = useRef<GPBonusHandle | null>(null);
  let gpbWidgetFullRef = useRef<GPBonusHandle | null>(null);

  const [isGPBonusModalVisible, setGPBonusModalVisible] = useState(false);
  const [isGPBonusVisible, setGPBonusVisible] = useState(false);
  const [token, setToken] = useState(tokenDefault);

  const backgroundStyle = {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const onWidgetClose = useCallback(() => {
    setGPBonusVisible(false);
  }, []);

  const onWidgetModalClose = useCallback(() => {
    setGPBonusModalVisible(false);
  }, []);

  const backAction = useCallback((fromModal = false) => {
    const webviewRef = gpbWidgetRef?.current || gpbWidgetFullRef?.current;

    const closeAppRequest = () => {
      Alert.alert('Exit', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
    };

    if (webviewRef && !webviewRef.goBack()) {
      if (fromModal) {
        return false;
      } else {
        closeAppRequest();
      }
    } else {
      if (!webviewRef) {
        closeAppRequest();
      } else {
        console.log('Back Procesed in Widget');
      }
    }
    return true;
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [backAction]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {isGPBonusVisible && !isGPBonusModalVisible && (
        <View style={styles.widgetContainer}>
          <View style={styles.widgetContainerHeader}>
            <View style={styles.widgetContainerBack}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setGPBonusVisible(false)}>
                <Text style={[styles.textStyle, styles.textCloseStyle]}>
                  {'<'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.widgetContainerTitle}>
              <Text style={styles.textStyle}>GPBonus View</Text>
            </View>
          </View>
          <View style={styles.widgetContainerWebview}>
            <RNGPBonus
              ref={gpbWidgetRef}
              widgetUrl={url}
              token={token}
              webviewDebuggingEnabled={true}
              checkExternalUrl={false}
              printDebugInfo={true}
              onWidgetClose={onWidgetClose}
            />
          </View>
        </View>
      )}
      {
        <Modal
          transparent={true}
          animationType={'none'}
          visible={isGPBonusModalVisible && !isGPBonusVisible}
          onRequestClose={() => {
            if (!backAction(true)) {
              console.log('close widget');
              onWidgetModalClose();
            }
          }}>
          <View style={styles.centeredModalView}>
            <RNGPBonus
              ref={gpbWidgetFullRef}
              widgetUrl={url}
              token={token}
              webviewDebuggingEnabled={true}
              checkExternalUrl={false}
              printDebugInfo={true}
              onWidgetClose={onWidgetModalClose}
            />
          </View>
        </Modal>
      }
      {!isGPBonusVisible && (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={{marginTop: 50, maxWidth: '80%'}}>
          <Text style={styles.textTitleStyle}>GPBonus View Demo</Text>

          <Pressable
            style={[styles.button, styles.buttonOpen, styles.buttonModalOpen]}
            onPress={() => setGPBonusModalVisible(true)}>
            <Text style={styles.textStyle}>Show GPBonus Modal</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonOpen]}
            onPress={() => setGPBonusVisible(true)}>
            <Text style={styles.textStyle}>Show GPBonus View</Text>
          </Pressable>
          <View style={styles.tokenContainer}>
            <TextInput
              style={styles.tokenInput}
              placeholder="Token (optional):"
              onSubmitEditing={value => setToken(value.nativeEvent.text)}
              defaultValue={token}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centeredModalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalViewF: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  textTitleStyle: {
    color: 'black',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#BBBBBB',
    marginBottom: 10,
  },
  buttonModalOpen: {
    backgroundColor: '#DDDDDD',
  },
  buttonClose: {
    padding: 5,
    backgroundColor: '#FFFFFF',
  },
  textStyle: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textCloseStyle: {
    fontSize: 24,
    color: 'black',
  },
  tokenContainer: {
    height: 48,
    flex: 1,
    alignItems: 'stretch',
  },
  tokenInput: {
    fontSize: 12,
    backgroundColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  widgetContainer: {
    flex: 1,
    width: '100%',
  },
  widgetContainerHeader: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 48,
    paddingHorizontal: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'lightgray',
  },
  widgetContainerBack: {
    height: '100%',
    justifyContent: 'center',
  },
  widgetContainerTitle: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  widgetContainerWebview: {
    flex: 1,
  },
});

export default App;
