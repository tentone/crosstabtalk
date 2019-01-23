# Tabtalk
 - Javascript browser tab/window local message communication library.

## Features
 - TODO

## Usage

```
  var manager = new WindowManager("A");
  manager.onBroadcastMessage = function(data, authentication)
  {
    console.log("Broadcast Message received", data, authentication);
  };

  var session = manager.openSession("another.html", "B");
  session.onReady = function()
  {
    console.log("Session B is ready.");
  };
  session.onMessage = function(data, authentication)
  {
    console.log("Session B message received", data, authentication);
  };
  session.onClose = function()
  {
    console.log("Session B closed");
  };
```

## Comunication Diagram

```
           A              Open                 B
           | --------------------------------> |
           |                                   |
           |            (A waits)              |
           |                                   |
           |           Ready Message           |
           | <-------------------------------- |
           |     {                             |
A Knows B  |         action:READY,             |
   data    |         originUUID:...,           |
           |         originType:...            |
           |     }                             |
           |                                   |
           |           Ready Message           |
           | --------------------------------> |
           |     {                             |
           |         action:READY,             |  B Knows A
           |         originUUID:...,           |     data
           |         originType:...            |
           |     }                             |
           |                                   |
           | <-----------[Messages]----------> |
           |     {                             |
           |         action:MESSAGE,           | 
           |         originUUID:...,           |
           |         originType:...,           |
           |         destinationUUID:...,      |
           |         destinationType:...,      |
           |         authentication:...,       |
           |         data:{...}                |
           |     }                             | 
           |                                   |
           |          Lookup Window            |
           | --------------------------------> |
           |     {                             |
           |         action:LOOKUP,            | Lets assume 
           |         originUUID:...,           | B known C
           |         originType:...,           | its sends a response
           |         destinationType:...,      | containing C data.
           |         url:...                   |
           |     }                             |
           |                                   |
           |          Lookup Response          |
           | <-------------------------------- |
           |     {                             |
A Known C  |         action:LOOKUP_RESPONSE,   | If B doesnot known C
 via B     |         originUUID:...,           | action is lookup_unknown
           |         originType:...,           | and data empty.
           |         destinationType:...,      |
           |         destinationUUID:...,      |
           |         data:                     |
           |         {                         |
           |             uuid:...,             | UUID of C
           |             type:...              | Type of C
           |         }                         |
           |     }                             |
           
```
