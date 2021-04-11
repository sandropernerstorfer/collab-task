<h1>Logout_Routes.js</h1>

---------------------------------------------------------------------------

##### IMPORTS + GLOBAL

**_require('express')_**
    Express Framework

**_express.Router()_**
    Express ROUTER funktion welche unsere Routen speichert.
    Wird am ende des Dokuments als modul exportiert

---------------------------------------------------------------------------

##### ROUTES
    Alle Logout Routen hören auf url path: '/logout'.

**_GET('/')_**
    User öffnet /logout
    Setzt das session.currentUser Objekt auf undefined
    Löscht _taskID Token und leitet User auf /login

---------------------------------------------------------------------------

##### EXPORT

**_Exporting Routes_**
    Exportiert alle festgelegten Routen

---------------------------------------------------------------------------