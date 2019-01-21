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
A Knows B  |         action:"ready",           |
   data    |         originUUID:...,           |
           |         originType:...            |
           |     }                             |
           |                                   |
           |             Message               |
           | --------------------------------> |
           |     {                             |
           |         action:"message",         |  B Knows A
           |         originUUID:...,           |     data
           |         originType:...,           |
           |         destinationUUID:...,      |
           |         destinationType:...,      |
           |         token:...,                |
           |         data:{...}                |
           |     }                             |
           |                                   |
           | <------------[...]--------------> |
           |                                   |
           |          Lookup Window            |
           | --------------------------------> |
           |     {                             |
           |         action:"lookup",          | Lets assume 
           |         originUUID:...,           | B known C
           |         originType:...,           | its sends a response
           |         destinationType:...,      | containing C data.
           |         url:...                   |
           |     }                             |
           |                                   |
           |          Lookup Response          |
           | <-------------------------------- |
           |     {                             |
A Known C  |         action:"lookup_data",     | If B doesnot known C
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
