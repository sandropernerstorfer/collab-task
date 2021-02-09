const validation = {
    name: (name) => {
        name = name.trim();
        if(name.length <= 6) return 'Name: at least 6 characters';
        if(name.length >= 30) return 'Name: max. 30 characters';
        return '';
    },
    mail: (mail) => {
        mail = mail.trim();
        return mail.includes('@') && mail.includes('.') ? '' : 'Enter a valid Email-Address';
    },
    pass: (pass) => {
        pass = pass.trim();
        return pass.trim().length >= 8 ? '' : 'Password: at least 8 characters';
    }
};

export default validation;