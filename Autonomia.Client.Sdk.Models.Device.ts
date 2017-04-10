namespace Autonomia.Client.Sdk.Models {
    export class Device {
        public Id: string;
        public Type: string;
        public Name: string;

        public IsConnected: boolean;
        public ConnectedAt: string;
        public DisconnectedAt: string;

        public Telemetry: any[];
        public Cameras: Camera[];

        constructor() {
            this.Telemetry = [];
            this.Cameras = [];
        }
    }
}
