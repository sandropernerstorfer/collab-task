import validation from './scripts/validation.js';
const addDeskModal = document.querySelector('#addDeskModal');
const deskForm = document.querySelector('#createDeskForm');
const deskError = document.querySelector('#desknameError');
let boardData = {};

fetch('/desk/userdata')
.then( response => response.json())
.then( data => {
    boardData = data;
    renderContent();
});

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
})

function renderContent(){
    console.log('got data');
    console.log(boardData);
};




document.querySelector('#profile').click();


const LOGOUT = document.querySelector('#logoutButton');
LOGOUT.addEventListener('click', () => {
    fetch('/logout')
    .then( res => window.location.href = '/login');
});