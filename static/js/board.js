// IMPORTS + GLOBAL
import validation from './scripts/validation.js';
const socket = io();
let newName;
let nameEditing = false;
let newImage = false;

// BOARD DATA FETCH
let boardData = {};
fetch('/board/boarddata')
.then( res => res.json())
.then( data => {
    boardData = data;
    renderUsername();
    renderUserImage();
    renderDeskData();
    renderSharedData();
    renderInvites();
    sortHandling();
    setupSocket();
});

// SETUP FUNCTIONS / RENDER FUNCTIONS
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
function sortHandling(){
    if(localStorage.getItem('task_boardSort')){
        const {sortBy, sortOrder} = JSON.parse(localStorage.getItem('task_boardSort'));
        document.querySelector(`select option[value=${sortBy}]`).setAttribute('selected','true');
        document.querySelector(`select option[value=${sortOrder}]`).setAttribute('selected','true');
        boardData.desks = sortBoard(boardData.desks, sortBy, sortOrder);
        boardData.sharedDesks = sortBoard(boardData.sharedDesks, sortBy, sortOrder);
    };    
};

// OPEN DESK
function openDesk(deskID){
    const fadeWindow = document.querySelector('#fadeWindow')
    fadeWindow.style.zIndex = '9000';
    fadeWindow.style.opacity = '1';
    setTimeout(() => {
        window.location.href = `desk/${deskID}`;    
    }, 800);
};

// INVITE HANDLING
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

// DESK CREATION
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

// CREATE DESK SUBMIT
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

// DESK COLORS
document.addEventListener('click', e => {
    if(!e.target.matches('.desk-color')) return;
    const colorElements = document.querySelectorAll('.desk-color');
    colorElements.forEach( element => {
        element.classList.remove('selected-color');
    });
    e.target.classList.add('selected-color'); 
});

// USER PROFILE
const editName = document.querySelector('#editName');
const nameField = document.querySelector('#currentUsername');
const cancelBox = document.querySelector('#cancel-box');
const userError = document.querySelector('#usernameError');

// EDIT NAME BUTTON
editName.addEventListener('click', e => {
    if(!nameEditing){
        nameEditing = true;
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

// CANCEL EDIT BUTTON
document.addEventListener('click', e => {
    if(e.target.matches('#cancel')){
        nameField.innerHTML = newName;
        resetProfile();
    }
    else return;
});

// INSTANT IMAGE DISPLAY
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

// SAVE PROFILE CHANGES
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

// CLOSE PROFILE
document.querySelector('#profileClose').addEventListener('click', () => {
    setTimeout(() => {
        newImage = false;
        renderUserImage();
        newName = boardData.name;
        nameField.innerHTML = newName;
        resetProfile();    
    }, 400);
});

// RESET PROFILE
function resetProfile(){
    nameEditing = false;
    editName.innerHTML = `<i class="fas fa-pencil-alt"></i>`;
    cancelBox.innerHTML = '';
    userError.textContent = '';
};

// USER LOGOUT
document.querySelector('#logoutButton').addEventListener('click', () => {
    fetch('/logout')
    .then( res => {
        window.location.href = '/login';
    });
});

// BOARD SORTING
const sortForm = document.querySelector('#sortForm');
// SORT FORM EVENT
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

// SORT BOARD FUNCTION
function sortBoard(array, sortBy, sortOrder){
    array.sort((a,b) => {
        if(sortBy == 'name'){
            if(a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) return -1;
            if(a[sortBy].toLowerCase() > b[sortBy].toLowerCase()) return 1;    
        }
        else{
            if(a[sortBy] < b[sortBy]) return -1;
            if(a[sortBy] > b[sortBy]) return 1;
        }
        return 0;
    });
    if(sortOrder == 'descending') return array.reverse();
    return array;
};

// INVITE CARDS DYNAMIC COLORS
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

// SOCKET EVENTS
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

// UPDATE CLIENTS ON INVITE-ACCEPT
function updateOtherClients(inviteID){
    socket.emit('invite-accepted', '/desk/'+inviteID);
};