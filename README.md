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
