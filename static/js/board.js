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
fetch('/board/userdata')
.then( response => response.json())
.then( data => {
    boardData = data;
    renderUsername();
    renderUserImage();
    renderDeskData();
    renderSharedData();
    renderInvites();
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
    let deskCount = 0;
    const desksSection = document.querySelector('#desksContainer');
    if(boardData.desks.length == 0){
        desksSection.innerHTML = `<div class="card col no-card no-desk"><div><h4>Start by creating your first Desk</h4><small>You can use your own Deskname and pick a color you like</small><i id="handPointer" class="far fa-hand-point-up"></i></div></div>`;
    }
    else{
        desksSection.innerHTML = '';
        for(let i = 0; boardData.desks.length > i; i++){
            deskCount++;
            desksSection.innerHTML += `<div class="card col"><div id="desk${i}" class="${boardData.desks[i].color}-card">${boardData.desks[i].name}</div></div>`;
        };
        for(let i = 0; boardData.desks.length > i; i++){
            document.getElementById(`desk${i}`).addEventListener('click', () => { openDesk(boardData.desks[i]._id) });
        };
    };
    document.querySelector('#deskCount').textContent = deskCount.toString();
};
function renderSharedData(){
    let deskCount = 0;
    const sharedSection = document.querySelector('#sharedContainer');
    if(boardData.sharedDesks.length == 0){
        sharedSection.innerHTML = `<div class="card col no-card no-shared"><div><h4>All Desks you are a Member on will show up here</h4><small>Currently you are not a member on a desk</small></div></div>`;
    }
    else{
        sharedSection.innerHTML = '';
        for(let i = 0; boardData.sharedDesks.length > i; i++){
            sharedSection.innerHTML += `<div class="card col"><div id="shared${i}" class="${boardData.sharedDesks[i].color}-card">${boardData.sharedDesks[i].name}</div></div>`;
        };
        for(let i = 0; boardData.sharedDesks.length > i; i++){
            document.getElementById(`shared${i}`).addEventListener('click', () => { openDesk(boardData.sharedDesks[i]._id) });
        };
    };
    document.querySelector('#sharedCount').textContent = deskCount.toString();
};
function renderInvites(){
    let inviteCount = 0;
    const invitesSection = document.querySelector('#invitesContainer');
    if(boardData.invites.length == 0){
        invitesSection.innerHTML = `<div class="card col no-card no-invites"><div><h4>Desk Invitations</h4><small>There are no open invitations</small></div></div>`;
    }
    else{
        invitesSection.innerHTML = '';
        for(let i = 0; boardData.invites.length > i; i++){
            invitesSection.innerHTML += `<div class="card col"><div id="invite${i}" class="${boardData.invites[i].color}-card">${boardData.invites[i].name}</div></div>`;
        };
        for(let i = 0; boardData.invites.length > i; i++){
            document.getElementById(`invite${i}`).addEventListener('click', () => { openInvite(boardData.invites[i]._id) });
        };
    };
    document.querySelector('#inviteCount').textContent = inviteCount.toString();
};

/**
 *
 * @param {string} deskID - Desk ID des gewählten Desk
 * übernimmt die gewählte deskID und leitet weiter an diesen Desk
 */
function openDesk(deskID){
    window.location.href = `desk/${deskID}`;
};

/**
 *# INVITE HANDLIND ( W.I.P. )
 * @param {string} inviteID - Desk ID der Einaldung
 */
function openInvite(inviteID){
    console.log(inviteID);
};

//---- DESK CREATION
/**
 *  DESK-MODAL
 * 1.) nach dem öffnen -> Fokus auf Deskname Input
 * 2.) nach dem schließen -> Reset error und input
 */
deskModal.addEventListener('shown.bs.modal', () => {
    try{
        let handPointer = document.querySelector('#handPointer');
        handPointer.style.opacity = '0';
        setTimeout(() => { handPointer.remove(); }, 410);
    }
    catch(err){}
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

        fetch('/board/desk', {
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
            nameField.innerHTML = newName.split(' ').join('-');
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
            body: JSON.stringify({username : newName.split(' ').join('-')}),
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



const imageForm = document.querySelector('#imageForm');
const imageEdit = document.querySelector('#imageEdit');
const imageInput = document.querySelector('#imageInput');

imageEdit.addEventListener('click', () => {
    imageInput.click();
});
imageInput.addEventListener('change', e => {
    if(e.target.files && e.target.files[0]){
        let reader = new FileReader();

        reader.addEventListener('load', e => {
            const imageField = document.querySelector('#profile-picture');
            imageField.style.backgroundImage = `url("${e.target.result}")`;
        });

        reader.readAsDataURL(e.target.files[0]);
    }
});

imageForm.addEventListener('submit', e => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('image', imageInput.files[0]);

    fetch('/user/image', {
        method: 'PATCH',
        body: formData
    });
});