(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.TabTalk = {}));
}(this, function (exports) { 'use strict';

	/**
	 * EventManager is used to manager DOM events creationg and destruction in a single function call.
	 *
	 * It is used by objects to make it easier to add and remove events from global DOM objects.
	 *
	 * @class EventManager
	 */
	function EventManager()
	{
		/**
		 * Stores all events in the manager, their target and callback.
		 * 
		 * Format [target, event, callback, active]
		 * 
		 * @attribute events
		 * @type {Array}
		 */
		this.events = [];
	}

	/**
	 * Add new event to the manager.
	 *
	 * @method add
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
	 *
	 * @method clear
	 */
	EventManager.prototype.clear = function()
	{
		this.destroy();
		this.events = [];
	};

	/**
	 * Creates all events in this manager.
	 * 
	 * @method create
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
	 * 
	 * @method destroy
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
	 * @class WindowMessage
	 */
	function WindowMessage(number, action, originType, originUUID, destinationType, destinationUUID, data, authentication)
	{
		/**
		 * Message number in the context of messages exchanged between the windows.
		 *
		 * @attribute number
		 * @type {Number}
		 */
		this.number = number;

		/**
		 * The action category of this message.
		 *
		 * Obligatory message field.
		 *
		 * @attribute action
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
		 * @attribute type
		 * @type {String}
		 */
		this.originType = originType;

		/**
		 * UUID to identify the window that sent the message.
		 *
		 * Obligatory message field.
		 *
		 * @attribute origin
		 * @type {String}
		 */
		this.originUUID = originUUID;

		/**
		 * Type of the destination.
		 *
		 * Optional message field.
		 *
		 * @attribute destinationType
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
		 * @attribute destination
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
		 * @attribute data
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
		 * @attribute authentication
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
		 * @attribute hops
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
	 * @attribute READY
	 * @type {Number}
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
	 * @attribute CLOSED
	 * @type {Number}
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
	 * @attribute LOOKUP
	 * @type {Number}
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
	 * @attribute MESSAGE
	 * @type {Number}
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
	 * @attribute BROADCAST
	 * @type {Number}
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
	 * @attribute LOOKUP_FOUND
	 * @type {Number}
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
	 * @attribute LOOKUP_NOT_FOUND
	 * @type {Number}
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
	 * @attribute CONNECT
	 * @type {Number}
	 */
	WindowMessage.CONNECT = 7;

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
	};

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

	/**
	 * Message utils takes care of messaging between multiple windows. Messages can be transfered direcly or forwarded between windows.
	 *
	 * Is responsible for keeping track of all sessions, handles message reception, message forwarding and message sending.
	 *
	 * When a window is open it cannot be acessed we need to wait for the ready message.
	 * 
	 * @class WindowManager
	 * @param {String} type Type of this window.
	 */
	function WindowManager(type)
	{
		var self = this;

		/** 
		 * Type of this window manager object.
		 *
		 * @attribute type
		 * @type {String}
		 */
		this.type = type;

		/**
		 * UUID of this window manager.
		 *
		 * Used to identify this window on communication with another windows.
		 *
		 * @attribute uuid
		 * @type {String}
		 */
		this.uuid = WindowManager.generateUUID();

		/**
		 * Map of known sessions.
		 *
		 * Indexed by the UUID of the session.
		 *
		 * @attribute sessions
		 * @type {Object}
		 */
		this.sessions = {};

		/**
		 * List of sessions in waiting state.
		 *
		 * These still havent reached the READY state.
		 *
		 * @attribute waitingSessions
		 * @type {Array}
		 */
		this.waitingSessions = [];

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
		 * Event manager containing the message handling events for this manager.
		 *
		 * @attribute manager
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
				console.warn("TabTalk: Destination UUID diferent from self, destination is " + message.destinationUUID);

				var session = self.sessions[message.destinationUUID];

				if(session !== undefined)
				{
					message.hops.push(self.uuid);
					session.send(message);
					console.log("TabTalk: Redirect message to destination.", session, message);
				}
				else
				{
					console.warn("TabTalk: Unknown destination, cannot redirect message.");
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
					else
					{
						console.warn("TabTalk: Unknown closed origin session.");
					}
				}
				//Lookup
				else if(message.action === WindowMessage.LOOKUP)
				{
					console.log("TabTalk: WindowManager lookup request received from " + message.originType + ".", message);

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
						console.log("TabTalk: Response to lookup request sent.", response);
					}
					else
					{
						console.warn("TabTalk: Unknown lookup origin session.");
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
						console.warn("TabTalk: Connect message received, creating a new session.", message, session);
					}
					else
					{
						console.error("TabTalk: Connect message received, but the gateway is unknown.", message);
					}
				}
				//Broadcast
				else if(message.action === WindowMessage.BROADCAST)
				{
					console.log("TabTalk: WindowManager broadcast message received " + message.originType + ".", message);

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
					console.log("TabTalk: WindowManager message received " + message.originType + ".", message);

					var session = self.sessions[message.originUUID];
					if(session !== undefined)
					{
						if(session.onMessage !== null)
						{
							session.onMessage(message.data, message.authentication);
						}
					}
					else
					{
						console.warn("TabTalk: Unknown origin session.");
					}
				}
				else
				{
					console.warn("TabTalk: Unknown message type.");
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
	 * Log to the console a list of all known sessions
	 *
	 * @method logSessions
	 */
	WindowManager.prototype.logSessions = function()
	{
		console.log("TabTalk: List of known sessions:");
		for(var i in this.sessions)
		{
			var session = this.sessions[i];

			console.log("     " + session.uuid + " | " + session.type + " -> " + (session.gateway === null ? "*" : session.gateway.uuid));
		}
	};

	/**
	 * Broadcast a message to all available sessions.
	 *
	 * The message will be passed further on.
	 *
	 * @method broadcast
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
	 * @method checkOpener
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
	 * @method openSession
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
				console.warn("TabTalk: A session of the type " + type + " already exists.");
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
	 * @method lookup
	 * @param {String} type Type of the window to look for.
	 * @param {String} onFinish Receives the gateway session, found uuid and type as parameters onFinish(session, uuid, type), if null no window of the type was found.
	 */
	WindowManager.prototype.lookup = function(type, onFinish)
	{
		var message = new WindowMessage(0, WindowMessage.LOOKUP, this.type, this.uuid, type, undefined);
		var sent = 0, received = 0, found = false;

		for(var i in this.sessions)
		{
			console.log("TabTalk: Send lookup message to " + i + ".", message);
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
					
					console.log("TabTalk: Received lookup FOUND message from " + data.originUUID + ".", data.data);
					received++;
				}
				else if(data.action === WindowMessage.LOOKUP_NOT_FOUND)
				{
					console.log("TabTalk: Received lookup NOT FOUND message from " + data.originUUID + ".");
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
			console.log("TabTalk: No session available to run lookup.");
			onFinish(null);
		}
	};

	/**
	 * Check if this window was opened by another one.
	 *
	 * @method wasOpened
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
	 *
	 * @method dispose
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
	 * @method generateUUID
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

	exports.EventManager = EventManager;
	exports.WindowManager = WindowManager;
	exports.WindowSession = WindowSession;
	exports.WindowMessage = WindowMessage;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
