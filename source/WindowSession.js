"use strict";

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
	this.uuid = "";
	
	/**
	 * Textual type indicator of the other window, used to indetify the type of the other window.
	 *
	 * (e.g. "3D", "Main", etc)
	 *
	 * @attribute type
	 * @type {String}
	 */
	this.type = "";
		
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
	 * On message callback.
	 *
	 * @attribute onMessage
	 * @type {Function}
	 */
	this.onMessage = null;

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
 * Set the state of the window.
 *
 * Ensures the correct order of the state being set.
 *
 * @method setState
 * @param {Number} state
 */
WindowSession.prototype.setState = function(state)
{
	if(state <= this.state)
	{
		console.log("TabTalk: Invalid state, cannot go from " + this.state + " to " + state + ".");
		return;
	}

	this.state = state;

	//Send all queued waiting message
	if(this.status === WindowSession.READY)
	{
		for(var i = 0; i < this.queue; i++)
		{
			if(this.window !== null)
			{
				this.window.postMessage(this.queue[i], "*");
			}
			else if(this.gateway !== null)
			{
				this.gateway.postMessage(this.queue[i], "*");
			}
			else
			{
				console.warn("TabTalk: Session has no window attached.");
				return;
			}
		}

		this.queue = [];
	}
};

/**
 * Post data to another window, windows references are stored using their url for later usage.
 *
 * If the window is unknonwn the opener window is used if available.
 * 
 * @method sendMessage
 * @param {String} action Name of the action of this message.
 * @param {Object} data Data to be sent (Optional).
 * @param {String} token Authentication information (Optional).
 */
WindowSession.prototype.sendMessage = function(action, data, token)
{
	var message = new WindowMessage(this.counter++, action, this.manager.type, this.manager.uuid, this.type, this.uuid, token, data);

	if(this.status === WindowSession.WAITING)
	{
		this.queue.push(message);
		console.log("TabTalk: Still on waiting status message was queued.", message);
	}
	else
	{
		if(this.window !== null)
		{
			this.window.postMessage(message, "*");
		}
		else if(this.gateway !== null)
		{
			this.gateway.postMessage(message, "*");
		}
		else
		{
			console.warn("TabTalk: Session has no window attached.");
			return;
		}

		console.log("TabTalk: Message sent.", message);
	}
};

/**
 * Close this session, send a close message and is possible close the window.
 * 
 * @method close
 */
WindowSession.prototype.close = function()
{
	this.sendMessage("closed");
	
	if(this.window !== null)
	{
		this.window.close();
	}
};

/**
 * Send a message to indicate that this session is ready to be used.
 *
 * @method acknowledge
 */
WindowSession.prototype.acknowledge = function(onReady)
{
	var message = new WindowMessage(this.counter++, "ready", this.manager.type, this.manager.uuid);

	if(this.window !== null)
	{
		this.window.postMessage(message, "*");
	}
	else
	{
		console.warn("TabTalk: Session has no window attached.");
	}
};

/**
 * Wait for this window to be ready.
 *
 * When a window is ready it should send a message containing a action property set to "ready".
 *
 * @method waitReady
 * @param {Function} onReady Callback called when the winow is ready.
 */
WindowSession.prototype.waitReady = function()
{
	var self = this;

	var manager = new EventManager();
	manager.add(window, "message", function(event)
	{
		if(event.source !== self.window)
		{
			return;
		}

		var data = event.data;

		if(data.action === "ready")
		{
			console.log("TabTalk: Received ready message.", data, event);

			self.type = data.originType;
			self.uuid = data.originUUID;
			self.manager.sessions[self.uuid] = self;
			self.setState(WindowSession.READY);

			if(self.onReady !== null)
			{
				self.onReady(event);
			}

			manager.destroy();

			self.acknowledge();
		}
		else
		{
			console.warn("TabTalk: Not a ready message, waiting for ready.", data, event);
		}

	});
	manager.create();
};