/**
 * These samples show the currently supported Platform API calls being exercised.
 * Each of the sample functions takes the same parameters as the REST API,
 * and turns them into an xhr request using the Node request library.
 *
 * Run using:
 * > node platform.js
 *
 * @blakewatters: @checkoway  Ok, I see an issue we should consider before updating Platform API with patch metadata.

`GET /conversations` does not return a metadata field.  I won’t call this a blocker.  B
 */

var request = require("request");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Setup your application's config data:
var appConfig = {
    appId: process.env.platform_api_app_id,
    bearerToken: process.env.platform_api_bearer_token,
    serverUrl: process.env.platform_api_url || "https://api.layer.com"
};


(function() {
    var participant = String(Math.random()).replace(/\./,"");

    // A data cache of settings, request headers, and responses
    var layersample = {
        config: {
            serverUrl: appConfig.serverUrl + "/apps/" + appConfig.appId
        },
        headers: {
            Accept: "application/vnd.layer+json; version=1.0",
            Authorization: "Bearer " + appConfig.bearerToken,
            "Content-type": "application/json"
        },
        patchHeaders: {
            Accept: "application/vnd.layer+json; version=1.0",
            Authorization: "Bearer " + appConfig.bearerToken,
            "Content-type": "application/vnd.layer-patch+json"
        },
        cache: {
            newConversation: null,
            newMessage: null
        }
    };

    /**
     * Create a conversation
     *
     * @method
     * @param {string[]}    participants    Array of participant ids
     * @param {Mixed}       metadata        Hash of name value pairs.  Value must always be a string or subobject.
     * @param {Function}    callback
     *
     * curl -X POST -H "Accept: application/vnd.layer+json; version=1.0" -H "Authorization: Bearer ZEqI3cxmaoXo8wIUKcDJ8sHkdezVkzPKAKhFjN8zzJ9MY2QP" -H "Content-Type: application/json" https://api.layer.com/apps/cf7234d0-1526-11e5-9a3c-cb6d680055e6/conversations -d '{"participants": ["a", "b"], "distinct": false}'
     */
    function createConversation(participants, metadata, callback) {
        return request({
            uri: layersample.config.serverUrl + "/conversations",
            method: "POST",
            body: {
                participants: participants,
                metadata: metadata,
                distinct: true
            },
            json: true,
            headers: layersample.headers
        }, callback);
    }

    /**
     * Change the participants of a conversation
     *
     * @method
     * @param {string}      conversationUrl URL of the resource we are operating upon
     * @param {Object}      changes         Describes participants to add/remove
     * @param {string[]}    changes.add     Array of participant ids to add
     * @param {string[]}    changes.remove  Array of participant ids to remove
     * @param {Function}    callback
     */
    function changeParticipants(conversationUrl, changes, callback) {
        var operations = [];
        changes.add.forEach(function(add) {
            operations.push({operation: "add", property: "participants", value: add});
        });
        changes.remove.forEach(function(remove) {
            operations.push({operation: "remove", property: "participants", value: remove});
        });
        return request({
            uri: conversationUrl,
            method: "PATCH",
            body: operations,
            json: true,
            headers: layersample.patchHeaders
        }, callback);
    }

    function changeMetadata(conversationUrl, newKeys, callback) {
        var operations = [];
        for (name in newKeys) {
            operations.push({operation: "set", property: "metadata." + name, value: newKeys[name]});
        }
        return request({
            uri: conversationUrl,
            method: "PATCH",
            body: operations,
            json: true,
            headers: layersample.patchHeaders
        }, callback);
    }

    /**
     * Send a messaging in a conversation
     *
     * @method
     * @param {string}      conversationUrl     URL of the resource we are operating upon
     * @param {Object}      sender              Either {name: "fred"} or {user_id: "my-participant-id"}
     * @param {object[]}    parts               Array of message parts
     * @param {object}      push                Notification options; typically
     *                                          {text: "I am a notification", sound: "arf.aiff"}
     * @param {Function}    callback
     */
    function sendMessage(conversationUrl, sender, parts, push, callback) {
        return request({
            uri: conversationUrl + "/messages",
            method: "POST",
            body: {
                sender: sender,
                parts: parts,
                push: push || {text: "You have a new message"}
            },
            json: true,
            headers: layersample.headers
        }, callback);
    }


    function getConversation(url, callback) {
        return request({
            uri: url,
            method: "GET",
            json: true,
            headers: layersample.headers
        }, callback);
    }

    // Create a conversation
    createConversation([participant, "layer-tester1", "layer-tester2"], {
        title: "Sample conversation",
        background_color: "#aaa"
    }, function(error, response, body) {
        console.log("CREATE CONVERSATION:" + response.statusCode);
        console.dir(body);
        console.log("END CREATE CONVERSATION");
        if (response.statusCode == 201 || response.statusCode == 303) {
            layersample.cache.newConversation = body;

            createConversation([participant, "layer-tester1", "layer-tester2"], {
                title: "Sample conversation",
                background_color: "#aab"
            }, function(error, response, body) {
                console.log("DISTINCT CONFLICT");
                console.log("HTTP CODE: " + response.statusCode);
                console.dir(body);
                console.log("END DISTINCT CONFLICT");
            });

            changeMetadata(layersample.cache.newConversation.url,{
                "title1.racecar.title": "Sample conversation",
                "background_color": "#aaa"
            }, function(error, response, body) {
                if (response.statusCode == 204) {
                    console.log("CHANGE Metadata");
                    console.dir(body);
                    console.log("END CHANGE Metadata");

                    createConversation([participant, "layer-tester1", "layer-tester2"], {
                        title1: {
                            racecar: {
                                title: "Sample conversation"
                            }
                        },
                        "background_color": "#aaa",
                        title: "Sample conversation"
                    }, function(error, response, body) {
                        console.log("CREATE IDENTICAL DISTINCT: " + response.statusCode);
                        console.dir(body);
                        console.log("END CREATE IDENTICAL DISTINCT");

                        // Change its participants
                        return changeParticipants(layersample.cache.newConversation.url, {
                            add: ["layer-tester3"],
                            remove: ["layer-tester1"]
                        }, function(error, response, body) {
                            console.log("CHANGE PARTICIPANTS");
                            console.dir(body);
                            console.log("END CHANGE PARTICIPANTS");
                            if (response.statusCode == 204) {
                                layersample.cache.newConversation.participants = ["layer-tester2", "layer-tester3"];



                                // Send a message
                                return sendMessage(
                                    layersample.cache.newConversation.url,
                                    {"user_id": "layer-tester2"},
                                    [{body: "Hello World", mime_type: "text/plain"}],
                                    {text: "The world has been greeted", sound: "greetings.aiff"},
                                    function(error, response, body) {
                                        console.log("SENT MESSAGE");
                                        console.dir(body);
                                        console.log("END SENT MESSAGE");
                                        if (response.statusCode == 201) {
                                            layersample.cache.newMessage = body;
                                        }

                                        // Print final output
                                        console.log("CONVERSATION:");
                                        console.dir(layersample.cache.newConversation);
                                        console.log("MESSAGE:");
                                        console.dir(layersample.cache.newMessage);


                                        getConversation(layersample.cache.newConversation, function(response) {
                                            console.log("FINAL CONVERSATION: " + layersample.cache.newConversation.url);
                                            console.dir(body);
                                        });
                                    }
                                );
                                // end of sendMessage
                                //
                            }
                        }); // end of changeParticipants
                    }); // End recreate same distinct conv
                }
            });
            // end of changeMetadata

        }
    });
    // end of createConversation

})();