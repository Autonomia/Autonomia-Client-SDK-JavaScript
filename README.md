# ![](https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_info_outline_black_24px.svg) Autonomia Client SDK for JavaScript
Provides a simple wrapper around [Autonomia Client Side API](http://www.autonomia.io). Typical use would be to develop a connected application running anywhere but vehicle on-board computer.

It allows to connect to the Autonomia Cloud infrastructure and make remote interactions with the vehicle.

# ![](https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_cloud_queue_black_24px.svg) Include Hosted
- Add to HTML
```html
<script src="https://github.com/Autonomia/Autonomia-Client-SDK-JavaScript/releases/download/v1.0/Autonomia-Client-SDK-JavaScript.js"></script>
```

# ![](https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_cloud_off_black_24px.svg) Include Offline
- Save [this](https://github.com/Autonomia/Autonomia-Client-SDK-JavaScript/releases/download/v1.0/Autonomia-Client-SDK-JavaScript.js) from releases
- Add to HTML
```html
<script src="Autonomia-Client-SDK-JavaScript.js"></script>
```

# ![](https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_verified_user_black_24px.svg) API
```javascript
Autonomia.Client.Sdk.Client()
    .Connect()
    .GetDevices()
    .GetNotificationsForDevices()
    .StopDevicesNotifications()
    .StopAllDevicesNotifications()
```

# ![](https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_flash_on_black_24px.svg) Events
```javascript
DeviceConnected
DeviceDisconnected
DeviceConnectionError
DeviceMessage
DeviceInvalidMessage
```

# ![](https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_code_black_24px.svg) Code Samples
- For a complete examample chek [**this**](https://github.com/Autonomia/Autonomia-Client-Sample-Browser). Get your API key [**@DeveloperPortal**](https://developer.autonomia.io)
```javascript
let AutonomiaSdk = Autonomia.Client.Sdk;

var autonomiaConfig = new AutonomiaSdk.Config();
    autonomiaConfig.AppKey = "APP_KEY";
    autonomiaConfig.AppSecret = "APP_SECRET";
    autonomiaConfig.Server = "API_SERVER";

var autonomiaClient = new AutonomiaSdk.Client(autonomiaConfig);

    autonomiaClient.Events.DeviceConnected.OnHappen((deviceId) => {
        console.log("DeviceConnected: " + deviceId);
    });

    autonomiaClient.Events.DeviceDisconnected.OnHappen((messageObject) => {
        console.log("DeviceDisconnected: " + JSON.stringify(messageObject));
    });

    autonomiaClient.Events.DeviceConnectionError.OnHappen((messageObject) => {
        console.log("DeviceConnectionError: " + JSON.stringify(messageObject));
    });

    autonomiaClient.Events.DeviceMessage.OnHappen((messageObject) => {
        console.log("DeviceMessage: " + JSON.stringify(messageObject));
    });

    autonomiaClient.Events.DeviceInvalidMessage.OnHappen((data) => {
        console.log("DeviceInvalidMessage: " + JSON.stringify(data));
    });

    var foundDevices = [];
    AutonomiaSdk.Helpers.Tasks.Run()
        .This((done) => {
            console.log("Connecting to Autonomia");
            autonomiaClient.Connect(done);
        })
        .Then((done) => {
            console.log("Connected, Getting registered devices");
            autonomiaClient.GetDevices(done, foundDevices);
        })
        .Then((done) => {
            foundDevices.forEach((device) => {
                console.log("Found: " + device.Id);
            });

            console.log("Subscribing for device events");

            autonomiaClient.GetNotificationsForDevices(foundDevices);
        })
        .OnError((error) => {
            console.errror(error);
        });
```

# ![](https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_build_black_24px.svg) Develop
- Expects to be installed: `node`
- `git clone https://github.com/Autonomia/Autonomia-Client-SDK-JavaScript.git`
- Run `npm install` once
- Run `npm run build` to make a bundle, outputs a new `Autonomia-Client-SDK-JavaScript.js` file
