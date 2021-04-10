<h1>board.js</h1>

---------------------------------------------------------------------------

##### IMPORTS + GLOBAL

**_import validation_**
    importiert von js/scripts/validation.js
    methoden für input validierung

**_socket = io()_**
    öffne socket connection

**_let newName_**
    STRING
    zwischenspeichert den usernamen bei änderungen

**_let nameEditing_**
    BOOLEAN
    default = false
    wird auf true gesetzt wenn der Username geändert wird ( noch nicht gespeichert )
    wird wieder auf false gesetzt wenn das profil geschlossen oder die änderung gespeichert wird

**_let newImage_**
    BOOLEAN
    default = false
    wird auf true gesetzt wenn ein neues Bild gewählt wird ( noch nicht gespeichert )
    wird wieder auf false gesetzt wenn das profil geschlossen oder die änderung gespeichert wird

---------------------------------------------------------------------------

**_Board-Data Fetch_**
    beim öffnen des Dashboards werden vom server die benötigten USER und DESK daten gefetcht
    in 'boardData' als object gespeichert
    Setup Functions / Render Functions werden aufgerufen und die daten im client entsprechen angezeigt

---------------------------------------------------------------------------

##### SETUP FUNCTIONS / RENDER FUNCTIONS
werden nach Board Data Fetch aufgerufen um alle daten aus dem boardData Objekt entsprechend anzuzeigen

**_renderUsername_**
    holt sich alle elemente mit der klasse .username und setzt den username als textContent

**_renderUserImage_**
    prüft ob ein userImage angegeben ist
    holt sich das profil element in der navbar und das profilbild element im profil
    und setzt je nachdem das bild als background-image.  ( ist kein bild angegeben wird ein defaul user image gerendert)

**_renderDeskData_**
    erstellt für jeden Desk eine Desk-Card und zeigt diese in der Desk Section an

**_renderSharedData_**
    erstellt für jeden Shared-Desk eine Desk-Card und zeigt diese in der Shared-Desk Section an

**_renderInvites_**
    erstellt für jede Einladung eine spezielle Desk-Card mit Accept- / Discard-Buttons und zeigt diese in der Invite Section an

**_sortHandling_**
    prüft ob sich im localStorage bereits eine Sorting Präferenz befindet
    sortiert je nach Präferenz die Desk-Cards nach den angegebenen werten

---------------------------------------------------------------------------

**_Open Desk_**
    function(STRING), parameter -> deskID, Desk ID des gewählten Desk
    übernimmt die gewählte deskID und leitet weiter an diesen Desk

---------------------------------------------------------------------------

##### INVITE HANDLIND

**_acceptInvite_**
    function(STRING), parameter -> inviteID, Desk ID der Einladung
    löscht die invite-card und speichert den neuen desk als shared-desk
    rendert die invites und sharedDesks

**_discardInvite_**
    function(STRING), parameter -> inviteID, Desk ID der Einladung
    löscht die invite-card und den invite eintrag aus dem User

---------------------------------------------------------------------------

##### DESK CREATION

**_Create Desk Submit_**
    Desk Data Validation
    Error Handling
    Speichert Desk in Datenbank

**_Desk Colors_**
    Desk Farben durchschalten
    bei auswahl :
    entferne alle .selected-color klassen
    füge sie bei dem ausgewählten element hinzu

---------------------------------------------------------------------------

##### USER PROFILE

**_Edit Name Button_**
    Übernimmt zwischenspeicherung, error handling und button + input wechsel

**_Cancel Edit Button_**
    beendet die bearbeitung und setzt den usernamen wieder auf den letzten stand zurück

**_Instant Image Display_**
    imageEdit ist der custom EDIT button, dieser leitet den click an den eigentlichen file-input weiter
    wenn ein bild ausgewählt wurde wird das event vom eventListener erkannt
    und das bild als dataURL in das element geladen

**_Save Profile Changes_**
    wenn der SAVE button im Profil bereich geklickt wird
    vergleiche den neuen namen mit dem originalen
    wenn der name neu ist Update in der Datenbank und update client mit response
    kontrolliere ob ein neues bild gewählt wurde, wenn ja sende an server

**_Close Profile_**
    wenn das modal geschlossen wird -> rufe resetProfile() funktion auf
    resetProfile() setzt editing auf false , den zwischenspeicher auf den originalen username
    und setzt die Profile Page auf standard zurück

**_Reset Profile_**
    setzt im user profil entsprechend die buttons und daten zurück (zb beim schließen des modal)

**_User Logout_**
    bei klick auf den Log Out button
    server call auf /logout -> setzt lokal den user zurück und löscht session
    danach redirect auf /login

---------------------------------------------------------------------------

##### BOARD SORTING

**_Sort Form Event_**
    übernimmt die zwei werte der sorting form -> wonach sortieren & in welche richtung
    die werte werden als präferenz in den localStorage gespeichert damit nach app neustart wieder genau so sortiert wird
    die sortBoard() funktion sortiert die Desk Arrays, speichert sie in das haupt boardData objekt, und rendert die Desks

**_Sort Board Function_**
    parameter (ARRAY) array        Array dass sortiert wird
    parameter(STRING) sortBy       wonach wird sortiert : zb. 'name', 'date', 'color'
    parameter(STRING) sortOrder    bestimmt die sortier Richtung : 'ascending' oder 'descending'

---------------------------------------------------------------------------

**_Invite Cards Dynamic Color_**
    ändert bei mouseover und mouseout events die farben der invite-card

---------------------------------------------------------------------------

##### SOCKET EVENTS

**_socket.emit( 'board-join' )_**
    löst am server board-join aus und schickt User ID mit, um einem socket room beizutreten

**_socket.on( 'new-invite' )_**
    wird von server ausgelöst wenn eine neue einladung verfügbar ist
    lädt die neuen einladungen und rendert Invites

**_socket.on( 'board-deleted' )_**
    wird von server ausgelöst wenn ein desk gelöscht wurde auf dem der user sich als member befindet
    lädt die neuen sharedDesks und rendert SharedDesks

**_Update Clients on Invite-Accept_**
    function(STRING), parameter -> inviteID der akzeptierten einladung
    löst socket-event 'invite-accepted' am server aus und schickt path+ inviteID mit