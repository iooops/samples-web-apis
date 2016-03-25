# Layer for Web Sample Code

Samples for learning the Layer APIs.

There are three demos:

1. The Client REST API
2. The WebSocket API
3. The Platform API

## Requirements

The examples require that you have `npm` installed.

## Installation

To get started, execute the following commands:

1. `git clone git@github.com:layerhq/samples-web-apis.git`
2. `cd samples-web-apis`
3. `npm install`
4. Run your local webserver OR run `npm install http-server -g`
   followed by `sudo http-server -a localhost -p 8080`.

**Note**: These demos can NOT be run from `file:///`; only `http://`.

## Configuration

To run the demos below, you should edit your `config.js` file to have your `LAYER_APP_ID`.

You should use the Application ID for the sample app generated for you in the [Developer Dashboard](https://developer.layer.com); this is setup with an identity provider that the script will automatically access.

## The Client REST API Demo

To run the Client REST API Demo, simply load rest-demo/index.html in your browser.

The `~/rest-library.js` file contains a library of functions for accessing the REST API.

The `~/rest-demo/demo.js` file a script of calls for invoking those rest-library.js's functions.

This demo is meant to be understood by running it with your debugger open and showing your network traffic.

## The WebSocket API Demo

To run the WebSocket API Demo, you need to be able to run the REST API Demo.

Simply load `websocket-demo/index.html` to run the demo; the demo will run the REST API Demo and show all WebSocket events generated.  If you run this in chrome, you can see more details on the WebSocket events:

1. Open the JavaScript debugger in chrome
2. Go to the Network tab
3. Select the "WebSocket" filter to filter the network requests listed
4. Select the last WebSocket request shown in the network list
5. Select the "frames" tab to see a list of all message frames sent through the WebSocket.

## The Typing Indicator Demo

The Typing Indicator Demo comes with some libraries you are welcome to reuse, initializing three classes:

1. TypingPublisher: Sends WebSocket packets to the server indicating that typing is "started", "paused" or "finished"
2. TypingListener: Monitors a textbox you provide, and tells the TypingPublisher what the current state is
3. TypingIndicatorListener: Monitors the WebSocket for typing indicators from other users, and fires onChange events whenever a typing indicator updates its state

These can be found in the `typing-indicator-demo/typing_indicators` folder, and the demo.js shows an example of how to use them.

To run the Typing Indicator Demo, simply load `typing-indicator.html` in your browser.

Open `typing-indicator-demo/index.html` to run this test; you can test this in two browsers or tabs; one can log in as user "a" and the other as user "b" so you can see what both the sender and receiver of typing indicators will see.

## The Platform API Demo

The `platform.js` script is a Node.js script that reads from your environment variables to get its configuration.  Prior to running this sample you need to add the following environmental variables (unix example provided):

```
> export LAYER_APP_UUID=00000000-0000-0000-0000-000000000000
> export LAYER_PLATFORM_API_TOKEN=<token>
```

If you don't have a Platform API Bearer token, you can create one in the [Developer Dashboard](https://developer.layer.com), in the **Keys** section.

Once everything is setup, you can run

```
> node platform.js
```

The `platform.js` script provides some basic functions for accessing the platform api, and calls them in sequence.

## Credits

The samples were lovingly crafted in San Francisco by the Layer team. At Layer, we are building the Communications Layer for the Internet. We value, support, and create works of Open Source engineering excellence.

## License

These samples are available under the Apache 2 License. See the LICENSE file for more info.
