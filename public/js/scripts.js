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
// validate user session

function getSessionToken() {
    let name = 'token=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
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
        this.display = true;
    }
}
const fillerContact = new Contact(-1, 'Choose', 'Contact', 'Select Contact', 3);

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
            cachedContacts.push(newContact);
        }
        displayCachedContacts(); // display contacts here to avoid race condition
    } catch(error) {
        console.log('Issue in cacheContacts()');
        console.error(error);
    }
}

function displayCachedContacts() {
    for (let i = 0; i < cachedContacts.length; i++) {
        if (cachedContacts[i].display === true)
            appendContactToHTML(cachedContacts[i]); // NOTE: changing cache to cached
    }
}

function appendContactToHTML(contactObject) { // accepts a contact object and creates a card for the contacts_list element
    // create new list item
    var newContact = document.createElement('li');
    newContact.textContent = contactObject.fname + ' ' + contactObject.lname;
    newContact.id = contactObject.id;
    newContact.classList.add('mini_contact');

    document.getElementById('dynamic_contacts_list').appendChild(newContact); // adding the line to the list

    newContact.addEventListener('click', () => { // should open the details for specific contact clicked
        dynamicDetailsPane(contactObject);
    });

}

document.addEventListener("DOMContentLoaded", async function() {
    focusContact = fillerContact;
    getSessionToken();
    cacheContacts();
});

// gray out screen for all popups
var grayOutScreen = document.getElementById('gray_out');

// variables for new contacts popup
var newContactsForm = document.getElementById('new_contact_container');

// code for bringing up new contacts form

// VERY VERY NOT SURE IF THIS WORKS
const newContactButton = document.getElementById('new_contact_submit');
const updateContactButton = document.getElementById('update_contact_submit');

function showCreateButton() {
    newContactButton.style.display = 'grid';
    updateContactButton.style.display = 'none';
}

function showUpdateButton() {
    newContactButton.style.display = 'none';
    updateContactButton.style.display = 'grid';
}

function showNewContactsForm(option) {
    newContactsForm.style.display = 'grid';
    grayOutScreen.style.display = 'block';
    if (option === 1) {
        showCreateButton();
    }
    if (option === 2) {
        showUpdateButton();
    }
}
document.getElementById('new_contact_button').addEventListener('click', showNewContactsForm(1));   // brings up the form
document.getElementById('edit_contact_button').addEventListener('click', showNewContactsForm(2)); // brings up the form

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
            let contactObject = new Contact(usrID.id, fname, lname, emailText, defaultRating);
            appendContactToHTML(contactObject);
            cachedContacts.push(contactObject);
        }

    } catch (error) {
        console.log("Something wen't wrong in the createContact function!");
        console.error(error);
    }
}
createContactButton.addEventListener('click', createContact);


// VERY VERY NOT SURE IF THIS WORKS
async function updateContact(Contact) {
    const url = urlBase + '/' + Contact.id;
    var fname = document.getElementById('fname').value;
    var lname = document.getElementById('lname').value;
    var emailText = document.getElementById('email').value;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionToken 
            },
            body: JSON.stringify({
                id: Contact.id,
                firstName: fname,
                lastName: lname,
                email: emailText,
                rating: Contact.rating
            })
        });

        if (response.status != 204) {
            console.error(response.status);
            let error = await response.json();
            alert("Error: " + error.error);
        } else {
            hideNewContactForm();
            let contactObject = new Contact(Contact.id, fname, lname, emailText, Contact.rating);
            cachedContacts.push(contactObject);
        }
    } catch (error) {
        console.log("Something wen't wrong in the updateContact function!");
        console.error(error);
    }
}

function dynamicDetailsPane(contact) { // populating the details pane 
    focusContact = contact;
     // TODO: add images field
    document.getElementById('contact_name').textContent = `${contact.fname} ${contact.lname}`;
    document.getElementById('contact_email').textContent = contact.email;
    document.getElementById('number_display').textContent = contact.rating;
    document.getElementById('increment_button').onclick = () => {
        updateRating(focusContact, 1);  
    };
    document.getElementById('decrement_button').onclick = () => {
        updateRating(focusContact, -1);  
    };
}

function updateRating(contact, change) {
    let newRating = contact.rating + change;
    if (newRating < 1) { // minimum rating
        newRating = 1;
    } else if (newRating > 5) { // maximum rating
        newRating = 5;
    }
    document.getElementById('number_display').textContent = newRating;
    contact.rating = newRating;
    let cachedContact = cachedContacts.find(c => c.id === contact.id);
    if (cachedContact) {
        cachedContact.rating = newRating;
    }
    storeVals(contact);
}

async function storeVals(contact) {
    console.log(contact);  

    const url = `${urlBase}/${contact.id}`;  
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionToken 
            },
            body: JSON.stringify({
                id: contact.id,
                firstName: contact.fname,   
                lastName: contact.lname,
                email: contact.email,
                rating: contact.rating  
            })
        });
        if (!response.ok) {
            throw new Error(`I'm dumb this no work, status: ${response.status}`);
        }

        console.log('YAY IT WORKED.');// WHY THE HELL ARE YOU NOT CACHING PROPERLY
    } catch (error) {
        console.log('you suck:', error);
    }
}

// function accepts an li element and removes it from the ul
async function deleteContact() { 
    // don't attempt to delete non-focused target
    if (focusContact.id === fillerContact.id) return;

    const url = `${urlBase}/${focusContact.id}`;

    if (focusContact.id === fillerContact.id) {
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + sessionToken 
            },
            body: JSON.stringify({
                contactId: focusContact.id
            })
        });

        if (response.status != 204) {
            console.error(response.status);
            let error = await response.json();
        } else {
            // remove contact to delete from cachedContacts
            cachedContacts = cachedContacts.filter(function (contact) {
                return contact.id != focusContact.id;
            });

            // remove contact to delete from HTML
            let mini_contacts = document.getElementsByClassName('mini_contact');
            console.log(mini_contacts);
            for (let i = 0; i < mini_contacts.length; i++) {
                if (mini_contacts[i].id == focusContact.id) {
                    mini_contacts[i].remove();
                    dynamicDetailsPane(fillerContact);
                    console.log(cachedContacts);
                    break;
                }
            }
        }
    } catch(error) {
        console.log('Error with deleteContact() function!');
        console.error(error);
    }
}
document.getElementById('delete_contact_button').addEventListener('click', deleteContact);

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
    let search = searchBar.value.toLowerCase(); // standardize input
    let mini_contacts = document.getElementsByClassName('mini_contact'); // get all current contacts in the html

    // loop through each element
    // hide if doesn't match, show if it does
    // TODO: consider upgraded to trie structure for speed
    for (let i = 0; i < mini_contacts.length; i++) {
        if (mini_contacts[i].textContent.toLowerCase().includes(search)) { // include in search
            mini_contacts[i].style.display = 'block';
        } else {
            mini_contacts[i].style.display = 'none';
        }
    }
}
// execute search functionality everytime a key is pressed and search bar is focused
searchBar.addEventListener('keyup', search);