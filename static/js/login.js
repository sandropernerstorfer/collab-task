const form = document.querySelector('form');

form.addEventListener('submit', e => {

    e.preventDefault();
    return;
    //validation...

    const newUser = {
        name: form.name.value,
        email: form.mail.value,
        password: form.password.value
    };

    const expDate = new Date(9999, 0, 1).toUTCString();
    document.cookie = 'logged=true; expires='+expDate+'';

    $.ajax({
        url: '/user',
        method: 'POST',
        data: JSON.stringify(newUser),
        contentType:'application/json'
        }).done(res => {});
});