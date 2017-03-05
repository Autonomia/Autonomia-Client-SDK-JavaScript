namespace Autonomia.Client.Sdk.Helpers.GetPost {

    declare var fetch; 

    export function DoGetCall(url, headers, onSuccess, onError) {
        fetch(url, {
            method: "get",
            mode: "cors",
            headers: headers
        })  
        .then((response) => {
            if (response.status !== 200) {  
                if (onError) {
                    onError(response.statusText + " [HTTP ErrorCode: ]" + response.status);
                }
            }
            else if (onSuccess) {
                response.text().then((data) => {  
                    onSuccess(data);
                });
            }
        })  
        .catch((error) => {  
            if (onError) {
                onError(error);
            }
        });
    }

    export function DoPostCall(url, headers, data, onSuccess, onError) {
        fetch(url, {
            method: "post",
            headers: headers,
            body: data
        })
        .then((response) => {
            if (response.status !== 200) {  
                if (onError) {
                    onError(response.statusText + " [HTTP ErrorCode: ]" + response.status);
                }
            }
            else if (onSuccess) {
                response.text().then((data) => {  
                    onSuccess(data);
                });                
            }
        })  
        .catch((error) => {  
            if (onError) {
                onError(error);
            }
        });
    }    
}