"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var TypingPublisher = layer.TypingPublisher;
/**
 * The Typing Listener Class listens to keyboard events on
 * your text field, and uses the layer.TypingPublisher to
 * send state based on keyboard behavior.
 *
 * @class  layer.TypingListener
 */

window.layer.TypingListener = (function () {

    /**
     * @constructor
     * @param  {object} args
     * @param {Dom} input - A Text editor dom node that will have typing indicators
     * @param {Conversation} conversation - The Conversation object that the input will send messages to
     * @param {Websocket} websocket - The connection to use for sending typing indicators
     */

    function TypingListener(args) {
        _classCallCheck(this, TypingListener);

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

    _createClass(TypingListener, {
        setConversation: {

            /**
             * Change the Conversation; this should set the state of the old Conversation to "finished".
             * Use this when the user has changed Conversations and you want to report on typing to a new
             * Conversation.
             *
             * @method
             * @param  {Conversation} c - The new Conversation
             */

            value: function setConversation(c) {
                if (c != this.conversation) {
                    this.conversation = c;
                    this.publisher.setConversation(c);
                }
            }
        },
        handleKeyPress: {

            /**
             * Whenever the key is pressed, send a "started" or "finished" event.
             * If its a "start" event, schedule a pause-test that will send
             * a "pause" event if typing stops.
             *
             * @method
             * @param  {KeyboardEvent} evt
             */

            value: function handleKeyPress(evt) {
                if (this.lastKeyId) window.clearTimeout(this.lastKeyId);
                this.lastKeyId = window.setTimeout((function () {
                    this.lastKeyId = 0;
                    this.lastKeyTimestamp = Date.now();
                    var isEmpty = !Boolean(this.input.value);
                    this.send(isEmpty ? "finished" : "started");
                }).bind(this), 50);
            }
        },
        handleKeyDown: {
            value: function handleKeyDown(evt) {
                if (evt.keyCode == 8 || evt.keyCode == 46) this.handleKeyPress();
            }
        },
        send: {

            /**
             * Send the state to the publisher
             *
             * @method
             * @param  {string} state - One of "started", "paused", "finished"
             */

            value: function send(state) {
                this.publisher.setState(state);
            }
        }
    });

    return TypingListener;
})();
