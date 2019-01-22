# Tabtalk
 - Javascript browser tab/window local message communication library.

## Comunication

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
