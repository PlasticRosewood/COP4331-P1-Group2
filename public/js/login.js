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
        //.then(response => console.log(response));
        
        
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

    } catch (error) {
        console.log('Connection failed on userLogin()');
        console.error(error);
    }

        
}


