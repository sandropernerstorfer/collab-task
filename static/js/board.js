import validation from './scripts/validation.js';
import sortBoard from './scripts/boardSorting.js';
const socket = io();
/**
 * BOARD DATA FETCH
 * -- beim öffnen des Dashboards werden vom server die benötigten USER und DESK daten gefetcht
 * -- in 'boardData' als object gespeichert
 * -- und im client entsprechen angezeigt
 */
let boardData = {};
fetch('/board/boarddata')
.then( response => response.json())
.then( data => {
    boardData = data;
    sortHandling();
    renderUsername();
    renderUserImage();
    renderDeskData();
    renderSharedData();
    renderInvites();

    setupSocket();
});

function sortHandling(){
    if(localStorage.getItem('task_boardSort')){
        const {sortBy, sortOrder} = JSON.parse(localStorage.getItem('task_boardSort'));
        document.querySelector(`select option[value=${sortBy}]`).setAttribute('selected','true');
        document.querySelector(`select option[value=${sortOrder}]`).setAttribute('selected','true');
        boardData.desks = sortBoard(boardData.desks, sortBy, sortOrder);
        boardData.sharedDesks = sortBoard(boardData.sharedDesks, sortBy, sortOrder);
    };    
}
/**
 * Helper Variables
 */
let newName;
let editing = false;
let newImage = false;

/**
 * DISPLAY DESK & USER DATA
 * 
 * lädt user und desk daten von dem boardData objekt in das Dokument
 * beide funktionen werden aufgerufen sobald: 
 * -- der server die daten geschickt hat
 * -- und einzeln wenn daten geupdated wurden ( username bearbeitet, profilbild geändert, desk erstellt)
 */
function renderUsername(){
    newName = boardData.name;
    const nameElements = document.querySelectorAll('.username');
    nameElements.forEach( element => {
        element.textContent = boardData.name;
    });
};
function renderUserImage(){
    let imgUrl;
    if(boardData.image == null){
        imgUrl = 'url("../../assets/img/user-default.png")'; 
    }
    else{
        imgUrl = `url("https://res.cloudinary.com/sandrocloud/image/upload/w_200,c_scale/${boardData.image}")`;
    }
    document.querySelector('#profile').style.backgroundImage = imgUrl;
    document.querySelector('#profile-picture').style.backgroundImage = imgUrl;
};
function renderDeskData(){
    let deskCount = 0;
    const desksSection = document.querySelector('#desksContainer');
    if(boardData.desks.length == 0){
        desksSection.innerHTML = `<div class="card col no-card no-desk"><div><h4>Start by creating your first Desk</h4><small>Choose name and color for your desk</small></div></div>`;
    }
    else{
        desksSection.innerHTML = '';
        for(let i = 0; boardData.desks.length > i; i++){
            deskCount++;
            desksSection.innerHTML += `<div class="card col"><div id="desk${i}" class="${boardData.desks[i].color}-card desk-available">${boardData.desks[i].name}</div></div>`;
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
        sharedSection.innerHTML = `<div class="card col no-card no-shared"><div><h4>Desks you are a member on are shown here</h4><small>Currently you are not a member on a desk</small></div></div>`;
    }
    else{
        sharedSection.innerHTML = '';
        for(let i = 0; boardData.sharedDesks.length > i; i++){
            deskCount++;
            sharedSection.innerHTML += `<div class="card col"><div id="shared${i}" class="${boardData.sharedDesks[i].color}-card desk-available">${boardData.sharedDesks[i].name}</div></div>`;
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
            inviteCount++;
            invitesSection.innerHTML += `
                <div class="card col">
                    <div class="invite-available">
                        ${boardData.invites[i].name}
                        <div class="invite-buttons">
                            <button class="accept-button" id="accept${i}"><i class="far fa-check-circle"></i> Accept</button>
                            <button class="discard-button" id="discard${i}"><i class="far fa-trash-alt"></i> Discard</button>
                        </div>
                    </div>
                </div>`;
        };
        for(let i = 0; boardData.invites.length > i; i++){
            document.getElementById(`accept${i}`).addEventListener('click', () => { acceptInvite(boardData.invites[i]._id) });
            document.getElementById(`discard${i}`).addEventListener('click', () => { discardInvite(boardData.invites[i]._id) });
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
    const fadeWindow = document.querySelector('#fadeWindow')
    fadeWindow.style.zIndex = '9000';
    fadeWindow.style.opacity = '1';
    setTimeout(() => {
        window.location.href = `desk/${deskID}`;    
    }, 800);
};

/**
 * INVITE HANDLIND
 * @param {string} inviteID - Desk ID der Einladung
 */
function acceptInvite(inviteID){
    fetch('/board/invite', {
        method: 'PATCH',
        body: JSON.stringify({inviteID : inviteID}),
        headers : {'Content-type' : 'application/json; charset=UTF-8'}
    })
    .then(res => res.json())
    .then(status => {
        const desk = boardData.invites.find( desk => desk._id == inviteID);
        boardData.sharedDesks.push(desk);
        const filteredInvites = boardData.invites.filter( desk => desk._id !== inviteID );
        boardData.invites = filteredInvites;
        renderSharedData();
        renderInvites();
        updateOtherClients(inviteID);
    });
};
function discardInvite(inviteID){
    fetch('/board/invite', {
        method: 'DELETE',
        body: JSON.stringify({inviteID : inviteID}),
        headers : {'Content-type' : 'application/json; charset=UTF-8'}
    })
    .then(res => res.json())
    .then(status => {
        const filteredInvites = boardData.invites.filter( desk => desk._id !== inviteID);
        boardData.invites = filteredInvites;
        renderInvites();
    });
};

//---- DESK CREATION
/**
 *  DESK-MODAL
 * 1.) nach dem öffnen -> Fokus auf Deskname Input
 * 2.) nach dem schließen -> Reset error und input
 */
const deskModal = document.querySelector('#addDeskModal');
const deskForm = document.querySelector('#createDeskForm');
const deskError = document.querySelector('#desknameError');

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
 * Speichert Desk in Datenbank
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
            sortHandling();
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
 * editing; boolean -> ändert die button funktion abhängig davon ob der name gerade bearbeitet wird oder nicht
 * editName Event Listener:
 * Übernimmt zwischenspeicherung, error handling und button + input wechsel
 */
const editName = document.querySelector('#editName');
const nameField = document.querySelector('#currentUsername');
const cancelBox = document.querySelector('#cancel-box');
const userError = document.querySelector('#usernameError');

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
 * INSTANT IMAGE DISPLAY
 * 
 * imageEdit ist der custom EDIT button, dieser leitet den click an den eigentlichen file-input weiter
 * wenn ein bild ausgewählt wurde wird das event vom eventListener erkannt
 * und das bild als dataURL in das element geladen
 */
const imageInput = document.querySelector('#imageInput');

document.querySelector('#imageEdit').addEventListener('click', () => {
    imageInput.click();
});
imageInput.addEventListener('change', e => {
    if(e.target.files && e.target.files[0]){
        newImage = true;
        let reader = new FileReader();
        reader.addEventListener('load', e => {
            const imageField = document.querySelector('#profile-picture');
            imageField.style.backgroundImage = `url("${e.target.result}")`;
        });
        reader.readAsDataURL(e.target.files[0]);
    }
});

/**
 * PROFIL ÄNDERUNG SPEICHERN
 * 
 * wenn der SAVE button im Profil bereich geklickt wird
 * vergleiche den neuen namen mit dem originalen
 * wenn der name neu ist Update in der Datenbank und update client mit response
 * kontrolliere ob ein neues bild gewählt wurde, wenn ja sende an server
 */
document.querySelector('#profileSave').addEventListener('click', async () => {
    if(newName !== boardData.name && newName !== undefined){
        await fetch('/user/username', {
            method: 'PATCH',
            body: JSON.stringify({username : newName.split(' ').join('-')}),
            headers: {'Content-type' : 'application/json; charset=UTF-8'}
        })
        .then(response => response.json())
        .then( newName => {
            boardData.name = newName;
            renderUsername();
        });
    };
    if(newImage){
        document.querySelector('#profile-picture').style.filter = 'saturate(50%)';
        document.querySelector('#loadingCircle').innerHTML = `<div class="spinner-border" role="status"></div>`;
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        await fetch('/user/image', {
            method: 'PATCH',
            body: formData
        })
        .then(res => res.json())
        .then(image => {
            newImage = false;
            if(!image) console.log('failed')
            else{
                boardData.image = image;
                renderUserImage();
                document.querySelector('#loadingCircle').innerHTML = '';
                document.querySelector('#profile-picture').style.filter = 'none';
            }
        })
    };
});

/**
 * PROFILE CLOSE EVENT LISTENER
 * 
 * wenn das modal geschlossen wird -> rufe resetProfile() funktion auf
 * resetProfile() setzt editing auf false , den zwischenspeicher auf den originalen username
 * und setzt die Profile Page auf standard zurück
 */
document.querySelector('#profileClose').addEventListener('click', () => {
    setTimeout(() => {
        newImage = false;
        renderUserImage();
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
document.querySelector('#logoutButton').addEventListener('click', () => {
    fetch('/logout')
    .then( res => window.location.href = '/login');
});

/**
 * BOARD SORTING
 * übernimmt die zwei werte der sorting form -> wonach sortieren & in welche richtung
 * die werte werden als präferenz in den localStorage gespeichert damit nach app neustart wieder genau so sortiert wird
 * die sortBoard() funktion sortiert die Desk Arrays, speichert sie in das haupt boardData objekt, und rendert die Desks
 */
const sortForm = document.querySelector('#sortForm');
sortForm.addEventListener('change', e => {
    e.preventDefault();
    const sortBy = sortForm.sortBy.value;
    const sortOrder = sortForm.sortOrder.value;
    localStorage.setItem('task_boardSort', JSON.stringify({sortBy:sortBy, sortOrder:sortOrder}));
    boardData.desks = sortBoard(boardData.desks,sortBy,sortOrder);
    boardData.sharedDesks = sortBoard(boardData.sharedDesks,sortBy,sortOrder);
    renderDeskData();
    renderSharedData();
});

/**
 * INVITE CARDS DYNAMIC COLORS
 */
document.querySelector('#invitesContainer').addEventListener('mouseover', e => {
    if(!e.target.matches('.accept-button')) return;
    const parent = e.target.closest('.invite-available');
    const sibling = e.target.nextElementSibling;

    parent.style.color = '#23CE6B';
    sibling.style.color = '#ccc';
});
document.querySelector('#invitesContainer').addEventListener('mouseover', e => {
    if(!e.target.matches('.discard-button')) return;
    const parent = e.target.closest('.invite-available');
    const sibling = e.target.previousElementSibling;

    parent.style.color = 'rgba(220, 20, 60, 0.699)';
    sibling.style.color = '#ccc';
});
document.querySelector('#invitesContainer').addEventListener('mouseout', e => {
    if(e.target.matches('.accept-button') || e.target.matches('.discard-button')){
        const parent = e.target.closest('.invite-available');

        parent.style.color = 'rgb(100, 100, 100)';
        
        if(e.target.matches('.accept-button')){
            const sibling = e.target.nextElementSibling;
            sibling.style.color = 'rgba(220, 20, 60, 0.699)';
        }
        else{
            const sibling = e.target.previousElementSibling;
            sibling.style.color = '#23CE6B';
        }
    }
});

function setupSocket(){

    socket.emit('board-join', boardData._id);

    socket.on('new-invite', () => {
        fetch('/board/invites')
        .then(res => res.json())
        .then(invites => {
            boardData.invites = invites;
            renderInvites();
        });
    });

    socket.on('board-deleted', () => {
        fetch('/board/shared')
        .then(res => res.json())
        .then(shared => {
            boardData.sharedDesks = shared;
            renderSharedData();
        });
    });
};

function updateOtherClients(inviteID){
    socket.emit('invite-accepted', '/desk/'+inviteID);
};