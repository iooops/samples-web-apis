/*
 * Examples are written in JQuery to keep things simple, and limits sample code to
 * using only frameworks that most people are familiar with.
 *
 * Unfortunately, JQuery has some limitations, so in some cases it was necessary to fallback to
 * the raw XMLHttpRequest object.
 *
 * This example consists of two things:
 * 1. A series of functions, each of which returns a JQuery Deferred
 *    Either via return $.ajax(...) or by explicitly creating a new $.Deferred().
 * 2. A series of ".then(callbacks)" calls
 *
 * For those unfamiliar with Deferreds, When an asynchronous behavior is completed,
 * The Deferred is resolved: d.resolve(data);
 * When the Deferred is resolved, callbacks defined by "then" are then triggered.
 *
 */

/**
 * To get started, we must obtain a Nonce
 *
 * http://bit.ly/1xYNf7z#obtaining-a-nonce
 *
 * @method
 * @return {$.Deferred}
 */
function getNonce() {
    var d = new $.Deferred();
    $.ajax({
        url: window.layer.sampledata.config.serverUrl + "/nonces",
        method: "POST",
        headers: window.layer.sampledata.headers
    })
    .done(function(data, textStatus, xhr) {
        d.resolve(data.nonce);
    });
    return d;
}

/**
 * Example of getting an identity token.
 *
 * Replace this function with whatever service you are
 * getting an Identity Token from.
 *
 * @method
 * @param  {string} nonce   Token is provided by REST server for use by identity provider
 * @return {$.Deferred}
 */
function getIdentityToken(nonce, userId) {
    var d = new $.Deferred();
    $.ajax({
        url: "https://layer-identity-provider.herokuapp.com/identity_tokens",
        headers: {
            "X_LAYER_APP_ID": window.layer.sampledata.config.appId,
            "Content-type": "application/json",
            "Accept": "application/json"
        },
        method: "POST",
        data: JSON.stringify({
            app_id: window.layer.sampledata.config.appId,
            user_id: userId,
            nonce: nonce
        })
    })
    .then(function(data, textStatus, xhr) {
        d.resolve(data.identity_token);
    });
    return d;
}

/**
 * Create a session using the identity_token
 *
 * http://bit.ly/1xYNf7z#authenticating-with-an-identity-token
 *
 * @method
 * @param  {string} identityToken   Identity token returned by your identity provider
 * @return {$.Deferred}
 */
function getSession(identityToken) {
    var d = new $.Deferred();
    $.ajax({
        url: window.layer.sampledata.config.serverUrl + "/sessions",
        method: "POST",
        headers: window.layer.sampledata.headers,
        data: JSON.stringify({
            "identity_token": identityToken,
            "app_id": window.layer.sampledata.config.appId
        })
    })
    .then(function(data, textStatus, xhr) {
        d.resolve(data.session_token);
    });
    return d;
}

/**
 * Create a conversation
 *
 * http://bit.ly/1xYNf7z#creating-a-conversation
 *
 * @method
 * @param  {string[]} participants  Array of participant-ids
 * @return {$.Deferred}
 */
function createConversation(participants, distinct) {
    return $.ajax({
        url: window.layer.sampledata.config.serverUrl + "/conversations",
        method: "POST",
        headers: window.layer.sampledata.headers,
        data: JSON.stringify({
            participants: participants,
            distinct: Boolean(distinct),
            metadata: {
                "background-color": "#aaaacc",
                "is_favorite": "true",
                "last_3_participants": {
                    "fred_baggins": "2015-06-22T16:47:42.127Z",
                    "frodo_flinstone": "2015-06-22T15:47:40.327Z",
                    "gandalf_of_oz": "2015-06-22T16:43:42.127Z"
                }
            }
        })
    });
}


/**
 * Lists all Conversations
 *
 * http://bit.ly/1xYNf7z#listing-conversations
 *
 * @method
 * @return {$.Deferred}
 */
function getConversations() {
    return $.ajax({
        url: window.layer.sampledata.config.serverUrl + "/conversations",
        method: "GET",
        headers: window.layer.sampledata.headers
    })
}

/**
 * Download description of a single Conversation
 *
 * http://bit.ly/1xYNf7z#listing-conversations
 *
 * @method
 * @param  {string} conversationUrl     URL of the requested resource
 * @return {$.Deferred}
 */
function getOneConversation(conversationUrl) {
    return $.ajax({
        url: conversationUrl,
        method: "GET",
        headers: window.layer.sampledata.headers
    })
}

/**
 * Listing Messages in a Conversation:
 *
 * http://bit.ly/1xYNf7z#listing-messages-in-a-conversation
 *
 * @method
 * @param  {string} conversationUrl     URL of the requested resource
 * @return {$.Deferred}
 */
function getMessages(conversationUrl) {
    return $.ajax({
        url: conversationUrl + "/messages",
        method: "GET",
        headers: window.layer.sampledata.headers
    })
}

/**
 * Retrieving a single Message
 *
 * http://bit.ly/1xYNf7z#retrieving-a-message
 *
 * @method
 * @param  {string} messageUrl      URL of the requested resource
 * @return {$.Deferred}
 */
function getOneMessage(messageUrl) {
    return $.ajax({
        url: messageUrl,
        method: "GET",
        headers: window.layer.sampledata.headers
    })
}

/**
 * Sending a Message:
 *
 * http://bit.ly/1xYNf7z#sending-a-message
 *
 * This function sends only a single message part, but could easily be
 * adapted to send more.
 *
 * @method
 * @param  {string} conversationUrl     URL of the resource to operate upon
 * @param  {string} body                Message contents
 * @param  {string} mimeType            Mime type for the message contents (e.g. "text/plain")
 * @return {$.Deferred}
 */
function sendMessage(conversationUrl, body, mimeType) {
    return $.ajax({
        url: conversationUrl + "/messages",
        method: "POST",
        headers: window.layer.sampledata.headers,
        data: JSON.stringify({
            parts: [{
                body: body,
                mime_type: mimeType
            }]
        })
    });
}

/**
 * Writing a Receipt for a Message (i.e. marking it as read or delivered)
 *
 * http://bit.ly/1xYNf7z#writing-a-receipt-for-a-message
 *
 * @method
 * @param  {string} messageUrl      URL of the resource to operate upon
 * @return {$.Deferred}
 */
function markAsRead(messageUrl) {
    return $.ajax({
        url: messageUrl + "/receipts",
        method: "POST",
        headers: window.layer.sampledata.headers,
        data: JSON.stringify({type: "read"})
    });
}

/**
 * Delete a message/conversation from the server and all mobile clients
 *
 * http://bit.ly/1xYNf7z#deleting-a-message
 * http://bit.ly/1xYNf7z#deleting-a-conversation
 *
 * @method
 * @param  {string} resourceUrl      URL of the resource to operate upon
 * @return {$.Deferred}
 */
function deleteResource(resourceUrl) {
    return $.ajax({
        url: resourceUrl + "?destroy=true",
        method: "DELETE",
        headers: window.layer.sampledata.headers
    });
}


/**
 * For sending large files/content, use the Rich Content APIs:
 *
 * http://bit.ly/1xYNf7z#rich-content
 *
 * This method is Step 1 of the sequence: Initiating a Rich Content Upload.
 *
 * http://bit.ly/1xYNf7z#initiating-a-rich-content-upload
 *
 * @method
 * @param  {string}     mimeType    Mime type for the content that is to be uploaded
 * @param  {integer}    size        Size of the content that is to be uploaded
 * @return {$.Deferred}
 */
function initiateRichContentUpload(mimeType, size) {
    return $.ajax({
        url: window.layer.sampledata.config.serverUrl + "/content",
        method: "POST",
        headers: $.extend({
            "Upload-Content-Type": mimeType,
            "Upload-Content-Length": size,
            "Upload-Origin": window.location.origin
        }, window.layer.sampledata.headers)
    });
}

/**
 * For sending large files/content, use the Rich Content APIs:
 *
 * http://bit.ly/1xYNf7z#rich-content
 *
 * This method is Step 2 of the sequence: Upload the Content
 *
 * https://cloud.google.com/storage/docs/json_api/v1/how-tos/upload#resumable
 *
 * NOTE: JQuery doesn't handle this very well.
 *
 * @method
 * @param  {string} url     Url provided by Step 1
 * @param  {Any}    data    Typically a string or blob to upload to the server
 * @return {$.Deferred}
 */
function uploadRichContent(url, data) {
    var d = new $.Deferred();
    var r = new XMLHttpRequest();
    r.open('PUT', url, true);
    r.send(data);
    r.onload = function() {
        d.resolve(r.response);
    };
    return d;
}

/**
 * For sending large files/content, use the Rich Content APIs:
 *
 * http://bit.ly/1xYNf7z#rich-content
 *
 * This method is Step 3 of the sequence: Sending a Message
 *
 * http://bit.ly/1xYNf7z#sending-a-message-including-rich-content
 *
 * This example sends a Message with two Message Parts
 *
 * @method
 * @param  {string} conversationUrl     URL of the resource to operate upon
 * @param  {Object} part1               First Message Part
 * @param  {string} part1.mimeType      Mime type for the first Message Part
 * @param  {string} part1.contentId     Id returned in Step 1
 * @param  {Object} part2               Second Message Part
 * @param  {string} part2.mimeType      Mime type for the first Message Part
 * @param  {string} part2.body          Contents of the second message part
 * @return {$.Deferred}
 */
function sendRichContentMessage(conversationUrl, part1, part2) {
    return $.ajax({
        url: conversationUrl + "/messages",
        method: "POST",
        headers: window.layer.sampledata.headers,
        data: JSON.stringify({
            parts: [
                {
                    mime_type: part1.mimeType,
                    content: {
                        id: part1.contentId,
                        size: part1.size
                    }
                },
                {
                    body: part2.body,
                    mime_type: part2.mimeType
                }
            ]
        })
    });
}

/**
 * Download rich content from the cloud server (ascii version)
 *
 * @method
 * @param  {string} url     download_url that is in message_part.content.download_url
 * @return {$.Deferred}
 */
function downloadAsciiRichContent(url) {
    return $.ajax({
        url: url,
        method: "GET"
    });
}

/**
 * Download rich content from the cloud server (binary version)
 *
 * Not done with jquery because: http://bugs.jquery.com/ticket/11461 (Doh!)
 *
 * @method
 * @param  {string} url     download_url that is in message_part.content.download_url
 * @return {$.Deferred}
 */
function downloadBinaryRichContent(url) {
    var d = new $.Deferred();
    var r = new XMLHttpRequest();
    r.responseType = "blob";
    r.open('GET', url, true);
    r.send();
    r.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            d.resolve(btoa(reader.result));
        };
        reader.readAsBinaryString(this.response)
    };

    return d;
}

/**
 * Add and remove participants from this conversation
 *
 * http://bit.ly/1xYNf7z#addremove-participants
 *
 * @method
 * @param  {string} conversationUrl     URL of the conversation to update
 * @param  {string[]} addUsers          Array of users to add to the conversation
 * @param  {string[]} removeUsers       Array of users to remove from the conversation
 * @return {$.Deferred}
 */
function addRemoveParticipants(conversationUrl, addUsers, removeUsers) {
    var operations = [];
    addUsers.forEach(function(user) {
        operations.push({operation: "add", property: "participants", value: user});
    });

    removeUsers.forEach(function(user) {
        operations.push({operation: "remove", property: "participants", value: user});
    });

    return $.ajax({
        url: conversationUrl,
        method: "PATCH",
        headers: $.extend({}, window.layer.sampledata.headers, {
            "Content-Type": "application/vnd.layer-patch+json"
        }),
        data: JSON.stringify(operations)
    });
}

/**
 * Set and delete metadata keys/values from this conversation
 *
 * http://bit.ly/1xYNf7z#patching-metadata-structures
 *
 * @method
 * @param  {string} conversationUrl     URL of the conversation to update
 * @param  {object} metadataChanges     Any key in the object will be assign with the specified value.
 *                                      If the value is undefined, delete the key.
 * @return {$.Deferred}
 *
 * NOTE: Method is not recursive, so does not currently work on nested metadata keys
 */
function patchConversationMetadata(conversationUrl, metadataChanges) {
    var operations = [];
    for (var key in metadataChanges) {
        if (metadataChanges.hasOwnProperty(key)) {
            var value = metadataChanges[key];
            if (value === undefined) {
                operations.push({operation: "delete", property: "metadata." + key});
            } else {
                operations.push({operation: "set", property: "metadata." + key, value: value});
            }
        }
    }

    return $.ajax({
        url: conversationUrl,
        method: "PATCH",
        headers: $.extend({}, window.layer.sampledata.headers, {
            "Content-Type": "application/vnd.layer-patch+json"
        }),
        data: JSON.stringify(operations)
    });
}

// For demoing only
function log(message, optionalNode) {
    var d = new Date();
    var node = document.createElement("pre");
    node.innerHTML = d.toLocaleTimeString() + ": " +  message;
    (optionalNode || document.body).appendChild(node);
}