const LOGOUT = document.querySelector('button');



$.ajax({
    url: '/desk/userdata',
    method: 'GET'
}).done(res => {
    console.log(JSON.parse(res));
})


LOGOUT.addEventListener('click', () => {

    $.ajax({
        url: '/logout',
        method: 'GET'
        }).done(res => {
            const deleteDate = new Date(1999, 0, 1).toUTCString();
            document.cookie = 'logged=; expires='+deleteDate+'';
            window.location.href = '/login';
        });
});