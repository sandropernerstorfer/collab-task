import validation from './scripts/validation.js';
let userData, deskData, adminData, memberData;
fetch('/desk/deskdata')
.then(res => res.json())
.then(data => {
    userData = data.user;       // OBJECT - USER:               _id, name
    deskData = data.desk;       // OBJECT - DESK:               _id, name, color, lists
    adminData = data.admin;     // OBJECT - ADMIN:              _id, name, email, image
    memberData = data.members;  // ARRAY OF OBJECTS - MEMBERS:  _id, name, email, image
    logTables();
    renderDeskname();
    renderMembers();
    checkAccess();
    // renderLists();
});

function logTables(){
    console.table(userData);
    console.table(deskData);
    console.table(adminData);
    console.table(memberData);
};

function renderDeskname(){
    document.querySelector('#topDeskname').textContent = deskData.name;
    document.querySelector('#renameInput').value = deskData.name;
    document.title = `Task-App | ${deskData.name}`;
};

function renderMembers(){
    const admin = document.querySelector('#admin');
    const url = adminData.image == null ? '../../assets/img/user-default.png' : `https://res.cloudinary.com/sandrocloud/image/upload/w_50,c_scale/${adminData.image}`;
    admin.style.backgroundImage = `url(${url})`;
    admin.setAttribute('title', adminData.name);

    const membersDiv = document.querySelector('#topMembers');
    memberData.forEach(member => {
        const url = member.image == null ? '../../assets/img/user-default.png' : `https://res.cloudinary.com/sandrocloud/image/upload/w_50,c_scale/${member.image}`;
        membersDiv.innerHTML += `<div id="${member._id}" class="member-card"></div>`;
        const currentMember = document.getElementById(`${member._id}`);
        currentMember.style.backgroundImage = `url(${url})`;
        currentMember.setAttribute('title', member.name);
    });
};

function checkAccess(){
    const deskActionText = document.querySelector('#deskActionText');
    const deskActionBtn = document.querySelector('#deskActionBtn');

    if(userData._id == adminData._id){
        deskActionText.innerHTML = '<i id="dangerIcon" class="fas fa-exclamation-triangle"></i> Delete Desk';
        deskActionBtn.textContent = 'Delete';
        const elements = document.querySelectorAll('.accessDisabled');

        elements.forEach( element => {
            element.classList.remove('accessDisabled');
        });

        elements[0].setAttribute('data-bs-toggle', 'modal');
        elements[0].setAttribute('data-bs-target', '#inviteModal');

        const inviteForm = document.querySelector('#inviteForm');
        inviteForm.addEventListener('submit', e => {
            e.preventDefault();
            const mail = inviteForm.inviteEmail.value.trim();
            const error = validation.mail(mail);
            const errorField = document.querySelector('#inviteError');
            if(error != ''){
                errorField.textContent = error;
                return;
            }
            const checkMembers = memberData.find( member => {
                return member.email == mail;
            });
            if(checkMembers){
                errorField.textContent = 'User is already a Member';
                return;
            }
            errorField.innerHTML = '&nbsp;';
            fetch('/user/invite', {
                method : 'POST',
                body : JSON.stringify({
                    mail : mail,
                    deskID : deskData._id
                }),
                headers : {'Content-type' : 'application/json; charset=UTF-8'}
            })
            .then(res => res.json())
            .then(status => {
                if(!status){
                    errorField.textContent = 'No user with this Email found';
                }
                else{
                    errorField.innerHTML = `<span style="color: #23CE6B;">${status.name} invited !</span>`;
                    inviteForm.reset();
                }
            });
        });
        elements[2].addEventListener('click', () => {
            const newName = document.querySelector('#renameInput').value.trim();
            if(newName == deskData.name) return;
            fetch('/desk/deskname', {
                method: 'PATCH',
                body: JSON.stringify({deskname : newName}),
                headers: {'Content-type' : 'application/json; charset=UTF-8'}
            })
            .then(res => res.json())
            .then(deskname => {
                deskData.name = deskname;
                renderDeskname();
            });
        });
        deskActionBtn.addEventListener('click', () => {
            const confirmed = confirm(`Are you sure you want to delete this desk:\n"${deskData.name}"`);
            if(confirmed){
                fetch(`/desk/delete`, {
                    method: 'DELETE'
                })
                .then(location.href = '/board');
            };
        });
    }
    else{
        deskActionText.innerHTML = '<i id="dangerIcon" class="fas fa-exclamation-triangle"></i> Leave Desk';
        deskActionBtn.textContent = 'Leave';
        deskActionBtn.addEventListener('click', () => {
            const confirmed = confirm('You will no longer be a Member on this Desk\n\nContinue ?');
            if(confirmed){
                fetch(`/desk/leave`, {
                    method: 'DELETE',
                })
                .then(res => res.json())
                .then(res => {
                    if(res) location.href = '/board';
                });
            };
        });
    };
};

// Invite Modal - Input focus und Error Reset
const inviteModal = document.querySelector('#inviteModal');
inviteModal.addEventListener('shown.bs.modal', () => {
    document.querySelector('input[name="inviteEmail"]').focus();
});
inviteModal.addEventListener('hidden.bs.modal', () => {
    document.querySelector('#inviteError').innerHTML = '&nbsp;';
});

// CHAT & MENU show/hide
const openMenu = document.querySelector('#menuBtn');
const openChat = document.querySelector('#chatBtn');
openMenu.addEventListener('click', () => {
    document.querySelector('#sideMenu').classList.toggle('d-none');
});
openChat.addEventListener('click', () => {
    document.querySelector('#chatWindow').classList.toggle('d-none');
});