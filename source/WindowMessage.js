"use strict";

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
 *		authentication(?): ...,
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
 *		data(?): ...,
 *		authentication(?): ...,
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
 * }
 *
 * @static
 * @attribute CONNECT
 * @type {Number}
 */
WindowMessage.CONNECT = 7;
