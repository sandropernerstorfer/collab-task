const form = document.querySelector('form');
const formContainer = document.querySelector('#user-form');
const signinForm = document.querySelector('#signin-form');
const signupForm = document.querySelector('#signup-form');
const usernameContainer = document.querySelector('#username-container');
const submitText = document.querySelector('#submit-text');
let toggling = false;
let activeForm = 'signin';

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

function toggleFormSwitches(){
    signinForm.classList.toggle('active-form');
    signupForm.classList.toggle('active-form');
};

function toggleForms(formType){
    toggling = true;
    activeForm = formType;
    formContainer.style.opacity = '0';
    setTimeout(() => {
        if(formType == 'signin'){
            usernameContainer.innerHTML = '';
            submitText.textContent = 'Sign In ';
        }
        else if(formType == 'signup'){
            usernameContainer.innerHTML = `
                <div class="form-group position-relative mb-3">
                    <label for="username-input" class="mb-0"></label><small class="form-error float-end form-text"></small>
                    <input type="text" class="form-control shadow-none" id="username-input" name="username" placeholder="Username"><span class="form-icon"><i class="fas fa-signature"></i></span>
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

form.addEventListener('submit', e => {
    e.preventDefault();

    let errorArray = [];

    if(activeForm == 'signup'){
        errorArray.push(validateUsername(form.username.value));
        errorArray.push(validateEmail(form.email.value));
        errorArray.push(validatePassword(form.password.value));
    }
    else if(activeForm == 'signin'){
        errorArray.push(validateEmail(form.email.value));
    }

    renderErrors(errorArray);
    
    const sum = errorArray.reduce((sum, content) =>{
        return sum + content                            
    },'');

    if(sum != '') return;
    
    if(activeForm == 'signup'){

        const newUser = {
            name: form.username.value,
            email: form.email.value,
            password: form.password.value
        };
        signupUser(newUser);
    }
    else if(activeForm == 'signin'){

        const userLogin = {
            email: form.email.value,
            password: form.password.value
        };
        signinUser(userLogin);
    }
});

function validateUsername(name){
    return name.length >= 6 ? '' : 'Name: at least 6 characters';
};
function validateEmail(email){
    return email.includes('@') && email.includes('.') ? '' : 'Enter a valid Email-Address';
};
function validatePassword(password){
    return password.length >= 8 ? '' : 'Password: at least 8 characters';
};
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

function signupUser(newUser){
    createLogCookie();
    $.ajax({
        url: '/user/signup',
        method: 'POST',
        data: JSON.stringify(newUser),
        contentType:'application/json'
        }).done(res => {
            if(res == 'user exists'){
                renderErrors(['', 'This email already exists', '']);
            }
            else{
                window.location.href = '/desk';
            }
        });
};
function signinUser(userLogin){
    createLogCookie();
    $.ajax({
        url: '/user/signin',
        method: 'POST',
        data: JSON.stringify(userLogin),
        contentType:'application/json'
        }).done(res => {
            if(res == 'no user'){
                renderErrors(['Email not found','']);
            }
            else if(res == 'wrong password'){
                renderErrors(['','Incorrect Password']);
            }
            else{
                window.location.href = '/desk';
            }
        });
};
function createLogCookie(){
    const expDate = new Date(9999, 0, 1).toUTCString();
    document.cookie = 'logged=true; expires='+expDate+'';
};