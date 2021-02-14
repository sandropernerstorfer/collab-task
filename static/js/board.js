import validation from './scripts/validation.js';
const deskModal = document.querySelector('#addDeskModal');
const profileClose = document.querySelector('#profileClose');
const profileSave = document.querySelector('#profileSave');
const deskForm = document.querySelector('#createDeskForm');
const deskError = document.querySelector('#desknameError');
const userError = document.querySelector('#usernameError');
const cancelBox = document.querySelector('#cancel-box');
const editName = document.querySelector('#editName');
const nameField = document.querySelector('#currentUsername');
let newName;
let editing = false;
/**
 * BOARD DATA FETCH
 * 
 * -- beim öffnen des Dashboards werden vom server die benötigten USER und DESK daten gefetcht
 * -- in 'boardData' als object gespeichert
 * -- und im client entsprechen angezeigt
 */
let boardData = {};
fetch('/desk/userdata')
.then( response => response.json())
.then( data => {
    boardData = data;
    console.log(boardData);
    renderUsername();
    renderUserImage();
    renderDeskData();
    renderSharedData();
});

/**
 * DISPLAY DESK & USER DATA
 * 
 * lädt user und desk daten von dem boardData objekt in das Dokument
 * beide funktionen werden aufgerufen sobald: 
 * -- der server die daten geschickt hat
 * -- und einzeln wenn daten geupdated wurden ( username bearbeitet , desk erstellt)
 */
function renderUsername(){
    newName = boardData.name;
    const nameElements = document.querySelectorAll('.username');
    nameElements.forEach( element => {
        element.textContent = boardData.name;
    });
};
function renderUserImage(){
    document.querySelector('#profile').style.backgroundImage = "url('../../assets/img/"+boardData.image+"')";
    document.querySelector('#profile-picture').style.backgroundImage = "url('../../assets/img/"+boardData.image+"')";
};
function renderDeskData(){
    const desksSection = document.querySelector('#desksContainer');
    if(boardData.desks.length == 0){
        desksSection.innerHTML = `<div class="card col"><div class="no-desk">No Desks</div></div>`;
    }
    else{
        desksSection.innerHTML = '';
        for(let i = 0; boardData.desks.length > i; i++){
            desksSection.innerHTML += `<div class="card col"><div id="desk${i}" class="${boardData.desks[i].color}-card">${boardData.desks[i].name}</div></div>`;
        };
        for(let i = 0; boardData.desks.length > i; i++){
            document.getElementById(`desk${i}`).addEventListener('click', () => { openDesk(boardData.desks[i]._id) });
        };
    }
};
function renderSharedData(){
    const sharedSection = document.querySelector('#sharedContainer');
    if(boardData.sharedDesks.length == 0){
        sharedSection.innerHTML = `<div class="card col no-shared"><div><h4>All Desks you are a Member on will show up here</h4><small>Currently there are no invitations or shared desks</small></div></div>`;
    }
    else{
        sharedSection.innerHTML = '';
        for(let i = 0; boardData.sharedDesks.length > i; i++){
            sharedSection.innerHTML += `<div class="card col"><div id="shared${i}" class="${boardData.sharedDesks[i].color}-card">${boardData.sharedDesks[i].name}</div></div>`;
        };
        for(let i = 0; boardData.sharedDesks.length > i; i++){
            document.getElementById(`shared${i}`).addEventListener('click', () => { openDesk(boardData.sharedDesks[i]._id) });
        };
    }
};

/**
 * 
 * @param {string} deskID - Die ID von dem Desk der geöffnet werden soll
 */
function openDesk(deskID){
    console.log(deskID);
};

//---- DESK CREATION
/**
 *  DESK-MODAL
 * 1.) nach dem öffnen -> Fokus auf Deskname Input
 * 2.) nach dem schließen -> Reset error und input
 */
deskModal.addEventListener('shown.bs.modal', () => {
    deskForm.deskname.focus();
});
deskModal.addEventListener('hidden.bs.modal', () => {
    deskError.innerHTML = '&nbsp;';
    deskForm.deskname.value = '';
});

/**
 * Desk Data Validation
 * Error Handling
 * Speicher Desk in Datenbank
 */
deskForm.addEventListener('submit', e => {
    e.preventDefault();
    const deskname = deskForm.deskname.value.trim();
    const error = validation.deskname(deskname);
    if(error !== ''){
        deskError.textContent = error;
        deskForm.deskname.focus();
    }
    else{
        const deskColors = ['green','blue','orange','black'];
        const allColors = document.querySelectorAll('.desk-color');
        const selectedColor = document.querySelector('.selected-color');
        const i = Array.prototype.indexOf.call(allColors, selectedColor);

        const newDesk = {
            name: deskname,
            color: deskColors[i],
            admin: boardData._id
        }

        fetch('/desk', {
            method: 'POST',
            body: JSON.stringify(newDesk),
            headers: {'Content-type' : 'application/json; charset=UTF-8'}
        })
        .then(response => response.json())
        .then( newDesk => {
            boardData.desks.push(newDesk);
            renderDeskData();
            document.querySelector('#deskModalClose').click();
        });
    }
});

/**
 * Desk FARBEN durchschalten
 * bei auswahl :
 * entferne alle .selected-color klassen
 * füge sie bei dem ausgewählten element hinzu
 */
document.addEventListener('click', e => {
    if(!e.target.matches('.desk-color')) return;
    const colorElements = document.querySelectorAll('.desk-color');
    colorElements.forEach( element => {
        element.classList.remove('selected-color');
    });
    e.target.classList.add('selected-color'); 
});

// ---- USER PROFILE
/**
 * newName; zwischenspeichert lokal den neu gewählten namen ( wenn validierung OK )
 * editing; boolean -> ändert den dataflow anhängig davon ob der name gerade bearbeitet wird oder nicht
 * editName Event Listener:
 * Übernimmt zwischenspeicherung, error handling und button + input wechsel
 */
editName.addEventListener('click', e => {
    if(!editing){
        editing = true;
        nameField.innerHTML = `<input type="text" name="newUsername" maxlength="30" class="form-control shadow-none" id="newUsername" value=${nameField.textContent}>`;
        editName.innerHTML = `<i class="fas fa-check"></i>`;
        cancelBox.innerHTML = `<button class="btn btn-outline-success button shadow-none"><i id="cancel" class="fas fa-redo-alt"></i></button>`;
        const input = document.querySelector('#newUsername');
        input.focus();
        input.select();
    }
    else{
        const inputValue = document.querySelector('#newUsername').value;
        const error = validation.name(inputValue);
        if(error == ''){
            newName = inputValue;
            nameField.innerHTML = newName;
            resetProfile();
        }
        else{
            document.querySelector('#newUsername').focus();
            userError.textContent = error;
        }
    }
});

/**
 * CANCEL EDIT
 * beendet die bearbeitung und setzt den usernamen wieder auf den letzten stand zurück
 */
document.addEventListener('click', e => {
    if(e.target.matches('#cancel')){
        nameField.innerHTML = newName;
        resetProfile();
    }
    else return;
});

/**
 * PROFIL ÄNDERUNG SPEICHERN
 * 
 * wenn der SAVE button im Profil bereich geklickt wird
 * vergleiche den neuen namen mit dem originalen -> wenn identisch call close event (resetProfile)
 * wenn der name neu ist Update in der Datenbank und update client mit response
 */
profileSave.addEventListener('click', () => {
    if(newName === boardData.name || newName == undefined){
        profileClose.click();
    }
    else{
        fetch('/user/username', {
            method: 'PATCH',
            body: JSON.stringify({username : newName}),
            headers: {'Content-type' : 'application/json; charset=UTF-8'}
        })
        .then(response => response.json())
        .then( newName => {
            boardData.name = newName;
            profileClose.click();
            setTimeout(() => {
                renderUsername();    
            }, 400);
        });
    }
});

/**
 * PROFILE CLOSE EVENT LISTENER
 * 
 * wenn das modal geschlossen wird -> rufe resetProfile() funktion auf
 * resetProfile() setzt editing auf false , den zwischenspeicher auf den originalen username
 * und setzt die Profile Page auf standard zurück
 */
profileClose.addEventListener('click', () => {
    setTimeout(() => {
        newName = boardData.name;
        nameField.innerHTML = newName;
        resetProfile();    
    }, 400);
});

/**
 * resetProfile()
 * setzt im user profil entsprechend die buttons und daten zurück (zb beim schließen des modal)
 */
function resetProfile(){
    editing = false;
    editName.innerHTML = `<i class="fas fa-pencil-alt"></i>`;
    cancelBox.innerHTML = '';
    userError.textContent = '';
};

/**
 * USER LOGOUT
 * 
 * bei klick auf den Log Out button
 * server call auf /logout -> setzt lokal den user zurück und löscht session
 * danach redirect auf /login
 */
const userLogout = document.querySelector('#logoutButton');
userLogout.addEventListener('click', () => {
    fetch('/logout')
    .then( res => window.location.href = '/login');
});