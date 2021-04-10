<h1>desk.js</h1>

---------------------------------------------------------------------------

##### IMPORTS + GLOBAL

**_import validation_**
    importiert von js/scripts/validation.js
    methoden für input validierung

**_socket = io()_**
    öffne socket connection

---------------------------------------------------------------------------

**_Desk Data Fetch_**
    beim öffnen des Desk's werden vom server die benötigten Deskdaten geholt
    und aufgeteilt als objekte in 'userData, deskData, adminData, memberData und boardData' gespeichert
    Setup Functions / Render Functions werden aufgerufen und die daten im client entsprechen angezeigt

---------------------------------------------------------------------------

##### SETUP FUNCTIONS / RENDER FUNCTIONS
werden nach Desk-data Fetch aufgerufen um alle daten aus den objekten entsprechend anzuzeigen

**_fadeOutLoader_**
    blendet den loading-screen aus

**_renderDeskname_**
    holt sich alle elemente welchen den desknamen enthalten und setzt den deskname ein

**_renderMembers_**
    erstellt für den Admin und jeden Member eine Admin- und Member-Cards in der Navbar Mitglieder Liste

**_addRoleDependingEvents_**
    ist der user der admin des desks werden INVITE funktionen, RENAME DESK funktionen, und DELETE DESK funktionen freigegeben
    ist der user ein member kann dieser nur die LEAVE DESK funktion verwenden

**_renderLists_**
    sortiert je nach gegebener order die listen und tasks und rendert diese in den deskbereich

---------------------------------------------------------------------------

##### LIST & TASK DRAGGING

**_List only draggable when on grab-icon_**
    nur bei maus über einem grab-icon wird der zugehörigen liste der draggable attribut gegeben
    bei mauszeiger weg von einem grab-icon wird der draggable attribut entfernt

**_Add .dragging class_**
    gibt dem element welches bewegt wird die klasse .dragging ( opacity change )

**_Remove .dragging class and handle new order_**
    entfernt beim niederlegen des elements die .dragging klasse
    und ruft die funktionen auf welche die neue Reihenfolge der Liste oder Task speichern
    
**_Get and return current List Index_**
    holt sich den derzeitigen index der Liste im ListContainer und gibt ihn zurück

**_Get and return current Task Index_**
    holt sich den derzeitigen index des Tasks in der Liste und gibt ihn zurück

**_Create Array containing ID's and Order(index)_**
    erstellt ein Array welches die list/task ID + Order(Index) in objekten sammelt

**_Save new List / Task order_**
    speichert die neue task oder list reihenfolge in der datenbank

**_ADD DRAGOVER EVENTS_**
    Event feuert wenn sich drag cursor über drag Container bewegt

**_Returns the After Element_**
    Gibt das nächste element zurück von dem element über welchem sich der dragcursor befindet

---------------------------------------------------------------------------

**_INVITE MODAL - Input focus und Error Reset_**
    fokusiert nach öffnen des invite-modal den input automatisch
    setzt die error nachrichten nach schließen des invite-modals zurück

---------------------------------------------------------------------------

**_Show / Hide Side Menu_**
    macht das side-menu sichtbar und unsichtbar (toggle d-none class)

---------------------------------------------------------------------------

**_CREATE LIST: form / button toggle_**
    schaltet zwischen ADD LIST BUTTON und ADD LIST FORM

---------------------------------------------------------------------------

**_Try to close open forms or tasks_**
    versucht, wenn es welche gibt, geöffnete Tasks oder Forms zu schließen

---------------------------------------------------------------------------

**_ADD NEW LIST_**
    nach validierung des namens wird die liste erstellt

---------------------------------------------------------------------------

##### LIST ACTIONS

**_ADD TASK BUTTON / SAVE TASK / CANCEL TASK_**
    schaltet ADD TASK BUTTON und ADD TASK FORM um
    cancel-button event + save-task event

**_Expand / Collapse Task Field_**
    übernimmt nur clicks auf TASKS
    .task-expand class wird dem task element zugeschrieben um den task auszuklappen

**_DELETE LIST_**
    function(STRING), parameter -> listID,
    Fetch Request um liste zu löschen

---------------------------------------------------------------------------

##### SPECIFIC TASK

**_Open Task Modal_**
    nach klick auf einen INFO-Button eines tasks wird ein modal geöffnet
    und die daten dieses tasks in das modal geladen

**_findSpecificTask_**
    function(STRING, STRIN), parameter -> listID, taskID
    wird beim öffnen eines task modals aufgerufen um die task infos zu holen

**_calculatePassedTime_**
    function
    parameter {STRING} -> earlierMS, Früherer Zeitpunkt in ms.
    parameter {STRING} -> laterMS, Späterer Zeitpunkt in ms. <- (Optional)
    wird kein zweiter parameter angegeben wird der wert: Date.now() verwendet
    Rechnet die vergangene Zeit zwischen 2 Zeitpunkten und gibt die Anzahl in Tagen, Stunden, Minuten oder Sekunden zurück.
    Nach dem Errechnen der vergangenen Zeit wird der Wert je nach Ergebnis in: Days, Hours, Minutes or Seconds zurück gegeben.

**_Filter Task Members_**
    function(ARRAY), parameter -> taskMembers, taskMembers Array von member ID's die dem task zugewiesen sind.
    Sortiert die zugewiesenen und verfügbaren member eines tasks
    Gibt zurück: Objekt mit zwei Arrays. eines für die zugewiesenen und eines für die verfügbaren member

**_Create Task Member Bubbles_**
    erstellt beim öffnen eines task-modals für jeden desk-member + admin eine member-card

**_Assign/Remove Member to/from task_**
    bewegt den member von available zu assigned oder umgekehrt
    per fetch request wird in der datenbank gespeichert

**_Textarea for taskName & Description_**
    bekommt die textarea input wird autoSetTextareaHeight(TEXTAREA) aufgerufen
    um die größe jederzeit an den text anzupassen.
    Wird der ENTER-KEY gedrückt, wird der zeilenumbruch übersprungen und der fokus weggenommen
    bei CHANGE wird der neue text validiert und per fetch request gespeichert

**_SET TEXTAREA HEIGHT TO CONTENT_**
    function(HTML ELEMENT) parameter -> textarea, html textarea

**_Delete Specific Task_**
    function(STRING, STRING) parameter -> listID, taskID.
    löscht anhand der listID und taskID diesen task

---------------------------------------------------------------------------

##### COLOR THEME

**_Check Theme Preference_**
    prüft ob im localStorage eine dark-theme präferenz gespeichert ist und legt demnach light oder dark theme fest

**_Theme Switch/Button_**
    überwacht status von Theme Switch Button und legt je nach status theme fest

**_Set Data-Theme on body_**
    ändert je nach theme den data-theme attribut am body-element

---------------------------------------------------------------------------

##### TASK SEARCHBAR

**_Search on Enter-Key & SearchButton_**
    die suche wird gestartet sobal der Enter-Key gedrückt wird oder der SearchButton geklickt


**_Process Search Query_**
    validiert und checkt den such auftrag und durchsucht alle tasks

**_markFoundTask_**
    function(HTML ELEMENT), parameter -> found, gefundenes Task Element
    markiert das angegebene HTML Element und entfernt die markierung kurz danach wieder

**_markNotFound_**
    markiert die searchbar rot falls die suche nicht erfolgreich war

---------------------------------------------------------------------------

##### DESK CHAT

**_Open Chat Window_**
    versteckt oder zeigt das chat fenster beim klick auf den chat button

**_Build Chat Message List Element_**
    erstellt das listen element für den chat welches für eine nachricht benötigt wird

**_Build Chat info list element_**
    erstellt das listen element für den chat welches für informationen benötigt wird ( online status )

---------------------------------------------------------------------------

##### SOCKETS

**_socket.emit( 'join' )_**
    löst am server das socket event 'join' aus und tritt einem raum bei welcher auf diesen desk begrenzt ist
    schickt userID, userName, und location.pathname ( wird dann der name des rooms )

**_socket.emit( 'chat-here' )_**
    löst am server das socket event 'chat-here' aus und schickt den userName mit.
    Soll anderen usern am desk signalisieren das der user online ist

**_socket.on( 'new-member' )_**
    wird von server ausgelöst wenn ein neuer member beitritt ( invite wurde akzeptiert )

**_socket.on('left-member')_**
    wird von server ausgelöst wenn ein member den desk verlässt (permanent)
    bekommt id dieses members und löscht ihn aus dem client

**_socket.on('desk-deleted')_**
    wird von server ausgelöst wenn der admin den desk gelöscht hat
    eine warnung wird angezeigt und nach ein paar sekunden wird der user zum dashboard geleitet

**_socket.on('chat-receive')_**
    wird von server ausgelöst wenn ein anderer user eine nachricht verschickt
    die nachricht wird empfangen und damit ein list element gebaut

**_socket.on('chat-otherHere')_**
    wird von server ausgelöst wenn ein anderer member online kommt.
    name wird verwendet und ein chat info list element gebaut

**_socket.on('status-otherHere')_**
    wird von server ausgelöst wenn ein anderer member online kommt.
    ändert den online status des users in der memberliste

**_socket.on('desk-leave')_**
    wird von server ausgelöst wenn ein member offline geht.
    eine chat info wird mit dem namen gebaut und der user auf offline geschalten

---------------------------------------------------------------------------

**_Chat Form Message Submit_**
    löst am server chat-send aus und schickt die nachricht mit.
    sendet diese nachricht an alle anderen clients im selben raum

---------------------------------------------------------------------------

**_Toggle Online Status_**
    legt grünen ring um member-card wenn member online ist/kommt.
    graut member-card aus wenn member offline ist/geht

---------------------------------------------------------------------------