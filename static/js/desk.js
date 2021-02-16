let userData, deskData, adminData, memberData;
fetch('/deskdata')
.then(res => res.json())
.then(data => {
    userData = data.user;
    deskData = data.desk;
    adminData = data.admin;
    memberData = data.members;
    renderData();
});

function renderData(){
    console.table(userData);
    console.table(deskData);
    console.table(adminData);
    console.table(memberData);
};