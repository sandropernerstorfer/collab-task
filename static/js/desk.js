let userData, deskData, adminData, memberData;
fetch('/desk/deskdata')
.then(res => res.json())
.then(data => {
    userData = data.user;       // OBJECT - USER:               _id, name
    deskData = data.desk;       // OBJECT - DESK:               _id, name, color, lists
    adminData = data.admin;     // OBJECT - ADMIN:              _id, name, email, image
    memberData = data.members;  // ARRAY OF OBJECTS - MEMBERS:  _id, name, email, image
    logTables();
});
function logTables(){
    console.table(userData);
    console.table(deskData);
    console.table(adminData);
    console.table(memberData);
};