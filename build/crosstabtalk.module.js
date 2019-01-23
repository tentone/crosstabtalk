/**
 * EventManager is used to manager DOM events creationg and destruction in a single function call.
 *
 * It is used by objects to make it easier to add and remove events from global DOM objects.
 *
 * @class
 */
function EventManager()
{
	/**
	 * Stores all events in the manager, their target and callback.
	 * 
	 * Format [target, event, callback, active]
	 * 
	 * @type {Array}
	 */
	this.events = [];
}

/**
 * Add new event to the manager.
 *
 * @param {DOM} target Event target element.
 * @param {String} event Event name.
 * @param {Function} callback Callback function.
 */
EventManager.prototype.add = function(target, event, callback)
{
	this.events.push([target, event, callback, false]);
};

/**
 * Destroys this manager and remove all events.
 */
EventManager.prototype.clear = function()
{
	this.destroy();
	this.events = [];
};

/**
 * Creates all events in this manager.
 */
EventManager.prototype.create = function()
{
	for(var i = 0; i < this.events.length; i++)
	{
		var event = this.events[i];
		event[0].addEventListener(event[1], event[2]);
		event[3] = true;
	}
};

/**
 * Removes all events in this manager.
 */
EventManager.prototype.destroy = function()
{
	for(var i = 0; i < this.events.length; i++)
	{
		var event = this.events[i];
		event[0].removeEventListener(event[1], event[2]);
		event[3] = false;
	}
};

/**
 * Message object sent between windows.
 *
 * Contains booth window identification useful for message forwarding between windows and user authentication data.
 *
 * @class
 */
function WindowMessage(number, action, originType, originUUID, destinationType, destinationUUID, data, authentication)
{
	/**
	 * Message number in the context of messages exchanged between the windows.
	 *
	 * @type {Number}
	 */
	this.number = number;

	/**
	 * The action category of this message.
	 *
	 * Obligatory message field.
	 *
	 * @type {Number}
	 */
	this.action = action;

	 /**
	 * Type of the window that sent the message.
	 *
	 * Obligatory message field.
	 *
	 * (e.g. "3D", "Main", etc)
	 *
	 * @type {String}
	 */
	this.originType = originType;

	/**
	 * UUID to identify the window that sent the message.
	 *
	 * Obligatory message field.
	 *
	 * @type {String}
	 */
	this.originUUID = originUUID;

	/**
	 * Type of the destination.
	 *
	 * Optional message field.
	 *
	 * @type {String}
	 */
	if(destinationType !== undefined)
	{
		this.destinationType = destinationType;
	}

	/**
	 * UUID to identify the destination of the message.
	 *
	 * Optional message field.
	 *
	 * @type {String}
	 */
	if(destinationUUID !== undefined)
	{
		this.destinationUUID = destinationUUID;
	}

	/**
	 * Payload of the message (the actual content of the message).
	 *
	 * Beware that object refereces are not accessible across windows.
	 *
	 * Optional message field.
	 *
	 * @type {Object}
	 */
	if(data !== undefined)
	{
		this.data = data;
	}

	/**
	 * Token of the user for authentication.
	 *
	 * Optional message field.
	 *
	 * @type {String}
	 */
	if(authentication !== undefined)
	{
		this.authentication = authentication;
	}

	/**
	 * Hops of this message until it reaches its destination.
	 *
	 * Each window where this message passes should push its UUID to this list.
	 *
	 * e.g [UUID1, UUID2, UUID3], UUID3 is the uuid of the last sessions before destination, booth origin and destination are not included in the hop list.
	 * 
	 * @type {Array}
	 */
	this.hops = [];
}

/**
 * Ready message exchanged before starting comunication.
 *
 * {
 *		type: READY,
 *		originUUID: ...,
 *		originType: ...
 * }
 *
 * @static
 * @attribute {Number}
 */
WindowMessage.READY = 0;

/**
 * Closed message is used to indicate that the comunication was terminated.
 *
 * {
 *		type: CLOSED,
 *		originUUID: ...,
 *		originType: ...
 * }
 *
 * @static
 * @attribute {Number}
 */
WindowMessage.CLOSED = 1;

/**
 * Message to lookup for a window type in the neighbor session.
 *
 * {
 *		type: LOOKUP,
 *		originUUID: ...,
 *		originType: ...,
 *		destinationType: ...
 * }
 *
 * @static
 * @attribute {Number}
 */
WindowMessage.LOOKUP = 2;

/**
 * Regular message exchanged between the windows.
 *
 * {
 *		type: LOOKUP,
 *		originUUID: ...,
 *		originType: ...,
 *		destinationType: ...,
 *		destinationUUID: ...,
 *		data(?): ...,
 *		authentication(?): ...
 * }
 *
 * @static
 * @attribute {Number}
 */
WindowMessage.MESSAGE = 3;

/**
 * Broadcast message.
 *
 * {
 *		type: BROADCAST,
 *		originUUID: ...,
 *		originType: ...,
 *		destinationUUID: "*",
 *		hops: [UUID1, UUID2, ...], //Each hop adds its UUID to the list
 *		data(?): ...,
 *		authentication(?): ...
 * }
 *
 * @static
 * @attribute {Number}
 */
WindowMessage.BROADCAST = 4;

/**
 * Lookup response for when a window was found.
 *
 * {
 *		type: LOOKUP_FOUND,
 *		originUUID: ...,
 *		originType: ...,
 *		data:
 *		{
 *			uuid: ..., //Of the requested session
 *			type: ... 
 *		}
 * }
 *
 * @static
 * @attribute {Number}
 */
WindowMessage.LOOKUP_FOUND = 5;

/**
 * Message responde for when a window is not found.
 *
 * {
 *		type: LOOKUP_NOT_FOUND,
 *		originUUID: ...,
 *		originType: ...
 * }
 *
 * @static
 * @attribute {Number}
 */
WindowMessage.LOOKUP_NOT_FOUND = 6;

/**
 * Message used after obtaining a positive lookup respose to connect to the remote window trough the middle layers.
 *
 * After the connect message reaches the destination the window should send a READY message.
 *
 * {
 *		type: CONNECT,
 *		originUUID: ...,
 *		originType: ...,
 *		destinationType: ...,
 *		destinationUUID: ...,
 *		hops: [UUID1, UUID2, ...] //Each hop adds its UUID to the list
 * }
 *
 * @static
 * @attribute {Number}
 */
WindowMessage.CONNECT = 7;

/**
 * Windows sesstion client is used to store the status of a inter window communication process.
 *
 * Stores information about the other window e.g. (identification, status etc).
 *
 * @class
 */
function WindowSession(manager)
{
	/**
	 * The manager attached to this session.
	 *
	 * @type {WindowManager}
	 */
	this.manager = manager;

	/**
	 * Window object of this client, is not always the actual window, but it is the window that contains (directly or indirectly) access to the destination.
	 *
	 * The window object is used as a point of communcation. Depending of security configurations the access may be restricted.
	 *
	 * @type {Object}
	 */
	this.window = null;

	/**
	 * URL of the other window.
	 *
	 * Only available for windows that were open direclty, for wich a URL is known.
	 *
	 * @type {String}
	 */
	this.url = "";

	/**
	 * UUID to identify the other window.
	 *
	 * @type {String}
	 */
	this.uuid = null;
	
	/**
	 * Textual type indicator of the other window, used to indetify the type of the other window.
	 *
	 * (e.g. "3D", "Main", etc)
	 *
	 * @type {String}
	 */
	this.type = null;
		
	/**
	 * Counter of messages exchanged between the sessions.
	 *
	 * Increased everytime a message is sent.
	 *
	 * @type {Number}
	 */
	this.counter = 0;

	/** 
	 * The session object that is used as gateway for this session.
	 *
	 * When directly connected to the other window has a null value.
	 *
	 * @type {WindowSession}
	 */
	this.gateway = null;

	/**
	 * Status of the communication.
	 *
	 * @type {String}
	 */
	this.status = WindowSession.WAITING;

	/**
	 * Messages waiting to be sent.
	 * 
	 * When the status is set to WAITING the messages are held here until it gets to READY status.
	 *
	 * @type {Array}
	 */
	this.queue = [];

	/**
	 * Domains allowed for this session messages.
	 *
	 * @type {String}
	 */
	this.allowdomain = "*";

	/**
	 * On message callback, receives data and authentication as parameters.
	 *
	 * Called when a normal message is received from another window, onMessage(data, authentication).
	 *
	 * @type {Function}
	 */
	this.onMessage = null;

	/**
	 * On broadcast message callback, receives data and authentication as parameters.
	 *
	 * Called when a broadcast message arrives, onBroadcastMessage(data, authentication).
	 *
	 * @type {Function}
	 */
	this.onBroadcastMessage = null;

	/**
	 * On closed callback.
	 *
	 * @type {Function}
	 */
	this.onClosed = null;
	
	/**
	 * On ready callback.
	 *
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
 * @attribute {Number}
 */
WindowSession.WAITING = 101;

/**
 * READY status means that the window is ready to receive data.
 *
 * @static
 * @attribute {Number}
 */
WindowSession.READY = 102;

/**
 * CLOSED status means that the window is not available.
 *
 * @static
 * @attribute {Number}
 */
WindowSession.CLOSED = 103;

/**
 * Set the status of the window.
 *
 * Ensures the correct order of the status being set.
 *
 * @param {Number} status
 */
WindowSession.prototype.setStatus = function(status)
{
	if(status <= this.status)
	{
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
 * @param {String} action Name of the action of this message.
 * @param {Object} data Data to be sent (Optional).
 * @param {String} authentication Authentication information (Optional).
 */
WindowSession.prototype.send = function(message)
{
	if(this.window !== null)
	{
		this.window.postMessage(message, this.allowdomain);
	}
	else if(this.gateway !== null)
	{
		this.gateway.send(message);
	}
	else
	{
		return;
	}
};

/**
 * Send a message to another window, if the session is in WAITING status the message will be queued to be send later.
 * 
 * @param {Object} data Data to be sent (Optional).
 * @param {String} authentication Authentication information (Optional).
 */
WindowSession.prototype.sendMessage = function(data, authentication)
{
	var message = new WindowMessage(this.counter++, WindowMessage.MESSAGE, this.manager.type, this.manager.uuid, this.type, this.uuid, data, authentication);

	if(this.status === WindowSession.WAITING)
	{
		this.queue.push(message);
	}
	else
	{
		this.send(message);
	}
};

/**
 * Close this session, send a close message and is possible close the window.
 * 
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
 * @param {Function} onReady Callback called when the winow is ready.
 */
WindowSession.prototype.waitReady = function()
{
	var self = this;

	var manager = new EventManager();
	manager.add(window, "message", function(event)
	{
		//Ready events can only come from direct messages 
		if(event.source !== self.window && self.window !== null)
		{
			return;
		}

		var data = event.data;

		if(data.action === WindowMessage.READY)
		{

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
	});
	manager.create();
};

/**
 * Message utils takes care of messaging between multiple windows. Messages can be transfered direcly or forwarded between windows.
 *
 * Is responsible for keeping track of all sessions, handles message reception, message forwarding and message sending.
 *
 * When a window is open it cannot be acessed we need to wait for the ready message.
 * 
 * @class
 * @param {String} type Type of this window.
 */
function WindowManager(type)
{
	var self = this;

	/** 
	 * Type of this window manager object.
	 *
	 * @type {String}
	 */
	this.type = type;

	/**
	 * UUID of this window manager.
	 *
	 * Used to identify this window on communication with another windows.
	 *
	 * @type {String}
	 */
	this.uuid = WindowManager.generateUUID();

	/**
	 * Map of known sessions.
	 *
	 * Indexed by the UUID of the session.
	 *
	 * @type {Object}
	 */
	this.sessions = {};

	/**
	 * List of sessions in waiting state.
	 *
	 * These still havent reached the READY state.
	 *
	 * @type {Array}
	 */
	this.waitingSessions = [];

	/**
	 * On broadcast message callback, receives data and authentication as parameters.
	 *
	 * Called when a broadcast message arrives, onBroadcastMessage(data, authentication).
	 *
	 * type {Function}
	 */
	this.onBroadcastMessage = null;

	/**
	 * Event manager containing the message handling events for this manager.
	 *
	 * @type {EventManager}
	 */
	this.manager = new EventManager();
	this.manager.add(window, "message", function(event)
	{
		//console.log("TabTalk: Window message event fired.", event);

		var message = event.data;

		//Messages that need to be redirected
		if(message.destinationUUID !== undefined && message.destinationUUID !== self.uuid)
		{

			var session = self.sessions[message.destinationUUID];

			if(session !== undefined)
			{
				message.hops.push(self.uuid);
				session.send(message);
			}

			return;
		}
		//Messages to be processed
		else
		{
			//Session closed
			if(message.action === WindowMessage.CLOSED)
			{
				var session = self.sessions[message.originUUID];

				if(session !== undefined)
				{
					if(session.onClose != null)
					{
						session.onClose();
					}

					delete self.sessions[message.originUUID];
				}
			}
			//Lookup
			else if(message.action === WindowMessage.LOOKUP)
			{

				var found = false;
				var response;

				for(var i in self.sessions)
				{
					var session = self.sessions[i];

					if(session.type === message.destinationType)
					{
						var response = new WindowMessage(0, WindowMessage.LOOKUP_FOUND, self.type, self.uuid, undefined, undefined,
						{
							uuid:session.uuid,
							type:session.type
						});
						found = true;
						break;
					}
				}

				if(found === false)
				{
					response = new WindowMessage(0, WindowMessage.LOOKUP_NOT_FOUND, self.type, self.uuid);
				}

				var session = self.sessions[message.originUUID];
				if(session !== undefined)
				{
					session.send(response);
				}
			}
			//Connect message
			else if(message.action === WindowMessage.CONNECT)
			{
				var gatewayUUID = message.hops.pop();
				var gateway = self.sessions[gatewayUUID];

				if(gateway !== undefined)
				{
					var session = new WindowSession(self);
					session.uuid = message.originUUID;
					session.type = message.originType;
					session.gateway = gateway;
					session.waitReady();
					session.acknowledge();
				}
			}
			//Broadcast
			else if(message.action === WindowMessage.BROADCAST)
			{

				if(self.onBroadcastMessage !== null)
				{
					self.onBroadcastMessage(message.data, message.authentication);
				}

				//TODO <FIX BROADCAST LOOP>

				for(var i in self.sessions)
				{
					var session = self.sessions[i];

					if(session.uuid !== message.originUUID)
					{
						session.send(message);

						if(session.onBroadcastMessage !== null)
						{
							session.onBroadcastMessage(message.data, message.authentication);
						}
					}
				}
			}
			//Messages
			else if(message.action === WindowMessage.MESSAGE)
			{

				var session = self.sessions[message.originUUID];
				if(session !== undefined)
				{
					if(session.onMessage !== null)
					{
						session.onMessage(message.data, message.authentication);
					}
				}
			}
		}
	});

	this.manager.add(window, "beforeunload", function(event)
	{
		for(var i in self.sessions)
		{
			self.sessions[i].close();
		}
	});

	this.manager.create();

	this.checkOpener();
}

/**
 * Log to the console a list of all known sessions.
 */
WindowManager.prototype.logSessions = function()
{
	for(var i in this.sessions)
	{
		var session = this.sessions[i];
	}
};

/**
 * Broadcast a message to all available sessions.
 *
 * The message will be passed further on.
 *
 * @param {WindowMessage} data Data to be broadcasted.
 * @param {String} authentication Authentication information.
 */
WindowManager.prototype.broadcast = function(data, authentication)
{
	var message = new WindowMessage(0, WindowMessage.BROADCAST, this.manager.type, this.manager.uuid, undefined, undefined, data, authentication);

	for(var i in this.sessions)
	{
		this.sessions[i].send(message);
	}
};

/**
 * Send an acknowledge message.
 *
 * Used to send a signal indicating the parent window that it is ready to receive data.
 *
 * @return {WindowSession} Session fo the opener window, null if the window was not opened.
 */
WindowManager.prototype.checkOpener = function()
{
	if(this.wasOpened())
	{
		var session = new WindowSession(this);
		session.window = window.opener;
		session.acknowledge();
		session.waitReady();
		return session;
	}

	return null;
};

/**
 * Create a new session with a new window from URL and type.
 *
 * First needs to search for a window of the same type in the known sessions.
 *
 * @param {String} url URL of the window.
 * @param {String} type Type of the window to open (Optional).
 * @return {WindowSession} Session createed to open a new window.
 */
WindowManager.prototype.openSession = function(url, type)
{
	//Search in the current sessions
	for(var i in this.sessions)
	{
		var session = this.sessions[i];
		if(session.type === type)
		{
			return session;
		}
	}

	var session = new WindowSession(this);
	session.type = type;

	//Lookup the session
	if(type !== undefined)
	{
		this.lookup(type, function(gateway, uuid, type)
		{
			//Not found
			if(gateway === null)
			{
				if(url !== null)
				{	
					session.url = url;
					session.window = window.open(url);
					session.waitReady();
				}
			}
			//Found
			else
			{
				session.gateway = gateway;
				session.uuid = uuid;
				session.type = type;
				session.waitReady();
				session.connect();
			}
		});
	}

	return session;
};

/**
 * Lookup for a window type.
 *
 * @param {String} type Type of the window to look for.
 * @param {String} onFinish Receives the gateway session, found uuid and type as parameters onFinish(session, uuid, type), if null no window of the type was found.
 */
WindowManager.prototype.lookup = function(type, onFinish)
{
	var message = new WindowMessage(0, WindowMessage.LOOKUP, this.type, this.uuid, type, undefined);
	var sent = 0, received = 0, found = false;

	for(var i in this.sessions)
	{
		this.sessions[i].send(message);
		sent++;
	}

	if(sent > 0)
	{
		var self = this;
		var manager = new EventManager();
		manager.add(window, "message", function(event)
		{
			var data = event.data;
			if(data.action === WindowMessage.LOOKUP_FOUND)
			{

				if(found === false)
				{
					var session = self.sessions[data.originUUID];
					if(session !== undefined)
					{
						found = true;
						onFinish(session, data.data.uuid, data.data.type);
					}
				}
				received++;
			}
			else if(data.action === WindowMessage.LOOKUP_NOT_FOUND)
			{
				received++;
			}

			if(sent === received)
			{
				manager.destroy();

				if(found === false)
				{
					onFinish(null);
				}
			}
		});
		manager.create();
	}
	else
	{
		onFinish(null);
	}
};

/**
 * Check if this window was opened by another one.
 *
 * @return {Boolean} True if the window was opened by another window, false otherwise.
 */
WindowManager.prototype.wasOpened = function()
{
	return window.opener !== null;
};

/**
 * Dispose the window manager.
 *
 * Should be called when its not used anymore. Destroy all the window events created by the manager.
 */
WindowManager.prototype.dispose = function()
{
	for(var i in this.sessions)
	{
		this.sessions[i].close();
	}

	this.manager.destroy();
};

/**
 * Generate a UUID used to indetify the window manager.
 *
 * .toUpperCase() here flattens concatenated strings to save heap memory space.
 *
 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 *
 * @return {String} UUID generated.
 */
WindowManager.generateUUID = function()
{
	var lut = [];
	for(var i = 0; i < 256; i ++)
	{
		lut[i] = (i < 16 ? "0" : "") + (i).toString(16);
	}

	return function generateUUID()
	{
		var d0 = Math.random() * 0xffffffff | 0;
		var d1 = Math.random() * 0xffffffff | 0;
		var d2 = Math.random() * 0xffffffff | 0;
		var d3 = Math.random() * 0xffffffff | 0;
		var uuid = lut[ d0 & 0xff ] + lut[ d0 >> 8 & 0xff ] + lut[ d0 >> 16 & 0xff ] + lut[ d0 >> 24 & 0xff ] + "-" +
			lut[ d1 & 0xff ] + lut[ d1 >> 8 & 0xff ] + "-" + lut[ d1 >> 16 & 0x0f | 0x40 ] + lut[ d1 >> 24 & 0xff ] + "-" +
			lut[ d2 & 0x3f | 0x80 ] + lut[ d2 >> 8 & 0xff ] + "-" + lut[ d2 >> 16 & 0xff ] + lut[ d2 >> 24 & 0xff ] +
			lut[ d3 & 0xff ] + lut[ d3 >> 8 & 0xff ] + lut[ d3 >> 16 & 0xff ] + lut[ d3 >> 24 & 0xff ];

		return uuid.toUpperCase();
	};
}();

export { EventManager, WindowManager, WindowSession, WindowMessage };
