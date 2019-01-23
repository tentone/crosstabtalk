"use strict";

import {EventManager} from "./EventManager.js";
import {WindowMessage} from "./WindowMessage.js";

/**
 * Windows sesstion client is used to store the status of a inter window communication process.
 *
 * Stores information about the other window e.g. (identification, status etc).
 *
 * @class WindowSession
 */
function WindowSession(manager)
{
	/**
	 * The manager attached to this session.
	 *
	 * @attribute manager
	 * @type {WindowManager}
	 */
	this.manager = manager;

	/**
	 * Window object of this client, is not always the actual window, but it is the window that contains (directly or indirectly) access to the destination.
	 *
	 * The window object is used as a point of communcation. Depending of security configurations the access may be restricted.
	 *
	 * @attribute window
	 * @type {Object}
	 */
	this.window = null;

	/**
	 * URL of the other window.
	 *
	 * Only available for windows that were open direclty, for wich a URL is known.
	 *
	 * @attribute url
	 * @type {String}
	 */
	this.url = "";

	/**
	 * UUID to identify the other window.
	 *
	 * @attribute uuid
	 * @type {String}
	 */
	this.uuid = null;
	
	/**
	 * Textual type indicator of the other window, used to indetify the type of the other window.
	 *
	 * (e.g. "3D", "Main", etc)
	 *
	 * @attribute type
	 * @type {String}
	 */
	this.type = null;
		
	/**
	 * Counter of messages exchanged between the sessions.
	 *
	 * Increased everytime a message is sent.
	 *
	 * @attribute counter
	 * @type {Number}
	 */
	this.counter = 0;

	/** 
	 * The session object that is used as gateway for this session.
	 *
	 * When directly connected to the other window has a null value.
	 *
	 * @attribute gateway
	 * @type {WindowSession}
	 */
	this.gateway = null;

	/**
	 * Status of the communication.
	 *
	 * @attribute status
	 * @type {String}
	 */
	this.status = WindowSession.WAITING;

	/**
	 * Messages waiting to be sent.
	 * 
	 * When the status is set to WAITING the messages are held here until it gets to READY status.
	 *
	 * @attribute queue
	 * @type {Array}
	 */
	this.queue = [];

	/**
	 * Domains allowed for this session messages.
	 *
	 * @attribute allowdomain
	 * @type {String}
	 */
	this.allowdomain = "*";

	/**
	 * On message callback, receives data and authentication as parameters.
	 *
	 * Called when a normal message is received from another window, onMessage(data, authentication).
	 *
	 * @attribute onMessage
	 * @type {Function}
	 */
	this.onMessage = null;

	/**
	 * On broadcast message callback, receives data and authentication as parameters.
	 *
	 * Called when a broadcast message arrives, onBroadcastMessage(data, authentication).
	 *
	 * @attribute onBroadcastMessage
	 * @type {Function}
	 */
	this.onBroadcastMessage = null;

	/**
	 * On closed callback.
	 *
	 * @attribute onClosed
	 * @type {Function}
	 */
	this.onClosed = null;
	
	/**
	 * On ready callback.
	 *
	 * @attribute onReady
	 * @type {Function}
	 */
	this.onReady = null;
}

/**
 * WAITING status means that the window is open but the ready message was not received.
 *
 * While the window is waiting all messages are stored in a queue waiting for a ready message.
 *
 * @static
 * @attribute WAITING
 * @type {Number}
 */
WindowSession.WAITING = 101;

/**
 * READY status means that the window is ready to receive data.
 *
 * @static
 * @attribute READY
 * @type {Number}
 */
WindowSession.READY = 102;

/**
 * CLOSED status means that the window is not available.
 *
 * @static
 * @attribute CLOSED
 * @type {Number}
 */
WindowSession.CLOSED = 103;

/**
 * Set the status of the window.
 *
 * Ensures the correct order of the status being set.
 *
 * @method setStatus
 * @param {Number} status
 */
WindowSession.prototype.setStatus = function(status)
{
	if(status <= this.status)
	{
		console.warn("TabTalk: Invalid status cannot go from " + this.status + " to " + status + ".");
		return;
	}

	this.status = status;

	//Send all queued waiting message
	if(this.status === WindowSession.READY)
	{
		for(var i = 0; i < this.queue; i++)
		{
			this.send(this.queue[i]);
		}

		this.queue = [];
	}
};

/**
 * Post data to another window, windows references are stored using their url for later usage.
 *
 * If the window is unknonwn the opener window is used if available.
 * 
 * @method send
 * @param {String} action Name of the action of this message.
 * @param {Object} data Data to be sent (Optional).
 * @param {String} authentication Authentication information (Optional).
 */
WindowSession.prototype.send = function(message)
{
	if(this.window !== null)
	{
		this.window.postMessage(message, this.allowdomain);
		console.log("TabTalk: Sent message.", message);
	}
	else if(this.gateway !== null)
	{
		console.log("TabTalk: Message passed to gateway.", message);
		this.gateway.send(message);
	}
	else
	{
		console.warn("TabTalk: Session has no window attached.");
		return;
	}
};

/**
 * Send a message to another window, if the session is in WAITING status the message will be queued to be send later.
 * 
 * @method sendMessage
 * @param {Object} data Data to be sent (Optional).
 * @param {String} authentication Authentication information (Optional).
 */
WindowSession.prototype.sendMessage = function(data, authentication)
{
	var message = new WindowMessage(this.counter++, WindowMessage.MESSAGE, this.manager.type, this.manager.uuid, this.type, this.uuid, data, authentication);

	if(this.status === WindowSession.WAITING)
	{
		this.queue.push(message);
		console.log("TabTalk: Still on waiting status message was queued.", message);
	}
	else
	{
		this.send(message);
	}
}

/**
 * Close this session, send a close message and is possible close the window.
 * 
 * @method close
 * @param {Boolean} closeWindow If set true the session window will be closed (if possible).
 */
WindowSession.prototype.close = function(closeWindow)
{
	var message = new WindowMessage(this.counter++, WindowMessage.CLOSED, this.manager.type, this.manager.uuid, this.type, this.uuid);

	this.sendMessage(message);
	
	if(closeWindow === true && this.window !== null)
	{
		this.window.close();
	}
};

/**
 * Send a message to indicate that this session is READY.
 *
 * Also sends the session metadata for the remote window.
 *
 * @method acknowledge
 */
WindowSession.prototype.acknowledge = function()
{
	if(this.uuid !== null)
	{
		this.send(new WindowMessage(this.counter++, WindowMessage.READY, this.manager.type, this.manager.uuid, this.type, this.uuid));
	}
	else
	{
		this.send(new WindowMessage(this.counter++, WindowMessage.READY, this.manager.type, this.manager.uuid));
	}
};

/**
 * Used to indicate the connection intent to remote windows after a positive lookup response.
 *
 * Works similarly to the ready message.
 *
 * @method connect
 */
WindowSession.prototype.connect = function()
{
	this.send(new WindowMessage(this.counter++, WindowMessage.CONNECT, this.manager.type, this.manager.uuid, this.type, this.uuid));
};

/**
 * Wait for this window to be ready.
 *
 * When a window is ready it should send a message containing a action property set to WindowMessage.READY.
 *
 * @method waitReady
 * @param {Function} onReady Callback called when the winow is ready.
 */
WindowSession.prototype.waitReady = function()
{
	var self = this;

	console.log("TabTalk: Waiting for a ready message.");

	var manager = new EventManager();
	manager.add(window, "message", function(event)
	{
		//Ready events can only come from direct messages 
		if(event.source !== self.window && self.window !== null)
		{
			console.log("TabTalk: Event from diferent window.", event);
			return;
		}

		var data = event.data;

		if(data.action === WindowMessage.READY)
		{
			console.log("TabTalk: Received ready message.", data, event);

			self.type = data.originType;
			self.uuid = data.originUUID;
			self.manager.sessions[self.uuid] = self;
			self.setStatus(WindowSession.READY);
			self.acknowledge();

			if(self.onReady !== null)
			{
				self.onReady(event);
			}

			manager.destroy();
		}
		else
		{
			console.warn("TabTalk: Not a ready message, waiting for ready.", data, event);
		}
	});
	manager.create();
};
