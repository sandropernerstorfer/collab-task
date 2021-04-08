———————————————————————————————————————————————————————————————————————————————
**IMPORT PACKAGES**
* _require('express') / app = express()_
    express framework und app initialisierung

* _require('express-session')_
    express-session package für user-session handling via cookie und req.session objekt

* _require('socket.io')_
    socket.io package für realtime client/server verbindungen (websockets)

* _require('cookie-parser')_
    cookie-parser für middleware zur cookie verarbeitung

* _require('mongoose')_
    mongoDB "framework" / tool

* _require('dotenv/config')_
    environment variables
———————————————————————————————————————————————————————————————————————————————
**IMPORT ROUTES**
* _require(./routes/ROUTE)_
    importiere routen (.js dateien) aus 'routes' ordner
———————————————————————————————————————————————————————————————————————————————
**MIDDLEWARE**
* _mongoose.set('useFindAndModify', false)_
    veraltete mongoose funktion exkludieren

* _app.use(express.static('static'))_
    static ordner angeben

* _app.use(express.json())_
    automatisches JSON Parsing

* _app.use(express.urlencoded({ extended: true }))_
    automatisches urlencoded payload Parsing

* _app.use(cookieParser())_
    automatisches cookie parsing. wird in req.cookies.-cookieName- gespeichert

* _app.use(session(......))_
    konfiguriert die express user-session mit secret key und sonstigen parametern
———————————————————————————————————————————————————————————————————————————————
**CHECK STATUS**
* _Get and Save User Data (Middleware)_
    kontrolliert den User status und speichert user daten in das session objekt
    ist der session cookie & session data vorhanden wird die middleware übersprungen
    ist nur der session cookie vorhanden wird damit der passende user in der Datenbank gesucht
    wird kein User gefunden (zB. wegen falscher cookieID) wird der cookie gelöscht und session data zurückgesetzt
    ansonsten speichere die nötigen user daten in das session objekt
———————————————————————————————————————————————————————————————————————————————
**ROUTING**
* _app.use( route, imported Route )_
    requests auf die angegebenen routen zu den importierten routen weiterleiten
———————————————————————————————————————————————————————————————————————————————
**PORT / DB CONNECTION**
* _app.listen(PORT)_
    server hört auf angegebenen port
* _mongoose.connect()_
    verbinde mongoDB datenbank mit angegebenen umgebungs-variablen
———————————————————————————————————————————————————————————————————————————————
**SOCKETS** 
* _socket.on( 'join' )_
    join wird von client ausgelöst wenn ein user einen desk öffnet
    client schickt: url-path und username. Welche im socket gespeichert werden
    socket tritt raum bei welcher den namen der url-location hat

* _socket.on( 'board-join' )_
    board-join wird von client ausgelöst wenn ein user sein dashboard öffnet
    Tritt einem privaten raum bei welcher dann live invites empfangen kann

* _socket.on( 'sent-invite' ).emit( 'new-invite' )_
    sent-invite wird von client im desk ausgelöst wenn eine einladung verschickt wird
    server löst dann new-invite im client dashboard des eingeladenen users aus

* _socket.on( 'invite-accepted' ).emit( 'new-member' )_
    invite-accepted wird von client im dashboard ausgelöst wenn eine einladung angenommen wird
    server löst new-member in desk-clients aus und lädt die neue member liste

* _socket.on( 'member-leaving' ).emit( 'left-member' )_
    member-leaving wird von client ausgelöst wenn dieser user den desk verlässt
    server löst left-member aus und entfernt den user aus den clients

* _socket.on( 'desk-deletion' ).emit( 'desk-deleted' ).emit( 'board-deleted' )_
    desk-deletion wird von client ausgelöst wenn admin den desk löscht
    löst in den anderen clients desk-deleted aus und bringt sie zurück zu ihren dashboards
    löst in den member boards board-deleted aus und entfernt den desk vom board

* _socket.on( 'chat-send' ).emit( 'chat-receive' )_
    chat-send wird von client ausgelöst wenn eine nachricht verschickt wird
    server löst dann chat-receive in den anderen clients im selben raum aus

* _socket.on( 'chat-here' ).emit( 'chat-otherHere' )_
    chat-here wird von client ausgelöst wenn ein user einen desk öffnet
    server löst dann chat-otherHere in den anderen clients im selben raum aus


* _socket.on( 'status-here' ).emit( 'status-otherHere' )_
    status-here wird von client ausgelöst wenn ein anderer user auf den desk kommt
    server löst status-otherHere in den anderen clients aus um dem neuzugang anzuzeigen wer bereits online ist


* _socket.on( 'disconnect' ).emit( 'desk-leave' )_
    disconnect wird ausgelöst wenn die socket verbindung vom client getrennt wird
    server löst dann desk-leave in den anderen clients im selben raum aus
    schickt username mit
———————————————————————————————————————————————————————————————————————————————