"use strict";

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
		var message = event.data;

		if(message.destinationUUID !== undefined && message.destinationUUID !== self.uuid)
		{
			console.warn("TabTalk: Destination UUID diferent from self.", message.destinationUUID);
		}

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
				console.warn("TabTalk: Unknown origin session.")
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
		//Lookup
		else if(message.action === WindowMessage.LOOKUP)
		{
			//TODO <LOOK ON KNOWN SESSIONS FOR TYPE>
		}
		//Messages
		else if(message.action === WindowMessage.MESSAGE)
		{
			console.log("TabTalk: WindowManager, Message received.", message);

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
				console.warn("TabTalk: Unknown origin session.")
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
	//Lookup the session
	if(type !== undefined)
	{
		this.lookup(type, function(gateway)
		{
			if(gateway === null)
			{
				//TODO <OPEN NEW WINDOW>
			}
			else
			{
				//TODO <ADD CODE HERE>
			}
		});
	}

	var session = new WindowSession(this);
	session.window = window.open(url);
	session.url = url;
	session.type = type;
	session.waitReady();
	return session;
};

/**
 * Lookup for a window type.
 *
 * @method lookup
 * @param {String} type Type of the window to look for.
 * @param {String} onFinish Receives the gateway session as parameter, if null no window of the type was found.
 */
WindowManager.prototype.lookup = function(type, onFinish)
{
	var message = new WindowMessage(0, WindowMessage.LOOKUP, this.manager.type, this.manager.uuid, type, undefined);
	var sent = 0, received = 0, found = false;

	for(var i in this.sessions)
	{
		sent++;
		this.sessions[i].send(message);
	}

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
					onFinish(session);
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
		lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
	}

	return function generateUUID()
	{
		var d0 = Math.random() * 0xffffffff | 0;
		var d1 = Math.random() * 0xffffffff | 0;
		var d2 = Math.random() * 0xffffffff | 0;
		var d3 = Math.random() * 0xffffffff | 0;
		var uuid = lut[ d0 & 0xff ] + lut[ d0 >> 8 & 0xff ] + lut[ d0 >> 16 & 0xff ] + lut[ d0 >> 24 & 0xff ] + '-' +
			lut[ d1 & 0xff ] + lut[ d1 >> 8 & 0xff ] + '-' + lut[ d1 >> 16 & 0x0f | 0x40 ] + lut[ d1 >> 24 & 0xff ] + '-' +
			lut[ d2 & 0x3f | 0x80 ] + lut[ d2 >> 8 & 0xff ] + '-' + lut[ d2 >> 16 & 0xff ] + lut[ d2 >> 24 & 0xff ] +
			lut[ d3 & 0xff ] + lut[ d3 >> 8 & 0xff ] + lut[ d3 >> 16 & 0xff ] + lut[ d3 >> 24 & 0xff ];

		return uuid.toUpperCase();
	};
}();
