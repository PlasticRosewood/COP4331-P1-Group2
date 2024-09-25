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
        // check for empty fields
        if (usernameText == '' || passwordFieldText == '') {
            throw new Error('Enter username and password');
        }

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

        if (response.status !== 200) { // error has occured
            let error = await response.json();
            throw new Error(error.error);
        } else{  // successful login
            // store token and redirect to index.html
            const responseData = await response.json();
            setCookie(responseData.token);
            window.location.href = '/index.html';
        }

    } catch (error) {
        console.error(error);
        alert(error);
    }        
}

async function createAccount() {
    usernameText = usernameField.value;
    passwordText = passwordField.value;

    const url = urlBase + '/register';
    try {
        // check for empty fields
        if (usernameText == '' || passwordFieldText == '') {
            throw new Error('Enter username and password');
        }

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

        if (response.status != 200) { // error occured
            let error = await response.json();
            throw new Error(error.error);
        } else {
            console.log('account successfully created');
            const responseData = await response.json();
            setCookie(responseData.token);
            window.location.href = '/index.html';
        }

    } catch (error) {
        console.error(error);
        alert(error);
    }
}


