namespace Autonomia.Client.Sdk.Helpers.Tasks {

    declare var ASQ;

    ASQ.extend("Parallel", function __build__(api, internals) {
        return api.gate;
    });
    ASQ.extend("This", function __build__(api, internals) {
        return api.then;
    });
    ASQ.extend("Then", function __build__(api, internals) {
        return api.then;
    });
    ASQ.extend("OnError", function __build__(api, internals) {
        return api.or;
    });

    export class TaskRunner {

        private _asq: any;

        constructor() {
            this._asq = ASQ();
            return this._asq;
        }

        // These below are just to make the TS copmiler happy
        // At runtime the ASQ extensions above will run

        public Parallel(...args: any[]): TaskRunner {
            return this;
        }

        public This(p: any): TaskRunner {
            return this;
        }

        public Then(p: any): TaskRunner {
            return this;
        }

        public OnError(p: any): TaskRunner {
            return this;
        }
    }

    export function Run(): TaskRunner{
        return new TaskRunner();
    }
}