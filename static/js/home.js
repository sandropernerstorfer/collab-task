const dynamicHeading = document.querySelector('#dynamic-heading');
const dynamicRoutes = document.querySelectorAll('.dynamic-route');
const aboutButton = document.querySelector('#about-button');
const scrollTopButton = document.querySelector('#scroll-to-top');

/**
 * Versuche Session-Cookie zu lesen und rufe renderBannerContent() auf
 * wird ein cookie gefunden werden per GET request die passenden user daten an den client geschickt
 * wurde zB. ein 'falscher cookie' erstellt werden keine userdaten gefunden und der server schickt nichts zurück
 */
try{
    const cookie = document.cookie.split('; ').find(row => row.startsWith('_taskID')).split('=')[1];
    fetch('/userdata')
    .then(response => response.json())
    .then(username => {
        if(!username){
            renderBannerContent();
        }
        else{
            renderBannerContent(username);
        }
    });
}
catch(err){
    renderBannerContent();
};

/**
 * 
 * @param {STRING} username Enthält den Username des eingeloggten Users
 * wird kein parameter an die funktion übergeben, beudetet das dass keine passende session gefunden wurde
 * und eine allgemeine begrüßung + Login/SignUp button werden gerendert
 * 
 * ansonsten wird eine begrüßung mit username + Dashboard button eingeblendet
 */
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
    dynamicHeading.innerHTML = heading;
    dynamicRoutes.forEach( element => {
        element.innerHTML = `<button class="btn btn-outline-success button shadow-none">${html}</button>`;
        element.setAttribute('href',route);
    });
};

/**
 * LEARN MORE BUTTON
 * wird der learn more button geklickt wird automatisch zur App Info gescrollt (main-section)
 */
aboutButton.addEventListener('click', e => {
    const mainSection = document.querySelector('#main-content');
    mainSection.scrollIntoView({ left: 0, block: 'start', behavior: 'smooth' });
});

/**
 * SCROLL TO TOP BUTTON
 * wird der TopScroll button geklickt wird automatisch zum oberen ende des Dokuments gescrollt
 */
scrollTopButton.addEventListener('click', e => {
    document.documentElement.scroll({ top: 0, behavior: 'smooth' });
});

/**
 * SHOW / HIDE SCROLL TO TOP BUTTON
 * erstellt einen neuen IntersectionObserver welcher das element mit der ID #observed-element überwacht (main section)
 * ist das element in sicht wird der button eingeblendet.
 * entfernt sich das element aus dem bildschirm wird der button ausgeblendet
 */
let observer = new IntersectionObserver(callback);
const observedElement = document.querySelector('#observed-element');
observer.observe(observedElement);
function callback(entries, observer){
    entries.forEach(entry => {
        if(entry.isIntersecting){
            scrollTopButton.classList.add('show-btn');
        }
        else{
            scrollTopButton.classList.remove('show-btn');
        };
    });
};