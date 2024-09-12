const urlBase = '/api/auth';

let usernameText = '';
let passwordText = '';

let usernameField = document.getElementById('username_field');
let passwordField = document.getElementById('password_field');

// prevent page reload on form submission
var form = document.getElementById('login_form');
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);

async function userLogin() {
    usernameText = usernameField.value;
    passwordText = passwordField.value;

    const url = urlBase + '/login';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameText,
                password: passwordText
            })
        });
        
        
        if (!response.ok) {
            throw new Error('Response status: ' + response.status);
        } 
        
        // error logging code
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            const data = await response.json();
            console.log('Connection successful on userLogin()', data);
        } else {
            const text = await response.text();
            console.error('Expected JSON, got:\n', text);
            throw new Error('Server returned non-JSON response');
        }  
        

        // successful login
        if (response.status === 200) {
            // redirect to index.html
            window.location.href = '/index.html';
        } else if (response.status === 401) { // invalid login code
            // TODO: alert user that account isn't found
            console.error('account not found!');
        }

    } catch (error) {
        console.log('Connection failed on userLogin()');
        console.error(error);
    }        
}

async function createAccount() {
    usernameText = usernameField.value;
    passwordText = passwordField.value;

    const url = urlBase + '/register';
    try {
        const response = await fetch(url, {
           method: 'POST',
           headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
           },
           body: JSON.stringify({
            username: usernameText,
            password: passwordText
           })
        });

        if (!response.ok) {
            throw new Error('Response status: ' + response.status);
        }

        if (response.status === 200) {
            //TODO: alert user of successful account creation
            console.log('account successfully created');
            window.location.href = '/index.html';
        } else if (response.status === 400) {
            //TODO: alert user of issue with creating account
            console.error('bad request on create account');
        }

    } catch (error) {
        console.log('Connection failed on createAccount()');
        console.error(error);
    }
}


