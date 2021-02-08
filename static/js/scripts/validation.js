const validation = {
    name: (name) => {
        return name.trim().length >= 6 ? '' : 'Name: at least 6 characters';
    },
    mail: (mail) => {
        return mail.trim().includes('@') && mail.includes('.') ? '' : 'Enter a valid Email-Address';
    },
    pass: (pass) => {
        return pass.trim().length >= 8 ? '' : 'Password: at least 8 characters';
    }
};

export default validation;