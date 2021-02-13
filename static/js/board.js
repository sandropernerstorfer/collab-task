import validation from './scripts/validation.js';
const addDeskModal = document.querySelector('#addDeskModal');
const profileClose = document.querySelector('#profileClose');
const profileSave = document.querySelector('#profileSave');
const deskForm = document.querySelector('#createDeskForm');
const deskError = document.querySelector('#desknameError');
const editName = document.querySelector('#editName');
const nameField = document.querySelector('#currentUsername');
let boardData = {};

fetch('/desk/userdata')
.then( response => response.json())
.then( data => {
    boardData = data;
    renderContent();
});
function renderContent(){
    console.log('got data');
    console.log(boardData);
};

addDeskModal.addEventListener('shown.bs.modal', () => {
    deskForm.deskname.focus();
});
addDeskModal.addEventListener('hidden.bs.modal', () => {
    deskError.innerHTML = '&nbsp;';
    deskForm.deskname.value = '';
});

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

        console.log(deskColors[i], deskname, boardData._id);
    }
});

// CLICK THROUGH DESK COLORS
document.addEventListener('click', e => {
    if(!e.target.matches('.desk-color')) return;
    const colorElements = document.querySelectorAll('.desk-color');
    colorElements.forEach( element => {
        element.classList.remove('selected-color');
    });
    e.target.classList.add('selected-color'); 
});



let newName;
let editing = false;
editName.addEventListener('click', e => {
    if(!editing){
        editing = true;
        nameField.innerHTML = `<input type="text" name="newUsername" maxlength="30" class="form-control shadow-none" id="newUsername" value=${nameField.textContent}>`;
        editName.innerHTML = `<i class="far fa-check-circle"></i>`;    
    }
    else{
        const inputValue = document.querySelector('#newUsername').value;
        const error = validation.name(inputValue);
        if(error == ''){
            editing = false;
            newName = inputValue;
            nameField.innerHTML = newName;
            editName.innerHTML = `<i class="fas fa-user-edit"></i>`;
        }
        else{
            console.log(error);
        }
    }
});

profileClose.addEventListener('click', () => {
    resetProfile();
});

profileSave.addEventListener('click', () => {
    if(newName === boardData.name || newName == undefined){
        profileClose.click();
    }
    else{
        console.log(newName);
    }
});

// RESETS PROFILE PAGE
function resetProfile(){
    editing = false;
    newName = boardData.name;
    setTimeout(() => {
        nameField.innerHTML = boardData.name;
        editName.innerHTML = `<i class="fas fa-user-edit"></i>`;   
    }, 400);
};

// USER-LOGOUT
const userLogout = document.querySelector('#logoutButton');
userLogout.addEventListener('click', () => {
    fetch('/logout')
    .then( res => window.location.href = '/login');
});