namespace Autonomia.Client.Sdk.Helpers.Persisters {

    // Contracts
    // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
    export interface IPersister {
        Save(data: any, done);
        Read(dataContainer: any, done);
    }

    // Persisters
    // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
    export class LocalStoragePersister implements IPersister {
        private _key: string = "";

        constructor(key: string) {
            this._key = key;
        }

        public Save(data: any, done) {
            try {
                var dataAsString = JSON.stringify(data);
                localStorage.setItem(this._key, dataAsString);

                done();
            }
            catch (ex) {
                done.fail(ex);
            }
        }

        public Read(dataContainer: any, done) {
            var dataAsString: string = localStorage.getItem(this._key);

            if (Helpers.IsNullOrEmpty(dataAsString)) {
                dataContainer.data = null;
                done();
            }
            else {
                try {
                    dataContainer.data = JSON.parse(dataAsString);
                } 
                catch (ex) {
                    dataContainer.data = null;
                }

                done();
            }
        }
    }
}