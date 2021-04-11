/**
 **************************************************************
 * @documentation --> ../../../docs-code/Client/db-schemas.md *
 **************************************************************
**/

const validation = {
    name: (name) => {
        name = name.trim();
        if(name.length < 6) return 'Name: at least 6 characters';
        if(name.length > 30) return 'Name: max. 30 characters';
        return '';
    },
    mail: (mail) => {
        mail = mail.trim();
        return mail.includes('@') && mail.includes('.') ? '' : 'Enter a valid email-address';
    },
    pass: (pass) => {
        pass = pass.trim();
        return pass.length >= 8 ? '' : 'Password: at least 8 characters';
    },
    deskname: (deskname) => {
        deskname = deskname.trim();
        if(deskname.length > 15) return 'Deskname: max. 15 characters';
        if(deskname.length <= 0) return 'Please enter a Deskname';
        return '';
    }
};

export default validation;