namespace Autonomia.Client.Sdk.Helpers.GetPost {

    declare var axios; 

    export function DoGetCall(url, headers, onSuccess, onError) {
        let request = {
            method: "GET",
            url: url,
            headers: headers
        };

        axios
            .request(request)
            .then((response) => {
                onSuccess(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    onError(error.response.data);
                }
                else {
                    onError(error);
                }
            });
    }

    export function DoPostCall(url, headers, data, onSuccess, onError) {
        let request = {
            method: "POST",
            url: url,
            headers: headers,
            data: data
        };

        axios
            .request(request)
            .then((response) => {
                onSuccess(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    onError(error.response.data);
                }
                else {
                    onError(error);
                }
            });
    }

    export function DoPutCall(url, headers, data, onSuccess, onError) {
        let request = {
            method: "PUT",
            url: url,
            headers: headers,
            data: data
        };

        axios
            .request(request)
            .then((response) => {
                onSuccess(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    onError(error.response.data);
                }
                else {
                    onError(error);
                }
            });
    }

    export function DoDeleteCall(url, headers, onSuccess, onError) {
        let request = {
            method: "DELETE",
            url: url,
            headers: headers
        };

        axios
            .request(request)
            .then((response) => {
                onSuccess(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    onError(error.response.data);
                }
                else {
                    onError(error);
                }
            });
    }
}