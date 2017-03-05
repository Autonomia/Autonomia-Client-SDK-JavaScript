namespace Autonomia.Client.Sdk.Helpers.Events {

    export interface Delegate<T> {
        (data?: T): void;
    }

    export interface IEvent<T> {
        OnHappen(delegate: Delegate<T>): void;
        Notify(data?: T): void;
        RemoveHandler(delegate: Delegate<T>): void;
    }

    export class Event<T> implements IEvent<T> {
        private _delegates: Delegate<T>[] = [];
 
        public OnHappen(delegate: Delegate<T>) {
            this._delegates.push(delegate);
        }

        public Notify(data?: T) {
            this._delegates.slice(0).forEach(d => d(data));
        }

        public RemoveHandler(delegate: Delegate<T>) {
            this._delegates = this._delegates.filter(d => d !== delegate);
        }
    }
}