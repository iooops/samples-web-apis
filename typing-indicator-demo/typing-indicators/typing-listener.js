"use strict";

var TypingPublisher = layer.TypingPublisher;
layer.TypingListener = TypingListener;

/**
 * The Typing Listener Class listens to keyboard events on
 * your text field, and uses the layer.TypingPublisher to
 * send state based on keyboard behavior.
 *
 * @class  layer.TypingListener
 */


/**
 * @constructor
 * @param  {object} args
 * @param {Dom} input - A Text editor dom node that will have typing indicators
 * @param {Conversation} conversation - The Conversation object that the input will send messages to
 * @param {Websocket} websocket - The connection to use for sending typing indicators
 */

function TypingListener(args) {
    this.input = args.input;
    this.websocket = args.websocket;
    this.conversation = args.conversation;
    this.publisher = new TypingPublisher({
        websocket: this.websocket,
        conversation: this.conversation
    });

    this.intervalId = 0;
    this.lastKeyId = 0;

    // Use keypress rather than keydown because the user hitting alt-tab to change
    // windows, and other meta keys should not result in typing indicators
    this.input.addEventListener("keypress", this.handleKeyPress.bind(this));
    this.input.addEventListener("keydown", this.handleKeyDown.bind(this));
}


/**
 * Change the Conversation; this should set the state of the old Conversation to "finished".
 * Use this when the user has changed Conversations and you want to report on typing to a new
 * Conversation.  This will update the TypingPublisher's conversation.
 *
 * @method
 * @param  {Conversation} c - The new Conversation
 */

TypingListener.prototype.setConversation = function setConversation(c) {
    if (c != this.conversation) {
        this.conversation = c;
        this.publisher.setConversation(c);
    }
};

/**
 * Whenever the key is pressed, send a "started" or "finished" event.
 * If its a "start" event, schedule a pause-test that will send
 * a "pause" event if typing stops.  KeyPress only receives character keypresses
 *
 * @method
 * @param  {KeyboardEvent} evt
 */

TypingListener.prototype.handleKeyPress = function handleKeyPress(evt) {
    if (this.lastKeyId) window.clearTimeout(this.lastKeyId);
    this.lastKeyId = window.setTimeout((function () {
        this.lastKeyId = 0;
        this.lastKeyTimestamp = Date.now();
        var isEmpty = !Boolean(this.input.value);
        this.send(isEmpty ? "finished" : "started");
    }).bind(this), 50);
};

/**
 * Whenever we receive a DELETE or BACKSPACE key, these are not character keypresses
 * but we still want to treat them as keypresses.
 *
 * @method
 */
TypingListener.prototype.handleKeyDown = function handleKeyDown(evt) {
    if (evt.keyCode == 8 || evt.keyCode == 46) this.handleKeyPress();
};



/**
 * Send the state to the publisher
 *
 * @method
 * @param  {string} state - One of "started", "paused", "finished"
 */

TypingListener.prototype.send = function send(state) {
    this.publisher.setState(state);
};


