"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * The TypingPublisher's job is not to transition from one
 * state (say `started`) to another (`paused` for example)...
 * It's only purpose is not to flood the server with too
 * many ephemeral events whenever user calls the `setState('started')`
 *
 * A few rules for the *publisher*:
 *
 *  - it maintains an indicator state for the current conversation
 *  - if user calls  `setState('started');` publisher sends the event immediately
 *  - if user calls the same method under _2.5 seconds_ with the same typing indicator state (`started`), publisher waits
 *    for those 2.5 seconds to pass and then publishes the ephemeral event
 *  - if user calls the same methods multiple times within _2.5 seconds_ with the same value,
 *    publisher waits until end of 2.5 second period and sends the state only once.
 *  - if user calls the same method under _2.5 seconds_ with a different typing indicator state (say `paused`), publisher immediately sends the event
 *  - if 2.5 seconds passes without any events, state transitions from 'started' to 'paused'
 *  - if 2.5 seconds passes without any events, state transitions from 'paused' to 'finished'
 *
 * @class layer.TypingPublisher
 */

var INTERVAL = 2500;

window.layer.TypingPublisher = (function () {

    /**
     * @constructor
     * @param {Object} args
     * @param {WebSocket} websocket - The Websocket your app is using to listen/send messages
     * @param {Conversation} conversation - The Conversation that messages are being typed to.
     */

    function TypingPublisher(args) {
        _classCallCheck(this, TypingPublisher);

        this.websocket = args.websocket;
        this.conversation = args.conversation;
        this.state = "finished";
        this.lastMessageTime = 0;
    }

    _createClass(TypingPublisher, {
        setConversation: {
            value: function setConversation(c) {
                this.setState("finished");
                this.conversation = c;
                this.state = "finished";
            }
        },
        setState: {

            /**
             * Sets the state and either sends the state to the server or schedules it to be sent.
             *
             * @method
             * @param  {string} state - One of 'started', 'paused', 'finished'
             */

            value: function setState(state) {
                if (this.pauseLoopId) {
                    clearInterval(this.pauseLoopId);
                    this.pauseLoopId = 0;
                }
                if (!this.conversation) {
                    return;
                } // If its a new state, send it immediately.
                if (this.state != state) {
                    this.state = state;
                    this.send(state);
                }

                // No need to resend 'finished' state
                else if (state == "finished") {
                    return;
                }

                // If its an existing state that hasn't been sent in the
                // last 2.5 seconds, send it immediately.
                else if (Date.now() > this.lastMessageTime + INTERVAL) {
                    this.send(state);
                }

                // Else schedule it to be sent.
                else {
                    this.scheduleNextMessage(state);
                }

                // Start test to automatically transition if 2.5 seconds without any setState calls
                if (this.state != "finished") this.startPauseLoop();
            }
        },
        startPauseLoop: {

            /**
             * Any time we are set to 'started' or 'paused' we should transition
             * to the next state after 2.5 seconds of no setState calls.
             *
             * The 2.5 second setTimeout is canceled/restarted every call to setState()
             *
             * @method startPauseLoop
             */

            value: function startPauseLoop() {
                if (this.pauseLoopId) {
                    return;
                }this.pauseLoopId = window.setInterval((function () {
                    if (this.state == "paused") {
                        this.setState("finished");
                    } else if (this.state == "started") {
                        this.setState("paused");
                    }
                }).bind(this), INTERVAL);
            }
        },
        scheduleNextMessage: {

            /**
             * Schedule the next state refresh message so as to be at least INTERVAL ms after
             * the last state message of the same state
             *
             * @method
             * @param  {string} state - One of 'started', 'paused', 'finished'
             */

            value: function scheduleNextMessage(state) {
                if (this.scheduleId) clearTimeout(this.scheduleId);
                this.scheduleId = setTimeout((function () {
                    this.scheduleId = 0;

                    // If the state didn't change while waiting...
                    if (this.state == state) this.send(state);
                }).bind(this), Date.now() - this.lastMessageTime + INTERVAL);
            }
        },
        send: {

            /**
             * Send a state change to the server
             *
             * @method
             * @param  {string} state - One of 'started', 'paused', 'finished'
             */

            value: function send(state) {
                this.lastMessageTime = Date.now();
                this.websocket.send(JSON.stringify({
                    type: "signal",
                    body: {
                        type: "typing_indicator",
                        object: {
                            id: this.conversation.id
                        },
                        data: {
                            action: state
                        }
                    }
                }));
            }
        }
    });

    return TypingPublisher;
})();