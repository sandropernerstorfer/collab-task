<h1>Import validation.js</h1>

---------------------------------------------------------------------------

**_Validierungs Funktion ( Objekt + Methoden)_**
    Bei erfolgreicher Validierung wird ein leerer String zurückgegeben -> ''.
    Bei fehlgeschlagener Validierung wird eine passende Fehlermeldung als String zurückgegeben.

##### name
    trim() -> mindestens 6 stellen ? -> maximal 30 stellen ? -> return ''

##### mail
    trim() -> enthält @ ? -> enthält . ? -> return ''

##### pass
    trim() -> mindestens 8 stellen ? -> return ''

##### deskname
    trim() -> mindestens 1 stelle ? -> maximal 15 stellen ? -> return ''
    
---------------------------------------------------------------------------