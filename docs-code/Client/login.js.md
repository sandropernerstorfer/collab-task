<h1>login.js</h1>

---------------------------------------------------------------------------

##### IMPORTS + GLOBAL

**_import validation_**
    importiert von js/scripts/validation.js
    methoden für input validierung

**_toggling_**
    BOOLEAN
    wird die form gerade umgeschaltet wird toggling auf true gesetzt und die funktionen toggle funktionen deaktiviert
    nach dem umschalten wird toggling wieder auf false gesetzt und die funktionen aktiviert

**_activeForm_**
    STRING
    'signin' oder 'signup' je nach aktiver Form

---------------------------------------------------------------------------

##### FORM AUSWAHL / TOGGLE

**_Form Auswahl_**
    Übernimmt click events auf Log In / Sign Up headings um Form umzuschalten
    rufen nach auswahl 'toggleFormSwitches' und 'toggleForms('signin' oder 'signup')' auf

**_Toggle Heading_**
    markiert je nach aktiver form das entsprechende Heading

**_Toggle Forms_**
    function{STRING} parameter -> formType enthält entweder 'signin' oder 'signup'
    dem paramenter entsprechend wird dann die Form per übergang umgeschalten
    und elemente hinzugefügt oder wieder entfernt (zb. username input = bei signin entfernt, bei signup hinzugefügt)

---------------------------------------------------------------------------

##### SUBMIT FORM

**_Submit Form_**
    wird auf einen der beiden Submit buttons geklickt werden die Input Werte validiert
    bei fehlgeschlagener validierung werden alle nötigen Fehlermeldungen eingeblendet
    sind alle werte validiert und bereit an den server geschickt zu werden,
    wird je nach aktiver Form - signupUser({input werte}) oder signinUser({input werte}) - aufgerufen

**_Render Form Errors_**
    function(ARRAY) parameter -> errorArray, Array welches alle nötigen Fehlermeldungen bei fehlgeschlagener Validierung enthält
    wird kein parameter an diese funktion übergeben, werden die Error felder zurückgesetzt (leerer String)
    ansonsten werden die nachrichten nach der reihe in die elemente eingefügt und dem User angezeigt

**_Sign Up User_**
    function(OBJECT) parameter -> newUser, Objekt welches alle input daten für den SIGNUP enthält
    dieses Objekt wird dann per POST Request an den server geschickt
    welcher dann in der Datenbank kontrolliert ob die angegebene Email schon existiert
    wenn ja wird dem User per renderErrors funktion dies angezeigt
    ansonsten war der Signup erfolgreich -> weiterleitung zum Persönlichen Dashboard

**_Sign In User_**
    function(OBJECT) parameter -> userLogin, Objekt welches alle input daten für den SIGNIN enthält
    dieses Objekt wird dann per POST Request an den server geschickt
    welcher dann zuerst in der Datenbank kontrolliert ob diese Email existiert
    wenn nicht wird dem User per renderErrors funktion dies angezeigt

    Existiert die Email Adresse vergleicht der Server das angegebene Passwort mit dem aus der Datenbank
    falsches Passwort -> Fehlermeldung
    ansonsten war der Sigin erfolgreich -> weiterleitung zum Persönlichen Dashboard

---------------------------------------------------------------------------