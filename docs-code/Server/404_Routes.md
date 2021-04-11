<h1>404_Routes.js</h1>

---------------------------------------------------------------------------

##### IMPORTS + GLOBAL

**_require('express')_**
    Express Framework

**_express.Router()_**
    Express ROUTER funktion welche unsere Routen speichert.
    Wird am ende des Dokuments als modul exportiert

---------------------------------------------------------------------------

##### ROUTES
    Alle 404 Routen hören auf url path: '/*?'.
    Bedeutet alle url's die sonst keinen festgelegten Router besitzen

**_GET('/')_**
    Schickt die HTML-Datei '404.html' an den client
    Signalisiert dem User dass diese URL so nicht im Programm existiert

---------------------------------------------------------------------------

##### EXPORT

**_Exporting Routes_**
    Exportiert alle festgelegten Routen

---------------------------------------------------------------------------