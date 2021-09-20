/**
 *********************************************************
 * @documentation --> ../../docs-code/Client/login.js.md *
 *********************************************************
**/

// IMPORTS + GLOBAL
import validation from './scripts/validation.js';
let toggling = false;
let activeForm = 'signin';

// FADE OUT LOADER
fadeOutLoader();
function fadeOutLoader(){
    const fadeWindow = document.querySelector('#fadeInWindow');
    fadeWindow.style.opacity = 0;
    setTimeout(() => {
        fadeWindow.remove();
    }, 800);
};

// FORM AUSWAHL / TOGGLE
const form = document.querySelector('form');
const signinForm = document.querySelector('#signin-form');
const signupForm = document.querySelector('#signup-form');

// FORM AUSWAHL ( heading click events )
signinForm.addEventListener('click', e => {
    if(toggling) return;
    if(e.target.matches('.active-form')) return;
    toggleFormSwitches();
    toggleForms('signin');
});
signupForm.addEventListener('click', e => {
    if(toggling) return;
    if(e.target.matches('.active-form')) return;
    toggleFormSwitches();
    toggleForms('signup');
});

// TOGGLE HEADING
function toggleFormSwitches(){
    signinForm.classList.toggle('active-form');
    signupForm.classList.toggle('active-form');
};

// TOGGLE FORMS
function toggleForms(formType){
    toggling = true;
    activeForm = formType;
    const formContainer = document.querySelector('#user-form');
    const usernameContainer = document.querySelector('#username-container');
    const submitText = document.querySelector('#submit-text');
    
    formContainer.style.opacity = '0';
    setTimeout(() => {
        if(formType == 'signin'){
            usernameContainer.innerHTML = '';
            submitText.textContent = 'Log In ';
        }
        else if(formType == 'signup'){
            usernameContainer.innerHTML = `
                <div class="form-group position-relative mb-2">
                    <label for="username-input" class="mb-0"></label><small class="form-error float-end form-text"></small>
                    <input type="text" maxlength="15" spellcheck="false" class="form-control shadow-none" id="username-input" name="username" placeholder="Username"><span class="form-icon"><i class="fas fa-signature"></i></span>
                </div>
            `;
            submitText.textContent = 'Sign Up ';
        };
        formContainer.style.opacity = '1';
        form.reset();
        renderErrors();
        toggling = false;
    }, 400);
};

// SUBMIT FORM
form.addEventListener('submit', e => {
    e.preventDefault();

    let errorArray = [];
    if(activeForm == 'signup'){
        errorArray.push(validation.name(form.username.value));
        errorArray.push(validation.mail(form.email.value));
        errorArray.push(validation.pass(form.password.value));
    }
    else if(activeForm == 'signin'){
        errorArray.push(validation.mail(form.email.value));
    }
    renderErrors(errorArray);
    
    const sum = errorArray.reduce((sum, content) =>{
        return sum + content                            
    },'');

    if(sum != '') return;
    
    if(activeForm == 'signup'){
        const newUser = {
            name: form.username.value.trim().split(' ').join('-'),
            email: form.email.value.toLowerCase().trim(),
            password: form.password.value.trim()
        };
        signupUser(newUser);
    }
    else if(activeForm == 'signin'){
        const userLogin = {
            email: form.email.value.toLowerCase().trim(),
            password: form.password.value.trim()
        };
        signinUser(userLogin);
    }
});

// RENDER FORM ERRORS
function renderErrors(errorArray){
    const errorElements = document.querySelectorAll('.form-error');
    if(!errorArray){
        errorElements.forEach(element => {
            element.textContent = '';
        })
    }
    else{
        for(let i = 0; i < errorArray.length; i++){
            errorElements[i].textContent = errorArray[i];
        };
    }
};

// SIGN UP USER
function signupUser(newUser){
    fetch('/user/signup', {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {'Content-type' : 'application/json; charset=UTF-8'}
    })
    .then(response => response.text())
    .then( msg => {
        if(msg == 'user exists'){
            renderErrors(['', 'This email is already in use', '']);
        }
        else{
            const fadeWindow = document.querySelector('#fadeOutWindow');
            fadeWindow.style.opacity = 1;
            fadeWindow.style.zIndex = 9000;
            setTimeout(() => {
                location.href = '/board';
            }, 500);
        }
    });
};

// SIGN IN USER
function signinUser(userLogin){
    fetch('/user/signin', {
        method: 'POST',
        body: JSON.stringify(userLogin),
        headers: {'Content-type' : 'application/json; charset=UTF-8'}
    })
    .then(response => response.text())
    .then( msg => {
        if(msg == 'no user'){
            renderErrors(['Email not found','']);
        }
        else if(msg == 'wrong password'){
            renderErrors(['','Incorrect Password']);
        }
        else{
            const fadeWindow = document.querySelector('#fadeOutWindow');
            fadeWindow.style.opacity = 1;
            fadeWindow.style.zIndex = 9000;
            setTimeout(() => {
                location.href = '/board';
            }, 500);
        }
    });
};