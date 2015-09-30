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
            conversationList: [],
            sampleConversation: null,
            sampleMessage1: null,
            sampleMessage2: null,
            sampleContent1: null,
            sampleContent2: null
        },
        testData: {
            imageBlob: generateBlob(),
            longText: new Array(5000).join("?!")
        },
        onSessionStart: function(token) {
        },
        onSessionEnd: function() {}
    };


    /**
     * This generates sample data.
     *
     * Sets up imageBlob variable with a blob.
     * More commonly you'll use
     *
     *     var fileInput = document.getElementById("myFileInput");
     *     var blob = fileInput.files[0];
     *
     * @method
     * @return {Blob}
     */
    function generateBlob() {
        var imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAECElEQVR4Xu2ZO44TURREa0SAWBASKST8xCdDQMAq+OyAzw4ISfmLDBASISERi2ADEICEWrKlkYWny6+77fuqalJfz0zVOXNfv/ER8mXdwJF1+oRHBDCXIAJEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8waWjX8OwHcAv5f9Me3fPRugvbuxd14C8B7AVwA3q0oQAcYwtr2+hn969faPVSWIAG2AT3rXJvz17CcAN6ptgggwrwDb4JeVIALMJ8AY/JISRIB5BGDhr3/aZwDXKxwHEWC6AJcBvAOwfuBjvuNfABcBfGGGl5yJANPabYV/B8DLaT96nndHgPYeu4c/RI8AbQJIwO9FgDMAfrVxWuRdMvB7EOA+gHsALgD4uQjO3b6pFPzqAjwA8HTF5weA8weWQA5+ZQGOw1//jR5SAkn4VQV4CODJls18CAmuAHjbcM8vc9U76ZSrdgt4BODxyLG8Twla4P8BcLfKPX/sEaeSAAz8fR4H8vArHQHXAHwYs3Xj9SU3gQX8SgKcAvBitTp38WAJCWzgVxJg+F0qSGAFv5oAh5bADn5FAQ4lwVUAb3a86nX1tL/tXK10Czj+O+7zOLCFX3UDrEXYhwTW8KsLsPRx0Ap/+A/fq12uKpVnqx4BSx8Hgb9quAcB5t4EgX/sz6sXAeaSIPA3zqOeBJgqwTMAzxuuelJn/ubzSG8CTJFg12ex4Z4vDb+HW8A2aK1XRFYCC/g9C7DkJrCB37sAS0hgBV9BgDklGODfBvCaPScU5np8CPxf71OfCSzhq2yAqZ8d2MJXE6DlOLCGryjALhLYw1cVgJEg8Dv7MKjlgXvbg2Hgd/ph0BwSBH7nHwZNkeCW4z1/rDCV/wOM5RyOg7MAvo0Nur3uIoAbVzpvBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hz8BzIXtYE3VcPnAAAAAElFTkSuQmCC",
            imageBinary = atob(imgBase64),
            buffer = new ArrayBuffer(imageBinary.length),
            view = new Uint8Array(buffer),
            i;

        for (i = 0; i < imageBinary.length; i++) {
         view[i] = imageBinary.charCodeAt(i);
        }
        return new Blob( [view], { type: "image/png" });
    }


    // Get a nonce
    getNonce()

    // Use the nonce to get an identity token
    .then(function(nonce) {
        return getIdentityToken(nonce, window.USER_ID);
    })

    // Use the identity token to get a session
    .then(function(identityToken) {
        return getSession(identityToken);
    })

    // Store the sessionToken so we can use it in the header for our requests
    .then(function(sessionToken) {
        sampledata.headers.Authorization =
                'Layer session-token="' + sessionToken + '"';

        // this call does nothing... unless your also running the
        // websocket sample
        sampledata.onSessionStart(sessionToken);

        // Now we can do stuff, like get a list of conversations
        return getConversations();
    })

    // getConversations() returns a list of conversations
    .then(function(conversations) {
        sampledata.cache.conversationList = conversations;

        // Now lets create a conversation
        return createConversation(["a", "b", "c"]);
    })

    // createConversation returns a conversation object;
    // Using conversation object's url, we can download it any time
    .then(function(conversation) {
        sampledata.cache.sampleConversation = conversation;

        // Demonstrate downloading the object we just created
        return getOneConversation(conversation.url);
    })

    // addRemoveParticipants allows us to change the participants of a conversation
    .then(function(conversation) {
        return addRemoveParticipants(sampledata.cache.sampleConversation.url,
            ["sauruman_the_annoying", "smeagol_baggins"],
            ["a", "b"]
        );
    })

    // Patch metadata deletes frodo.flinstone, adds samwise.flanders and changes is_favorite to false.
    .then(function() {
        return patchConversationMetadata(sampledata.cache.sampleConversation.url,
            {
                "is_favorite": "false",
                "last_3_participants.frodo_flinstone": undefined,
                "last_3_participants.samwise_flanders": "2015-06-22T16:47:42.127Z"
            }
        );
    })

    // getOneConversation returns a conversation identical to sampleConversation
    .then(function() {

        // Lets send a message on that conversation
        return sendMessage( sampledata.cache.sampleConversation.url,
                            "Hello World", "text/plain");
    })

    // sendMessage returns a message object
    // Using the message's url, we can perform operations upon it.
    .then(function(message) {
        sampledata.cache.sampleMessage1 = message;

        // Once we have a message url, we can download it any time
        return getOneMessage(message.url);
    })

    // getOneMessage should return an identical message to sampleMessage1
    .then(function(message) {

        // Sometimes though you just want a full list of messages
        return getMessages(sampledata.cache.sampleConversation.url);
    })

    // getMessages returns an array of messages; in this case,
    // an array of one message that is identical to sampleMessage1.
    .then(function(messages) {

        // Lets mark that message as read.  Well, ok, we created it,
        // so its already marked as read for us, but this shows how to do it.
        return markAsRead(messages[0].url);
    })

    // And of course we can delete the message we created
    .then(function() {
        return deleteResource(sampledata.cache.sampleMessage1.url);
    })

    // Request a URL for uploading Rich Content.
    .then(function() {
        return initiateRichContentUpload("text/plain", sampledata.testData.longText.length);
    })

    // initiateRichContentUpload returns a new Content object
    // which contains an upload_url for us to upload our rich content
    .then(function(contentData) {
        sampledata.cache.sampleContent1 = contentData;
        return uploadRichContent(contentData.upload_url, sampledata.testData.longText);
    })

    // Once upload completes, we can send a message using that Rich Content ID
    .then(function() {
        return sendRichContentMessage(
            sampledata.cache.sampleConversation.url,

            // Message Part 1
            {
                contentId: sampledata.cache.sampleContent1.id,
                mimeType: "text/plain",
                size: sampledata.testData.longText.length
            },

            // Message Part 2
            {
                body: "Farewell Cruel World",
                mimeType: "text/pain"
            }
        );
    })

    // sendRichContentMessage returns the new message
    .then(function(message) {

        // The new message will have a content.download_url; lets download the data.
        return downloadAsciiRichContent(message.parts[0].content.download_url);
    })

    // downloadAsciiRichContent returns our text
    .then(function(text) {

        // Append the text to a dom node and add it to our document
        var div = document.createElement("div");
        div.innerHTML = text;
        document.body.appendChild(div);

        // Now lets repeat using binary data
        return initiateRichContentUpload("image/png", sampledata.testData.imageBlob.size);
    })

    // initiateRichContentUpload returns a new Content object
    // which contains an upload_url for us to upload our rich content
    .then(function(contentData) {
        sampledata.cache.sampleContent2 = contentData;
        return uploadRichContent(contentData.upload_url, sampledata.testData.imageBlob);
    })

    // Once upload completes, we can send a message using that Rich Content ID
    .then(function() {
        return sendRichContentMessage(
            sampledata.cache.sampleConversation.url,

            // Message Part 1:
            {
                contentId: sampledata.cache.sampleContent2.id,
                mimeType: "image/png",
                size: sampledata.testData.imageBlob.size
            },

            // Message Part 2:
            {
                body: "Farewell Cruel World",
                mimeType: "text/pain"
            }
        );
    })

    // sendRichContentMessage returns the new message
    // The new message will have a content.download_url; lets download the data.
    .then(function(message) {

        // Simplest way to deal with Rich Content if its an image is
        // to just set an img.src = download_url:
        var img = document.createElement("img");
        img.src = message.parts[0].content.download_url;
        document.body.appendChild(img);

        // Sometimes though you want the raw binary or base64 encoded data:
        return downloadBinaryRichContent(message.parts[0].content.download_url);
    })

    // downloadBinaryRichContent returns a base64 encoded image
    .then(function(base64img) {
        var img = document.createElement("img");
        img.src = "data:image/png;base64," + base64img;
        document.body.appendChild(img);

        var done = document.createElement("div");
        done.innerHTML = "Test is Completed";
        document.body.appendChild(done);
    });
})();
