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

// CHAT & MENU show/hide
const openMenu = document.querySelector('#menuBtn');
const openChat = document.querySelector('#chatBtn');
openMenu.addEventListener('click', () => {
    document.querySelector('#sideMenu').classList.toggle('d-none');
});
openChat.addEventListener('click', () => {
    document.querySelector('#chatWindow').classList.toggle('d-none');
});