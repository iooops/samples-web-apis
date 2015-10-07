/*
 * The script demonstrates use rest-library.js functions.
 * To run it successfully, you will need to replace:
 * 1. window.LAYER_APP_ID with your Application ID
 * 2. getIdentityToken() with a function that gets your identity token
 */
(function() {
    if (!window.LAYER_APP_ID) {
        return alert("Please provide an Application ID from your developer dashboard; this goes in config.js");
    }

    if (!window.layer) window.layer = {};

    var sampledata = window.layer.sampledata = {
        config: {
            serverUrl: "https://api.layer.com",
            appId: window.LAYER_APP_ID
        },
        headers: {
            Accept: "application/vnd.layer+json; version=1.0",
            Authorization: "",
            "Content-type": "application/json"
        },
        cache: {
            sendSocket: null,
            receiveSocket: null
        }
    };

    var websocketUrl = sampledata.config.serverUrl.replace(/^https/, "wss");

    // AUTHENTICATE
    getNonce()

    // Use the nonce to get an identity token
    .then(function(nonce) {
        return getIdentityToken(nonce, prompt("Are you user 'a' or 'b'?", "a"));
    })

    // Use the identity token to get a session
    .then(function(identityToken) {
        return getSession(identityToken);
    })

    // Store the sessionToken so we can use it in the header for our requests
    .then(function(sessionToken) {
        sampledata.cache.token = sessionToken;
        sampledata.headers.Authorization =
                'Layer session-token="' + sessionToken + '"';
        return createConversation(["a", "b"], true)
    })

    // OK, we finally have authenticated, we have a Conversation
    // we can now start our typing indicator demo
    .then(function(conversation) {
        // Step 1: Create a websocket
        sampledata.cache.sendSocket = new WebSocket( websocketUrl + "/websocket?session_token=" + sampledata.cache.token,
                                    "com.layer.notifications-1.0");

        // Step 2: Setup The typingListener which will monitor
        // our text editor and send typing indicators over the websocket
        var typingListener = new layer.TypingListener({
            input: document.getElementById("textbox"),
            websocket: sampledata.cache.sendSocket,
            conversation: conversation
        });

        // Nasty hack to let us log all messages sent over the websocket
        // so that people who run this demo can see whats being sent.
        var send = typingListener.publisher.send;
        typingListener.publisher.send = function(msg) {
            log(msg, document.getElementById("sentLog"));
            send.apply(typingListener.publisher, [msg]);
        }

        // Step 3: Setup a TypingIndicatorListener which monitors the
        // websocket for typing indicator events that relate to this
        // conversation
        var typingIndicatorListener = new layer.TypingIndicatorListener({
            conversation: conversation,
            websocket: sampledata.cache.sendSocket,
            onChange: function(evt, data) {
                log("State Data: " + JSON.stringify(evt), document.getElementById("receiveLog"));
                log("WebSocketSocket Data: " + JSON.stringify(data, false, 4), document.getElementById("receiveLog"));
                var typingStr = evt.typing.length ? evt.typing.join(", ") + " " + (evt.typing.length == 1 ? "is" : "are") + " typing" : "";
                var pausedStr = evt.paused.length ? evt.paused.join(", ") + " " + (evt.paused.length == 1 ? "is" : "are") + " paused" : "";
                var state = "";
                state = typingStr ? typingStr : "";
                if (state && pausedStr) state += " and ";
                if (pausedStr) state += pausedStr;
                document.getElementById("statusIndicator").innerHTML = "STATE: " + state;
            }
        });
    });


})();
