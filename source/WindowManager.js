"use strict";

/**
 * Message utils takes care of messaging between multiple windows. Messages can be transfered direcly or forwarded between windows.
 *
 * Is responsible for keeping track of all sessions, handles message reception, message forwarding and message sending.
 *
 * When a window is open it cannot be acessed we need to wait for the ready message.
 *
 *            A              Open                 B
 *            | --------------------------------> |
 *            |                                   |
 *            |            (A waits)              |
 *            |                                   |
 *            |           Ready Message           |
 *            | <-------------------------------- |
 *            |     {                             |
 * A Knows B  |         action:"ready",           |
 *    data    |         originUUID:...,           |
 *            |         originType:...            |
 *            |     }                             |
 *            |                                   |
 *            |             Message               |
 *            | --------------------------------> |
 *            |     {                             |
 *            |         action:"message",         |  B Knows A
 *            |         originUUID:...,           |     data
 *            |         originType:...,           |
 *            |         destinationUUID:...,      |
 *            |         destinationType:...,      |
 *            |         token:...,                |
 *            |         data:{...}                |
 *            |     }                             |
 *            |                                   |
 *            | <------------[...]--------------> |
 *            |                                   |
 *            |          Lookup Window            |
 *            | --------------------------------> |
 *            |     {                             |
 *            |         action:"lookup",          | Lets assume 
 *            |         originUUID:...,           | B known C
 *            |         originType:...,           | its sends a response
 *            |         destinationType:...,      | containing C data.
 *            |         url:...                   |
 *            |     }                             |
 *            |                                   |
 *            |          Lookup Response          |
 *            | <-------------------------------- |
 *            |     {                             |
 * A Known C  |         action:"lookup_data",     | If B doesnot known C
 *  via B     |         originUUID:...,           | action is lookup_unknown
 *            |         originType:...,           | and data empty.
 *            |         destinationType:...,      |
 *            |         destinationUUID:...,      |
 *            |         data:                     |
 *            |         {                         |
 *            |             uuid:...,             | UUID of C
 *            |             type:...              | Type of C
 *            |         }                         |
 *            |     }                             |
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
	 * Event manager containing the message handling events for this manager.
	 *
	 * @attribute manager
	 * @type {EventManager}
	 */
	this.manager = new EventManager();
	this.manager.add(window, "message", function(event)
	{
		var message = event.data;

		console.log("Window message received.", event);

		//Session ready
		if(message.action === "ready")
		{
			var session = self.sessions[message.originUUID];
			if(session !== undefined)
			{
				
			}
		}
		//Session closed
		else if(message.action === "closed")
		{
			var session = self.sessions[message.originUUID];

			//TODO <CLOSED EVENT>

			if(session !== undefined)
			{
				delete self.sessions[message.originUUID];
			}
		}
		else
		{
			//TODO <ON MESSAGE>
		}

		/*
		//Lookup for other windows
		else if(message.action === "lookup")
		{

		}
		//Lookup response
		else if(message.action === "lookup_found")
		{

		}
		//Regular message being exchanged
		else if(message.action === "message")
		{

		}*/
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
 * Generate a UUID.
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

		// .toUpperCase() here flattens concatenated strings to save heap memory space.
		return uuid.toUpperCase();
	};
}();


/**
 * Send an acknowledge message.
 *
 * Used to send a signal indicating the parent window that it is ready to receive data.
 *
 * @method checkOpener
 */
WindowManager.prototype.checkOpener = function()
{
	if(this.wasOpened())
	{
		var session = new WindowSession(this);
		session.window = window.opener;
		session.status = WindowSession.READY;
		session.acknowledge();

		//TODO <ADD SESSION TO THE LIST>
	}
};

/**
 * Create a new session with a new window from URL and type.
 *
 * First needs to search for a window of the same type in the known sessions.
 *
 * @method openSession
 * @param {String} url URL of the window.
 * @param {String} type Type of the window to open.
 * @return {WindowSession} Session opened.
 */
WindowManager.prototype.openSession = function(url, type)
{
	//TODO <LOOKUP FOR A SESSION OF THIS TYPE>
	
	var session = new WindowSession(this);
	session.window = window.open(url);
	session.url = url;
	session.type = type;

	//TODO <ADD SESSION TO THE LIST>

	return session;
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
