namespace Autonomia.Client.Sdk.Helpers.Uris {

    export class Uri {
        public Protocol: string; // => "http:"
        public Host: string;     // => "example.com:3000"
        public Hostname: string; // => "example.com"
        public Port: string;     // => "3000"
        public Pathname: string; // => "/pathname/"
        public Hash: string;     // => "#hash"
        public Search: string;   // => "?search=test"
      //public Origin: string;   // => "http://example.com:3000"

        public ToHref(): string { // "http://example.com:3000/pathname/?search=test#hash";
            return;
        }
    }

    export function Parse(url: string): Uri {
        var parser = document.createElement("a");
        parser.href = url;
        
        var uri = new Uri();
            uri.Protocol = parser.protocol;
            uri.Host     = parser.host;
            uri.Hostname = parser.hostname;
            uri.Port     = parser.port;
            uri.Pathname = parser.pathname;
            uri.Hash     = parser.hash;
            uri.Search   = parser.search;
          //uri.Origin   = parser.origin;

        return uri;
    }
}