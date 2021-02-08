const validation = {
    name: (name) => {
        return name.length >= 6 ? '' : 'Name: at least 6 characters';
    },
    mail: (mail) => {
        return mail.includes('@') && mail.includes('.') ? '' : 'Enter a valid Email-Address';
    },
    pass: (pass) => {
        return pass.length >= 8 ? '' : 'Password: at least 8 characters';
    }
};

export default validation;