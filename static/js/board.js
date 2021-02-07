$.ajax({
    url: '/desk/userdata',
    method: 'GET'
}).done(res => {
    console.log(JSON.parse(res));
});
















const LOGOUT = document.querySelector('button');
LOGOUT.addEventListener('click', () => {

    $.ajax({
        url: '/logout',
        method: 'GET'
        }).done(res => {
            window.location.href = '/login';
        });
});