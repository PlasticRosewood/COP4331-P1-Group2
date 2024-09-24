const urlBase = '/api/contact';
let sessionToken;
const defaultRating = 3;
let focusContact; // global tracker for current contact to focus on

function logout() {
    // delete cookie
    document.cookie = 'token=; Path=/; Expires=Thu, 11 Sep 2001 00:00:01 GMT;';

    // return user to login page
    window.location.href = '/login.html';
}
document.getElementById('sign_out').addEventListener('click', logout);

// TODO: move this to separate non-deferred file for quicker redirect
// validate user session

function getSessionToken() {
    let name = 'token=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        sessionToken = c.substring(name.length, c.length);
        return;
      }
    }
    
    //cookie not found; redirect to login page
    window.location.href = '/login.html';
}


// create contact object and cache array upon startup
class Contact {
    constructor(id, fname, lname, email, rating) {
        this.id = id;
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.rating = rating;
    }
}

let cachedContacts = []; // initialized as an array

async function cacheContacts() {
    let url = urlBase;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionToken
            }
        });

        if (!response.ok) {
            throw new Error('Response status: ' + response.status);
        }

        let jsonContacts = await response.json();
        for (let i = 0; i < jsonContacts.contacts.length; i++) {
            let cur = jsonContacts.contacts[i];
            let newContact = new Contact(cur.contact_id, cur.first_name, cur.last_name, cur.email, cur.rating);
            console.log(newContact);
            cachedContacts.push(newContact);
        }
        displayCachedContacts(); // display contacts here to avoid race condition
    } catch(error) {
        console.log('Issue in cacheContacts()');
        alert('Issue with caching contacts for user!');
        console.error(error);
    }
}

function displayCachedContacts() {
    console.log(cachedContacts.length);
    for (let i = 0; i < cachedContacts.length; i++) {
        appendContactToHTML(cachedContacts[i]); // NOTE: changing cache to cached
        alert("Contact displayed: " + cachedContacts[i].fname + ' ' + cachedContacts[i].lname);
    }
}

function appendContactToHTML(contactObject) { // accepts a contact object and creates a card for the contacts_list element
    // create new list item
    var newContact = document.createElement('li');
    newContact.textContent = contactObject.fname + ' ' + contactObject.lname;

    document.getElementById('dynamic_contacts_list').appendChild(newContact); // adding the line to the list

    newContact.addEventListener('click', () => { // should open the details for specific contact clicked
        dynamicDetailsPane(contactObject);
    });

}

document.addEventListener("DOMContentLoaded", async function() {
    getSessionToken();
    cacheContacts();
});

// gray out screen for all popups
var grayOutScreen = document.getElementById('gray_out');

// variables for account options page
var accountOptionsPopup = document.getElementById('account_options_popup');

function showAccountOptionsPopup() {
    accountOptionsPopup.style.display = 'grid';
    grayOutScreen.style.display = 'block';
}
document.getElementById('account_options').addEventListener('click', showAccountOptionsPopup);

function hideAccountOptionsPopup() {
    accountOptionsPopup.style.display = 'none';
    grayOutScreen.style.display = 'none';
}
document.getElementById('acc_opt_close_button').addEventListener('click', hideAccountOptionsPopup);

// code for bringing up delete confirmation popup
function showDeleteConfirmationPopup() {
    deleteConfirmationPopup.style.display = 'grid';
}

document.getElementById('delete_account').addEventListener('click', showDeleteConfirmationPopup);

function hideDeleteConfirmationPopup() {
    deleteConfirmationPopup.style.display = 'none';
}

// variables for new contacts popup
var newContactsForm = document.getElementById('new_contact_container');

// code for bringing up new contacts form
function showNewContactsForm() {
    newContactsForm.style.display = 'grid';
    grayOutScreen.style.display = 'block';
}
document.getElementById('new_contact_button').addEventListener('click', showNewContactsForm);   // brings up the form

// code for hiding contact form
function hideNewContactForm() {
    newContactsForm.style.display = 'none';
    grayOutScreen.style.display = 'none';
}
document.getElementById('form_close_button').addEventListener('click', hideNewContactForm);

// prevent page reload on form submission
var form = document.getElementById('new_contact_form');
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);

// submit button reads and sends data to server
var createContactButton = document.getElementById('new_contact_submit'); // submits the form
async function createContact() {
    const url = urlBase;
    var fname = document.getElementById('fname').value;
    var lname = document.getElementById('lname').value;
    var emailText = document.getElementById('email').value;

    // send POST request to server
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionToken 
            },
            body: JSON.stringify({
                firstName: fname,
                lastName: lname,
                email: emailText,
                rating: '' + defaultRating
            })
        });

        // on some type of failure, alert user
        if (response.status != 201) {
            console.error(response.status);
            let error = await response.json();
            alert("Error: " + error.error);
            
        } else {
            let usrID = await response.json();
            hideNewContactForm();
            let contactObject = new Contact(usrID, fname, lname, emailText, defaultRating);
            appendContactToHTML(contactObject);
            cachedContacts.push(contactObject);
        }

    } catch (error) {
        console.log("Something wen't wrong in the createContact function!");
        console.error(error);
    }
}
createContactButton.addEventListener('click', createContact);

function dynamicDetailsPane(contact) { // populating the details pane 
    // TODO: add images field
    document.getElementById('contact_name').textContent = `${contact.fname} ${contact.lname}`;
    document.getElementById('contact_email').textContent = contact.email;
    document.getElementById('number_display').textContent = contact.rating;
}  

// function accepts an li element and removes it from the ul
async function deleteContact(contactID) { 
    const url = urlBase + '/' + contactID;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                contactId: contactID
            })
        });

        if (!response.ok) {
            throw new Error('Response status: ' + response.status);
        }

        //TODO: handle response codes properly
    } catch(error) {
        console.log('Error with deleteContact() function!');
        console.error(error);
    }
}

async function editContact(contactID) {
    const url = urlBase + '/' + contactID;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contactId: contactID,
                //TODO: poll contact update from form
            })
        });

        if (!response.ok) {
            throw new Error('Response status: ' + response.status);
        }
    } catch(error) {
        console.log('Error with editContact() function!');
        console.error(error);
    }
}   
// end of dynamic contacts list


// search functionality
let searchBar = document.getElementById('search_bar');
function search() {

}
// execute search functionality everytime a key is pressed

