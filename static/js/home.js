try{
    const cookie = document.cookie.split('; ').find(row => row.startsWith('_taskID')).split('=')[1];
    $.ajax({
        url: '/userdata',
        method: 'GET'
    }).done(res => {
        const username = JSON.parse(res);
        if(!username){
            document.body.innerHTML += `<a href='/login'><button>Login</button></a>`;
        }
        else{
            document.body.innerHTML += `<a href='/desk'><button>${username}</button></a>`;
        };
    });
}
catch(err){
    document.body.innerHTML += `<a href='/login'><button>Login</button></a>`;
}