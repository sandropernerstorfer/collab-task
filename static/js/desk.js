let userData;
let deskData;
fetch('/deskdata')
.then(res => res.json())
.then(data => {
    userData = data[0];
    deskData = data[1];
    renderData();
});

function renderData(){
    console.table(userData);
    console.table(deskData);
};