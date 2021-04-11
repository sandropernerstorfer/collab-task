<h1>Login_Routes.js</h1>

---------------------------------------------------------------------------

##### IMPORTS + GLOBAL

**_require('express')_**
    Express Framework

**_express.Router()_**
    Express ROUTER funktion welche unsere Routen speichert.
    Wird am ende des Dokuments als modul exportiert

---------------------------------------------------------------------------

##### ROUTES
    Alle Login Routen hören auf url path: '/login'.

**_GET('/')_**
    User öffnet /login
    Prüft ob ein Zugangstoken vorhanden ist
    Token vorhanden -> leite User weiter zum Dashboard
    Token nicht vorhanden -> User gelangt zum Login / Sign Up

**_USE('/*?')_**
    User öffnet /login/*?
    Egal welcher url-path nach '/login' hinzugefügt wird, der User wird auf /login geleitet

---------------------------------------------------------------------------

##### EXPORT

**_Exporting Routes_**
    Exportiert alle festgelegten Routen

---------------------------------------------------------------------------