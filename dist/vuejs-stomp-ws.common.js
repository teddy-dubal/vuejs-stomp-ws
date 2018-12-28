/*!
 * vuejs-stomp-ws v0.0.3
 * (c) 2018 T.ED
 * Released under the MIT License.
 */

module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var noop = exports.noop = function(){};

exports.extend = function extend(dest, source) {
    for (var prop in source) {
        dest[prop] = source[prop];
    }
};

exports.eventEmitterListenerCount =
    __webpack_require__(0).EventEmitter.listenerCount ||
    function(emitter, type) { return emitter.listeners(type).length; };

exports.bufferAllocUnsafe = Buffer.allocUnsafe ?
    Buffer.allocUnsafe :
    function oldBufferAllocUnsafe(size) { return new Buffer(size); };

exports.bufferFromString = Buffer.from ?
    Buffer.from :
    function oldBufferFromString(string, encoding) {
      return new Buffer(string, encoding);
    };

exports.BufferingLogger = function createBufferingLogger(identifier, uniqueID) {
    var logFunction = __webpack_require__(6)(identifier);
    if (logFunction.enabled) {
        var logger = new BufferingLogger(identifier, uniqueID, logFunction);
        var debug = logger.log.bind(logger);
        debug.printOutput = logger.printOutput.bind(logger);
        debug.enabled = logFunction.enabled;
        return debug;
    }
    logFunction.printOutput = noop;
    return logFunction;
};

function BufferingLogger(identifier, uniqueID, logFunction) {
    this.logFunction = logFunction;
    this.identifier = identifier;
    this.uniqueID = uniqueID;
    this.buffer = [];
}

BufferingLogger.prototype.log = function() {
  this.buffer.push([ new Date(), Array.prototype.slice.call(arguments) ]);
  return this;
};

BufferingLogger.prototype.clear = function() {
  this.buffer = [];
  return this;
};

BufferingLogger.prototype.printOutput = function(logFunction) {
    if (!logFunction) { logFunction = this.logFunction; }
    var uniqueID = this.uniqueID;
    this.buffer.forEach(function(entry) {
        var date = entry[0].toLocaleString();
        var args = entry[1].slice();
        var formatString = args[0];
        if (formatString !== (void 0) && formatString !== null) {
            formatString = '%s - %s - ' + formatString.toString();
            args.splice(0, 1, formatString, date, uniqueID);
            logFunction.apply(global, args);
        }
    });
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/************************************************************************
 *  Copyright 2010-2015 Brian McKelvey.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var util = __webpack_require__(1);
var utils = __webpack_require__(2);
var EventEmitter = __webpack_require__(0).EventEmitter;
var WebSocketFrame = __webpack_require__(9);
var BufferList = __webpack_require__(36);
var Validation = __webpack_require__(28).Validation;
var bufferAllocUnsafe = utils.bufferAllocUnsafe;
var bufferFromString = utils.bufferFromString;

// Connected, fully-open, ready to send and receive frames
const STATE_OPEN = 'open';
// Received a close frame from the remote peer
const STATE_PEER_REQUESTED_CLOSE = 'peer_requested_close';
// Sent close frame to remote peer.  No further data can be sent.
const STATE_ENDING = 'ending';
// Connection is fully closed.  No further data can be sent or received.
const STATE_CLOSED = 'closed';

var setImmediateImpl = ('setImmediate' in global) ?
                            global.setImmediate.bind(global) :
                            process.nextTick.bind(process);

var idCounter = 0;

function WebSocketConnection(socket, extensions, protocol, maskOutgoingPackets, config) {
    this._debug = utils.BufferingLogger('websocket:connection', ++idCounter);
    this._debug('constructor');
    
    if (this._debug.enabled) {
        instrumentSocketForDebugging(this, socket);
    }
    
    // Superclass Constructor
    EventEmitter.call(this);

    this._pingListenerCount = 0;
    this.on('newListener', function(ev) {
        if (ev === 'ping'){
            this._pingListenerCount++;
        }
      }).on('removeListener', function(ev) {
        if (ev === 'ping') {
            this._pingListenerCount--;
        }
    });

    this.config = config;
    this.socket = socket;
    this.protocol = protocol;
    this.extensions = extensions;
    this.remoteAddress = socket.remoteAddress;
    this.closeReasonCode = -1;
    this.closeDescription = null;
    this.closeEventEmitted = false;

    // We have to mask outgoing packets if we're acting as a WebSocket client.
    this.maskOutgoingPackets = maskOutgoingPackets;

    // We re-use the same buffers for the mask and frame header for all frames
    // received on each connection to avoid a small memory allocation for each
    // frame.
    this.maskBytes = bufferAllocUnsafe(4);
    this.frameHeader = bufferAllocUnsafe(10);

    // the BufferList will handle the data streaming in
    this.bufferList = new BufferList();

    // Prepare for receiving first frame
    this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    this.fragmentationSize = 0; // data received so far...
    this.frameQueue = [];
    
    // Various bits of connection state
    this.connected = true;
    this.state = STATE_OPEN;
    this.waitingForCloseResponse = false;
    // Received TCP FIN, socket's readable stream is finished.
    this.receivedEnd = false;

    this.closeTimeout = this.config.closeTimeout;
    this.assembleFragments = this.config.assembleFragments;
    this.maxReceivedMessageSize = this.config.maxReceivedMessageSize;

    this.outputBufferFull = false;
    this.inputPaused = false;
    this.receivedDataHandler = this.processReceivedData.bind(this);
    this._closeTimerHandler = this.handleCloseTimer.bind(this);

    // Disable nagle algorithm?
    this.socket.setNoDelay(this.config.disableNagleAlgorithm);

    // Make sure there is no socket inactivity timeout
    this.socket.setTimeout(0);

    if (this.config.keepalive && !this.config.useNativeKeepalive) {
        if (typeof(this.config.keepaliveInterval) !== 'number') {
            throw new Error('keepaliveInterval must be specified and numeric ' +
                            'if keepalive is true.');
        }
        this._keepaliveTimerHandler = this.handleKeepaliveTimer.bind(this);
        this.setKeepaliveTimer();

        if (this.config.dropConnectionOnKeepaliveTimeout) {
            if (typeof(this.config.keepaliveGracePeriod) !== 'number') {
                throw new Error('keepaliveGracePeriod  must be specified and ' +
                                'numeric if dropConnectionOnKeepaliveTimeout ' +
                                'is true.');
            }
            this._gracePeriodTimerHandler = this.handleGracePeriodTimer.bind(this);
        }
    }
    else if (this.config.keepalive && this.config.useNativeKeepalive) {
        if (!('setKeepAlive' in this.socket)) {
            throw new Error('Unable to use native keepalive: unsupported by ' +
                            'this version of Node.');
        }
        this.socket.setKeepAlive(true, this.config.keepaliveInterval);
    }
    
    // The HTTP Client seems to subscribe to socket error events
    // and re-dispatch them in such a way that doesn't make sense
    // for users of our client, so we want to make sure nobody
    // else is listening for error events on the socket besides us.
    this.socket.removeAllListeners('error');
}

WebSocketConnection.CLOSE_REASON_NORMAL = 1000;
WebSocketConnection.CLOSE_REASON_GOING_AWAY = 1001;
WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR = 1002;
WebSocketConnection.CLOSE_REASON_UNPROCESSABLE_INPUT = 1003;
WebSocketConnection.CLOSE_REASON_RESERVED = 1004; // Reserved value.  Undefined meaning.
WebSocketConnection.CLOSE_REASON_NOT_PROVIDED = 1005; // Not to be used on the wire
WebSocketConnection.CLOSE_REASON_ABNORMAL = 1006; // Not to be used on the wire
WebSocketConnection.CLOSE_REASON_INVALID_DATA = 1007;
WebSocketConnection.CLOSE_REASON_POLICY_VIOLATION = 1008;
WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG = 1009;
WebSocketConnection.CLOSE_REASON_EXTENSION_REQUIRED = 1010;
WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR = 1011;
WebSocketConnection.CLOSE_REASON_TLS_HANDSHAKE_FAILED = 1015; // Not to be used on the wire

WebSocketConnection.CLOSE_DESCRIPTIONS = {
    1000: 'Normal connection closure',
    1001: 'Remote peer is going away',
    1002: 'Protocol error',
    1003: 'Unprocessable input',
    1004: 'Reserved',
    1005: 'Reason not provided',
    1006: 'Abnormal closure, no further detail available',
    1007: 'Invalid data received',
    1008: 'Policy violation',
    1009: 'Message too big',
    1010: 'Extension requested by client is required',
    1011: 'Internal Server Error',
    1015: 'TLS Handshake Failed'
};

function validateCloseReason(code) {
    if (code < 1000) {
        // Status codes in the range 0-999 are not used
        return false;
    }
    if (code >= 1000 && code <= 2999) {
        // Codes from 1000 - 2999 are reserved for use by the protocol.  Only
        // a few codes are defined, all others are currently illegal.
        return [1000, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014].indexOf(code) !== -1;
    }
    if (code >= 3000 && code <= 3999) {
        // Reserved for use by libraries, frameworks, and applications.
        // Should be registered with IANA.  Interpretation of these codes is
        // undefined by the WebSocket protocol.
        return true;
    }
    if (code >= 4000 && code <= 4999) {
        // Reserved for private use.  Interpretation of these codes is
        // undefined by the WebSocket protocol.
        return true;
    }
    if (code >= 5000) {
        return false;
    }
}

util.inherits(WebSocketConnection, EventEmitter);

WebSocketConnection.prototype._addSocketEventListeners = function() {
    this.socket.on('error', this.handleSocketError.bind(this));
    this.socket.on('end', this.handleSocketEnd.bind(this));
    this.socket.on('close', this.handleSocketClose.bind(this));
    this.socket.on('drain', this.handleSocketDrain.bind(this));
    this.socket.on('pause', this.handleSocketPause.bind(this));
    this.socket.on('resume', this.handleSocketResume.bind(this));
    this.socket.on('data', this.handleSocketData.bind(this));
};

// set or reset the keepalive timer when data is received.
WebSocketConnection.prototype.setKeepaliveTimer = function() {
    this._debug('setKeepaliveTimer');
    if (!this.config.keepalive  || this.config.useNativeKeepalive) { return; }
    this.clearKeepaliveTimer();
    this.clearGracePeriodTimer();
    this._keepaliveTimeoutID = setTimeout(this._keepaliveTimerHandler, this.config.keepaliveInterval);
};

WebSocketConnection.prototype.clearKeepaliveTimer = function() {
    if (this._keepaliveTimeoutID) {
        clearTimeout(this._keepaliveTimeoutID);
    }
};

// No data has been received within config.keepaliveTimeout ms.
WebSocketConnection.prototype.handleKeepaliveTimer = function() {
    this._debug('handleKeepaliveTimer');
    this._keepaliveTimeoutID = null;
    this.ping();

    // If we are configured to drop connections if the client doesn't respond
    // then set the grace period timer.
    if (this.config.dropConnectionOnKeepaliveTimeout) {
        this.setGracePeriodTimer();
    }
    else {
        // Otherwise reset the keepalive timer to send the next ping.
        this.setKeepaliveTimer();
    }
};

WebSocketConnection.prototype.setGracePeriodTimer = function() {
    this._debug('setGracePeriodTimer');
    this.clearGracePeriodTimer();
    this._gracePeriodTimeoutID = setTimeout(this._gracePeriodTimerHandler, this.config.keepaliveGracePeriod);
};

WebSocketConnection.prototype.clearGracePeriodTimer = function() {
    if (this._gracePeriodTimeoutID) {
        clearTimeout(this._gracePeriodTimeoutID);
    }
};

WebSocketConnection.prototype.handleGracePeriodTimer = function() {
    this._debug('handleGracePeriodTimer');
    // If this is called, the client has not responded and is assumed dead.
    this._gracePeriodTimeoutID = null;
    this.drop(WebSocketConnection.CLOSE_REASON_ABNORMAL, 'Peer not responding.', true);
};

WebSocketConnection.prototype.handleSocketData = function(data) {
    this._debug('handleSocketData');
    // Reset the keepalive timer when receiving data of any kind.
    this.setKeepaliveTimer();

    // Add received data to our bufferList, which efficiently holds received
    // data chunks in a linked list of Buffer objects.
    this.bufferList.write(data);

    this.processReceivedData();
};

WebSocketConnection.prototype.processReceivedData = function() {
    this._debug('processReceivedData');
    // If we're not connected, we should ignore any data remaining on the buffer.
    if (!this.connected) { return; }

    // Receiving/parsing is expected to be halted when paused.
    if (this.inputPaused) { return; }

    var frame = this.currentFrame;

    // WebSocketFrame.prototype.addData returns true if all data necessary to
    // parse the frame was available.  It returns false if we are waiting for
    // more data to come in on the wire.
    if (!frame.addData(this.bufferList)) { this._debug('-- insufficient data for frame'); return; }

    var self = this;

    // Handle possible parsing errors
    if (frame.protocolError) {
        // Something bad happened.. get rid of this client.
        this._debug('-- protocol error');
        process.nextTick(function() {
            self.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR, frame.dropReason);
        });
        return;
    }
    else if (frame.frameTooLarge) {
        this._debug('-- frame too large');
        process.nextTick(function() {
            self.drop(WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG, frame.dropReason);
        });
        return;
    }

    // For now since we don't support extensions, all RSV bits are illegal
    if (frame.rsv1 || frame.rsv2 || frame.rsv3) {
        this._debug('-- illegal rsv flag');
        process.nextTick(function() {
            self.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
              'Unsupported usage of rsv bits without negotiated extension.');
        });
        return;
    }

    if (!this.assembleFragments) {
        this._debug('-- emitting frame');
        process.nextTick(function() { self.emit('frame', frame); });
    }

    process.nextTick(function() { self.processFrame(frame); });
    
    this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);

    // If there's data remaining, schedule additional processing, but yield
    // for now so that other connections have a chance to have their data
    // processed.  We use setImmediate here instead of process.nextTick to
    // explicitly indicate that we wish for other I/O to be handled first.
    if (this.bufferList.length > 0) {
        setImmediateImpl(this.receivedDataHandler);
    }
};

WebSocketConnection.prototype.handleSocketError = function(error) {
    this._debug('handleSocketError: %j', error);
    if (this.state === STATE_CLOSED) {
		// See https://github.com/theturtle32/WebSocket-Node/issues/288
        this._debug('  --- Socket \'error\' after \'close\'');
        return;
    }
    this.closeReasonCode = WebSocketConnection.CLOSE_REASON_ABNORMAL;
    this.closeDescription = 'Socket Error: ' + error.syscall + ' ' + error.code;
    this.connected = false;
    this.state = STATE_CLOSED;
    this.fragmentationSize = 0;
    if (utils.eventEmitterListenerCount(this, 'error') > 0) {
        this.emit('error', error);
    }
    this.socket.destroy(error);
    this._debug.printOutput();
};

WebSocketConnection.prototype.handleSocketEnd = function() {
    this._debug('handleSocketEnd: received socket end.  state = %s', this.state);
    this.receivedEnd = true;
    if (this.state === STATE_CLOSED) {
        // When using the TLS module, sometimes the socket will emit 'end'
        // after it emits 'close'.  I don't think that's correct behavior,
        // but we should deal with it gracefully by ignoring it.
        this._debug('  --- Socket \'end\' after \'close\'');
        return;
    }
    if (this.state !== STATE_PEER_REQUESTED_CLOSE &&
        this.state !== STATE_ENDING) {
      this._debug('  --- UNEXPECTED socket end.');
      this.socket.end();
    }
};

WebSocketConnection.prototype.handleSocketClose = function(hadError) {
    this._debug('handleSocketClose: received socket close');
    this.socketHadError = hadError;
    this.connected = false;
    this.state = STATE_CLOSED;
    // If closeReasonCode is still set to -1 at this point then we must
    // not have received a close frame!!
    if (this.closeReasonCode === -1) {
        this.closeReasonCode = WebSocketConnection.CLOSE_REASON_ABNORMAL;
        this.closeDescription = 'Connection dropped by remote peer.';
    }
    this.clearCloseTimer();
    this.clearKeepaliveTimer();
    this.clearGracePeriodTimer();
    if (!this.closeEventEmitted) {
        this.closeEventEmitted = true;
        this._debug('-- Emitting WebSocketConnection close event');
        this.emit('close', this.closeReasonCode, this.closeDescription);
    }
};

WebSocketConnection.prototype.handleSocketDrain = function() {
    this._debug('handleSocketDrain: socket drain event');
    this.outputBufferFull = false;
    this.emit('drain');
};

WebSocketConnection.prototype.handleSocketPause = function() {
    this._debug('handleSocketPause: socket pause event');
    this.inputPaused = true;
    this.emit('pause');
};

WebSocketConnection.prototype.handleSocketResume = function() {
    this._debug('handleSocketResume: socket resume event');
    this.inputPaused = false;
    this.emit('resume');
    this.processReceivedData();
};

WebSocketConnection.prototype.pause = function() {
    this._debug('pause: pause requested');
    this.socket.pause();
};

WebSocketConnection.prototype.resume = function() {
    this._debug('resume: resume requested');
    this.socket.resume();
};

WebSocketConnection.prototype.close = function(reasonCode, description) {
    if (this.connected) {
        this._debug('close: Initating clean WebSocket close sequence.');
        if ('number' !== typeof reasonCode) {
            reasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
        }
        if (!validateCloseReason(reasonCode)) {
            throw new Error('Close code ' + reasonCode + ' is not valid.');
        }
        if ('string' !== typeof description) {
            description = WebSocketConnection.CLOSE_DESCRIPTIONS[reasonCode];
        }
        this.closeReasonCode = reasonCode;
        this.closeDescription = description;
        this.setCloseTimer();
        this.sendCloseFrame(this.closeReasonCode, this.closeDescription);
        this.state = STATE_ENDING;
        this.connected = false;
    }
};

WebSocketConnection.prototype.drop = function(reasonCode, description, skipCloseFrame) {
    this._debug('drop');
    if (typeof(reasonCode) !== 'number') {
        reasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
    }

    if (typeof(description) !== 'string') {
        // If no description is provided, try to look one up based on the
        // specified reasonCode.
        description = WebSocketConnection.CLOSE_DESCRIPTIONS[reasonCode];
    }

    this._debug('Forcefully dropping connection. skipCloseFrame: %s, code: %d, description: %s',
        skipCloseFrame, reasonCode, description
    );

    this.closeReasonCode = reasonCode;
    this.closeDescription = description;
    this.frameQueue = [];
    this.fragmentationSize = 0;
    if (!skipCloseFrame) {
        this.sendCloseFrame(reasonCode, description);
    }
    this.connected = false;
    this.state = STATE_CLOSED;
    this.clearCloseTimer();
    this.clearKeepaliveTimer();
    this.clearGracePeriodTimer();

    if (!this.closeEventEmitted) {
        this.closeEventEmitted = true;
        this._debug('Emitting WebSocketConnection close event');
        this.emit('close', this.closeReasonCode, this.closeDescription);
    }
    
    this._debug('Drop: destroying socket');
    this.socket.destroy();
};

WebSocketConnection.prototype.setCloseTimer = function() {
    this._debug('setCloseTimer');
    this.clearCloseTimer();
    this._debug('Setting close timer');
    this.waitingForCloseResponse = true;
    this.closeTimer = setTimeout(this._closeTimerHandler, this.closeTimeout);
};

WebSocketConnection.prototype.clearCloseTimer = function() {
    this._debug('clearCloseTimer');
    if (this.closeTimer) {
        this._debug('Clearing close timer');
        clearTimeout(this.closeTimer);
        this.waitingForCloseResponse = false;
        this.closeTimer = null;
    }
};

WebSocketConnection.prototype.handleCloseTimer = function() {
    this._debug('handleCloseTimer');
    this.closeTimer = null;
    if (this.waitingForCloseResponse) {
        this._debug('Close response not received from client.  Forcing socket end.');
        this.waitingForCloseResponse = false;
        this.state = STATE_CLOSED;
        this.socket.end();
    }
};

WebSocketConnection.prototype.processFrame = function(frame) {
    this._debug('processFrame');
    this._debug(' -- frame: %s', frame);
    
    // Any non-control opcode besides 0x00 (continuation) received in the
    // middle of a fragmented message is illegal.
    if (this.frameQueue.length !== 0 && (frame.opcode > 0x00 && frame.opcode < 0x08)) {
        this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
          'Illegal frame opcode 0x' + frame.opcode.toString(16) + ' ' +
          'received in middle of fragmented message.');
        return;
    }

    switch(frame.opcode) {
        case 0x02: // WebSocketFrame.BINARY_FRAME
            this._debug('-- Binary Frame');
            if (this.assembleFragments) {
                if (frame.fin) {
                    // Complete single-frame message received
                    this._debug('---- Emitting \'message\' event');
                    this.emit('message', {
                        type: 'binary',
                        binaryData: frame.binaryPayload
                    });
                }
                else {
                    // beginning of a fragmented message
                    this.frameQueue.push(frame);
                    this.fragmentationSize = frame.length;
                }
            }
            break;
        case 0x01: // WebSocketFrame.TEXT_FRAME
            this._debug('-- Text Frame');
            if (this.assembleFragments) {
                if (frame.fin) {
                    if (!Validation.isValidUTF8(frame.binaryPayload)) {
                        this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,
                          'Invalid UTF-8 Data Received');
                        return;
                    }
                    // Complete single-frame message received
                    this._debug('---- Emitting \'message\' event');
                    this.emit('message', {
                        type: 'utf8',
                        utf8Data: frame.binaryPayload.toString('utf8')
                    });
                }
                else {
                    // beginning of a fragmented message
                    this.frameQueue.push(frame);
                    this.fragmentationSize = frame.length;
                }
            }
            break;
        case 0x00: // WebSocketFrame.CONTINUATION
            this._debug('-- Continuation Frame');
            if (this.assembleFragments) {
                if (this.frameQueue.length === 0) {
                    this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                      'Unexpected Continuation Frame');
                    return;
                }

                this.fragmentationSize += frame.length;

                if (this.fragmentationSize > this.maxReceivedMessageSize) {
                    this.drop(WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG,
                      'Maximum message size exceeded.');
                    return;
                }

                this.frameQueue.push(frame);

                if (frame.fin) {
                    // end of fragmented message, so we process the whole
                    // message now.  We also have to decode the utf-8 data
                    // for text frames after combining all the fragments.
                    var bytesCopied = 0;
                    var binaryPayload = bufferAllocUnsafe(this.fragmentationSize);
                    var opcode = this.frameQueue[0].opcode;
                    this.frameQueue.forEach(function (currentFrame) {
                        currentFrame.binaryPayload.copy(binaryPayload, bytesCopied);
                        bytesCopied += currentFrame.binaryPayload.length;
                    });
                    this.frameQueue = [];
                    this.fragmentationSize = 0;

                    switch (opcode) {
                        case 0x02: // WebSocketOpcode.BINARY_FRAME
                            this.emit('message', {
                                type: 'binary',
                                binaryData: binaryPayload
                            });
                            break;
                        case 0x01: // WebSocketOpcode.TEXT_FRAME
                            if (!Validation.isValidUTF8(binaryPayload)) {
                                this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,
                                  'Invalid UTF-8 Data Received');
                                return;
                            }
                            this.emit('message', {
                                type: 'utf8',
                                utf8Data: binaryPayload.toString('utf8')
                            });
                            break;
                        default:
                            this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                              'Unexpected first opcode in fragmentation sequence: 0x' + opcode.toString(16));
                            return;
                    }
                }
            }
            break;
        case 0x09: // WebSocketFrame.PING
            this._debug('-- Ping Frame');

            if (this._pingListenerCount > 0) {
                // logic to emit the ping frame: this is only done when a listener is known to exist
                // Expose a function allowing the user to override the default ping() behavior
                var cancelled = false;
                var cancel = function() { 
                  cancelled = true; 
                };
                this.emit('ping', cancel, frame.binaryPayload);

                // Only send a pong if the client did not indicate that he would like to cancel
                if (!cancelled) {
                    this.pong(frame.binaryPayload);
                }
            }
            else {
                this.pong(frame.binaryPayload);
            }

            break;
        case 0x0A: // WebSocketFrame.PONG
            this._debug('-- Pong Frame');
            this.emit('pong', frame.binaryPayload);
            break;
        case 0x08: // WebSocketFrame.CONNECTION_CLOSE
            this._debug('-- Close Frame');
            if (this.waitingForCloseResponse) {
                // Got response to our request to close the connection.
                // Close is complete, so we just hang up.
                this._debug('---- Got close response from peer.  Completing closing handshake.');
                this.clearCloseTimer();
                this.waitingForCloseResponse = false;
                this.state = STATE_CLOSED;
                this.socket.end();
                return;
            }
            
            this._debug('---- Closing handshake initiated by peer.');
            // Got request from other party to close connection.
            // Send back acknowledgement and then hang up.
            this.state = STATE_PEER_REQUESTED_CLOSE;
            var respondCloseReasonCode;

            // Make sure the close reason provided is legal according to
            // the protocol spec.  Providing no close status is legal.
            // WebSocketFrame sets closeStatus to -1 by default, so if it
            // is still -1, then no status was provided.
            if (frame.invalidCloseFrameLength) {
                this.closeReasonCode = 1005; // 1005 = No reason provided.
                respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
            }
            else if (frame.closeStatus === -1 || validateCloseReason(frame.closeStatus)) {
                this.closeReasonCode = frame.closeStatus;
                respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
            }
            else {
                this.closeReasonCode = frame.closeStatus;
                respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
            }
            
            // If there is a textual description in the close frame, extract it.
            if (frame.binaryPayload.length > 1) {
                if (!Validation.isValidUTF8(frame.binaryPayload)) {
                    this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,
                      'Invalid UTF-8 Data Received');
                    return;
                }
                this.closeDescription = frame.binaryPayload.toString('utf8');
            }
            else {
                this.closeDescription = WebSocketConnection.CLOSE_DESCRIPTIONS[this.closeReasonCode];
            }
            this._debug(
                '------ Remote peer %s - code: %d - %s - close frame payload length: %d',
                this.remoteAddress, this.closeReasonCode,
                this.closeDescription, frame.length
            );
            this._debug('------ responding to remote peer\'s close request.');
            this.sendCloseFrame(respondCloseReasonCode, null);
            this.connected = false;
            break;
        default:
            this._debug('-- Unrecognized Opcode %d', frame.opcode);
            this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
              'Unrecognized Opcode: 0x' + frame.opcode.toString(16));
            break;
    }
};

WebSocketConnection.prototype.send = function(data, cb) {
    this._debug('send');
    if (Buffer.isBuffer(data)) {
        this.sendBytes(data, cb);
    }
    else if (typeof(data['toString']) === 'function') {
        this.sendUTF(data, cb);
    }
    else {
        throw new Error('Data provided must either be a Node Buffer or implement toString()');
    }
};

WebSocketConnection.prototype.sendUTF = function(data, cb) {
    data = bufferFromString(data.toString(), 'utf8');
    this._debug('sendUTF: %d bytes', data.length);
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.opcode = 0x01; // WebSocketOpcode.TEXT_FRAME
    frame.binaryPayload = data;
    this.fragmentAndSend(frame, cb);
};

WebSocketConnection.prototype.sendBytes = function(data, cb) {
    this._debug('sendBytes');
    if (!Buffer.isBuffer(data)) {
        throw new Error('You must pass a Node Buffer object to WebSocketConnection.prototype.sendBytes()');
    }
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.opcode = 0x02; // WebSocketOpcode.BINARY_FRAME
    frame.binaryPayload = data;
    this.fragmentAndSend(frame, cb);
};

WebSocketConnection.prototype.ping = function(data) {
    this._debug('ping');
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.opcode = 0x09; // WebSocketOpcode.PING
    frame.fin = true;
    if (data) {
        if (!Buffer.isBuffer(data)) {
            data = bufferFromString(data.toString(), 'utf8');
        }
        if (data.length > 125) {
            this._debug('WebSocket: Data for ping is longer than 125 bytes.  Truncating.');
            data = data.slice(0,124);
        }
        frame.binaryPayload = data;
    }
    this.sendFrame(frame);
};

// Pong frames have to echo back the contents of the data portion of the
// ping frame exactly, byte for byte.
WebSocketConnection.prototype.pong = function(binaryPayload) {
    this._debug('pong');
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.opcode = 0x0A; // WebSocketOpcode.PONG
    if (Buffer.isBuffer(binaryPayload) && binaryPayload.length > 125) {
        this._debug('WebSocket: Data for pong is longer than 125 bytes.  Truncating.');
        binaryPayload = binaryPayload.slice(0,124);
    }
    frame.binaryPayload = binaryPayload;
    frame.fin = true;
    this.sendFrame(frame);
};

WebSocketConnection.prototype.fragmentAndSend = function(frame, cb) {
    this._debug('fragmentAndSend');
    if (frame.opcode > 0x07) {
        throw new Error('You cannot fragment control frames.');
    }

    var threshold = this.config.fragmentationThreshold;
    var length = frame.binaryPayload.length;

    // Send immediately if fragmentation is disabled or the message is not
    // larger than the fragmentation threshold.
    if (!this.config.fragmentOutgoingMessages || (frame.binaryPayload && length <= threshold)) {
        frame.fin = true;
        this.sendFrame(frame, cb);
        return;
    }
    
    var numFragments = Math.ceil(length / threshold);
    var sentFragments = 0;
    var sentCallback = function fragmentSentCallback(err) {
        if (err) {
            if (typeof cb === 'function') {
                // pass only the first error
                cb(err);
                cb = null;
            }
            return;
        }
        ++sentFragments;
        if ((sentFragments === numFragments) && (typeof cb === 'function')) {
            cb();
        }
    };
    for (var i=1; i <= numFragments; i++) {
        var currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
        
        // continuation opcode except for first frame.
        currentFrame.opcode = (i === 1) ? frame.opcode : 0x00;
        
        // fin set on last frame only
        currentFrame.fin = (i === numFragments);
        
        // length is likely to be shorter on the last fragment
        var currentLength = (i === numFragments) ? length - (threshold * (i-1)) : threshold;
        var sliceStart = threshold * (i-1);
        
        // Slice the right portion of the original payload
        currentFrame.binaryPayload = frame.binaryPayload.slice(sliceStart, sliceStart + currentLength);
        
        this.sendFrame(currentFrame, sentCallback);
    }
};

WebSocketConnection.prototype.sendCloseFrame = function(reasonCode, description, cb) {
    if (typeof(reasonCode) !== 'number') {
        reasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
    }
    
    this._debug('sendCloseFrame state: %s, reasonCode: %d, description: %s', this.state, reasonCode, description);
    
    if (this.state !== STATE_OPEN && this.state !== STATE_PEER_REQUESTED_CLOSE) { return; }
    
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.fin = true;
    frame.opcode = 0x08; // WebSocketOpcode.CONNECTION_CLOSE
    frame.closeStatus = reasonCode;
    if (typeof(description) === 'string') {
        frame.binaryPayload = bufferFromString(description, 'utf8');
    }
    
    this.sendFrame(frame, cb);
    this.socket.end();
};

WebSocketConnection.prototype.sendFrame = function(frame, cb) {
    this._debug('sendFrame');
    frame.mask = this.maskOutgoingPackets;
    var flushed = this.socket.write(frame.toBuffer(), cb);
    this.outputBufferFull = !flushed;
    return flushed;
};

module.exports = WebSocketConnection;



function instrumentSocketForDebugging(connection, socket) {
    /* jshint loopfunc: true */
    if (!connection._debug.enabled) { return; }
    
    var originalSocketEmit = socket.emit;
    socket.emit = function(event) {
        connection._debug('||| Socket Event  \'%s\'', event);
        originalSocketEmit.apply(this, arguments);
    };
    
    for (var key in socket) {
        if ('function' !== typeof(socket[key])) { continue; }
        if (['emit'].indexOf(key) !== -1) { continue; }
        (function(key) {
            var original = socket[key];
            if (key === 'on') {
                socket[key] = function proxyMethod__EventEmitter__On() {
                    connection._debug('||| Socket method called:  %s (%s)', key, arguments[0]);
                    return original.apply(this, arguments);
                };
                return;
            }
            socket[key] = function proxyMethod() {
                connection._debug('||| Socket method called:  %s', key);
                return original.apply(this, arguments);
            };
        })(key);
    }
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Emitter = function () {
  function Emitter() {
    _classCallCheck(this, Emitter);

    this.listeners = new Map();
  }

  _createClass(Emitter, [{
    key: 'addListener',
    value: function addListener(label, callback, vm) {
      if (typeof callback === 'function') {
        this.listeners.has(label) || this.listeners.set(label, []);
        this.listeners.get(label).push({ callback: callback, vm: vm });
        return true;
      }
      return false;
    }
  }, {
    key: 'removeListener',
    value: function removeListener(label, callback, vm) {
      var listeners = this.listeners.get(label);
      var index = void 0;

      if (listeners && listeners.length) {
        index = listeners.reduce(function (i, listener, index) {
          if (typeof listener.callback === 'function' && listener.callback === callback && listener.vm === vm) {
            i = index;
          }
          return i;
        }, -1);

        if (index > -1) {
          listeners.splice(index, 1);
          this.listeners.set(label, listeners);
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'emit',
    value: function emit(label) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var listeners = this.listeners.get(label);

      if (listeners && listeners.length) {
        listeners.forEach(function (listener) {
          var _listener$callback;

          (_listener$callback = listener.callback).call.apply(_listener$callback, [listener.vm].concat(args));
        });
        return true;
      }
      return false;
    }
  }]);

  return Emitter;
}();

exports.default = new Emitter();

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(19);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(16);
} else {
  module.exports = __webpack_require__(17);
}


/***/ }),
/* 7 */
/***/ (function(module, exports) {

// Generated by CoffeeScript 1.7.1

/*
   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0

   Copyright (C) 2010-2013 [Jeff Mesnil](http://jmesnil.net/)
   Copyright (C) 2012 [FuseSource, Inc.](http://fusesource.com)
 */

(function() {
  var Byte, Client, Frame, Stomp,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  Byte = {
    LF: '\x0A',
    NULL: '\x00'
  };

  Frame = (function() {
    var unmarshallSingle;

    function Frame(command, headers, body) {
      this.command = command;
      this.headers = headers != null ? headers : {};
      this.body = body != null ? body : '';
    }

    Frame.prototype.toString = function() {
      var lines, name, skipContentLength, value, _ref;
      lines = [this.command];
      skipContentLength = this.headers['content-length'] === false ? true : false;
      if (skipContentLength) {
        delete this.headers['content-length'];
      }
      _ref = this.headers;
      for (name in _ref) {
        if (!__hasProp.call(_ref, name)) continue;
        value = _ref[name];
        lines.push("" + name + ":" + value);
      }
      if (this.body && !skipContentLength) {
        lines.push("content-length:" + (Frame.sizeOfUTF8(this.body)));
      }
      lines.push(Byte.LF + this.body);
      return lines.join(Byte.LF);
    };

    Frame.sizeOfUTF8 = function(s) {
      if (s) {
        return encodeURI(s).match(/%..|./g).length;
      } else {
        return 0;
      }
    };

    unmarshallSingle = function(data) {
      var body, chr, command, divider, headerLines, headers, i, idx, len, line, start, trim, _i, _j, _len, _ref, _ref1;
      divider = data.search(RegExp("" + Byte.LF + Byte.LF));
      headerLines = data.substring(0, divider).split(Byte.LF);
      command = headerLines.shift();
      headers = {};
      trim = function(str) {
        return str.replace(/^\s+|\s+$/g, '');
      };
      _ref = headerLines.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        idx = line.indexOf(':');
        headers[trim(line.substring(0, idx))] = trim(line.substring(idx + 1));
      }
      body = '';
      start = divider + 2;
      if (headers['content-length']) {
        len = parseInt(headers['content-length']);
        body = ('' + data).substring(start, start + len);
      } else {
        chr = null;
        for (i = _j = start, _ref1 = data.length; start <= _ref1 ? _j < _ref1 : _j > _ref1; i = start <= _ref1 ? ++_j : --_j) {
          chr = data.charAt(i);
          if (chr === Byte.NULL) {
            break;
          }
          body += chr;
        }
      }
      return new Frame(command, headers, body);
    };

    Frame.unmarshall = function(datas) {
      var data;
      return (function() {
        var _i, _len, _ref, _results;
        _ref = datas.split(RegExp("" + Byte.NULL + Byte.LF + "*"));
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          data = _ref[_i];
          if ((data != null ? data.length : void 0) > 0) {
            _results.push(unmarshallSingle(data));
          }
        }
        return _results;
      })();
    };

    Frame.marshall = function(command, headers, body) {
      var frame;
      frame = new Frame(command, headers, body);
      return frame.toString() + Byte.NULL;
    };

    return Frame;

  })();

  Client = (function() {
    var now;

    function Client(ws) {
      this.ws = ws;
      this.ws.binaryType = "arraybuffer";
      this.counter = 0;
      this.connected = false;
      this.heartbeat = {
        outgoing: 10000,
        incoming: 10000
      };
      this.maxWebSocketFrameSize = 16 * 1024;
      this.subscriptions = {};
    }

    Client.prototype.debug = function(message) {
      var _ref;
      return typeof window !== "undefined" && window !== null ? (_ref = window.console) != null ? _ref.log(message) : void 0 : void 0;
    };

    now = function() {
      if (Date.now) {
        return Date.now();
      } else {
        return new Date().valueOf;
      }
    };

    Client.prototype._transmit = function(command, headers, body) {
      var out;
      out = Frame.marshall(command, headers, body);
      if (typeof this.debug === "function") {
        this.debug(">>> " + out);
      }
      while (true) {
        if (out.length > this.maxWebSocketFrameSize) {
          this.ws.send(out.substring(0, this.maxWebSocketFrameSize));
          out = out.substring(this.maxWebSocketFrameSize);
          if (typeof this.debug === "function") {
            this.debug("remaining = " + out.length);
          }
        } else {
          return this.ws.send(out);
        }
      }
    };

    Client.prototype._setupHeartbeat = function(headers) {
      var serverIncoming, serverOutgoing, ttl, v, _ref, _ref1;
      if ((_ref = headers.version) !== Stomp.VERSIONS.V1_1 && _ref !== Stomp.VERSIONS.V1_2) {
        return;
      }
      _ref1 = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = headers['heart-beat'].split(",");
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          v = _ref1[_i];
          _results.push(parseInt(v));
        }
        return _results;
      })(), serverOutgoing = _ref1[0], serverIncoming = _ref1[1];
      if (!(this.heartbeat.outgoing === 0 || serverIncoming === 0)) {
        ttl = Math.max(this.heartbeat.outgoing, serverIncoming);
        if (typeof this.debug === "function") {
          this.debug("send PING every " + ttl + "ms");
        }
        this.pinger = Stomp.setInterval(ttl, (function(_this) {
          return function() {
            _this.ws.send(Byte.LF);
            return typeof _this.debug === "function" ? _this.debug(">>> PING") : void 0;
          };
        })(this));
      }
      if (!(this.heartbeat.incoming === 0 || serverOutgoing === 0)) {
        ttl = Math.max(this.heartbeat.incoming, serverOutgoing);
        if (typeof this.debug === "function") {
          this.debug("check PONG every " + ttl + "ms");
        }
        return this.ponger = Stomp.setInterval(ttl, (function(_this) {
          return function() {
            var delta;
            delta = now() - _this.serverActivity;
            if (delta > ttl * 2) {
              if (typeof _this.debug === "function") {
                _this.debug("did not receive server activity for the last " + delta + "ms");
              }
              return _this.ws.close();
            }
          };
        })(this));
      }
    };

    Client.prototype._parseConnect = function() {
      var args, connectCallback, errorCallback, headers;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      headers = {};
      switch (args.length) {
        case 2:
          headers = args[0], connectCallback = args[1];
          break;
        case 3:
          if (args[1] instanceof Function) {
            headers = args[0], connectCallback = args[1], errorCallback = args[2];
          } else {
            headers.login = args[0], headers.passcode = args[1], connectCallback = args[2];
          }
          break;
        case 4:
          headers.login = args[0], headers.passcode = args[1], connectCallback = args[2], errorCallback = args[3];
          break;
        default:
          headers.login = args[0], headers.passcode = args[1], connectCallback = args[2], errorCallback = args[3], headers.host = args[4];
      }
      return [headers, connectCallback, errorCallback];
    };

    Client.prototype.connect = function() {
      var args, errorCallback, headers, out;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      out = this._parseConnect.apply(this, args);
      headers = out[0], this.connectCallback = out[1], errorCallback = out[2];
      if (typeof this.debug === "function") {
        this.debug("Opening Web Socket...");
      }
      this.ws.onmessage = (function(_this) {
        return function(evt) {
          var arr, c, client, data, frame, messageID, onreceive, subscription, _i, _len, _ref, _results;
          data = typeof ArrayBuffer !== 'undefined' && evt.data instanceof ArrayBuffer ? (arr = new Uint8Array(evt.data), typeof _this.debug === "function" ? _this.debug("--- got data length: " + arr.length) : void 0, ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = arr.length; _i < _len; _i++) {
              c = arr[_i];
              _results.push(String.fromCharCode(c));
            }
            return _results;
          })()).join('')) : evt.data;
          _this.serverActivity = now();
          if (data === Byte.LF) {
            if (typeof _this.debug === "function") {
              _this.debug("<<< PONG");
            }
            return;
          }
          if (typeof _this.debug === "function") {
            _this.debug("<<< " + data);
          }
          _ref = Frame.unmarshall(data);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            frame = _ref[_i];
            switch (frame.command) {
              case "CONNECTED":
                if (typeof _this.debug === "function") {
                  _this.debug("connected to server " + frame.headers.server);
                }
                _this.connected = true;
                _this._setupHeartbeat(frame.headers);
                _results.push(typeof _this.connectCallback === "function" ? _this.connectCallback(frame) : void 0);
                break;
              case "MESSAGE":
                subscription = frame.headers.subscription;
                onreceive = _this.subscriptions[subscription] || _this.onreceive;
                if (onreceive) {
                  client = _this;
                  messageID = frame.headers["message-id"];
                  frame.ack = function(headers) {
                    if (headers == null) {
                      headers = {};
                    }
                    return client.ack(messageID, subscription, headers);
                  };
                  frame.nack = function(headers) {
                    if (headers == null) {
                      headers = {};
                    }
                    return client.nack(messageID, subscription, headers);
                  };
                  _results.push(onreceive(frame));
                } else {
                  _results.push(typeof _this.debug === "function" ? _this.debug("Unhandled received MESSAGE: " + frame) : void 0);
                }
                break;
              case "RECEIPT":
                _results.push(typeof _this.onreceipt === "function" ? _this.onreceipt(frame) : void 0);
                break;
              case "ERROR":
                _results.push(typeof errorCallback === "function" ? errorCallback(frame) : void 0);
                break;
              default:
                _results.push(typeof _this.debug === "function" ? _this.debug("Unhandled frame: " + frame) : void 0);
            }
          }
          return _results;
        };
      })(this);
      this.ws.onclose = (function(_this) {
        return function() {
          var msg;
          msg = "Whoops! Lost connection to " + _this.ws.url;
          if (typeof _this.debug === "function") {
            _this.debug(msg);
          }
          _this._cleanUp();
          return typeof errorCallback === "function" ? errorCallback(msg) : void 0;
        };
      })(this);
      return this.ws.onopen = (function(_this) {
        return function() {
          if (typeof _this.debug === "function") {
            _this.debug('Web Socket Opened...');
          }
          headers["accept-version"] = Stomp.VERSIONS.supportedVersions();
          headers["heart-beat"] = [_this.heartbeat.outgoing, _this.heartbeat.incoming].join(',');
          return _this._transmit("CONNECT", headers);
        };
      })(this);
    };

    Client.prototype.disconnect = function(disconnectCallback, headers) {
      if (headers == null) {
        headers = {};
      }
      this._transmit("DISCONNECT", headers);
      this.ws.onclose = null;
      this.ws.close();
      this._cleanUp();
      return typeof disconnectCallback === "function" ? disconnectCallback() : void 0;
    };

    Client.prototype._cleanUp = function() {
      this.connected = false;
      if (this.pinger) {
        Stomp.clearInterval(this.pinger);
      }
      if (this.ponger) {
        return Stomp.clearInterval(this.ponger);
      }
    };

    Client.prototype.send = function(destination, headers, body) {
      if (headers == null) {
        headers = {};
      }
      if (body == null) {
        body = '';
      }
      headers.destination = destination;
      return this._transmit("SEND", headers, body);
    };

    Client.prototype.subscribe = function(destination, callback, headers) {
      var client;
      if (headers == null) {
        headers = {};
      }
      if (!headers.id) {
        headers.id = "sub-" + this.counter++;
      }
      headers.destination = destination;
      this.subscriptions[headers.id] = callback;
      this._transmit("SUBSCRIBE", headers);
      client = this;
      return {
        id: headers.id,
        unsubscribe: function() {
          return client.unsubscribe(headers.id);
        }
      };
    };

    Client.prototype.unsubscribe = function(id) {
      delete this.subscriptions[id];
      return this._transmit("UNSUBSCRIBE", {
        id: id
      });
    };

    Client.prototype.begin = function(transaction) {
      var client, txid;
      txid = transaction || "tx-" + this.counter++;
      this._transmit("BEGIN", {
        transaction: txid
      });
      client = this;
      return {
        id: txid,
        commit: function() {
          return client.commit(txid);
        },
        abort: function() {
          return client.abort(txid);
        }
      };
    };

    Client.prototype.commit = function(transaction) {
      return this._transmit("COMMIT", {
        transaction: transaction
      });
    };

    Client.prototype.abort = function(transaction) {
      return this._transmit("ABORT", {
        transaction: transaction
      });
    };

    Client.prototype.ack = function(messageID, subscription, headers) {
      if (headers == null) {
        headers = {};
      }
      headers["message-id"] = messageID;
      headers.subscription = subscription;
      return this._transmit("ACK", headers);
    };

    Client.prototype.nack = function(messageID, subscription, headers) {
      if (headers == null) {
        headers = {};
      }
      headers["message-id"] = messageID;
      headers.subscription = subscription;
      return this._transmit("NACK", headers);
    };

    return Client;

  })();

  Stomp = {
    VERSIONS: {
      V1_0: '1.0',
      V1_1: '1.1',
      V1_2: '1.2',
      supportedVersions: function() {
        return '1.1,1.0';
      }
    },
    client: function(url, protocols) {
      var klass, ws;
      if (protocols == null) {
        protocols = ['v10.stomp', 'v11.stomp'];
      }
      klass = Stomp.WebSocketClass || WebSocket;
      ws = new klass(url, protocols);
      return new Client(ws);
    },
    over: function(ws) {
      return new Client(ws);
    },
    Frame: Frame
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.Stomp = Stomp;
  }

  if (typeof window !== "undefined" && window !== null) {
    Stomp.setInterval = function(interval, f) {
      return window.setInterval(f, interval);
    };
    Stomp.clearInterval = function(id) {
      return window.clearInterval(id);
    };
    window.Stomp = Stomp;
  } else if (!exports) {
    self.Stomp = Stomp;
  }

}).call(this);


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/************************************************************************
 *  Copyright 2010-2015 Brian McKelvey.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var utils = __webpack_require__(2);
var extend = utils.extend;
var util = __webpack_require__(1);
var EventEmitter = __webpack_require__(0).EventEmitter;
var http = __webpack_require__(42);
var https = __webpack_require__(43);
var url = __webpack_require__(13);
var crypto = __webpack_require__(11);
var WebSocketConnection = __webpack_require__(3);
var bufferAllocUnsafe = utils.bufferAllocUnsafe;

var protocolSeparators = [
    '(', ')', '<', '>', '@',
    ',', ';', ':', '\\', '\"',
    '/', '[', ']', '?', '=',
    '{', '}', ' ', String.fromCharCode(9)
];

var excludedTlsOptions = ['hostname','port','method','path','headers'];

function WebSocketClient(config) {
    // Superclass Constructor
    EventEmitter.call(this);

    // TODO: Implement extensions

    this.config = {
        // 1MiB max frame size.
        maxReceivedFrameSize: 0x100000,

        // 8MiB max message size, only applicable if
        // assembleFragments is true
        maxReceivedMessageSize: 0x800000,

        // Outgoing messages larger than fragmentationThreshold will be
        // split into multiple fragments.
        fragmentOutgoingMessages: true,

        // Outgoing frames are fragmented if they exceed this threshold.
        // Default is 16KiB
        fragmentationThreshold: 0x4000,

        // Which version of the protocol to use for this session.  This
        // option will be removed once the protocol is finalized by the IETF
        // It is only available to ease the transition through the
        // intermediate draft protocol versions.
        // At present, it only affects the name of the Origin header.
        webSocketVersion: 13,

        // If true, fragmented messages will be automatically assembled
        // and the full message will be emitted via a 'message' event.
        // If false, each frame will be emitted via a 'frame' event and
        // the application will be responsible for aggregating multiple
        // fragmented frames.  Single-frame messages will emit a 'message'
        // event in addition to the 'frame' event.
        // Most users will want to leave this set to 'true'
        assembleFragments: true,

        // The Nagle Algorithm makes more efficient use of network resources
        // by introducing a small delay before sending small packets so that
        // multiple messages can be batched together before going onto the
        // wire.  This however comes at the cost of latency, so the default
        // is to disable it.  If you don't need low latency and are streaming
        // lots of small messages, you can change this to 'false'
        disableNagleAlgorithm: true,

        // The number of milliseconds to wait after sending a close frame
        // for an acknowledgement to come back before giving up and just
        // closing the socket.
        closeTimeout: 5000,

        // Options to pass to https.connect if connecting via TLS
        tlsOptions: {}
    };

    if (config) {
        var tlsOptions;
        if (config.tlsOptions) {
          tlsOptions = config.tlsOptions;
          delete config.tlsOptions;
        }
        else {
          tlsOptions = {};
        }
        extend(this.config, config);
        extend(this.config.tlsOptions, tlsOptions);
    }

    this._req = null;
    
    switch (this.config.webSocketVersion) {
        case 8:
        case 13:
            break;
        default:
            throw new Error('Requested webSocketVersion is not supported. Allowed values are 8 and 13.');
    }
}

util.inherits(WebSocketClient, EventEmitter);

WebSocketClient.prototype.connect = function(requestUrl, protocols, origin, headers, extraRequestOptions) {
    var self = this;
    
    if (typeof(protocols) === 'string') {
        if (protocols.length > 0) {
            protocols = [protocols];
        }
        else {
            protocols = [];
        }
    }
    if (!(protocols instanceof Array)) {
        protocols = [];
    }
    this.protocols = protocols;
    this.origin = origin;

    if (typeof(requestUrl) === 'string') {
        this.url = url.parse(requestUrl);
    }
    else {
        this.url = requestUrl; // in case an already parsed url is passed in.
    }
    if (!this.url.protocol) {
        throw new Error('You must specify a full WebSocket URL, including protocol.');
    }
    if (!this.url.host) {
        throw new Error('You must specify a full WebSocket URL, including hostname. Relative URLs are not supported.');
    }

    this.secure = (this.url.protocol === 'wss:');

    // validate protocol characters:
    this.protocols.forEach(function(protocol) {
        for (var i=0; i < protocol.length; i ++) {
            var charCode = protocol.charCodeAt(i);
            var character = protocol.charAt(i);
            if (charCode < 0x0021 || charCode > 0x007E || protocolSeparators.indexOf(character) !== -1) {
                throw new Error('Protocol list contains invalid character "' + String.fromCharCode(charCode) + '"');
            }
        }
    });

    var defaultPorts = {
        'ws:': '80',
        'wss:': '443'
    };

    if (!this.url.port) {
        this.url.port = defaultPorts[this.url.protocol];
    }

    var nonce = bufferAllocUnsafe(16);
    for (var i=0; i < 16; i++) {
        nonce[i] = Math.round(Math.random()*0xFF);
    }
    this.base64nonce = nonce.toString('base64');

    var hostHeaderValue = this.url.hostname;
    if ((this.url.protocol === 'ws:' && this.url.port !== '80') ||
        (this.url.protocol === 'wss:' && this.url.port !== '443'))  {
        hostHeaderValue += (':' + this.url.port);
    }

    var reqHeaders = {};
    if (this.secure && this.config.tlsOptions.hasOwnProperty('headers')) {
      // Allow for additional headers to be provided when connecting via HTTPS
      extend(reqHeaders, this.config.tlsOptions.headers);
    }
    if (headers) {
      // Explicitly provided headers take priority over any from tlsOptions
      extend(reqHeaders, headers);
    }
    extend(reqHeaders, {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Version': this.config.webSocketVersion.toString(10),
        'Sec-WebSocket-Key': this.base64nonce,
        'Host': reqHeaders.Host || hostHeaderValue
    });

    if (this.protocols.length > 0) {
        reqHeaders['Sec-WebSocket-Protocol'] = this.protocols.join(', ');
    }
    if (this.origin) {
        if (this.config.webSocketVersion === 13) {
            reqHeaders['Origin'] = this.origin;
        }
        else if (this.config.webSocketVersion === 8) {
            reqHeaders['Sec-WebSocket-Origin'] = this.origin;
        }
    }

    // TODO: Implement extensions

    var pathAndQuery;
    // Ensure it begins with '/'.
    if (this.url.pathname) {
        pathAndQuery = this.url.path;
    }
    else if (this.url.path) {
        pathAndQuery = '/' + this.url.path;
    }
    else {
        pathAndQuery = '/';
    }

    function handleRequestError(error) {
        self._req = null;
        self.emit('connectFailed', error);
    }

    var requestOptions = {
        agent: false
    };
    if (extraRequestOptions) {
        extend(requestOptions, extraRequestOptions);
    }
    // These options are always overridden by the library.  The user is not
    // allowed to specify these directly.
    extend(requestOptions, {
        hostname: this.url.hostname,
        port: this.url.port,
        method: 'GET',
        path: pathAndQuery,
        headers: reqHeaders
    });
    if (this.secure) {
        var tlsOptions = this.config.tlsOptions;
        for (var key in tlsOptions) {
            if (tlsOptions.hasOwnProperty(key) && excludedTlsOptions.indexOf(key) === -1) {
                requestOptions[key] = tlsOptions[key];
            }
        }
    }

    var req = this._req = (this.secure ? https : http).request(requestOptions);
    req.on('upgrade', function handleRequestUpgrade(response, socket, head) {
        self._req = null;
        req.removeListener('error', handleRequestError);
        self.socket = socket;
        self.response = response;
        self.firstDataChunk = head;
        self.validateHandshake();
    });
    req.on('error', handleRequestError);

    req.on('response', function(response) {
        self._req = null;
        if (utils.eventEmitterListenerCount(self, 'httpResponse') > 0) {
            self.emit('httpResponse', response, self);
            if (response.socket) {
                response.socket.end();
            }
        }
        else {
            var headerDumpParts = [];
            for (var headerName in response.headers) {
                headerDumpParts.push(headerName + ': ' + response.headers[headerName]);
            }
            self.failHandshake(
                'Server responded with a non-101 status: ' +
                response.statusCode + ' ' + response.statusMessage +
                '\nResponse Headers Follow:\n' +
                headerDumpParts.join('\n') + '\n'
            );
        }
    });
    req.end();
};

WebSocketClient.prototype.validateHandshake = function() {
    var headers = this.response.headers;

    if (this.protocols.length > 0) {
        this.protocol = headers['sec-websocket-protocol'];
        if (this.protocol) {
            if (this.protocols.indexOf(this.protocol) === -1) {
                this.failHandshake('Server did not respond with a requested protocol.');
                return;
            }
        }
        else {
            this.failHandshake('Expected a Sec-WebSocket-Protocol header.');
            return;
        }
    }

    if (!(headers['connection'] && headers['connection'].toLocaleLowerCase() === 'upgrade')) {
        this.failHandshake('Expected a Connection: Upgrade header from the server');
        return;
    }

    if (!(headers['upgrade'] && headers['upgrade'].toLocaleLowerCase() === 'websocket')) {
        this.failHandshake('Expected an Upgrade: websocket header from the server');
        return;
    }

    var sha1 = crypto.createHash('sha1');
    sha1.update(this.base64nonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
    var expectedKey = sha1.digest('base64');

    if (!headers['sec-websocket-accept']) {
        this.failHandshake('Expected Sec-WebSocket-Accept header from server');
        return;
    }

    if (headers['sec-websocket-accept'] !== expectedKey) {
        this.failHandshake('Sec-WebSocket-Accept header from server didn\'t match expected value of ' + expectedKey);
        return;
    }

    // TODO: Support extensions

    this.succeedHandshake();
};

WebSocketClient.prototype.failHandshake = function(errorDescription) {
    if (this.socket && this.socket.writable) {
        this.socket.end();
    }
    this.emit('connectFailed', new Error(errorDescription));
};

WebSocketClient.prototype.succeedHandshake = function() {
    var connection = new WebSocketConnection(this.socket, [], this.protocol, true, this.config);

    connection.webSocketVersion = this.config.webSocketVersion;
    connection._addSocketEventListeners();

    this.emit('connect', connection);
    if (this.firstDataChunk.length > 0) {
        connection.handleSocketData(this.firstDataChunk);
    }
    this.firstDataChunk = null;
};

WebSocketClient.prototype.abort = function() {
    if (this._req) {
        this._req.abort();
    }
};

module.exports = WebSocketClient;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/************************************************************************
 *  Copyright 2010-2015 Brian McKelvey.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var bufferUtil = __webpack_require__(25).BufferUtil;
var bufferAllocUnsafe = __webpack_require__(2).bufferAllocUnsafe;

const DECODE_HEADER = 1;
const WAITING_FOR_16_BIT_LENGTH = 2;
const WAITING_FOR_64_BIT_LENGTH = 3;
const WAITING_FOR_MASK_KEY = 4;
const WAITING_FOR_PAYLOAD = 5;
const COMPLETE = 6;

// WebSocketConnection will pass shared buffer objects for maskBytes and
// frameHeader into the constructor to avoid tons of small memory allocations
// for each frame we have to parse.  This is only used for parsing frames
// we receive off the wire.
function WebSocketFrame(maskBytes, frameHeader, config) {
    this.maskBytes = maskBytes;
    this.frameHeader = frameHeader;
    this.config = config;
    this.maxReceivedFrameSize = config.maxReceivedFrameSize;
    this.protocolError = false;
    this.frameTooLarge = false;
    this.invalidCloseFrameLength = false;
    this.parseState = DECODE_HEADER;
    this.closeStatus = -1;
}

WebSocketFrame.prototype.addData = function(bufferList) {
    if (this.parseState === DECODE_HEADER) {
        if (bufferList.length >= 2) {
            bufferList.joinInto(this.frameHeader, 0, 0, 2);
            bufferList.advance(2);
            var firstByte = this.frameHeader[0];
            var secondByte = this.frameHeader[1];

            this.fin     = Boolean(firstByte  & 0x80);
            this.rsv1    = Boolean(firstByte  & 0x40);
            this.rsv2    = Boolean(firstByte  & 0x20);
            this.rsv3    = Boolean(firstByte  & 0x10);
            this.mask    = Boolean(secondByte & 0x80);

            this.opcode  = firstByte  & 0x0F;
            this.length = secondByte & 0x7F;

            // Control frame sanity check
            if (this.opcode >= 0x08) {
                if (this.length > 125) {
                    this.protocolError = true;
                    this.dropReason = 'Illegal control frame longer than 125 bytes.';
                    return true;
                }
                if (!this.fin) {
                    this.protocolError = true;
                    this.dropReason = 'Control frames must not be fragmented.';
                    return true;
                }
            }

            if (this.length === 126) {
                this.parseState = WAITING_FOR_16_BIT_LENGTH;
            }
            else if (this.length === 127) {
                this.parseState = WAITING_FOR_64_BIT_LENGTH;
            }
            else {
                this.parseState = WAITING_FOR_MASK_KEY;
            }
        }
    }
    if (this.parseState === WAITING_FOR_16_BIT_LENGTH) {
        if (bufferList.length >= 2) {
            bufferList.joinInto(this.frameHeader, 2, 0, 2);
            bufferList.advance(2);
            this.length = this.frameHeader.readUInt16BE(2);
            this.parseState = WAITING_FOR_MASK_KEY;
        }
    }
    else if (this.parseState === WAITING_FOR_64_BIT_LENGTH) {
        if (bufferList.length >= 8) {
            bufferList.joinInto(this.frameHeader, 2, 0, 8);
            bufferList.advance(8);
            var lengthPair = [
              this.frameHeader.readUInt32BE(2),
              this.frameHeader.readUInt32BE(2+4)
            ];

            if (lengthPair[0] !== 0) {
                this.protocolError = true;
                this.dropReason = 'Unsupported 64-bit length frame received';
                return true;
            }
            this.length = lengthPair[1];
            this.parseState = WAITING_FOR_MASK_KEY;
        }
    }

    if (this.parseState === WAITING_FOR_MASK_KEY) {
        if (this.mask) {
            if (bufferList.length >= 4) {
                bufferList.joinInto(this.maskBytes, 0, 0, 4);
                bufferList.advance(4);
                this.parseState = WAITING_FOR_PAYLOAD;
            }
        }
        else {
            this.parseState = WAITING_FOR_PAYLOAD;
        }
    }

    if (this.parseState === WAITING_FOR_PAYLOAD) {
        if (this.length > this.maxReceivedFrameSize) {
            this.frameTooLarge = true;
            this.dropReason = 'Frame size of ' + this.length.toString(10) +
                              ' bytes exceeds maximum accepted frame size';
            return true;
        }

        if (this.length === 0) {
            this.binaryPayload = bufferAllocUnsafe(0);
            this.parseState = COMPLETE;
            return true;
        }
        if (bufferList.length >= this.length) {
            this.binaryPayload = bufferList.take(this.length);
            bufferList.advance(this.length);
            if (this.mask) {
                bufferUtil.unmask(this.binaryPayload, this.maskBytes);
                // xor(this.binaryPayload, this.maskBytes, 0);
            }

            if (this.opcode === 0x08) { // WebSocketOpcode.CONNECTION_CLOSE
                if (this.length === 1) {
                    // Invalid length for a close frame.  Must be zero or at least two.
                    this.binaryPayload = bufferAllocUnsafe(0);
                    this.invalidCloseFrameLength = true;
                }
                if (this.length >= 2) {
                    this.closeStatus = this.binaryPayload.readUInt16BE(0);
                    this.binaryPayload = this.binaryPayload.slice(2);
                }
            }

            this.parseState = COMPLETE;
            return true;
        }
    }
    return false;
};

WebSocketFrame.prototype.throwAwayPayload = function(bufferList) {
    if (bufferList.length >= this.length) {
        bufferList.advance(this.length);
        this.parseState = COMPLETE;
        return true;
    }
    return false;
};

WebSocketFrame.prototype.toBuffer = function(nullMask) {
    var maskKey;
    var headerLength = 2;
    var data;
    var outputPos;
    var firstByte = 0x00;
    var secondByte = 0x00;

    if (this.fin) {
        firstByte |= 0x80;
    }
    if (this.rsv1) {
        firstByte |= 0x40;
    }
    if (this.rsv2) {
        firstByte |= 0x20;
    }
    if (this.rsv3) {
        firstByte |= 0x10;
    }
    if (this.mask) {
        secondByte |= 0x80;
    }

    firstByte |= (this.opcode & 0x0F);

    // the close frame is a special case because the close reason is
    // prepended to the payload data.
    if (this.opcode === 0x08) {
        this.length = 2;
        if (this.binaryPayload) {
            this.length += this.binaryPayload.length;
        }
        data = bufferAllocUnsafe(this.length);
        data.writeUInt16BE(this.closeStatus, 0);
        if (this.length > 2) {
            this.binaryPayload.copy(data, 2);
        }
    }
    else if (this.binaryPayload) {
        data = this.binaryPayload;
        this.length = data.length;
    }
    else {
        this.length = 0;
    }

    if (this.length <= 125) {
        // encode the length directly into the two-byte frame header
        secondByte |= (this.length & 0x7F);
    }
    else if (this.length > 125 && this.length <= 0xFFFF) {
        // Use 16-bit length
        secondByte |= 126;
        headerLength += 2;
    }
    else if (this.length > 0xFFFF) {
        // Use 64-bit length
        secondByte |= 127;
        headerLength += 8;
    }

    var output = bufferAllocUnsafe(this.length + headerLength + (this.mask ? 4 : 0));

    // write the frame header
    output[0] = firstByte;
    output[1] = secondByte;

    outputPos = 2;

    if (this.length > 125 && this.length <= 0xFFFF) {
        // write 16-bit length
        output.writeUInt16BE(this.length, outputPos);
        outputPos += 2;
    }
    else if (this.length > 0xFFFF) {
        // write 64-bit length
        output.writeUInt32BE(0x00000000, outputPos);
        output.writeUInt32BE(this.length, outputPos + 4);
        outputPos += 8;
    }

    if (this.mask) {
        maskKey = nullMask ? 0 : ((Math.random() * 0xFFFFFFFF) >>> 0);
        this.maskBytes.writeUInt32BE(maskKey, 0);

        // write the mask key
        this.maskBytes.copy(output, outputPos);
        outputPos += 4;

        if (data) {
          bufferUtil.mask(data, this.maskBytes, output, outputPos, this.length);
        }
    }
    else if (data) {
        data.copy(output, outputPos);
    }

    return output;
};

WebSocketFrame.prototype.toString = function() {
    return 'Opcode: ' + this.opcode + ', fin: ' + this.fin + ', length: ' + this.length + ', hasPayload: ' + Boolean(this.binaryPayload) + ', masked: ' + this.mask;
};


module.exports = WebSocketFrame;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/************************************************************************
 *  Copyright 2010-2015 Brian McKelvey.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var crypto = __webpack_require__(11);
var util = __webpack_require__(1);
var url = __webpack_require__(13);
var EventEmitter = __webpack_require__(0).EventEmitter;
var WebSocketConnection = __webpack_require__(3);

var headerValueSplitRegExp = /,\s*/;
var headerParamSplitRegExp = /;\s*/;
var headerSanitizeRegExp = /[\r\n]/g;
var xForwardedForSeparatorRegExp = /,\s*/;
var separators = [
    '(', ')', '<', '>', '@',
    ',', ';', ':', '\\', '\"',
    '/', '[', ']', '?', '=',
    '{', '}', ' ', String.fromCharCode(9)
];
var controlChars = [String.fromCharCode(127) /* DEL */];
for (var i=0; i < 31; i ++) {
    /* US-ASCII Control Characters */
    controlChars.push(String.fromCharCode(i));
}

var cookieNameValidateRegEx = /([\x00-\x20\x22\x28\x29\x2c\x2f\x3a-\x3f\x40\x5b-\x5e\x7b\x7d\x7f])/;
var cookieValueValidateRegEx = /[^\x21\x23-\x2b\x2d-\x3a\x3c-\x5b\x5d-\x7e]/;
var cookieValueDQuoteValidateRegEx = /^"[^"]*"$/;
var controlCharsAndSemicolonRegEx = /[\x00-\x20\x3b]/g;

var cookieSeparatorRegEx = /[;,] */;

var httpStatusDescriptions = {
    100: 'Continue',
    101: 'Switching Protocols',
    200: 'OK',
    201: 'Created',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    406: 'Not Acceptable',
    407: 'Proxy Authorization Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Long',
    414: 'Request-URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Requested Range Not Satisfiable',
    417: 'Expectation Failed',
    426: 'Upgrade Required',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported'
};

function WebSocketRequest(socket, httpRequest, serverConfig) {
    // Superclass Constructor
    EventEmitter.call(this);

    this.socket = socket;
    this.httpRequest = httpRequest;
    this.resource = httpRequest.url;
    this.remoteAddress = socket.remoteAddress;
    this.remoteAddresses = [this.remoteAddress];
    this.serverConfig = serverConfig;
    
    // Watch for the underlying TCP socket closing before we call accept
    this._socketIsClosing = false;
    this._socketCloseHandler = this._handleSocketCloseBeforeAccept.bind(this);
    this.socket.on('end', this._socketCloseHandler);
    this.socket.on('close', this._socketCloseHandler);
    
    this._resolved = false;
}

util.inherits(WebSocketRequest, EventEmitter);

WebSocketRequest.prototype.readHandshake = function() {
    var self = this;
    var request = this.httpRequest;

    // Decode URL
    this.resourceURL = url.parse(this.resource, true);

    this.host = request.headers['host'];
    if (!this.host) {
        throw new Error('Client must provide a Host header.');
    }

    this.key = request.headers['sec-websocket-key'];
    if (!this.key) {
        throw new Error('Client must provide a value for Sec-WebSocket-Key.');
    }

    this.webSocketVersion = parseInt(request.headers['sec-websocket-version'], 10);

    if (!this.webSocketVersion || isNaN(this.webSocketVersion)) {
        throw new Error('Client must provide a value for Sec-WebSocket-Version.');
    }

    switch (this.webSocketVersion) {
        case 8:
        case 13:
            break;
        default:
            var e = new Error('Unsupported websocket client version: ' + this.webSocketVersion +
                              'Only versions 8 and 13 are supported.');
            e.httpCode = 426;
            e.headers = {
                'Sec-WebSocket-Version': '13'
            };
            throw e;
    }

    if (this.webSocketVersion === 13) {
        this.origin = request.headers['origin'];
    }
    else if (this.webSocketVersion === 8) {
        this.origin = request.headers['sec-websocket-origin'];
    }

    // Protocol is optional.
    var protocolString = request.headers['sec-websocket-protocol'];
    this.protocolFullCaseMap = {};
    this.requestedProtocols = [];
    if (protocolString) {
        var requestedProtocolsFullCase = protocolString.split(headerValueSplitRegExp);
        requestedProtocolsFullCase.forEach(function(protocol) {
            var lcProtocol = protocol.toLocaleLowerCase();
            self.requestedProtocols.push(lcProtocol);
            self.protocolFullCaseMap[lcProtocol] = protocol;
        });
    }

    if (!this.serverConfig.ignoreXForwardedFor &&
        request.headers['x-forwarded-for']) {
        var immediatePeerIP = this.remoteAddress;
        this.remoteAddresses = request.headers['x-forwarded-for']
            .split(xForwardedForSeparatorRegExp);
        this.remoteAddresses.push(immediatePeerIP);
        this.remoteAddress = this.remoteAddresses[0];
    }

    // Extensions are optional.
    var extensionsString = request.headers['sec-websocket-extensions'];
    this.requestedExtensions = this.parseExtensions(extensionsString);

    // Cookies are optional
    var cookieString = request.headers['cookie'];
    this.cookies = this.parseCookies(cookieString);
};

WebSocketRequest.prototype.parseExtensions = function(extensionsString) {
    if (!extensionsString || extensionsString.length === 0) {
        return [];
    }
    var extensions = extensionsString.toLocaleLowerCase().split(headerValueSplitRegExp);
    extensions.forEach(function(extension, index, array) {
        var params = extension.split(headerParamSplitRegExp);
        var extensionName = params[0];
        var extensionParams = params.slice(1);
        extensionParams.forEach(function(rawParam, index, array) {
            var arr = rawParam.split('=');
            var obj = {
                name: arr[0],
                value: arr[1]
            };
            array.splice(index, 1, obj);
        });
        var obj = {
            name: extensionName,
            params: extensionParams
        };
        array.splice(index, 1, obj);
    });
    return extensions;
};

// This function adapted from node-cookie
// https://github.com/shtylman/node-cookie
WebSocketRequest.prototype.parseCookies = function(str) {
    // Sanity Check
    if (!str || typeof(str) !== 'string') {
        return [];
    }

    var cookies = [];
    var pairs = str.split(cookieSeparatorRegEx);

    pairs.forEach(function(pair) {
        var eq_idx = pair.indexOf('=');
        if (eq_idx === -1) {
            cookies.push({
                name: pair,
                value: null
            });
            return;
        }

        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();

        // quoted values
        if ('"' === val[0]) {
            val = val.slice(1, -1);
        }

        cookies.push({
            name: key,
            value: decodeURIComponent(val)
        });
    });

    return cookies;
};

WebSocketRequest.prototype.accept = function(acceptedProtocol, allowedOrigin, cookies) {
    this._verifyResolution();
    
    // TODO: Handle extensions

    var protocolFullCase;

    if (acceptedProtocol) {
        protocolFullCase = this.protocolFullCaseMap[acceptedProtocol.toLocaleLowerCase()];
        if (typeof(protocolFullCase) === 'undefined') {
            protocolFullCase = acceptedProtocol;
        }
    }
    else {
        protocolFullCase = acceptedProtocol;
    }
    this.protocolFullCaseMap = null;

    // Create key validation hash
    var sha1 = crypto.createHash('sha1');
    sha1.update(this.key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
    var acceptKey = sha1.digest('base64');

    var response = 'HTTP/1.1 101 Switching Protocols\r\n' +
                   'Upgrade: websocket\r\n' +
                   'Connection: Upgrade\r\n' +
                   'Sec-WebSocket-Accept: ' + acceptKey + '\r\n';

    if (protocolFullCase) {
        // validate protocol
        for (var i=0; i < protocolFullCase.length; i++) {
            var charCode = protocolFullCase.charCodeAt(i);
            var character = protocolFullCase.charAt(i);
            if (charCode < 0x21 || charCode > 0x7E || separators.indexOf(character) !== -1) {
                this.reject(500);
                throw new Error('Illegal character "' + String.fromCharCode(character) + '" in subprotocol.');
            }
        }
        if (this.requestedProtocols.indexOf(acceptedProtocol) === -1) {
            this.reject(500);
            throw new Error('Specified protocol was not requested by the client.');
        }

        protocolFullCase = protocolFullCase.replace(headerSanitizeRegExp, '');
        response += 'Sec-WebSocket-Protocol: ' + protocolFullCase + '\r\n';
    }
    this.requestedProtocols = null;

    if (allowedOrigin) {
        allowedOrigin = allowedOrigin.replace(headerSanitizeRegExp, '');
        if (this.webSocketVersion === 13) {
            response += 'Origin: ' + allowedOrigin + '\r\n';
        }
        else if (this.webSocketVersion === 8) {
            response += 'Sec-WebSocket-Origin: ' + allowedOrigin + '\r\n';
        }
    }

    if (cookies) {
        if (!Array.isArray(cookies)) {
            this.reject(500);
            throw new Error('Value supplied for "cookies" argument must be an array.');
        }
        var seenCookies = {};
        cookies.forEach(function(cookie) {
            if (!cookie.name || !cookie.value) {
                this.reject(500);
                throw new Error('Each cookie to set must at least provide a "name" and "value"');
            }

            // Make sure there are no \r\n sequences inserted
            cookie.name = cookie.name.replace(controlCharsAndSemicolonRegEx, '');
            cookie.value = cookie.value.replace(controlCharsAndSemicolonRegEx, '');

            if (seenCookies[cookie.name]) {
                this.reject(500);
                throw new Error('You may not specify the same cookie name twice.');
            }
            seenCookies[cookie.name] = true;

            // token (RFC 2616, Section 2.2)
            var invalidChar = cookie.name.match(cookieNameValidateRegEx);
            if (invalidChar) {
                this.reject(500);
                throw new Error('Illegal character ' + invalidChar[0] + ' in cookie name');
            }

            // RFC 6265, Section 4.1.1
            // *cookie-octet / ( DQUOTE *cookie-octet DQUOTE ) | %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
            if (cookie.value.match(cookieValueDQuoteValidateRegEx)) {
                invalidChar = cookie.value.slice(1, -1).match(cookieValueValidateRegEx);
            } else {
                invalidChar = cookie.value.match(cookieValueValidateRegEx);
            }
            if (invalidChar) {
                this.reject(500);
                throw new Error('Illegal character ' + invalidChar[0] + ' in cookie value');
            }

            var cookieParts = [cookie.name + '=' + cookie.value];

            // RFC 6265, Section 4.1.1
            // 'Path=' path-value | <any CHAR except CTLs or ';'>
            if(cookie.path){
                invalidChar = cookie.path.match(controlCharsAndSemicolonRegEx);
                if (invalidChar) {
                    this.reject(500);
                    throw new Error('Illegal character ' + invalidChar[0] + ' in cookie path');
                }
                cookieParts.push('Path=' + cookie.path);
            }

            // RFC 6265, Section 4.1.2.3
            // 'Domain=' subdomain
            if (cookie.domain) {
                if (typeof(cookie.domain) !== 'string') {
                    this.reject(500);
                    throw new Error('Domain must be specified and must be a string.');
                }
                invalidChar = cookie.domain.match(controlCharsAndSemicolonRegEx);
                if (invalidChar) {
                    this.reject(500);
                    throw new Error('Illegal character ' + invalidChar[0] + ' in cookie domain');
                }
                cookieParts.push('Domain=' + cookie.domain.toLowerCase());
            }

            // RFC 6265, Section 4.1.1
            //'Expires=' sane-cookie-date | Force Date object requirement by using only epoch
            if (cookie.expires) {
                if (!(cookie.expires instanceof Date)){
                    this.reject(500);
                    throw new Error('Value supplied for cookie "expires" must be a vaild date object');
                }
                cookieParts.push('Expires=' + cookie.expires.toGMTString());
            }

            // RFC 6265, Section 4.1.1
            //'Max-Age=' non-zero-digit *DIGIT
            if (cookie.maxage) {
                var maxage = cookie.maxage;
                if (typeof(maxage) === 'string') {
                    maxage = parseInt(maxage, 10);
                }
                if (isNaN(maxage) || maxage <= 0 ) {
                    this.reject(500);
                    throw new Error('Value supplied for cookie "maxage" must be a non-zero number');
                }
                maxage = Math.round(maxage);
                cookieParts.push('Max-Age=' + maxage.toString(10));
            }

            // RFC 6265, Section 4.1.1
            //'Secure;'
            if (cookie.secure) {
                if (typeof(cookie.secure) !== 'boolean') {
                    this.reject(500);
                    throw new Error('Value supplied for cookie "secure" must be of type boolean');
                }
                cookieParts.push('Secure');
            }

            // RFC 6265, Section 4.1.1
            //'HttpOnly;'
            if (cookie.httponly) {
                if (typeof(cookie.httponly) !== 'boolean') {
                    this.reject(500);
                    throw new Error('Value supplied for cookie "httponly" must be of type boolean');
                }
                cookieParts.push('HttpOnly');
            }

            response += ('Set-Cookie: ' + cookieParts.join(';') + '\r\n');
        }.bind(this));
    }

    // TODO: handle negotiated extensions
    // if (negotiatedExtensions) {
    //     response += 'Sec-WebSocket-Extensions: ' + negotiatedExtensions.join(', ') + '\r\n';
    // }
    
    // Mark the request resolved now so that the user can't call accept or
    // reject a second time.
    this._resolved = true;
    this.emit('requestResolved', this);
    
    response += '\r\n';

    var connection = new WebSocketConnection(this.socket, [], acceptedProtocol, false, this.serverConfig);
    connection.webSocketVersion = this.webSocketVersion;
    connection.remoteAddress = this.remoteAddress;
    connection.remoteAddresses = this.remoteAddresses;
    
    var self = this;
    
    if (this._socketIsClosing) {
        // Handle case when the client hangs up before we get a chance to
        // accept the connection and send our side of the opening handshake.
        cleanupFailedConnection(connection);
    }
    else {
        this.socket.write(response, 'ascii', function(error) {
            if (error) {
                cleanupFailedConnection(connection);
                return;
            }
            
            self._removeSocketCloseListeners();
            connection._addSocketEventListeners();
        });
    }

    this.emit('requestAccepted', connection);
    return connection;
};

WebSocketRequest.prototype.reject = function(status, reason, extraHeaders) {
    this._verifyResolution();
    
    // Mark the request resolved now so that the user can't call accept or
    // reject a second time.
    this._resolved = true;
    this.emit('requestResolved', this);
    
    if (typeof(status) !== 'number') {
        status = 403;
    }
    var response = 'HTTP/1.1 ' + status + ' ' + httpStatusDescriptions[status] + '\r\n' +
                   'Connection: close\r\n';
    if (reason) {
        reason = reason.replace(headerSanitizeRegExp, '');
        response += 'X-WebSocket-Reject-Reason: ' + reason + '\r\n';
    }

    if (extraHeaders) {
        for (var key in extraHeaders) {
            var sanitizedValue = extraHeaders[key].toString().replace(headerSanitizeRegExp, '');
            var sanitizedKey = key.replace(headerSanitizeRegExp, '');
            response += (sanitizedKey + ': ' + sanitizedValue + '\r\n');
        }
    }

    response += '\r\n';
    this.socket.end(response, 'ascii');

    this.emit('requestRejected', this);
};

WebSocketRequest.prototype._handleSocketCloseBeforeAccept = function() {
    this._socketIsClosing = true;
    this._removeSocketCloseListeners();
};

WebSocketRequest.prototype._removeSocketCloseListeners = function() {
    this.socket.removeListener('end', this._socketCloseHandler);
    this.socket.removeListener('close', this._socketCloseHandler);
};

WebSocketRequest.prototype._verifyResolution = function() {
    if (this._resolved) {
        throw new Error('WebSocketRequest may only be accepted or rejected one time.');
    }
};

function cleanupFailedConnection(connection) {
    // Since we have to return a connection object even if the socket is
    // already dead in order not to break the API, we schedule a 'close'
    // event on the connection object to occur immediately.
    process.nextTick(function() {
        // WebSocketConnection.CLOSE_REASON_ABNORMAL = 1006
        // Third param: Skip sending the close frame to a dead socket
        connection.drop(1006, 'TCP connection lost before handshake completed.', true);
    });
}

module.exports = WebSocketRequest;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Emitter = __webpack_require__(4);

var _Emitter2 = _interopRequireDefault(_Emitter);

var _stompjs = __webpack_require__(20);

var _stompjs2 = _interopRequireDefault(_stompjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(connectionUrl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, _class);

    this.format = opts.format && opts.format.toLowerCase();

    if (connectionUrl.startsWith('//')) {
      var scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      connectionUrl = scheme + '://' + connectionUrl;
    }

    this.connectionUrl = connectionUrl;
    this.opts = opts;

    this.reconnection = this.opts.reconnection || false;
    this.reconnectionAttempts = this.opts.reconnectionAttempts || Infinity;
    this.reconnectionDelay = this.opts.reconnectionDelay || 1000;
    this.reconnectTimeoutId = 0;
    this.reconnectionCount = 0;

    this.passToStoreHandler = this.opts.passToStoreHandler || false;

    this.connect(connectionUrl, opts);

    if (opts.store) {
      this.store = opts.store;
    }
    if (opts.mutations) {
      this.mutations = opts.mutations;
    }
  }

  _createClass(_class, [{
    key: 'connect',
    value: function connect(connectionUrl) {
      var _this = this;

      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var password = opts.headers && opts.headers.password || '';
      var login = opts.headers && opts.headers.login || '';
      var vhost = opts.headers && opts.headers.vhost || '';
      var subscribes = opts.subscribes || {};
      var debug = opts.debug || false;
      this.WebSocket = opts.WebSocket || _stompjs2.default.client(connectionUrl);
      this.WebSocket.debug = debug;
      var onConnect = function onConnect() {
        Object.keys(subscribes).forEach(function (key) {
          _this.WebSocket.subscribe(key, subscribes[key]);
        });
        _Emitter2.default.emit('onConnect', 'onConnect');
        if (_this.store) {
          _this.passToStore('SOCKET_ON_CONNECT', true);
        }
      };
      var onError = function onError() {
        _Emitter2.default.emit('onError', 'onError');
        if (_this.store) {
          _this.passToStore('SOCKET_ON_ERROR', true);
        }
      };
      this.WebSocket.connect(login, password, onConnect, onError, vhost);
      if (this.format === 'json') {
        if (!('sendObj' in this.WebSocket)) {
          this.WebSocket.sendObj = function (obj) {
            return _this.WebSocket.send(JSON.stringify(obj));
          };
        }
      }
      return this.WebSocket;
    }
  }, {
    key: 'reconnect',
    value: function reconnect() {
      var _this2 = this;

      if (this.reconnectionCount <= this.reconnectionAttempts) {
        this.reconnectionCount++;
        clearTimeout(this.reconnectTimeoutId);

        this.reconnectTimeoutId = setTimeout(function () {
          if (_this2.store) {
            _this2.passToStore('SOCKET_RECONNECT', _this2.reconnectionCount);
          }

          _this2.connect(_this2.connectionUrl, _this2.opts);
          _this2.onEvent();
        }, this.reconnectionDelay);
      } else {
        if (this.store) {
          this.passToStore('SOCKET_RECONNECT_ERROR', true);
        }
      }
    }
  }, {
    key: 'onEvent',
    value: function onEvent() {
      var _this3 = this;

      ;['onmessage', 'onclose', 'onerror', 'onopen'].forEach(function (eventType) {
        _this3.WebSocket[eventType] = function (event) {
          _Emitter2.default.emit(eventType, event);

          if (_this3.store) {
            _this3.passToStore('SOCKET_' + eventType, event);
          }

          if (_this3.reconnection && eventType === 'onopen') {
            _this3.opts.$setInstance(event.currentTarget);
            _this3.reconnectionCount = 0;
          }

          if (_this3.reconnection && eventType === 'onclose') {
            _this3.reconnect();
          }
        };
      });
    }
  }, {
    key: 'passToStore',
    value: function passToStore(eventName, event) {
      if (this.passToStoreHandler) {
        this.passToStoreHandler(eventName, event, this.defaultPassToStore.bind(this));
      } else {
        this.defaultPassToStore(eventName, event);
      }
    }
  }, {
    key: 'defaultPassToStore',
    value: function defaultPassToStore(eventName, event) {
      if (!eventName.startsWith('SOCKET_')) {
        return;
      }
      var method = 'commit';
      var target = eventName.toUpperCase();
      var msg = event;
      if (this.format === 'json' && event.data) {
        msg = JSON.parse(event.data);
        if (msg.mutation) {
          target = [msg.namespace || '', msg.mutation].filter(function (e) {
            return !!e;
          }).join('/');
        } else if (msg.action) {
          method = 'dispatch';
          target = [msg.namespace || '', msg.action].filter(function (e) {
            return !!e;
          }).join('/');
        }
      }
      if (this.mutations) {
        target = this.mutations[target] || target;
      }
      this.store[method](target, msg);
    }
  }]);

  return _class;
}();

exports.default = _class;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Observer = __webpack_require__(14);

var _Observer2 = _interopRequireDefault(_Observer);

var _Emitter = __webpack_require__(4);

var _Emitter2 = _interopRequireDefault(_Emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VueSWS = {};
VueSWS.install = function (Vue) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var observer = null;
  var connection = opts.url || null;
  opts.$setInstance = function (wsInstance) {
    Vue.prototype.$swSocket = wsInstance;
  };

  if (opts.connectManually) {
    Vue.prototype.$connect = function () {
      var connectionUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : connection;
      var connectionOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : opts;

      observer = new _Observer2.default(connectionUrl, connectionOpts);
      Vue.prototype.$swSocket = observer.WebSocket;
    };

    Vue.prototype.$disconnect = function () {
      if (observer && observer.reconnection) {
        observer.reconnection = false;
      }
      if (Vue.prototype.$swSocket) {
        Vue.prototype.$swSocket.close();
        delete Vue.prototype.$swSocket;
      }
    };
  } else {
    if (!connection) {
      throw new Error('[vuejs-stomp-ws] cannot locate connection');
    }
    observer = new _Observer2.default(connection, opts);
    Vue.prototype.$swSocket = observer.WebSocket;
  }
  var hasProxy = typeof Proxy !== 'undefined' && typeof Proxy === 'function' && /native code/.test(Proxy.toString());

  Vue.mixin({
    created: function created() {
      var _this = this;

      var vm = this;
      var sockets = this.$options['sockets'];
      if (hasProxy) {
        this.$options.sockets = new Proxy({}, {
          set: function set(target, key, value) {
            _Emitter2.default.addListener(key, value, vm);
            target[key] = value;
            return true;
          },
          deleteProperty: function deleteProperty(target, key) {
            _Emitter2.default.removeListener(key, vm.$options.sockets[key], vm);
            delete target.key;
            return true;
          }
        });
        if (sockets) {
          Object.keys(sockets).forEach(function (key) {
            _this.$options.sockets[key] = sockets[key];
          });
        }
      } else {
        Object.seal(this.$options.sockets);
        // if !hasProxy need addListener
        if (sockets) {
          Object.keys(sockets).forEach(function (key) {
            _Emitter2.default.addListener(key, sockets[key], vm);
          });
        }
      }
    },
    beforeDestroy: function beforeDestroy() {
      var _this2 = this;

      if (hasProxy) {
        var sockets = this.$options['sockets'];

        if (sockets) {
          Object.keys(sockets).forEach(function (key) {
            delete _this2.$options.sockets[key];
          });
        }
      }
    }
  });
};

// Auto-install
var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(VueSWS);
}

exports.default = VueSWS;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(5);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(44);
var util = __webpack_require__(1);

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(5);
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(41);
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(12);
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports      = isTypedArray
isTypedArray.strict = isStrictTypedArray
isTypedArray.loose  = isLooseTypedArray

var toString = Object.prototype.toString
var names = {
    '[object Int8Array]': true
  , '[object Int16Array]': true
  , '[object Int32Array]': true
  , '[object Uint8Array]': true
  , '[object Uint8ClampedArray]': true
  , '[object Uint16Array]': true
  , '[object Uint32Array]': true
  , '[object Float32Array]': true
  , '[object Float64Array]': true
}

function isTypedArray(arr) {
  return (
       isStrictTypedArray(arr)
    || isLooseTypedArray(arr)
  )
}

function isStrictTypedArray(arr) {
  return (
       arr instanceof Int8Array
    || arr instanceof Int16Array
    || arr instanceof Int32Array
    || arr instanceof Uint8Array
    || arr instanceof Uint8ClampedArray
    || arr instanceof Uint16Array
    || arr instanceof Uint32Array
    || arr instanceof Float32Array
    || arr instanceof Float64Array
  )
}

function isLooseTypedArray(arr) {
  return names[toString.call(arr)]
}


/***/ }),
/* 19 */
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

// Copyright (C) 2013 [Jeff Mesnil](http://jmesnil.net/)
//
//   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0
//
// The library can be used in node.js app to connect to STOMP brokers over TCP 
// or Web sockets.

// Root of the `stompjs module`

var Stomp = __webpack_require__(7);
var StompNode = __webpack_require__(21);

module.exports = Stomp.Stomp;
module.exports.overTCP = StompNode.overTCP;
module.exports.overWS = StompNode.overWS;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.7.1

/*
   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0

   Copyright (C) 2013 [Jeff Mesnil](http://jmesnil.net/)
 */

(function() {
  var Stomp, net, overTCP, overWS, wrapTCP, wrapWS;

  Stomp = __webpack_require__(7);

  net = __webpack_require__(12);

  Stomp.Stomp.setInterval = function(interval, f) {
    return setInterval(f, interval);
  };

  Stomp.Stomp.clearInterval = function(id) {
    return clearInterval(id);
  };

  wrapTCP = function(port, host) {
    var socket, ws;
    socket = null;
    ws = {
      url: 'tcp:// ' + host + ':' + port,
      send: function(d) {
        return socket.write(d);
      },
      close: function() {
        return socket.end();
      }
    };
    socket = net.connect(port, host, function(e) {
      return ws.onopen();
    });
    socket.on('error', function(e) {
      return typeof ws.onclose === "function" ? ws.onclose(e) : void 0;
    });
    socket.on('close', function(e) {
      return typeof ws.onclose === "function" ? ws.onclose(e) : void 0;
    });
    socket.on('data', function(data) {
      var event;
      event = {
        'data': data.toString()
      };
      return ws.onmessage(event);
    });
    return ws;
  };

  wrapWS = function(url) {
    var WebSocketClient, connection, socket, ws;
    WebSocketClient = __webpack_require__(23).client;
    connection = null;
    ws = {
      url: url,
      send: function(d) {
        return connection.sendUTF(d);
      },
      close: function() {
        return connection.close();
      }
    };
    socket = new WebSocketClient();
    socket.on('connect', function(conn) {
      connection = conn;
      ws.onopen();
      connection.on('error', function(error) {
        return typeof ws.onclose === "function" ? ws.onclose(error) : void 0;
      });
      connection.on('close', function() {
        return typeof ws.onclose === "function" ? ws.onclose() : void 0;
      });
      return connection.on('message', function(message) {
        var event;
        if (message.type === 'utf8') {
          event = {
            'data': message.utf8Data
          };
          return ws.onmessage(event);
        }
      });
    });
    socket.connect(url);
    return ws;
  };

  overTCP = function(host, port) {
    var socket;
    socket = wrapTCP(port, host);
    return Stomp.Stomp.over(socket);
  };

  overWS = function(url) {
    var socket;
    socket = wrapWS(url);
    return Stomp.Stomp.over(socket);
  };

  exports.overTCP = overTCP;

  exports.overWS = overWS;

}).call(this);


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Convert a typed array to a Buffer without a copy
 *
 * Author:   Feross Aboukhadijeh <https://feross.org>
 * License:  MIT
 *
 * `npm install typedarray-to-buffer`
 */

var isTypedArray = __webpack_require__(18).strict

module.exports = function typedarrayToBuffer (arr) {
  if (isTypedArray(arr)) {
    // To avoid a copy, use the typed array's underlying ArrayBuffer to back new Buffer
    var buf = Buffer.from(arr.buffer)
    if (arr.byteLength !== arr.buffer.byteLength) {
      // Respect the "view", i.e. byteOffset and byteLength, without doing a copy
      buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
    }
    return buf
  } else {
    // Pass through all other types to `Buffer.from`
    return Buffer.from(arr)
  }
}


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(34);

/***/ }),
/* 24 */
/***/ (function(module, exports) {

/*!
 * Copied from:
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

/* jshint -W086 */

module.exports.BufferUtil = {
  merge: function(mergedBuffer, buffers) {
    var offset = 0;
    for (var i = 0, l = buffers.length; i < l; ++i) {
      var buf = buffers[i];
      buf.copy(mergedBuffer, offset);
      offset += buf.length;
    }
  },
  mask: function(source, mask, output, offset, length) {
    var maskNum = mask.readUInt32LE(0);
    var i = 0;
    for (; i < length - 3; i += 4) {
      var num = maskNum ^ source.readUInt32LE(i);
      if (num < 0) { num = 4294967296 + num; }
      output.writeUInt32LE(num, offset + i);
    }
    switch (length % 4) {
      case 3: output[offset + i + 2] = source[i + 2] ^ mask[2];
      case 2: output[offset + i + 1] = source[i + 1] ^ mask[1];
      case 1: output[offset + i] = source[i] ^ mask[0];
      case 0:
    }
  },
  unmask: function(data, mask) {
    var maskNum = mask.readUInt32LE(0);
    var length = data.length;
    var i = 0;
    for (; i < length - 3; i += 4) {
      var num = maskNum ^ data.readUInt32LE(i);
      if (num < 0) { num = 4294967296 + num; }
      data.writeUInt32LE(num, i);
    }
    switch (length % 4) {
      case 3: data[i + 2] = data[i + 2] ^ mask[2];
      case 2: data[i + 1] = data[i + 1] ^ mask[1];
      case 1: data[i] = data[i] ^ mask[0];
      case 0:
    }
  }
};

/* jshint +W086 */

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * Copied from:
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

try {
  module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../build/Release/bufferutil\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
} catch (e) { try {
  module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../build/default/bufferutil\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
} catch (e) { try {
  module.exports = __webpack_require__(24);
} catch (e) {
  console.error('bufferutil.node seems to not have been built. Run npm install.');
  throw e;
}}}


/***/ }),
/* 26 */
/***/ (function(module, exports) {

/************************************************************************
 *  Copyright 2010-2015 Brian McKelvey.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var Deprecation = {
    disableWarnings: false,

    deprecationWarningMap: {

    },

    warn: function(deprecationName) {
        if (!this.disableWarnings && this.deprecationWarningMap[deprecationName]) {
            console.warn('DEPRECATION WARNING: ' + this.deprecationWarningMap[deprecationName]);
            this.deprecationWarningMap[deprecationName] = false;
        }
    }
};

module.exports = Deprecation;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

/*!
 * UTF-8 Validation Fallback Code originally from:
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

module.exports.Validation = {
  isValidUTF8: function() {
    return true;
  }
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * UTF-8 Validation Code originally from:
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

try {
    module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../build/Release/validation\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
} catch (e) { try {
    module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../build/default/validation\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
} catch (e) { try {
    module.exports = __webpack_require__(27);
} catch (e) {
    console.error('validation.node seems not to have been built. Run npm install.');
    throw e;
}}}


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

/************************************************************************
 *  Copyright 2010-2015 Brian McKelvey.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var WebSocketClient = __webpack_require__(8);
var toBuffer = __webpack_require__(22);
var yaeti = __webpack_require__(37);


const CONNECTING = 0;
const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;


module.exports = W3CWebSocket;


function W3CWebSocket(url, protocols, origin, headers, requestOptions, clientConfig) {
    // Make this an EventTarget.
    yaeti.EventTarget.call(this);

    // Sanitize clientConfig.
    clientConfig = clientConfig || {};
    clientConfig.assembleFragments = true;  // Required in the W3C API.

    var self = this;

    this._url = url;
    this._readyState = CONNECTING;
    this._protocol = undefined;
    this._extensions = '';
    this._bufferedAmount = 0;  // Hack, always 0.
    this._binaryType = 'arraybuffer';  // TODO: Should be 'blob' by default, but Node has no Blob.

    // The WebSocketConnection instance.
    this._connection = undefined;

    // WebSocketClient instance.
    this._client = new WebSocketClient(clientConfig);

    this._client.on('connect', function(connection) {
        onConnect.call(self, connection);
    });

    this._client.on('connectFailed', function() {
        onConnectFailed.call(self);
    });

    this._client.connect(url, protocols, origin, headers, requestOptions);
}


// Expose W3C read only attributes.
Object.defineProperties(W3CWebSocket.prototype, {
    url:            { get: function() { return this._url;            } },
    readyState:     { get: function() { return this._readyState;     } },
    protocol:       { get: function() { return this._protocol;       } },
    extensions:     { get: function() { return this._extensions;     } },
    bufferedAmount: { get: function() { return this._bufferedAmount; } }
});


// Expose W3C write/read attributes.
Object.defineProperties(W3CWebSocket.prototype, {
    binaryType: {
        get: function() {
            return this._binaryType;
        },
        set: function(type) {
            // TODO: Just 'arraybuffer' supported.
            if (type !== 'arraybuffer') {
                throw new SyntaxError('just "arraybuffer" type allowed for "binaryType" attribute');
            }
            this._binaryType = type;
        }
    }
});


// Expose W3C readyState constants into the WebSocket instance as W3C states.
[['CONNECTING',CONNECTING], ['OPEN',OPEN], ['CLOSING',CLOSING], ['CLOSED',CLOSED]].forEach(function(property) {
    Object.defineProperty(W3CWebSocket.prototype, property[0], {
        get: function() { return property[1]; }
    });
});

// Also expose W3C readyState constants into the WebSocket class (not defined by the W3C,
// but there are so many libs relying on them).
[['CONNECTING',CONNECTING], ['OPEN',OPEN], ['CLOSING',CLOSING], ['CLOSED',CLOSED]].forEach(function(property) {
    Object.defineProperty(W3CWebSocket, property[0], {
        get: function() { return property[1]; }
    });
});


W3CWebSocket.prototype.send = function(data) {
    if (this._readyState !== OPEN) {
        throw new Error('cannot call send() while not connected');
    }

    // Text.
    if (typeof data === 'string' || data instanceof String) {
        this._connection.sendUTF(data);
    }
    // Binary.
    else {
        // Node Buffer.
        if (data instanceof Buffer) {
            this._connection.sendBytes(data);
        }
        // If ArrayBuffer or ArrayBufferView convert it to Node Buffer.
        else if (data.byteLength || data.byteLength === 0) {
            data = toBuffer(data);
            this._connection.sendBytes(data);
        }
        else {
            throw new Error('unknown binary data:', data);
        }
    }
};


W3CWebSocket.prototype.close = function(code, reason) {
    switch(this._readyState) {
        case CONNECTING:
            // NOTE: We don't have the WebSocketConnection instance yet so no
            // way to close the TCP connection.
            // Artificially invoke the onConnectFailed event.
            onConnectFailed.call(this);
            // And close if it connects after a while.
            this._client.on('connect', function(connection) {
                if (code) {
                    connection.close(code, reason);
                } else {
                    connection.close();
                }
            });
            break;
        case OPEN:
            this._readyState = CLOSING;
            if (code) {
                this._connection.close(code, reason);
            } else {
                this._connection.close();
            }
            break;
        case CLOSING:
        case CLOSED:
            break;
    }
};


/**
 * Private API.
 */


function createCloseEvent(code, reason) {
    var event = new yaeti.Event('close');

    event.code = code;
    event.reason = reason;
    event.wasClean = (typeof code === 'undefined' || code === 1000);

    return event;
}


function createMessageEvent(data) {
    var event = new yaeti.Event('message');

    event.data = data;

    return event;
}


function onConnect(connection) {
    var self = this;

    this._readyState = OPEN;
    this._connection = connection;
    this._protocol = connection.protocol;
    this._extensions = connection.extensions;

    this._connection.on('close', function(code, reason) {
        onClose.call(self, code, reason);
    });

    this._connection.on('message', function(msg) {
        onMessage.call(self, msg);
    });

    this.dispatchEvent(new yaeti.Event('open'));
}


function onConnectFailed() {
    destroy.call(this);
    this._readyState = CLOSED;

    try {
        this.dispatchEvent(new yaeti.Event('error'));
    } finally {
        this.dispatchEvent(createCloseEvent(1006, 'connection failed'));
    }
}


function onClose(code, reason) {
    destroy.call(this);
    this._readyState = CLOSED;

    this.dispatchEvent(createCloseEvent(code, reason || ''));
}


function onMessage(message) {
    if (message.utf8Data) {
        this.dispatchEvent(createMessageEvent(message.utf8Data));
    }
    else if (message.binaryData) {
        // Must convert from Node Buffer to ArrayBuffer.
        // TODO: or to a Blob (which does not exist in Node!).
        if (this.binaryType === 'arraybuffer') {
            var buffer = message.binaryData;
            var arraybuffer = new ArrayBuffer(buffer.length);
            var view = new Uint8Array(arraybuffer);
            for (var i=0, len=buffer.length; i<len; ++i) {
                view[i] = buffer[i];
            }
            this.dispatchEvent(createMessageEvent(arraybuffer));
        }
    }
}


function destroy() {
    this._client.removeAllListeners();
    if (this._connection) {
        this._connection.removeAllListeners();
    }
}


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

/************************************************************************
 *  Copyright 2010-2015 Brian McKelvey.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var extend = __webpack_require__(2).extend;
var util = __webpack_require__(1);
var EventEmitter = __webpack_require__(0).EventEmitter;
var WebSocketRouterRequest = __webpack_require__(31);

function WebSocketRouter(config) {
    // Superclass Constructor
    EventEmitter.call(this);

    this.config = {
        // The WebSocketServer instance to attach to.
        server: null
    };
    if (config) {
        extend(this.config, config);
    }
    this.handlers = [];

    this._requestHandler = this.handleRequest.bind(this);
    if (this.config.server) {
        this.attachServer(this.config.server);
    }
}

util.inherits(WebSocketRouter, EventEmitter);

WebSocketRouter.prototype.attachServer = function(server) {
    if (server) {
        this.server = server;
        this.server.on('request', this._requestHandler);
    }
    else {
        throw new Error('You must specify a WebSocketServer instance to attach to.');
    }
};

WebSocketRouter.prototype.detachServer = function() {
    if (this.server) {
        this.server.removeListener('request', this._requestHandler);
        this.server = null;
    }
    else {
        throw new Error('Cannot detach from server: not attached.');
    }
};

WebSocketRouter.prototype.mount = function(path, protocol, callback) {
    if (!path) {
        throw new Error('You must specify a path for this handler.');
    }
    if (!protocol) {
        protocol = '____no_protocol____';
    }
    if (!callback) {
        throw new Error('You must specify a callback for this handler.');
    }

    path = this.pathToRegExp(path);
    if (!(path instanceof RegExp)) {
        throw new Error('Path must be specified as either a string or a RegExp.');
    }
    var pathString = path.toString();

    // normalize protocol to lower-case
    protocol = protocol.toLocaleLowerCase();

    if (this.findHandlerIndex(pathString, protocol) !== -1) {
        throw new Error('You may only mount one handler per path/protocol combination.');
    }

    this.handlers.push({
        'path': path,
        'pathString': pathString,
        'protocol': protocol,
        'callback': callback
    });
};
WebSocketRouter.prototype.unmount = function(path, protocol) {
    var index = this.findHandlerIndex(this.pathToRegExp(path).toString(), protocol);
    if (index !== -1) {
        this.handlers.splice(index, 1);
    }
    else {
        throw new Error('Unable to find a route matching the specified path and protocol.');
    }
};

WebSocketRouter.prototype.findHandlerIndex = function(pathString, protocol) {
    protocol = protocol.toLocaleLowerCase();
    for (var i=0, len=this.handlers.length; i < len; i++) {
        var handler = this.handlers[i];
        if (handler.pathString === pathString && handler.protocol === protocol) {
            return i;
        }
    }
    return -1;
};

WebSocketRouter.prototype.pathToRegExp = function(path) {
    if (typeof(path) === 'string') {
        if (path === '*') {
            path = /^.*$/;
        }
        else {
            path = path.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            path = new RegExp('^' + path + '$');
        }
    }
    return path;
};

WebSocketRouter.prototype.handleRequest = function(request) {
    var requestedProtocols = request.requestedProtocols;
    if (requestedProtocols.length === 0) {
        requestedProtocols = ['____no_protocol____'];
    }

    // Find a handler with the first requested protocol first
    for (var i=0; i < requestedProtocols.length; i++) {
        var requestedProtocol = requestedProtocols[i].toLocaleLowerCase();

        // find the first handler that can process this request
        for (var j=0, len=this.handlers.length; j < len; j++) {
            var handler = this.handlers[j];
            if (handler.path.test(request.resourceURL.pathname)) {
                if (requestedProtocol === handler.protocol ||
                    handler.protocol === '*')
                {
                    var routerRequest = new WebSocketRouterRequest(request, requestedProtocol);
                    handler.callback(routerRequest);
                    return;
                }
            }
        }
    }

    // If we get here we were unable to find a suitable handler.
    request.reject(404, 'No handler is available for the given request.');
};

module.exports = WebSocketRouter;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

/************************************************************************
 *  Copyright 2010-2015 Brian McKelvey.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var util = __webpack_require__(1);
var EventEmitter = __webpack_require__(0).EventEmitter;

function WebSocketRouterRequest(webSocketRequest, resolvedProtocol) {
    // Superclass Constructor
    EventEmitter.call(this);

    this.webSocketRequest = webSocketRequest;
    if (resolvedProtocol === '____no_protocol____') {
        this.protocol = null;
    }
    else {
        this.protocol = resolvedProtocol;
    }
    this.origin = webSocketRequest.origin;
    this.resource = webSocketRequest.resource;
    this.resourceURL = webSocketRequest.resourceURL;
    this.httpRequest = webSocketRequest.httpRequest;
    this.remoteAddress = webSocketRequest.remoteAddress;
    this.webSocketVersion = webSocketRequest.webSocketVersion;
    this.requestedExtensions = webSocketRequest.requestedExtensions;
    this.cookies = webSocketRequest.cookies;
}

util.inherits(WebSocketRouterRequest, EventEmitter);

WebSocketRouterRequest.prototype.accept = function(origin, cookies) {
    var connection = this.webSocketRequest.accept(this.protocol, origin, cookies);
    this.emit('requestAccepted', connection);
    return connection;
};

WebSocketRouterRequest.prototype.reject = function(status, reason, extraHeaders) {
    this.webSocketRequest.reject(status, reason, extraHeaders);
    this.emit('requestRejected', this);
};

module.exports = WebSocketRouterRequest;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

/************************************************************************
 *  Copyright 2010-2015 Brian McKelvey.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var extend = __webpack_require__(2).extend;
var utils = __webpack_require__(2);
var util = __webpack_require__(1);
var debug = __webpack_require__(6)('websocket:server');
var EventEmitter = __webpack_require__(0).EventEmitter;
var WebSocketRequest = __webpack_require__(10);

var WebSocketServer = function WebSocketServer(config) {
    // Superclass Constructor
    EventEmitter.call(this);

    this._handlers = {
        upgrade: this.handleUpgrade.bind(this),
        requestAccepted: this.handleRequestAccepted.bind(this),
        requestResolved: this.handleRequestResolved.bind(this)
    };
    this.connections = [];
    this.pendingRequests = [];
    if (config) {
        this.mount(config);
    }
};

util.inherits(WebSocketServer, EventEmitter);

WebSocketServer.prototype.mount = function(config) {
    this.config = {
        // The http server instance to attach to.  Required.
        httpServer: null,

        // 64KiB max frame size.
        maxReceivedFrameSize: 0x10000,

        // 1MiB max message size, only applicable if
        // assembleFragments is true
        maxReceivedMessageSize: 0x100000,

        // Outgoing messages larger than fragmentationThreshold will be
        // split into multiple fragments.
        fragmentOutgoingMessages: true,

        // Outgoing frames are fragmented if they exceed this threshold.
        // Default is 16KiB
        fragmentationThreshold: 0x4000,

        // If true, the server will automatically send a ping to all
        // clients every 'keepaliveInterval' milliseconds.  The timer is
        // reset on any received data from the client.
        keepalive: true,

        // The interval to send keepalive pings to connected clients if the
        // connection is idle.  Any received data will reset the counter.
        keepaliveInterval: 20000,

        // If true, the server will consider any connection that has not
        // received any data within the amount of time specified by
        // 'keepaliveGracePeriod' after a keepalive ping has been sent to
        // be dead, and will drop the connection.
        // Ignored if keepalive is false.
        dropConnectionOnKeepaliveTimeout: true,

        // The amount of time to wait after sending a keepalive ping before
        // closing the connection if the connected peer does not respond.
        // Ignored if keepalive is false.
        keepaliveGracePeriod: 10000,

        // Whether to use native TCP keep-alive instead of WebSockets ping
        // and pong packets.  Native TCP keep-alive sends smaller packets
        // on the wire and so uses bandwidth more efficiently.  This may
        // be more important when talking to mobile devices.
        // If this value is set to true, then these values will be ignored:
        //   keepaliveGracePeriod
        //   dropConnectionOnKeepaliveTimeout
        useNativeKeepalive: false,

        // If true, fragmented messages will be automatically assembled
        // and the full message will be emitted via a 'message' event.
        // If false, each frame will be emitted via a 'frame' event and
        // the application will be responsible for aggregating multiple
        // fragmented frames.  Single-frame messages will emit a 'message'
        // event in addition to the 'frame' event.
        // Most users will want to leave this set to 'true'
        assembleFragments: true,

        // If this is true, websocket connections will be accepted
        // regardless of the path and protocol specified by the client.
        // The protocol accepted will be the first that was requested
        // by the client.  Clients from any origin will be accepted.
        // This should only be used in the simplest of cases.  You should
        // probably leave this set to 'false' and inspect the request
        // object to make sure it's acceptable before accepting it.
        autoAcceptConnections: false,

        // Whether or not the X-Forwarded-For header should be respected.
        // It's important to set this to 'true' when accepting connections
        // from untrusted clients, as a malicious client could spoof its
        // IP address by simply setting this header.  It's meant to be added
        // by a trusted proxy or other intermediary within your own
        // infrastructure.
        // See:  http://en.wikipedia.org/wiki/X-Forwarded-For
        ignoreXForwardedFor: false,

        // The Nagle Algorithm makes more efficient use of network resources
        // by introducing a small delay before sending small packets so that
        // multiple messages can be batched together before going onto the
        // wire.  This however comes at the cost of latency, so the default
        // is to disable it.  If you don't need low latency and are streaming
        // lots of small messages, you can change this to 'false'
        disableNagleAlgorithm: true,

        // The number of milliseconds to wait after sending a close frame
        // for an acknowledgement to come back before giving up and just
        // closing the socket.
        closeTimeout: 5000
    };
    extend(this.config, config);

    if (this.config.httpServer) {
        if (!Array.isArray(this.config.httpServer)) {
            this.config.httpServer = [this.config.httpServer];
        }
        var upgradeHandler = this._handlers.upgrade;
        this.config.httpServer.forEach(function(httpServer) {
            httpServer.on('upgrade', upgradeHandler);
        });
    }
    else {
        throw new Error('You must specify an httpServer on which to mount the WebSocket server.');
    }
};

WebSocketServer.prototype.unmount = function() {
    var upgradeHandler = this._handlers.upgrade;
    this.config.httpServer.forEach(function(httpServer) {
        httpServer.removeListener('upgrade', upgradeHandler);
    });
};

WebSocketServer.prototype.closeAllConnections = function() {
    this.connections.forEach(function(connection) {
        connection.close();
    });
    this.pendingRequests.forEach(function(request) {
        process.nextTick(function() {
          request.reject(503); // HTTP 503 Service Unavailable
        });
    });
};

WebSocketServer.prototype.broadcast = function(data) {
    if (Buffer.isBuffer(data)) {
        this.broadcastBytes(data);
    }
    else if (typeof(data.toString) === 'function') {
        this.broadcastUTF(data);
    }
};

WebSocketServer.prototype.broadcastUTF = function(utfData) {
    this.connections.forEach(function(connection) {
        connection.sendUTF(utfData);
    });
};

WebSocketServer.prototype.broadcastBytes = function(binaryData) {
    this.connections.forEach(function(connection) {
        connection.sendBytes(binaryData);
    });
};

WebSocketServer.prototype.shutDown = function() {
    this.unmount();
    this.closeAllConnections();
};

WebSocketServer.prototype.handleUpgrade = function(request, socket) {
    var wsRequest = new WebSocketRequest(socket, request, this.config);
    try {
        wsRequest.readHandshake();
    }
    catch(e) {
        wsRequest.reject(
            e.httpCode ? e.httpCode : 400,
            e.message,
            e.headers
        );
        debug('Invalid handshake: %s', e.message);
        return;
    }
    
    this.pendingRequests.push(wsRequest);

    wsRequest.once('requestAccepted', this._handlers.requestAccepted);
    wsRequest.once('requestResolved', this._handlers.requestResolved);

    if (!this.config.autoAcceptConnections && utils.eventEmitterListenerCount(this, 'request') > 0) {
        this.emit('request', wsRequest);
    }
    else if (this.config.autoAcceptConnections) {
        wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
    }
    else {
        wsRequest.reject(404, 'No handler is configured to accept the connection.');
    }
};

WebSocketServer.prototype.handleRequestAccepted = function(connection) {
    var self = this;
    connection.once('close', function(closeReason, description) {
        self.handleConnectionClose(connection, closeReason, description);
    });
    this.connections.push(connection);
    this.emit('connect', connection);
};

WebSocketServer.prototype.handleConnectionClose = function(connection, closeReason, description) {
    var index = this.connections.indexOf(connection);
    if (index !== -1) {
        this.connections.splice(index, 1);
    }
    this.emit('close', connection, closeReason, description);
};

WebSocketServer.prototype.handleRequestResolved = function(request) {
    var index = this.pendingRequests.indexOf(request);
    if (index !== -1) { this.pendingRequests.splice(index, 1); }
};

module.exports = WebSocketServer;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(35).version;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
    'server'       : __webpack_require__(32),
    'client'       : __webpack_require__(8),
    'router'       : __webpack_require__(30),
    'frame'        : __webpack_require__(9),
    'request'      : __webpack_require__(10),
    'connection'   : __webpack_require__(3),
    'w3cwebsocket' : __webpack_require__(29),
    'deprecation'  : __webpack_require__(26),
    'version'      : __webpack_require__(33)
};


/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = {"name":"websocket","description":"Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.","keywords":["websocket","websockets","socket","networking","comet","push","RFC-6455","realtime","server","client"],"author":"Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)","contributors":["Iñaki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"],"version":"1.0.28","repository":{"type":"git","url":"https://github.com/theturtle32/WebSocket-Node.git"},"homepage":"https://github.com/theturtle32/WebSocket-Node","engines":{"node":">=0.10.0"},"dependencies":{"debug":"^2.2.0","nan":"^2.11.0","typedarray-to-buffer":"^3.1.5","yaeti":"^0.0.6"},"devDependencies":{"buffer-equal":"^1.0.0","faucet":"^0.0.1","gulp":"git+https://github.com/gulpjs/gulp.git#4.0","gulp-jshint":"^2.0.4","jshint-stylish":"^2.2.1","jshint":"^2.0.0","tape":"^4.9.1"},"config":{"verbose":false},"scripts":{"install":"(node-gyp rebuild 2> builderror.log) || (exit 0)","test":"faucet test/unit","gulp":"gulp"},"main":"index","directories":{"lib":"./lib"},"browser":"lib/browser.js","license":"Apache-2.0"}

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

// This file was copied from https://github.com/substack/node-bufferlist
// and modified to be able to copy bytes from the bufferlist directly into
// a pre-existing fixed-size buffer without an additional memory allocation.

// bufferlist.js
// Treat a linked list of buffers as a single variable-size buffer.
var Buffer = __webpack_require__(40).Buffer;
var EventEmitter = __webpack_require__(0).EventEmitter;
var bufferAllocUnsafe = __webpack_require__(2).bufferAllocUnsafe;

module.exports = BufferList;
module.exports.BufferList = BufferList; // backwards compatibility

function BufferList(opts) {
    if (!(this instanceof BufferList)) return new BufferList(opts);
    EventEmitter.call(this);
    var self = this;
    
    if (typeof(opts) == 'undefined') opts = {};
    
    // default encoding to use for take(). Leaving as 'undefined'
    // makes take() return a Buffer instead.
    self.encoding = opts.encoding;
    
    var head = { next : null, buffer : null };
    var last = { next : null, buffer : null };
    
    // length can get negative when advanced past the end
    // and this is the desired behavior
    var length = 0;
    self.__defineGetter__('length', function () {
        return length;
    });
    
    // keep an offset of the head to decide when to head = head.next
    var offset = 0;
    
    // Write to the bufferlist. Emits 'write'. Always returns true.
    self.write = function (buf) {
        if (!head.buffer) {
            head.buffer = buf;
            last = head;
        }
        else {
            last.next = { next : null, buffer : buf };
            last = last.next;
        }
        length += buf.length;
        self.emit('write', buf);
        return true;
    };
    
    self.end = function (buf) {
        if (Buffer.isBuffer(buf)) self.write(buf);
    };
    
    // Push buffers to the end of the linked list. (deprecated)
    // Return this (self).
    self.push = function () {
        var args = [].concat.apply([], arguments);
        args.forEach(self.write);
        return self;
    };
    
    // For each buffer, perform some action.
    // If fn's result is a true value, cut out early.
    // Returns this (self).
    self.forEach = function (fn) {
        if (!head.buffer) return bufferAllocUnsafe(0);
        
        if (head.buffer.length - offset <= 0) return self;
        var firstBuf = head.buffer.slice(offset);
        
        var b = { buffer : firstBuf, next : head.next };
        
        while (b && b.buffer) {
            var r = fn(b.buffer);
            if (r) break;
            b = b.next;
        }
        
        return self;
    };
    
    // Create a single Buffer out of all the chunks or some subset specified by
    // start and one-past the end (like slice) in bytes.
    self.join = function (start, end) {
        if (!head.buffer) return bufferAllocUnsafe(0);
        if (start == undefined) start = 0;
        if (end == undefined) end = self.length;
        
        var big = bufferAllocUnsafe(end - start);
        var ix = 0;
        self.forEach(function (buffer) {
            if (start < (ix + buffer.length) && ix < end) {
                // at least partially contained in the range
                buffer.copy(
                    big,
                    Math.max(0, ix - start),
                    Math.max(0, start - ix),
                    Math.min(buffer.length, end - ix)
                );
            }
            ix += buffer.length;
            if (ix > end) return true; // stop processing past end
        });
        
        return big;
    };
    
    self.joinInto = function (targetBuffer, targetStart, sourceStart, sourceEnd) {
        if (!head.buffer) return new bufferAllocUnsafe(0);
        if (sourceStart == undefined) sourceStart = 0;
        if (sourceEnd == undefined) sourceEnd = self.length;
        
        var big = targetBuffer;
        if (big.length - targetStart < sourceEnd - sourceStart) {
            throw new Error("Insufficient space available in target Buffer.");
        }
        var ix = 0;
        self.forEach(function (buffer) {
            if (sourceStart < (ix + buffer.length) && ix < sourceEnd) {
                // at least partially contained in the range
                buffer.copy(
                    big,
                    Math.max(targetStart, targetStart + ix - sourceStart),
                    Math.max(0, sourceStart - ix),
                    Math.min(buffer.length, sourceEnd - ix)
                );
            }
            ix += buffer.length;
            if (ix > sourceEnd) return true; // stop processing past end
        });
        
        return big;
    };
    
    // Advance the buffer stream by n bytes.
    // If n the aggregate advance offset passes the end of the buffer list,
    // operations such as .take() will return empty strings until enough data is
    // pushed.
    // Returns this (self).
    self.advance = function (n) {
        offset += n;
        length -= n;
        while (head.buffer && offset >= head.buffer.length) {
            offset -= head.buffer.length;
            head = head.next
                ? head.next
                : { buffer : null, next : null }
            ;
        }
        if (head.buffer === null) last = { next : null, buffer : null };
        self.emit('advance', n);
        return self;
    };
    
    // Take n bytes from the start of the buffers.
    // Returns a string.
    // If there are less than n bytes in all the buffers or n is undefined,
    // returns the entire concatenated buffer string.
    self.take = function (n, encoding) {
        if (n == undefined) n = self.length;
        else if (typeof n !== 'number') {
            encoding = n;
            n = self.length;
        }
        var b = head;
        if (!encoding) encoding = self.encoding;
        if (encoding) {
            var acc = '';
            self.forEach(function (buffer) {
                if (n <= 0) return true;
                acc += buffer.toString(
                    encoding, 0, Math.min(n,buffer.length)
                );
                n -= buffer.length;
            });
            return acc;
        } else {
            // If no 'encoding' is specified, then return a Buffer.
            return self.join(0, n);
        }
    };
    
    // The entire concatenated buffer as a string.
    self.toString = function () {
        return self.take('binary');
    };
}
__webpack_require__(1).inherits(BufferList, EventEmitter);


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
	EventTarget : __webpack_require__(39),
	Event       : __webpack_require__(38)
};


/***/ }),
/* 38 */
/***/ (function(module, exports) {

/**
 * Expose the Event class.
 */
module.exports = _Event;


function _Event(type) {
	this.type = type;
	this.isTrusted = false;

	// Set a flag indicating this is not a DOM Event object
	this._yaeti = true;
}


/***/ }),
/* 39 */
/***/ (function(module, exports) {

/**
 * Expose the _EventTarget class.
 */
module.exports = _EventTarget;

function _EventTarget() {
	// Do nothing if called for a native EventTarget object..
	if (typeof this.addEventListener === 'function') {
		return;
	}

	this._listeners = {};

	this.addEventListener = _addEventListener;
	this.removeEventListener = _removeEventListener;
	this.dispatchEvent = _dispatchEvent;
}

Object.defineProperties(_EventTarget.prototype, {
	listeners: {
		get: function () {
			return this._listeners;
		}
	}
});

function _addEventListener(type, newListener) {
	var
		listenersType,
		i, listener;

	if (!type || !newListener) {
		return;
	}

	listenersType = this._listeners[type];
	if (listenersType === undefined) {
		this._listeners[type] = listenersType = [];
	}

	for (i = 0; !!(listener = listenersType[i]); i++) {
		if (listener === newListener) {
			return;
		}
	}

	listenersType.push(newListener);
}

function _removeEventListener(type, oldListener) {
	var
		listenersType,
		i, listener;

	if (!type || !oldListener) {
		return;
	}

	listenersType = this._listeners[type];
	if (listenersType === undefined) {
		return;
	}

	for (i = 0; !!(listener = listenersType[i]); i++) {
		if (listener === oldListener) {
			listenersType.splice(i, 1);
			break;
		}
	}

	if (listenersType.length === 0) {
		delete this._listeners[type];
	}
}

function _dispatchEvent(event) {
	var
		type,
		listenersType,
		dummyListener,
		stopImmediatePropagation = false,
		i, listener;

	if (!event || typeof event.type !== 'string') {
		throw new Error('`event` must have a valid `type` property');
	}

	// Do some stuff to emulate DOM Event behavior (just if this is not a
	// DOM Event object)
	if (event._yaeti) {
		event.target = this;
		event.cancelable = true;
	}

	// Attempt to override the stopImmediatePropagation() method
	try {
		event.stopImmediatePropagation = function () {
			stopImmediatePropagation = true;
		};
	} catch (error) {}

	type = event.type;
	listenersType = (this._listeners[type] || []);

	dummyListener = this['on' + type];
	if (typeof dummyListener === 'function') {
		dummyListener.call(this, event);
	}

	for (i = 0; !!(listener = listenersType[i]); i++) {
		if (stopImmediatePropagation) {
			break;
		}

		listener.call(this, event);
	}

	return !event.defaultPrevented;
}


/***/ }),
/* 40 */
/***/ (function(module, exports) {

module.exports = require("buffer");

/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 42 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 43 */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),
/* 44 */
/***/ (function(module, exports) {

module.exports = require("tty");

/***/ })
/******/ ]);