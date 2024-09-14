const urlBase = '/api/auth';

let usernameText = '';
let passwordText = '';

let usernameField = document.getElementById('username_field');
let passwordField = document.getElementById('password_field');

// prevent page reload on form submission
var form = document.getElementById('login_form');
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);

function setCookie(token) {
    const date = new Date();
    date.setTime(date.getTime() + 1 * 3600 * 1000); // 1 hour
    document.cookie = 'token=' + token + ';expires=' + date.toUTCString() + ';';
}

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

        // successful login
        if (response.status === 200) {
            // store token and redirect to index.html
            const responseData = await response.json();
            setCookie(responseData.token);
            window.location.href = '/index.html';
        } else if (response.status === 401) { // invalid login code
            alert('Account not found!')
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
            const responseData = await response.json();
            setCookie(responseData.token);
            window.location.href = '/index.html';
        } else if (response.status === 400) {
            //TODO: alert user of issue with creating account
            console.error('bad request on create account');
        }

    } catch (error) {
        console.error(error);
    }
}


