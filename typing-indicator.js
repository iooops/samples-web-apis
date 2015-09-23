/*
 * The script demonstrates use rest-library.js functions.
 * To run it successfully, you will need to replace:
 * 1. window.appId with your appId
 * 2. getIdentityToken() with a function that gets your identity token
 */
(function() {
    if (!window.appId) {
        throw new Error("Please provide an App ID from your developer dashboard");
    }

    if (!window.layer) window.layer = {};

    if (!serverUrl) serverUrl = "https://api.layer.com";
    var websocketUrl = serverUrl.replace(/^https/, "wss");

    var sampledata = window.layer.sampledata = {
        config: {
            serverUrl: serverUrl,
            appId: window.appId
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

    // Part 1: Setup sending of typing indicators
    // Part 1a: Create a Websocket for sending typing indicators
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
    .then(function(conversation) {
        console.log("STARTING ON " + conversation.id);
        sampledata.cache.sendSocket = new WebSocket( websocketUrl + "/websocket?session_token=" + sampledata.cache.token,
                                    "com.layer.notifications-1.0");

        // Part 1b: Setup The typingListener
        var typingListener = new layer.TypingListener({
            input: document.getElementById("textbox"),
            websocket: sampledata.cache.sendSocket,
            conversation: conversation
        });

        var send = typingListener.publisher.send;
        typingListener.publisher.send = function(msg) {
            log(msg, document.getElementById("sentLog"));
            send.apply(typingListener.publisher, [msg]);
        }

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