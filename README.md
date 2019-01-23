# Cross-Tabtalk
 - Javascript browser tab/window local message communication library.
 - Crossdomain networked comunication between 2 or more windows.
 - 

## Todo
- Navigation requests.
- Remote method invocation (RMI).

## Build
 - Install NPM
 - Clone the repository to your computer
 - Run ```npm intall && npm run build```

## Usage
 - The WindowManager is the object reponsible for handling the comunication.
 - Each window/tab should have one of these objects, to discern the windows a string type indicator.
 - To declare a window as type "A" we can create the WindowManager object.

```
  var manager = new WindowManager("A");
```

 - To open another window use the manager.openSession method that returns a WindowSession object.
 - The WindowSession object is responsible for handling comunication to another window.
 - We can use the method session.sendMessage(data, authentication) to send data to another window.
 - The callbacks onReady, onMessage and onClose can be used to receive data from the other window.

```
  var session = manager.openSession("anotherwindow.html", "B");
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

 - Messages can be broadcasted to all known windows using the WindowManager object.
 - To send messages the broadcast(data, authentication) method can be used.
 - To process broadcasted messages the onBroadcastMessage callback can be used.

```
manager.broadcast({a:"something"}, "authenticationtoken");

manager.onBroadcastMessage = function(data, authentication)
{
  console.log("Broadcast Message received", data, authentication);
};
```

## Comunication Diagram
 - TODO

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
A Known C  |         action:LOOKUP_FOUND   ,   | If B doesnot known C
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
