
/// <reference path="Autonomia.Client.Sdk.Models.Device.ts" />

namespace Autonomia.Client.Sdk {
    export class Client {

        // DELETE-ME:
        private _userEmail: string;
        private _userPassword: string;
        private _userAppList: any[];

        private _apiServer: string;
        private _userLoginToken: string = null;

        private _urls: {
            Devices: string,
            Subscribe1: string
            Subscribe2: string
        }

        private _timeouts: {
            timeout_device_not_attached: number,
            timeout_websocket_reconnect: number
        };

        private _socketByDeviceId: any;

        public Events: {
            DeviceConnected: Helpers.Events.Event<string>,
            DeviceDisconnected: Helpers.Events.Event<{DeviceId: string, Reason: string}>,
            DeviceConnectionError: Helpers.Events.Event<{DeviceId: string, Error: string}>,
            DeviceMessage: Helpers.Events.Event<{DeviceId: string, Message: any}>,
            DeviceInvalidMessage: Helpers.Events.Event<any>
        }

        constructor() {
            this.SetApiServer("api.autonomia.io");
        }

        private static _clientInstance: Client = null;
        public static GetInstance() {
            if (Helpers.IsNullOrEmpty(Client._clientInstance)) {
                Client._clientInstance = new Client();
            }

            return Client._clientInstance;
        }

        // @ Helpers
        // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
        public SetApiServer(apiServer: string) {
            var thisRef = this;

            thisRef._apiServer = apiServer;

            this._urls = {
                Devices      : "https://" + thisRef._apiServer + "/v1/api/devices",
                Subscribe1   : "https://" + thisRef._apiServer + "/v1/api/devices/",
                Subscribe2   : "/subscribe"
            }

            this._timeouts = {
                timeout_device_not_attached: 30000,
                timeout_websocket_reconnect: 1000
            };

            this._socketByDeviceId = {};

            this.Events = {
                DeviceConnected         : new Helpers.Events.Event<string>(),
                DeviceDisconnected      : new Helpers.Events.Event<{DeviceId: string, Reason: string}>(),
                DeviceConnectionError   : new Helpers.Events.Event<{DeviceId: string, Error: string}>(),
                DeviceMessage           : new Helpers.Events.Event<{DeviceId: string, Message: any}>(),
                DeviceInvalidMessage    : new Helpers.Events.Event<any>()
            }
        }
        private GetUrls_User_R() {
            return {
                R: "https://" + this._apiServer + "/v1/api/auth/signin"
            };
        }
        private GetUrls_Applications_CRUD_LT(appId: string=null) {
            return {
                C: "https://" + this._apiServer + "/v1/api/applications",
                R: "https://" + this._apiServer + "/v1/api/applications/" + appId,
                U: "https://" + this._apiServer + "/v1/api/applications/" + appId,
                D: "https://" + this._apiServer + "/v1/api/applications/" + appId,

                L: "https://" + this._apiServer + "/v1/api/applications", // List All Apps
                T: "https://" + this._apiServer + "/v1/api/auth/token"    // Get Access Token
            };
        }
        private GetUrls_Device(deviceId: string=null, videoKey: string=null ) {
            return {
                PublishToSocial: "https://" + this._apiServer + "/v1/api/devices/" + deviceId + "/publish",
                RecordedVideoList: "https://" + this._apiServer + "/v1/api/devices/" + deviceId + "/video",
                StreamingUrlForVideo: "https://" + this._apiServer + "/v1/api/devices/" + deviceId + "/stream?key=" + videoKey,
                DownloadUrlForVideo: "https://" + this._apiServer + "/v1/api/devices/" + deviceId + "/url?key=" + videoKey,
                MetadataForVideo: "https://" + this._apiServer + "/v1/api/devices/" + deviceId + "/meta?key=" + videoKey
            };
        }


        // @ User
        // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
        public UserLogin(done, user: string, pass: string) {
            var thisRef = this;

            thisRef._userEmail = user;
            thisRef._userPassword = pass;

            var headers = {
                "Content-Type": "application/json"
            };
            var dataToSend = {
                "email": user,
                "password": pass
            };

            Helpers.GetPost.DoPostCall(
                thisRef.GetUrls_User_R().R,
                headers,
                JSON.stringify(dataToSend),
                (dataReceived) => {
                    thisRef._userLoginToken = dataReceived.token;
                    thisRef._userAppList = dataReceived.applications;
                    done();
                },
                (error) => {
                    done.fail("Login() -> [" + error + "]");
                }
            );
        }

        public IsAuthenticated() {
            return (this._userLoginToken !== null);
        }


        // @ Applications
        // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
        public AppCreate(done, appName: string, appIdContainer: any) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + thisRef._userLoginToken
            };

            var appKey = Helpers.Strings.ReplaceAll(Helpers.NewGuid(), "-", "");
            var appSecret = Helpers.Strings.ReplaceAll(Helpers.NewGuid(), "-", "");

            var dataToSend = {
                "name": appName,
                "appKey": appKey,
                "appSecret": appSecret
            };

            Helpers.GetPost.DoPostCall(
                thisRef.GetUrls_Applications_CRUD_LT().C,
                headers,
                JSON.stringify(dataToSend),
                (dataReceived) => {
                    appIdContainer.AppId = dataReceived._id;
                    done();
                },
                (error) => {
                    done.fail("AppCreate() -> [" + error + "]");
                }
            );
        }
        public AppGetInfo(done, appId: string, appInfoContainer: any) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + thisRef._userLoginToken
            };

            Helpers.GetPost.DoGetCall(
                thisRef.GetUrls_Applications_CRUD_LT(appId).R,
                headers,
                (dataReceived) => {
                    appInfoContainer.AppInfo = dataReceived;
                    done();
                },
                (error) => {
                    done.fail("AppGetInfo() -> [" + error + "]");
                }
            );
        }
        public AppUpdate(done, appId: string, data: any) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + thisRef._userLoginToken
            };

            Helpers.GetPost.DoPutCall(
                thisRef.GetUrls_Applications_CRUD_LT(appId).U,
                headers,
                JSON.stringify(data),
                (dataReceived) => {
                    done();
                },
                (error) => {
                    done.fail("AppUpdate() -> [" + error + "]");
                }
            );
        }
        public AppDelete(done, appId: string) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + thisRef._userLoginToken
            };

            Helpers.GetPost.DoDeleteCall(
                thisRef.GetUrls_Applications_CRUD_LT(appId).D,
                headers,
                (dataReceived) => {
                    done()
                },
                (error) => {
                    done.fail("AppGetInfo() -> [" + error + "]");
                }
            );
        }
        public AppListAll(parentDone, appsContainer: any) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + thisRef._userLoginToken
            };

            Helpers.Tasks.Run()
                .This((done) => {
                    thisRef.UserLogin(done, thisRef._userEmail, thisRef._userPassword);
                })
                .This((done) => {
                    appsContainer.Apps = thisRef._userAppList;
                    parentDone();
                    done();
                })
                .OnError((error) => {
                    console.log(error);
                });
        }
        public AppGetAccessToken(done, appKey: string, appSecret: string, appAccessTokenContainer: any) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json"
            };
            var dataToSend = {
                "app_key": appKey,
                "app_secret": appSecret
            };

            Helpers.GetPost.DoPostCall(
                thisRef.GetUrls_Applications_CRUD_LT().T,
                headers,
                JSON.stringify(dataToSend),
                (dataReceived) => {
                    if (
                        Helpers.IsNullOrEmpty(dataReceived)
                        || !dataReceived.hasOwnProperty("access_token")
                        || !dataReceived.hasOwnProperty("token_type")
                    ) {
                        done.fail("Connect() -> [Invalid data received]");
                    }
                    else {
                        appAccessTokenContainer.AppAccessToken = {
                            Type: dataReceived.token_type,
                            Value: dataReceived.access_token
                        };

                        done();
                    }
                },
                (error) => {
                    done.fail("Connect() -> [" + error + "]");
                }
            );
        }


        // @ Devices
        // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
        public GetDevices(done, token: string, devicesContainer: Models.Device[]) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": token
            };

            Helpers.GetPost.DoGetCall(
                thisRef._urls.Devices,
                headers,
                (dataReceived) => {
                    if (!Helpers.IsNullOrEmpty(dataReceived)) {
                        dataReceived.forEach((device) => {
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
                                        c.IsStreaming = camera.streaming;

                                    d.Cameras.push(c);
                                });
                            }

                            devicesContainer.push(d);
                        });
                    }

                    done();
                },
                (error) => {
                    done.fail("GetDevices() -> [" + error + "]");
                }
            );
        }

        public DeviceGetVideosForCamera(
            done,
            token: string,
            deviceId: string,
            cameraId: string,

            startTimeInUtc: string,
            endTimeInUtc: string,

            videosContainer: any
        ) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": token
            };

            var dataToSend = {
                "camera" : cameraId,
                "start": startTimeInUtc,
                "end": endTimeInUtc,
                "sign": false
            };

            Helpers.GetPost.DoPostCall(
                thisRef.GetUrls_Device(deviceId).RecordedVideoList,
                headers,
                JSON.stringify(dataToSend),
                (dataReceived) => {
                    videosContainer.Videos = dataReceived;
                    done();
                },
                (error) => {
                    done.fail("DeviceGetVideosForCamera() -> [" + error + "]");
                }
            );
        }

        public DeviceGetVideoStreamingUrl(
            done,
            token: string,
            deviceId: string,
            videoKey: string,

            streamingUrlContainer: any
        ) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": token
            };

            Helpers.GetPost.DoGetCall(
                thisRef.GetUrls_Device(deviceId, videoKey).StreamingUrlForVideo,
                headers,
                (dataReceived) => {
                    streamingUrlContainer.StreamingUrl = dataReceived.url;
                    done();
                },
                (error) => {
                    done.fail("DeviceGetVideoStreamingUrl() -> [" + error + "]");
                }
            );
        }

        public DeviceGetVideoDownloadUrl(
            done,
            token: string,
            deviceId: string,
            videoKey: string,

            downloadUrlContainer: any
        ) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": token
            };

            Helpers.GetPost.DoGetCall(
                thisRef.GetUrls_Device(deviceId, videoKey).DownloadUrlForVideo,
                headers,
                (dataReceived) => {
                    downloadUrlContainer.DownloadUrl = dataReceived.url;
                    done();
                },
                (error) => {
                    done.fail("DeviceGetVideoStreamingUrl() -> [" + error + "]");
                }
            );
        }

        public DeviceGetVideoMetadata(
            done,
            token: string,
            deviceId: string,
            videoKey: string,

            metadataContainer: any
        ) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": token
            };

            Helpers.GetPost.DoGetCall(
                thisRef.GetUrls_Device(deviceId, videoKey).MetadataForVideo,
                headers,
                (dataReceived) => {
                    metadataContainer.Metadata = dataReceived.metadata;
                    done();
                },
                (error) => {
                    done.fail("DeviceGetVideoStreamingUrl() -> [" + error + "]");
                }
            );
        }

        public DevicePublishCamera(
            done,
            token: string,
            deviceId: string,
            cameraId: string,
            platform: string,
            key: string,
            responseContainer: any
        ) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": token
            };

            var dataToSend = {
                platform: platform,
                key: key,
                camera: cameraId
            };

            Helpers.GetPost.DoPostCall(
                thisRef.GetUrls_Device(deviceId).PublishToSocial,
                headers,
                dataToSend,
                (dataReceived) => {
                    responseContainer.Response = dataReceived;
                    done();
                },
                (error) => {
                    done.fail("DevicePublishCamera() -> [" + error + "]");
                }
            );
        }

        public GetNotificationsForDevices(devices: Models.Device[], token: string) {
            var thisRef = this;

            devices.forEach((device: Models.Device) => {
                thisRef.GetWebsocketUrlForDevice(device.Id, token, thisRef._timeouts.timeout_device_not_attached, function (deviceId, url) {

                    var sslHost = "https://" + Helpers.Uris.Parse(url).Host + "/"

                    Helpers.GetPost.DoGetCall(sslHost, {}, (response) => {
                        thisRef.StartWebsocketForDevice(deviceId, url, token);
                    }, (error) => {
                        thisRef.StartWebsocketForDevice(deviceId, url, token);
                    })
                });
            });
        }

        public StopDevicesNotifications(deviceId) {
            try {
                this._socketByDeviceId[deviceId].close();
            }
            catch(e) {
                console.error("StopDevicesNotifications() -> " + e);
            }
        }

        public StopAllDevicesNotifications() {
            for (var deviceId in this._socketByDeviceId) {
                this.StopDevicesNotifications(deviceId);
            }
        }

        public Execute(deviceId: string, rpcDetails: any) {
            try {
                var data = JSON.stringify({
                    "jsonrpc": "2.0",
                    "method": rpcDetails.Method,
                    "params": rpcDetails.Params,
                    "id": 7
                });

                this._socketByDeviceId[deviceId].send(data);
            }
            catch(e) {
                console.error("Execute() -> " + e);
            }
        }

        private GetWebsocketUrlForDevice(deviceId: string, token: string, waitTimeOut: number, callback) {
            var thisRef = this;

            var headers = {
                "Content-Type": "application/json",
                "Authorization": token
            };

            Helpers.GetPost.DoGetCall(
                thisRef._urls.Subscribe1 + deviceId + thisRef._urls.Subscribe2,
                headers,
                (dataReceived) => {
                    if (Helpers.IsNullOrEmpty(dataReceived)) {
                        thisRef.Events.DeviceConnectionError.Notify({DeviceId: deviceId,
                            Error: "GetWebsocketUrlForDevice() -> NULL reply"
                        });
                    }
                    else {
                        callback(dataReceived.device_id, dataReceived.url);
                    }
                },
                (error) => {
                    thisRef.Events.DeviceConnectionError.Notify({DeviceId: deviceId,
                        Error: "ERROR: Device not connected. Retrying in " + waitTimeOut + " -> " + error
                    });

                    setTimeout(function () {
                        thisRef.GetWebsocketUrlForDevice(deviceId, token, waitTimeOut, callback);
                    }, waitTimeOut);
                }
            );
        }

        private StartWebsocketForDevice(deviceId: string, url: string, token: string) {
            var thisRef = this;

            var webSocket = new WebSocket(url);

            webSocket.onopen = function (event) {
                thisRef._socketByDeviceId[deviceId] = webSocket;
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
                    thisRef.GetWebsocketUrlForDevice(deviceId, token, thisRef._timeouts.timeout_websocket_reconnect, (did, url) => {
                        thisRef.StartWebsocketForDevice(did, url, token);
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
