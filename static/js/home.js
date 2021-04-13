/**
 ********************************************************
 * @documentation --> ../../docs-code/Client/home.js.md *
 ********************************************************
**/

// CHECK USER STATUS
try{
    const cookie = document.cookie.split('; ').find(row => row.startsWith('_taskID')).split('=')[1];
    fetch('/user/username')
    .then(response => response.json())
    .then(username => {
        fadeOutLoader();
        if(!username){
            renderBannerContent();
        }
        else{
            renderBannerContent(username);
        }
    });
}
catch(err){
    fadeOutLoader();
    renderBannerContent();
};

// FADE OUT LOADER
function fadeOutLoader(){
    const fadeWindow = document.querySelector('#fadeInWindow');
    fadeWindow.style.opacity = 0;
    setTimeout(() => {
        fadeWindow.remove();
    }, 1000);
};

// RENDER BANNER CONTENT
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
        route = '/board';
    };
    document.querySelector('#dynamic-heading').innerHTML = heading;
    document.querySelectorAll('.dynamic-route').forEach( element => {
        element.innerHTML = `<button class="btn btn-outline-success button shadow-none">${html}</button>`;
        element.addEventListener('click', () => {
            const fadeWindow = document.querySelector('#fadeOutWindow');
            fadeWindow.style.opacity = 1;
            fadeWindow.style.zIndex = 9000;
            setTimeout(() => {
                location.href = route;
            }, 800);
        });
    });
};

// LEARN MORE BUTTON
document.querySelector('#about-button').addEventListener('click', e => {
    const mainSection = document.querySelector('#main-content');
    mainSection.scrollIntoView({ left: 0, block: 'start', behavior: 'smooth' });
});

// SCROLL TO TOP BUTTON
const scrollTopButton = document.querySelector('#scroll-to-top');
scrollTopButton.addEventListener('click', e => {
    document.documentElement.scroll({ top: 0, behavior: 'smooth' });
});
// SHOW / HIDE SCROLL TO TOP BUTTON
let observer = new IntersectionObserver(callback);
const observedElement = document.querySelector('.observed-element');
observer.observe(observedElement);
function callback(entries, observer){
    entries.forEach(entry => {
        if(entry.isIntersecting){
            scrollTopButton.classList.remove('show-btn');
        }
        else{
            scrollTopButton.classList.add('show-btn');
        };
    });
};