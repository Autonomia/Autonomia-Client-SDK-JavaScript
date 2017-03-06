# ![](https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_info_outline_black_24px.svg) What
Autonomia Client SDK for JavaScript

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
- For a complete examample chek [this](https://github.com/Autonomia/Autonomia-Client-Sample-Browser)
```javascript
let AutonomiaSdk = Autonomia.Client.Sdk;

var autonomiaConfig = new AutonomiaSdk.Config();
    autonomiaConfig.AppKey = "APP_KEY";
    autonomiaConfig.AppSecret = "APP_SECRET";
    autonomiaConfig.Server = "API_SERVER";

var autonomiaClient = new AutonomiaSdk.Client(autonomiaConfig);

    autonomiaClient.Events.DeviceConnected.OnHappen((deviceId) => {
        thisRef.DeviceConnected(deviceId);
    });

    autonomiaClient.Events.DeviceDisconnected.OnHappen((messageObject) => {
        thisRef.DeviceDisconnected(messageObject);
    });

    autonomiaClient.Events.DeviceConnectionError.OnHappen((messageObject) => {
        thisRef.DeviceConnectionError(messageObject.DeviceId, messageObject.Error);
    });

    autonomiaClient.Events.DeviceMessage.OnHappen((messageObject) => {
        thisRef.DeviceMessage(messageObject.DeviceId, messageObject.Message);
    });

    autonomiaClient.Events.DeviceInvalidMessage.OnHappen((data) => {
        thisRef.DeviceInvalidMessage(data);
    });

    var foundDevices = [];
    AutonomiaSdk.Helpers.Tasks.Run()
        .This((done) => {
            console.log("Connecting to Autonomia");
            thisRef._autonomia.Connect(done);
        })
        .Then((done) => {
            console.log("Connected, Getting registered devices");
            thisRef._autonomia.GetDevices(done, foundDevices);
        })
        .Then((done) => {
            foundDevices.forEach((device) => {
                console.log("Found: " + device.Id);
            });

            console.log("Subscribing for device events");

            thisRef._autonomia.GetNotificationsForDevices(foundDevices);
        })
        .OnError((error) => {
            console.errror(error);
        });
```