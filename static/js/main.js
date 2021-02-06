const LOGOUT = document.querySelector('button');

LOGOUT.addEventListener('click', () => {
    const deleteDate = new Date(1999, 0, 1).toUTCString();
    document.cookie = 'logged=; expires='+deleteDate+'';
    window.location.href = '/login';
});