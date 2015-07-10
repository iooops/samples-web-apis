/**
 * These samples show the currently supported Platform API calls being exercised.
 * Each of the sample functions takes the same parameters as the REST API,
 * and turns them into an xhr request using the Node request library.
 *
 * Run using:
 * > node platform.js
 *
 */

var request = require("request");
var deferred = require('deferred');


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Setup your application's config data:
var appConfig = {
    appId: process.env.platform_api_app_id,
    bearerToken: process.env.platform_api_bearer_token,
    serverUrl: process.env.platform_api_url || "https://api.layer.com"
};

if (!appConfig.appId) {
    console.error("Please run \"setenv platform_api_app_id=your-uui-id\"");
    return;
}

if (!appConfig.bearerToken) {
    console.error("Please run \"setenv platform_api_bearer_token=your-token\"");
    return;
}

console.log(appConfig.appId);
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
     *
     * curl -X POST -H "Accept: application/vnd.layer+json; version=1.0" -H "Authorization: Bearer ZEqI3cxmaoXo8wIUKcDJ8sHkdezVkzPKAKhFjN8zzJ9MY2QP" -H "Content-Type: application/json" https://api.layer.com/apps/cf7234d0-1526-11e5-9a3c-cb6d680055e6/conversations -d '{"participants": ["a", "b"], "distinct": false}'
     */
    function createConversation(participants, metadata) {
    	var def = deferred();
        request({
            uri: layersample.config.serverUrl + "/conversations",
            method: "POST",
            body: {
                participants: participants,
                metadata: metadata,
                distinct: true
            },
            json: true,
            headers: layersample.headers
        }, function(error, response, body) {
	   var status;
	    switch(response.statusCode) {
		case 201:
		    status = "created";
		    break;
		case 303:
		    status = "found";
		    break;
		case 409:
		    status = "conflict";
		    break;
		default:
		    status = "error";
	    }

	   def.resolve({
	       statusCode: response.statusCode,
	       statusMessage: status, 
	       conversation: status == "conflict" ? body.data : body
	   });
	});
	return def.promise;
    }

    /**
     * Change the participants of a conversation
     *
     * @method
     * @param {string}      conversationUrl URL of the resource we are operating upon
     * @param {Object}      changes         Describes participants to add/remove
     * @param {string[]}    changes.add     Array of participant ids to add
     * @param {string[]}    changes.remove  Array of participant ids to remove
     */
    function changeParticipants(conversationUrl, changes) {
    	var def = deferred();
        var operations = [];
        changes.add.forEach(function(add) {
            operations.push({operation: "add", property: "participants", value: add});
        });
        changes.remove.forEach(function(remove) {
            operations.push({operation: "remove", property: "participants", value: remove});
        });
        request({
            uri: conversationUrl,
            method: "PATCH",
            body: operations,
            json: true,
            headers: layersample.patchHeaders
        }, function(error, response, body) {
	   def.resolve({statusCode: response.statusCode});
	});
	return def.promise;
    }

    function changeMetadata(conversationUrl, newKeys) {
    	var def = deferred();
        var operations = [];
        for (name in newKeys) {
            operations.push({operation: "set", property: "metadata." + name, value: newKeys[name]});
        }
        request({
            uri: conversationUrl,
            method: "PATCH",
            body: operations,
            json: true,
            headers: layersample.patchHeaders
        }, function(error, response, body) {
	   def.resolve({statusCode: response.statusCode});
	});
	return def.promise;
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
     */
    function sendMessage(conversationUrl, sender, parts, push) {
        var def = deferred();
        request({
            uri: conversationUrl + "/messages",
            method: "POST",
            body: {
                sender: sender,
                parts: parts,
                push: push || {text: "You have a new message"}
            },
            json: true,
            headers: layersample.headers
        }, function(error, response, body) {
	   def.resolve({
	       statusCode: response.statusCode, 
	       message: body
	   });
	});
	return def.promise;
    }


    function getConversation(url) {
    	var def = deferred();
        request({
            uri: url,
            method: "GET",
            json: true,
            headers: layersample.headers
        }, function(error, response, body) {
	   def.resolve({
	       statusCode: response.statusCode, 
	       conversation: body
	   });
	});
	return def.promise;
    }

    // Create a conversation
    createConversation([participant, "layer-tester1", "layer-tester2"], {
        title: "Sample conversation",
        background_color: "#aaa"
    }).then(function(result) {
        console.log("START CREATE CONVERSATION: " + result.statusMessage);
        console.dir(result.conversation);
        console.log("END CREATE CONVERSATION");

        if (result.statusMessage == "created" || result.statusMessage == "found") {
            layersample.cache.newConversation = result.conversation;

            return createConversation([participant, "layer-tester1", "layer-tester2"], {
                title: "Sample conversation",
                background_color: "#aab"
            });
	}
    })
    .then(function(result) {
        console.log("DISTINCT CONFLICT RESULT: " + result.statusMessage);
	console.dir(result.conversation);
	console.log("END DISTINCT CONFLICT");

        return changeMetadata(layersample.cache.newConversation.url, {
            "title1.racecar.title": "Sample conversation",
            "background_color": "#aaa"
         });
     })
     .then(function(result) {
         if (result.statusCode == 204) {
             console.log("Metadata Changed");
	     
             return createConversation([participant, "layer-tester1", "layer-tester2"], {
                 title1: {
                     racecar: {
                         title: "Sample conversation"
                     }
                 },
                 "background_color": "#aaa",
                 title: "Sample conversation"
             });
	 }
     })
    .then(function(result) {
        console.log("CREATE IDENTICAL DISTINCT: " + result.statusMessage);
        console.dir(result.conversation);
        console.log("END CREATE IDENTICAL DISTINCT");

        // Change its participants
        return changeParticipants(layersample.cache.newConversation.url, {
            add: ["layer-tester3"],
            remove: ["layer-tester1"]
        });
    })
    .then(function(result) {
        console.log("CHANGE PARTICIPANTS: " + result.statusCode);

        if (result.statusCode == 204) {
            layersample.cache.newConversation.participants = ["layer-tester2", "layer-tester3"];

            // Send a message
            return sendMessage(
                layersample.cache.newConversation.url,
                {"user_id": "layer-tester2"},
                [{body: "Hello World", mime_type: "text/plain"}],
                {text: "The world has been greeted", sound: "greetings.aiff"}
	    );
	}
    })
    .then(function(result) {
        console.log("SENT MESSAGE: " + result.statusCode);
        console.dir(result.message);
        console.log("END SENT MESSAGE");

        if (result.statusCode == 201) {
            layersample.cache.newMessage = result.message;
        }
        return getConversation(layersample.cache.newConversation.url);
    })
    .then(function(result) {
        console.log("FINAL CONVERSATION: " + layersample.cache.newConversation.url);
        console.dir(result.conversation);
    });

})();
