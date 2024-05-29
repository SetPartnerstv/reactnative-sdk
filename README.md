# @setpartnerstv/react-native-gpbonus-sdk

## О проекте

Данный проект позволит вам встроить виджет Газпром Бонус в ваше приложение с использованием React Native.

## Минимальные требования

- react native version 0.72.0
- iOS minimum version 12.0
- Android minimum version 10.0 (интеграция возможно и на более старых версиях, но стабильная работа не гарантируется)

## How to

### Загрузка библиотеки

Интегрировать SDK в свой проект вы можете напрямую из этого репозитория или с использованием npm.

```
cd my-project
npm install git+https://github.com/SetPartnerstv/reactnative-sdk.git
```

или

```
cd my-project
npm i @setpartnerstv/react-native-gpbonus-sdk
либо
yarn add @setpartnerstv/react-native-gpbonus-sdk
```

Если в основном проекте не используются библиотеки '@react-native-clipboard/clipboard' и 'react-native-webview', то для корректной работы авто линковки необходимо добавить файл react-native.config.js

```javascript
module.exports = {
  dependencies: {
    '@react-native-clipboard/clipboard': {},
    'react-native-webview': {},
  },
};
```

## Demo приложение

В данном репозитории в папке example находится пример работы с SDK в формате отдельного react native приложения. Примеры встраивания кода можете посмотреть в demo проекте.

### Поддержка вариантов отображения

В demo режиме можно посмотреть 2 варианта открытия виджета: полноэкранное открытие и открытие внутри окна хост-приложения (вашего приложения).


## Usage

Т.к. `@setpartnerstv/react-native-gpbonus-sdk` является расширением [React Native webview](https://github.com/react-native-webview/react-native-webview), вы можете использовать Webview props, например :

```javascript
    <RNGPBonus
        ...
        webviewDebuggingEnabled={true}
        ...
    />
```


1.  Import `react-native-gpbonus-sdk`:

```javascript
import import RNGPBonus from '@setpartnerstv/react-native-gpbonus-sdk';
```

2.  Добавьте `<RNGPBonus>` компонент как модальное окно:

```javascript
        <Modal
          transparent={true}
          animationType={'none'}
          visible={isVisible}
          onRequestClose={() => {
            onWidgetModalClose();
          }}>
          <View style={styles.centeredModalView}>
            <RNGPBonus
              ref={gpbWidgetFullRef}
              widgetUrl={url}
              token={token}
              checkExternalUrl={false}
              onWidgetClose={onWidgetModalClose}
            />
          </View>
        </Modal>
```
либо основной компонент обычного экрана

```javascript
          <View style={styles.widgetContainerWebview}>
            <RNGPBonus
              ref={gpbWidgetRef}
              widgetUrl={url}
              token={token}
              checkExternalUrl={false}
              onWidgetClose={onWidgetClose}
            />
          </View>
```



3. Для Андроид поддерживается обработка BackHandler, пример использования можно посмотрить в Demo приложении (example)

4. Для корректной работы открытия внешних ссылок в Андроид, необходимо либо добавить поддержку проверки в хост-приложение,

```javascript
    // Targeting Android 11 (SDK 30) requires you to update your AndroidManifest.xml and include a list of applications you're querying
    // <queries>
    //     <intent>
    //         <action android:name="android.intent.action.VIEW" />
    //         <data android:scheme="https" android:host="*" />
    //     </intent>
    // </queries>
```

 либо отключить проверку

```javascript
<RNGPBonus
    ...
    checkExternalUrl={false}
    ...
/>
```


## Available props

| Name                             | Type                 | Default                        | Description                                                                                                                                |
| -------------------------------- | -------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `widgetUrl`                      | `string`             |`https://widget.gazprombonus.ru`| URL виджета (опционально)                                                                                                                  |
| `token`                          | `string`             |`""`                            | token текущего пользователя (опционально)                                                                                                  |
| `checkExternalUrl`               | `boolean`            |`true`                          | проверка внешнего URL перед открытием (актуально для Андроид) (опционально)                                                                |
| `printDebugInfo`                 | `boolean`            |`false`                         | вывод в консоль отладочных сообщений о событиях виджета (опционально)                                                                      |
| `onWidgetClose`                  | `func`               |`() => void`                    | вызывается при закрывании виджета по внутренней ссылке (опционально)                                                                       |



## Замечания

- По умолчанию SDK виджета настроено на url https://widget.gazprombonus.ru (https://widget.gazprombonus.ru)

- Авторизация виджета позволяет авторизовать пользователя посредством передачи токена в url инициализации

## License

Исходный код публикуется под лицензией MIT
