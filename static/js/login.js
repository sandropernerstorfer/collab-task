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
                    <label for="username-input" class="mb-0"></label><small class="form-error float-end form-text">-</small>
                    <input type="text" class="form-control shadow-none" id="username-input" name="username" placeholder="Username"><span class="form-icon"><i class="fas fa-signature"></i></span>
                </div>
            `;
            submitText.textContent = 'Sign Up ';
        };
        formContainer.style.opacity = '1';
        toggling = false;
    }, 400);
};

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