# Cross-TabTalk

[![npm version](https://badge.fury.io/js/crosstabtalk.svg)](https://badge.fury.io/js/crosstabtalk)
[![GitHub version](https://badge.fury.io/gh/tentone%2Fcrosstabtalk.svg)](https://badge.fury.io/gh/tentone%2Fcrosstabtalk)

 - JavaScript browser tab/window local message communication library.
 - Cross-domain networked communication between 2 or more windows.



### Todo
 - Navigation requests.
 - Cross window method invocation (RMI).
 - Establish communication with already existing windows.



### Build
 - Install NPM
 - Clone the repository to your computer
 - Run ```npm install && npm run build```



### Usage
 - If you're using the UMD bundle the namespace for the project is ```CTalk```.

```javascript
  var manager = new CTalk.WindowManager("A");
```
 - The `WindowManager` is the object responsible for handling the communication.
 - Each window/tab should have one of these objects, to discern the windows a string type indicator.
 - To declare a window as type "A" we can create the `WindowManager` object.

```javascript
  var manager = new WindowManager("A");
```

 - To open another window use the `manager.openSession` method that returns a `WindowSession` object.
 - The `WindowSession` object is responsible for handling communication to another window.
 - We can use the method `session.sendMessage(data, authentication)` to send data to another window.
 - The callbacks `onReady`, `onMessage` and `onClose` can be used to receive data from the other window.

```javascript
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
  
  ...

  if(manager.sessionExists("B"))
  {
    session = manager.getSession("B");
  }
```

 - Messages can be broadcasted to all known windows using the `WindowManager` object.
 - To send messages the `broadcast(data, authentication)` method can be used.
 - To process broadcasted messages the `onBroadcastMessage` callback can be used.

```javascript
manager.broadcast({a:"something"}, "authenticationtoken");

manager.onBroadcastMessage = function(data, authentication)
{
  console.log("Broadcast Message received", data, authentication);
};
```
 - To close a session you can use the `session.close()` method.
 - The close method can receive a `closeWindow` parameter to indicate if the session window should be closed.
 - To handle message globally the manager object also contains an `onMessage` callback that receives the window type, data and authentication data as parameters.
```javascript
manager.onMessage = function(type, data, auhentication)
{
  console.log("Message received", type, data, authentication);
}
```



### Communication Diagram

 - Bellow there is a simple communication diagram explaining the handshake process used to establish communication.
 - In this example three windows exist the fist window is A, A is opens B.
 - B opens the window C, communication from A to C has to be redirected by B.

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
           | --------------------------------> |                                   C
           |     {                             |                                   |
           |         action:LOOKUP,            | Lets assume                       |
           |         originUUID:...,           | B known C                         |
           |         originType:...,           | its sends a response              |
           |         destinationType:...,      | containing C data.                |
           |         url:...                   |                                   |
           |     }                             |                                   |
           |                                   |                                   |
           |          Lookup Response          |                                   |
           | <-------------------------------- |                                   |
           |     {                             |                                   |
A Known C  |         action:LOOKUP_FOUND   ,   | If B doesnot known C              |
 via B     |         originUUID:...,           | action is lookup_unknown          |
           |         originType:...,           | and data empty.                   |
           |         destinationType:...,      |                                   |
           |         destinationUUID:...,      |                                   |
           |         data:                     |                                   |
           |         {                         |                                   |
           |             uuid:...,             | UUID of C                         |
           |             type:...              | Type of C                         |
           |         }                         |                                   |
           |     }                             |                                   |
           |        Ready Message from A       |         Ready Message from A      |
           | --------------------------------> | --------------------------------> | 
           |                                   |                                   |
           |                                   |                                   |
```
