const dynamicHeading = document.querySelector('#dynamic-heading');
const dynamicRoute = document.querySelector('#dynamic-route');

// Try to read sessionID Cookie -> call renderBannerContent function : parameter depends on cookie-status
try{
    const cookie = document.cookie.split('; ').find(row => row.startsWith('_taskID')).split('=')[1];
    $.ajax({
        url: '/userdata',
        method: 'GET'
    }).done(res => {
        const username = JSON.parse(res);
        if(!username){
            renderBannerContent();
        }
        else{
            renderBannerContent(username);
        };
    });
}
catch(err){
    renderBannerContent();
};

// Renders banner heading and button + href
function renderBannerContent(username){
    let heading, html, route;
    if(!username){
        heading = 'Welcome to TaskApp !';
        html = `Log In / Sign Up <i class="fas fa-sign-in-alt"></i>`;
        route = '/login';
    }
    else if(username){
        heading = `Welcome <span class="home-username">${username}</span> !`;
        html = `Dashboard <i class="fas fa-clipboard-list"></i>`;
        route = '/desk';
    };
    dynamicHeading.innerHTML = heading;
    dynamicRoute.innerHTML = `<button class="btn btn-outline-success button shadow-none">${html}</button>`;
    dynamicRoute.setAttribute('href',route);
};