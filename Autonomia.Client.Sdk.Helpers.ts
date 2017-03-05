namespace Autonomia.Client.Sdk.Helpers {

    declare var uuid;

    export function IsNullOrEmpty(object: any): boolean {
        // Quick Check
        if (   (object === null       )
            || (object === undefined  )
            || (object === "undefined"))
            return true;

        // [] or ""
        if (object.constructor === Array || object.constructor === String)
            return (object.length === 0);

        // {}
        if (object.constructor === Object) {
            var propertiesCount = 0;
            for (var propertyName in object) {
                propertiesCount++;
                break;
            }

            return (propertiesCount === 0)
        }

        // Anything else (seems only "Number" & "Function" is left but those would be excluded at first IF)
        return false;
    }

    export function NewGuid(): string {
        return uuid.v4();
    }

    export function CloneObject(object: any): any {
        return JSON.parse(JSON.stringify(object));
    }    
}