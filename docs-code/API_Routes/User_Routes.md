<h1>User_Routes.js</h1>

---------------------------------------------------------------------------

##### IMPORTS + GLOBAL

**_require('express')_**
    Express Framework

**_express.Router()_**
    Express ROUTER funktion welche unsere Routen speichert.
    Wird am ende des Dokuments als modul exportiert

**_require('bcrypt')_**
    bcrypt package
    wird verwendet um Passwörter zu verschlüsseln / entschlüsseln

**_require('uuid')_**
    uuid package
    wird verwendet um eine Einzigartige ID zu generieren die dann als Zugangstoken gilt

**_require('formidable')_**
    formidable package
    wird verwendet um form-data zu verarbeiten, insbesondere File Uploads ( User Profilbild )

**_require('cloudinary') & cloudinary.config()_**
    cloudinary package + konfiguration
    cloudinary ist der cloudspeicher welcher alle Profilbilder speichert
    durch das cloudinary-package wird die kommunikation zwischen cloud-service und applikation ermöglicht

    die config beinhaltet sensible API daten
    welche in den .env variablen festgelegt wurden um den cloudspeicher zu erreichen

**_require('../models/User')_**
    Importiert das mongoDB USER-Schema

---------------------------------------------------------------------------

##### ROUTES
    Alle User Routen hören auf url path: '/user'.

**_get('/username')_**
    Nur der Name des Users wird abgerufen
    Schickt den namen aus dem session.currentUser Objekt als response zurück
    Existiert kein username ( user nicht angemeldet ) wird false als response geschickt

**_post('/signup')_**
    Wird aufgerufen wenn der User einen neuen Account erstellen möchte
    Prüft in der Datenbank ob die angegebene Email schon existiert
    Erstellt ein neues User Objekt welches in der datenbank gespeichert wird und ein Zugangstoken

**_post('/signin')_**
    Wird aufgerufen wenn der User sich bei einem bestehenden Account anmelden möchte
    Prüft in der Datenbank ob die angegebene Email existiert
    Entschlüsselt das gespeicherte Password und vergleicht es mit dem angegebenen
    Erstellt ein Zugangstoken

**_patch('/username')_**
    Wird aufgerufen wenn der User seinen Namen im Profil ändert
    Speichert den neuen angegebenen Namen in der Datenbank und im session objekt

**_patch('/image')_**
    Wird aufgerufen wenn der User sein Profilbild ändert
    Verbindet sich mit der cloudinary API und speichert das neue bild
    Löscht wenn vorhanden das vorherige bild von der cloud
    Speichert eine Bild Referenz beim User in der datenbank

**_post('/invite')_**
    Wird aufgerufen wenn ein Desk-Admin einen anderen User einlädt
    Die DeskID der einaldung wird im Invites-Field des Users mit der angegebenen Email gespeichert

---------------------------------------------------------------------------

##### EXPORT

**_Exporting Routes_**
    Exportiert alle festgelegten Routen

---------------------------------------------------------------------------