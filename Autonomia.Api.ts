/// <reference path="Autonomia.Config.ts" /> 
/// <reference path="Autonomia.Models.Device.ts" /> 

/// <reference path="../Autonomia-Helpers-JavaScript/Autonomia-Helpers-JavaScript.d.ts" />

namespace Autonomia {
    export class Api {
        private _config: Config;
        private _urls: {
            AccessToken: string,
            Devices: string,
            Subscribe1: string
            Subscribe2: string
        }
        private _token: {
            Value: string,
            Type: string
        };
        private _timeouts: {
            timeout_device_not_attached: number,
            timeout_websocket_reconnect: number
        };

        public Events: {
            DeviceConnected: Helpers.Events.Event<string>,
            DeviceDisconnected: Helpers.Events.Event<{DeviceId: string, Reason: string}>,
            DeviceConnectionError: Helpers.Events.Event<{DeviceId: string, Error: string}>,
            DeviceMessage: Helpers.Events.Event<{DeviceId: string, Message: any}>,
            DeviceInvalidMessage: Helpers.Events.Event<any>
        }

        constructor(config: Config) {
            this._config = config;

            this._urls = {
                AccessToken  : "https://" + this._config.Server + "/v1/api/auth/token",
                Devices      : "https://" + this._config.Server + "/v1/api/devices",
                Subscribe1   : "https://" + this._config.Server + "/v1/api/devices/",
                Subscribe2   : "/subscribe"
            }

            this._token = null;

            this._timeouts = {
                timeout_device_not_attached: 30000,
                timeout_websocket_reconnect: 1000
            };

            this.Events = {
                DeviceConnected         : new Helpers.Events.Event<string>(),
                DeviceDisconnected      : new Helpers.Events.Event<{DeviceId: string, Reason: string}>(),
                DeviceConnectionError   : new Helpers.Events.Event<{DeviceId: string, Error: string}>(),
                DeviceMessage           : new Helpers.Events.Event<{DeviceId: string, Message: any}>(),
                DeviceInvalidMessage    : new Helpers.Events.Event<any>()
            }
        }

        private GetAccessToken(done) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json"
            };
            var dataToSend = {
                "app_key": thisRef._config.AppKey,
                "app_secret": thisRef._config.AppSecret
            };

            Helpers.GetPost.DoPostCall(
                thisRef._urls.AccessToken,
                headers,
                JSON.stringify(dataToSend),
                (dataReceived) => {
                    var response = null;

                    try {
                        response = JSON.parse(dataReceived);
                        if (
                            Helpers.IsNullOrEmpty(response)
                            || !response.hasOwnProperty("access_token")
                            || !response.hasOwnProperty("token_type")
                        ) {
                            done.fail("GetAccessToken() -> [Invalid data received]");
                        }
                        else {
                            thisRef._token = {
                                Type  : response.token_type,
                                Value : response.access_token
                            };

                            done();
                        }
                    } catch (e) {
                        done.fail("GetAccessToken() -> [" + e + "] -> [" + dataReceived + "]");
                    }
                },
                (error) => {
                    done.fail("GetAccessToken() -> [" + error + "]");
                }
            );
        }

        public Connect(done) {
            var thisRef = this;

            thisRef.GetAccessToken(done);
        }

        public GetDevices(done, devicesContainer: Models.Device[]) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": thisRef._token.Type + " " + thisRef._token.Value
            };

            Helpers.GetPost.DoGetCall(
                thisRef._urls.Devices,
                headers,
                (dataReceived) => {
                    var response = null;

                    try {
                        response = JSON.parse(dataReceived);

                        if (!Helpers.IsNullOrEmpty(response)) {
                            response.forEach((device) => {
                                var d = new Models.Device();
                                d.Id = device.serial;
                                d.Type = Helpers.IsNullOrEmpty(device.category) ? "" : device.category.name;

                                d.IsConnected = device.connected;
                                d.ConnectedAt = device.connectedAt;
                                d.DisconnectedAt = device.disconnectedAt;

                                if (!Helpers.IsNullOrEmpty(device.cameras)) {
                                    device.cameras.forEach((camera) => {
                                        var c = new Models.Camera();
                                        c.Name = camera.name;
                                        c.StreamUrl = camera.urlStream;
                                        c.LastPicUrl = camera.urlImage;

                                        d.Cameras.push(c);
                                    });
                                }

                                devicesContainer.push(d);
                            });
                            
                            done();
                        }
                    } catch (e) {
                        done.fail("GetDevices() -> [" + e + "] -> [" + dataReceived + "]");
                    }
                },
                (error) => {
                    done.fail("GetDevices() -> [" + error + "]");
                }
            );
        }

        public GetNotificationsForDevices(devices: Models.Device[]) {
            var thisRef = this;

            devices.forEach((device: Models.Device) => {
                thisRef.GetWebsocketUrlForDevice(device.Id, thisRef._timeouts.timeout_device_not_attached, function (deviceId, url) {

                    var sslHost = "https://" + Helpers.Uris.Parse(url).Host + "/"

                    Helpers.GetPost.DoGetCall(sslHost, {}, (response) => {
                        thisRef.StartWebsocketForDevice(deviceId, url);
                    }, (error) => {
                        thisRef.StartWebsocketForDevice(deviceId, url);
                    })
                });
            });
        }

        private GetWebsocketUrlForDevice(deviceId: string, waitTimeOut: number, callback) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": thisRef._token.Type + " " + thisRef._token.Value
            };

            Helpers.GetPost.DoGetCall(
                thisRef._urls.Subscribe1 + deviceId + thisRef._urls.Subscribe2,
                headers,
                (data) => {
                    var response = null;

                    try {
                        response = JSON.parse(data);
                    } catch (e) { 
                        // console.error("DEBUG: Device not connected. Retrying in " + waitTimeOut, e, deviceId, data);
                        thisRef.Events.DeviceConnectionError.Notify({DeviceId: deviceId, 
                            Error: "Device not connected. Retrying in " + waitTimeOut
                        });

                        setTimeout(function () {
                            thisRef.GetWebsocketUrlForDevice(deviceId, waitTimeOut, callback); 
                        }, waitTimeOut);

                        return;
                    }

                    if (Helpers.IsNullOrEmpty(response)) {
                        // console.error();
                        thisRef.Events.DeviceConnectionError.Notify({DeviceId: deviceId, 
                            Error: "GetWebsocketUrlForDevice() -> NULL reply"
                        });
                    }
                    else {
                        callback(response.device_id, response.url);
                    }
                },
                (error) => {
                    // console.error("ERROR: Device not connected. Retrying in " + waitTimeOut, deviceId, error);
                    thisRef.Events.DeviceConnectionError.Notify({DeviceId: deviceId, 
                        Error: "ERROR: Device not connected. Retrying in " + waitTimeOut + " -> " + error
                    });
                    
                    setTimeout(function () { 
                        thisRef.GetWebsocketUrlForDevice(deviceId, waitTimeOut, callback);
                    }, waitTimeOut);
                }
            );
        }

        private StartWebsocketForDevice(deviceId: string, url: string) {
            var thisRef = this;

            var webSocket = new WebSocket(url);

            webSocket.onopen = function (event) {
                thisRef.Events.DeviceConnected.Notify(deviceId);
            };

            webSocket.onclose = function (event) {
                // http://tools.ietf.org/html/rfc6455#section-7.4.1
                // http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description

                var reason = "";

                     if (event.code == 1000) reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
                else if (event.code == 1001) reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
                else if (event.code == 1002) reason = "An endpoint is terminating the connection due to a protocol error";
                else if (event.code == 1003) reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
                else if (event.code == 1004) reason = "Reserved. The specific meaning might be defined in the future.";
                else if (event.code == 1005) reason = "No status code was actually present.";
                else if (event.code == 1006) reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame. (ALSO Check: SSL Certificate)";
                else if (event.code == 1007) reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
                else if (event.code == 1008) reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
                else if (event.code == 1009) reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
                // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                else if (event.code == 1010) reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
                else if (event.code == 1011) reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
                else if (event.code == 1015) reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
                else                         reason = "Unknown reason";                
                
                thisRef.Events.DeviceDisconnected.Notify({DeviceId: deviceId, Reason: reason});

                setTimeout(function () {
                    thisRef.GetWebsocketUrlForDevice(deviceId, thisRef._timeouts.timeout_websocket_reconnect, (did, url) => {
                        thisRef.StartWebsocketForDevice(did, url);
                    });
                }, 0);
            };

            webSocket.onmessage = function (event) {
                try {
                    var message = JSON.parse(event.data);
                } catch (e) {
                    thisRef.Events.DeviceInvalidMessage.Notify(event);
                    return;
                }

                var deviceId = message.device_id;
                thisRef.Events.DeviceMessage.Notify({DeviceId: deviceId, Message: message});
            };

            webSocket.onerror = function (event) {
                thisRef.Events.DeviceConnectionError.Notify({DeviceId: deviceId, Error: "Websocket Error"});
            };
        }
    }
}
