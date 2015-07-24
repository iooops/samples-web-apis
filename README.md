# samples-web-apis

Samples for learning the Web APIs.

There are three demos:

1. The REST API
2. The Websocket API
3. The Platform API

to get started, execute the following commands:

1. git clone git@github.com:layerhq/samples-web-apis.git
2. cd samples-web-apis
3. npm install   (it is sometimes necessary to prefix this with `sudo`)

## The REST API Demo

To run the REST API Demo, you need to edit your config.js file to have your app-id.

You should use the app-id for the sample app generated for you in the Developer Dashboard; this is setup with an identity provider that the script will automatically access.

To run the REST API Demo, simply load rest.html in your browser.

The rest.js file contains a library of functions for accessing the REST API.

At the bottom is a script of calls for invoking those functions.

## The Websocket API Demo

To run the Websocket API Demo, you need to be able to run the REST API Demo.

Simply load websocket.html to run the demo; the demo will run the REST API Demo and show all websocket events generated.  If you run this in chrome, you can see more details on the websocket events:

1. Open the Javascript debugger in chrome
2. Go to the Network tab
3. Select the "Websocket" filter to filter the network requests listed
4. Select the last websocket request shown in the network list
5. Select the "frames" tab to see a list of all message frames sent through the websocket.


## The Platform API Demo

The platform.js script is a ndoe script that reads from your environment variables to get its configuration.  Prior to running this sample you need to add the following environmental variables (unix example provided):

```
> export platform_api_app_id=00000000-0000-0000-0000-000000000000
> export platform_api_bearer_token=Your Token Here
```

If you don't have a Platfrom API Bearer token, you can create one on the Developer Dashboard, in the **Keys** section.

Once everything is setup, you can run

```
> node platform.js
```

The platform.js script provides some basic functions for accessing the platform api, and calls them in sequence.

## Typing Indicators

To run the Typing Indicators demo, load typing_indicators.html, which will load typing_indicators.js.

Part 1: This demo will establish a websocket, and send typing indicators as you type.

Part 2: This demo will establish a second websocket connection and handle typing indicators as they are received.

Notes on working with typing indicators:

The sender is expected to use the following behavior:

1. Send a "start" event whenever the input field goes from empty to having text
2. Send a "start" event every 2.5 seconds for as long as there is text in the box, and 2.5 seconds have passed where keyboard events are being received.
3. Send a "pause" event for any 2.5 second stretch in which no keyboard events are received (but there is text in the box)
4. Send an "end" event any time the text box transitions from having text to not having text.

The recipient is expected to use the following behavior:

1. Display a typing indicator such as "frodo is typing that tech savy hobbit" on receiving a start event
2. On going 6 seconds without receiving any other events, automatically set the typing indicator state to "end" and remove any displayed indicators.
3. On receiving a "pause" event, Update the displayed indicator, such as "frodo can't find his keyboard"
4. On receiving an "end" event, remove any displayed indicator

