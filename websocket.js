/*
 * Examples are written in JQuery to keep things simple, and limits sample code to
 * using only frameworks that most people are familiar with.
 *
 * Example also uses the Layer-Patch repository at
 * https://github.com/layerhq/layer-patch/tree/master/js
 *
 *
 * This example:
 * 1. Initializes a session
 * 2. Establishes a websocket
 * 3. Adds objects to a cache on receiving a "create" event
 * 4. Removes objects from the cache on receiving a "delete" event
 * 5. Delegates "patch" events to the layer-patch library
 * 6. Renders a log for each websocket event
 *
 * The script below will run, but to run it successfully, you will need to replace:
 * 1. window.appId with your appId
 * 2. getIdentityToken() with a function that gets your identity token
 */
(function() {

    // If this throws an error, then you have not loaded the rest sample yet.
    var layersample = window.layer.sampledata;
    var serverUrl = layersample.config.serverUrl.replace(/^https/, "wss");

    function log(message) {
        var d = new Date();
        var node = document.createElement("pre");
        node.innerHTML = d.toLocaleTimeString() + ": " +  message;
        document.body.appendChild(node);
    }


    // Cache of all objects received via the websocket
    var objectCache = {};

    // Global for demonstration/debugging
    var currentMessage;

    var parser = new layer.js.LayerPatchParser({
        getObjectCallback: function(id) {
            return objectCache[id]
        },
        changeCallbacks: {
            Message: {
                all: function(object, newValue, oldValue, paths) {
                    var prop = paths[0].replace(/^([^\.]*).*$/, "$1");
                    newValue = typeof newValue != "object" ? newValue : js_beautify(JSON.stringify(newValue));
                    log("WEBSOCKET PATCH RESULT: " + prop + " = " + newValue);
                }
            },
            Conversation: {
                all: function(object, newValue, oldValue, paths) {
                    var prop = paths[0].replace(/^([^\.]*).*$/, "$1");
                    newValue = typeof newValue != "object" ? newValue : js_beautify(JSON.stringify(newValue));
                    log("WEBSOCKET PATCH RESULT: " + prop + " = " + newValue);
                }
            }
        }
    });


    function onMessage(evt) {
        var msg = JSON.parse(evt.data);
        try {
            switch(msg.type + "." + msg.operation) {

                // On receiving a create event, notify the app
                // of the new object, and cache the object
                case "change.create":
                    objectCache[msg.object.id] = msg.data;
                    log("WEBSOCKET CREATE: " + msg.object.id);
                    break;

                // On receiving a delete event, notify the app of
                // the removed object, and remove it from cache
                case "change.delete":
                    delete objectCache[msg.object.id];
                    log("WEBSOCKET DELETE: " + msg.object.id);
                    break;

                // On receiving a patch event, let the parser handle it.
                // Find the object to be modified, and if it exists, pass it and
                // the operations to the parser.
                // The changeCallbacks handler will notify the app
                // of any changes.
                case "change.patch":
                    var objectToChange = objectCache[msg.object.id];
                    if (objectToChange) {
                        log("WEBSOCKET PATCH: " + msg.object.id + ": " + js_beautify(JSON.stringify(msg.data)));
                        parser.parse({
                            object: objectToChange,
                            type: msg.object.type,
                            operations: msg.data
                        });
                    }
                    break;
            }
        } catch(e) {
            console.error("layer-patch Error: " + e);
        }


    }


    layersample.onSessionStart = function(token) {
        var socket = new WebSocket( serverUrl + "/websocket?session_token=" + token,
                                    "com.layer.notifications-1.0");
        socket.addEventListener("message", onMessage);
    };

    layersample.onSessionEnd = function() {
        log("WEBSOCKET END STATE:");
        for (var id in objectCache) {
            var o = objectCache[id];
            if (id.match(/conversations/)) {
                log("&nbsp;&nbsp;&nbsp;" + id + ": " + o.participants + "; " + JSON.stringify(o.metadata));
            } else if (id.match(/messages/)) {
                log("&nbsp;&nbsp;&nbsp;" + id + ": " + JSON.stringify(o.parts));
            }
        }
    };
})();