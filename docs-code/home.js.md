<h1>home.js</h1>

---------------------------------------------------------------------------

**_Check User Status_**
    Versuche Session-Cookie zu lesen und rufe renderBannerContent() auf
    wird ein cookie gefunden, werden per GET request die passenden user daten an den client geschickt
    wurde kein oder ein 'falscher cookie' gefunden werden keine userdaten gefunden und der server schickt nichts zurück

---------------------------------------------------------------------------

**_renderBannerContent( )_**
    function(STRING). parameter -> username enthält den Username des eingeloggten Users
    wird kein parameter an die funktion übergeben, beudetet das dass keine passende session gefunden wurde
    und eine allgemeine begrüßung + Login/SignUp button werden gerendert
    ansonsten wird eine begrüßung mit username + Dashboard button eingeblendet

---------------------------------------------------------------------------
    
**_Learn More Button_**
    wird der learn more button geklickt wird automatisch zur App Info gescrollt (main-section)

---------------------------------------------------------------------------

**_Scroll To Top_**
##### Button
    wird der TopScroll button geklickt wird automatisch zum oberen ende des Dokuments gescrollt

##### Show/Hide Button
    erstellt einen neuen IntersectionObserver welcher das element mit der ID #observed-element überwacht (main section)
    ist das element in sicht wird der button eingeblendet.
    entfernt sich das element aus dem bildschirm wird der button ausgeblendet

---------------------------------------------------------------------------