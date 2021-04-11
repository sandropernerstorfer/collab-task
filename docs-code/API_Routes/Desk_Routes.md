<h1>Desk_Routes.js</h1>

---------------------------------------------------------------------------

##### IMPORTS + GLOBAL

**_require('express')_**
    Express Framework

**_express.Router()_**
    Express ROUTER funktion welche unsere Routen speichert.
    Wird am ende des Dokuments als modul exportiert

**_require('../models/Desk')_**
    Importiert das mongoDB DESK-Schema

**_require('../models/User')_**
    Importiert das mongoDB USER-Schema

---------------------------------------------------------------------------

##### ROUTES
    Alle Desk Routen hören auf url path: '/desk'.

**_get('/')_**
    Wird /desk ohne deskID aufgerufen wird der User auf /board geleitet

**_get('/deskdata')_**
    Wird aufgerufen sobald der User einen Desk betritt
    Sammelt alle nötigen Desk Daten und schickt sie an den client zurück

**_get('/members')_**
    Nur die DeskMember werden abgerufen und an den client geschickt
    zb wenn durch eine Einladung ein neuer Member teil des desk ist

**_get('/:deskID')_**
    Wird aufgerufen wenn ein desk geöffnet wird ( /desk/123123123123)
    Prüft ob ein zugangstoken vorhanden ist
    Bei zugangsberechtigung wird die HTML Datei 'desk.js' an den client geschickt

**_patch('/deskname')_**
    Wird aufgerufen wenn ein admin den Desk-Namen ändert
    Speichert den neuen angegebenen Namen in der Datenbank

**_delete('/leave')_**
    Wird aufgerufen wenn ein member den desk verlässt
    Desk Referenz wird aus dem User Objekt in der datenbank gelöscht

**_delete('/delete')_**
    Wird aufgerufen wenn ein admin einen desk löscht
    Löscht den desk und die desk-referenz aus dem admin und jedem member objekt

**_post('/list')_**
    Wird aufgerufen wenn eine neue liste am desk erstellt wird
    Speichert eine neue liste mit dem namen im desk-objekt in der datenbank

**_patch('/list/order')_**
    Wird aufgerufen wenn eine Liste am desk verschoben wurde
    Aktualisiert die ORDER (reihenfolge) jeder liste

**_patch('/list/name')_**
    Wird aufgerufen wenn der name einer liste geändert wird
    Speichert den neuen Listen Namen im passenden objekt

**_delete('/list/:listID')_**
    Wird aufgerufen wenn eine liste gelöscht wird
    Entfernt die Liste aus dem desk objekt in der datenbank

**_post('/task')_**
    Wird aufgerufen wenn ein neuer Task in einer Liste erstellt wird
    Speichert neuen task mit tasknamen in der angegebenen liste (listID)

**_delete('/task/:listID/:taskID')_**
    Wird aufgerufen wenn ein task aus einer liste gelöscht wird
    Löscht einen task aus der angegebenen liste

**_patch('/task/name')_**
    Wird aufgerufen wenn ein Task-Name geändert wird
    Speichert den neuen tasknamen beim task in der datenbank

**_patch('/task/description')_**
    Wird aufgerufen wenn eine Task-Beschreibung geändert wird
    Speichert die neue beschreibung beim task in der datenbank

**_patch('/task/order')_**
    Wird aufgerufen wenn ein task veschoben wurde
    Aktualisiert die ORDER (reihenfolge) aller tasks in dieser Liste
    Falls der task von einer liste in eine andere verschoben wurde müssen die tasks beider listen aktualisiert werden

**_post('/:listID/:taskID/member')_**
    Wird aufgerufen wenn ein Desk Mitglied einem Task zugewiesen wurde
    Setzt die ID dieses Users auf die Task Member liste des tasks

**_delete('/:listID/:taskID/:userID')_**
    Wird aufgerufen wenn ein Task Mitglied wieder vom task entfernt wird
    entfert diese userID aus der TaskMember liste des tasks

---------------------------------------------------------------------------

##### EXPORT

**_Exporting Routes_**
    Exportiert alle festgelegten Routen

---------------------------------------------------------------------------