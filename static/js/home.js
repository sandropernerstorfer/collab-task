const dynamicHeading = document.querySelector('#dynamic-heading');
const dynamicRoute = document.querySelector('#dynamic-route');
const aboutButton = document.querySelector('#about-button');
const mainBox = document.querySelector('#main-content');
const scrollTopButton = document.querySelector('#scroll-to-top');

// Try to read sessionID Cookie -> call renderBannerContent(parameter depends on cookie-status)
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

// Smooth Scroll to Target
aboutButton.addEventListener('click', e => {
    let href = aboutButton.getAttribute("href");
    let elem = document.getElementById(href.replace("#",""));
    elem.scrollIntoView({ left: 0, block: 'start', behavior: 'smooth' });
});

// Scroll to Top of Document
scrollTopButton.addEventListener('click', e => {
    document.documentElement.scroll({
        top: 0,
        behavior: 'smooth'
    })
});

// Observe if mainBox is in sight -> show and hide top-scroll-button
let observer = new IntersectionObserver(callback);
observer.observe(mainBox);
function callback(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting){
            scrollTopButton.classList.add('show-btn')
        }
        else{
            scrollTopButton.classList.remove('show-btn')
        }
    });
};