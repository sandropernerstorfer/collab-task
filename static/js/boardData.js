let boardData = {};

fetch('/desk/userdata')
.then( response => response.json())
.then( data => {
    boardData = data;
    // renderContent();
});