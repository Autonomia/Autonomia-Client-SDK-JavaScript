/// <reference path="Autonomia.Client.Sdk.Helpers.ts" /> 

namespace Autonomia.Client.Sdk.Helpers.Strings {
    export function ReplaceAll(originalString: string, stringToFind: string, replacingString: string): string {
        if (Helpers.IsNullOrEmpty(originalString)) {
            return "";
        }
        
        // Escape things => http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711
        stringToFind = stringToFind.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return originalString.replace(new RegExp(stringToFind, 'g'), replacingString);
    }

    export function ReplaceAllInArray(originalString: string, stringsToFind: string[], replacingString: string): string {
        var result = originalString;
        for (var i = 0; i < stringsToFind.length; i++) {
            result = ReplaceAll(result, stringsToFind[i], replacingString);
        }
        return result;
    }

    export function RemoveIfExistsAtEnd(originalString: string, stringToFind: string): string {
        if (Helpers.IsNullOrEmpty(originalString)) {
            return "";
        }
        var newSubstringLength = (originalString.length - stringToFind.length);
        if (originalString.lastIndexOf(stringToFind) === newSubstringLength) {
            return originalString.substring(0, newSubstringLength);
        }
        return originalString;
    }

    export function StartsWith(originalString: string, stringToFind: string): boolean {
        if (Helpers.IsNullOrEmpty(originalString)) {
            return false;
        }
        if (originalString.indexOf(stringToFind) === 0) {
            return true;
        }
        return false;
    }

    export function EndsWith(originalString: string, stringToFind: string): boolean {
        if (Helpers.IsNullOrEmpty(originalString)) {
            return false;
        }
        var newSubstringLength = (originalString.length - stringToFind.length);
        if (originalString.lastIndexOf(stringToFind) === newSubstringLength) {
            return true;
        }
        return false;
    }

    export function Contains(originalString: string, stringToFind: string): boolean {
        if (Helpers.IsNullOrEmpty(originalString)
          ||Helpers.IsNullOrEmpty(stringToFind)) {
            return false;
        }
        
        return (originalString.indexOf(stringToFind) !== -1);
    }
}