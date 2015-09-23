"use strict";

/**
 * The TypingIndicatorListener receives Typing Indicator state
 * for other users via a websocket, and notifies
 * your application of the updated state.
 *
 * @class layer.TypingIndicatorListener
 */

window.layer.TypingIndicatorListener = TypingIndicatorListener;

/**
 * @constructor
 * @param  {Object} args
 * @param {Object} args.conversation - A Conversation object; instance of server representation are both OK.
 * @param {Websocket/layer.WebsocketManager} args.websocket - A websocket connection that will receive remote user typing indicators
 * *                                   WebsocketManager is better as reconnects don't require any new event handlers
 * @param {string} userId            - User ID of the current user; will ignore typing indicators from this user
 * @param {Function} args.onChange - A callback for notifying your app when a typing indicator state has changed
 *                                   for the current conversation
 * @param {} [string[]] args.onChange.typing - Array of userIds of people who are typing
 * @param {} [string[]] args.onChange.paused - Array of userIds of people who are paused
 */
function TypingIndicatorListener(args) {

    this.conversation = args.conversation;

    /**
     * Stores the state of all Conversations, indicating who is
     * typing and who is paused; people who are stopped are removed
     * from this state.
     * @property {Object}
     */
    this.state = {};

    /**
     * A websocket connection that will receive remote user typing indicators
     * @property {Websocket}
     */
    this.boundEventHandler = this.handleSocketEvent.bind(this);
    this.setWebsocket(args.websocket);
    this.userId = args.userId;

    /**
     * A callback for notifying your app when a typing indicator state has changed
     * for the current conversation
     * @property {Function}
     */
    this.onChange = args.onChange;
    this.pollId = 0;
}

/**
 * This method lets us change websockets at any time
 *
 * @method
 * @param  {WebSocket} socket
 */
TypingIndicatorListener.prototype.setWebsocket = function setWebsocket(socket) {
    if (this.websocket) {
        if (this.websocket instanceof WebSocket) {
            this.websocket.removeEventListener("message", this.boundEventHandler);
        } else {
            this.websocket.off(null, null, this);
        }
    }
    this.websocket = socket;

    if (this.websocket instanceof WebSocket) {
        this.websocket.addEventListener("message", this.boundEventHandler);
    } else {
        this.websocket.on("message", this.handleSocketEvent, this);
    }
};

/**
 * This method receives websocket events and
 * if they are typing indicator events, updates its state.
 *
 * @method
 */
TypingIndicatorListener.prototype.handleSocketEvent = function handleSocketEvent(evt) {
    if (this.websocket instanceof WebSocket) {
        evt = JSON.parse(evt.data);
    } else {
        evt = evt.data;
    }
    if (evt.type == "signal" && evt.body.type == "typing_indicator" && evt.body.data.user_id != this.userId) {
        var stateEntry = this.state[evt.body.object.id + " " + evt.body.data.user_id];
        if (!stateEntry) {
            stateEntry = this.state[evt.body.object.id + " " + evt.body.data.user_id] = { startTime: Date.now() };
        }
        stateEntry.state = evt.body.data.action;
        if (stateEntry.state == "started") {
            stateEntry.startTime = Date.now();
        } else if (stateEntry.state == "finished") {
            delete this.state[evt.body.data.user_id];
        }
        if (this.conversation && evt.body.object.id == this.conversation.id) {
            this.fireChangeEvents(evt);
        }
    }
};

/**
 * Any time a state change becomes more than 6 seconds stale,
 * assume that the user is "finished".  In theory, we should
 * receive
 *
 * @method
 * @return {[type]} [description]
 */

TypingIndicatorListener.prototype.startPolling = function startPolling() {
    if (this.pollId) {
        return;
    }this.pollId = setInterval((function () {
        var stateList = Object.keys(this.state);

        var hasConversationChanged = false;

        // Remove any users who are no longer in the Conversation
        stateList = stateList.filter(function (stateName) {
            if (Date.now() < this.state[stateName].startTime + 6000) {
                return true;
            } else {
                if (stateName.indexOf(this.conversation.id) == 0) {
                    hasConversationChanged = true;
                }
                return false;
            }
        }, this);

        if (hasConversationChanged) {
            this.fireChangeEvents();
        }
    }).bind(this), 5000);
};

/**
 * Any time the conversation's typing indicator state has changed, calculate
 * a change event and fire the onChange method
 *
 * @method
 * @param  {[type]} evt - Websocket message
 */
TypingIndicatorListener.prototype.fireChangeEvents = function fireChangeEvents(evt) {
    var stateList = Object.keys(this.state);

    var typing = stateList.filter(function (stateKey) {
        return stateKey.indexOf(this.conversation.id) == 0 && this.state[stateKey].state == "started";
    }, this).map(function (stateKey) {
        return stateKey.substring(this.conversation.id.length + 1);
    }, this);

    var paused = stateList.filter(function (stateKey) {
        return stateKey.indexOf(this.conversation.id) == 0 && this.state[stateKey].state == "paused";
    }, this).map(function (stateKey) {
        return stateKey.substring(this.conversation.id.length + 1);
    }, this);

    this.onChange({
        typing: typing || [],
        paused: paused || []
    }, evt);

    if (!typing.length && !paused.length) {
        clearInterval(this.pollId);
        this.pollId = 0;
    } else {
        this.startPolling();
    }
};