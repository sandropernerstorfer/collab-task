/**
 * BOARD DATA FETCH
 * 
 * beim öffnen des Dashboards werden vom server die benötigten USER und DESK daten gefetcht
 * und in boardData als object gespeichert
 * 
 */
let boardData = {};
fetch('/desk/userdata')
.then( response => response.json())
.then( data => {
    boardData = data;
});