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
        
        const data = await response.json();
        console.log('Connection successful on userLogin()');
    } catch (error) {
        console.log('Connection failed on userLogin()');
        console.error(error);
    }

        
}


