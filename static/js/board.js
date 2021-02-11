fetch('/desk/userdata')
.then( response => response.json())
.then( data => console.log(data))















const LOGOUT = document.querySelector('#logout');
LOGOUT.addEventListener('click', () => {
    fetch('/logout')
    .then( res => window.location.href = '/login');
});