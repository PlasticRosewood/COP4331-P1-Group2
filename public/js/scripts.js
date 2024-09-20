const urlBase = '/api/contact';
let sessionToken;

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
        for (let i = 0; i < jsonContacts.length; i++) {
            let cur = jsonContacts[i];
            cachedContacts.push(new Contact(cur.id, cur.firstName, cur.lastName, cur.email, cur.rating));
        }
    } catch(error) {
        console.log('Issue in cacheContacts()');
        alert('Issue with caching contacts for user!');
        console.error(error);
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

function displayCachedContacts() {
    for (let i = 0; i < cachedContacts.length; i++) {
        appendContactToHTML(cacheContacts[i]);
    }
}

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

document.addEventListener("DOMContentLoaded", function() {
    getSessionToken();
    cacheContacts();
    displayCachedContacts();
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
                firstname: fname,
                lastname: lname,
                email: emailText
                //TODO: ensure that API has updated the schema
            })
        });

        if (!response.ok) {
            throw new Error('Response status: ' + response.status);
        }

        //TODO: handle response codes
            //TODO: on successful code received, fetch data from given id 
            //TODO: @SilverMight make sure userID is returned
    } catch (error) {
        console.log("Something wen't wrong in the createContact function!");
        console.error(error);
    }
    
}

function dynamicDetailsPane(contact) { // populating the details pane 
    const detailsPane = document.getElementById('details_pane');
    detailsPane.innerHTML = `
      <div class="contact-info">
        <img id="contact_image" src="https://via.placeholder.com/150" alt="Contact Image">
          <h2 id="contact_name">${contact.fname} ${contact.lname}</h2>
          <div id="contact_details">
              <p id="contact_email">${contact.email}</p>
          </div>
          <div id="number_control">
              <button id="decrement_button" class="number_button">-</button>
              <span id="number_display">${contact.rating}</span>
              <button id="increment_button" class="number_button">+</button>
          </div>
          <div id="option_buttons">
              <button id="edit_contact_button" class="edit_button">Edit Contact</button>
              <button id="delete_contact_button" class="delete_button">Delete Contact</button>
          </div>
      </div>
    `;
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


