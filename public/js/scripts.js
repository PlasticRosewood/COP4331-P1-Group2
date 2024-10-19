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

/* CACHES ONLY CONTACTS ASSOCIATED WITH CURRENT USER */
/* DOES NOT CACHE ALL CONTACTS, AS PER INSTRUCTIONS */
/* SEARCHING FOR ALL CONTACTS OF A PARTICULAR USER IS DONE IN API */
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

    /*
    var contactImage = document.createElement('img');
    contactImage.src = alienImage(contactObject);
    contactImage.alt = `${contactObject.fname} ${contactObject.lname}'s image`;
    newContact.appendChild(contactImage); 
    */
   
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


function dynamicDetailsPane(contact) { // populating the details pane 
    // TODO: add images field
    document.getElementById('contact_name').textContent = `${contact.fname} ${contact.lname}`;
    document.getElementById('contact_email').textContent = contact.email;
    document.getElementById('number_display').textContent = contact.rating;

    focusContact = contact;
}  

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
    newContactButton.style.userSelect = 'auto';
    updateContactButton.style.userSelect = 'none';
}

function showUpdateButton() {
    newContactButton.style.display = 'none';
    updateContactButton.style.display = 'grid';
    newContactButton.style.userSelect = 'none';
    updateContactButton.style.userSelect = 'auto';
}

function showNewContactsForm(option) {
    newContactsForm.style.display = 'grid';
    grayOutScreen.style.display = 'block';
    if (option === 1) {
        showCreateButton();

        // change placeholder values back to initial
        document.getElementById('fname').placeholder = 'John';
        document.getElementById('lname').placeholder = 'Doe';
        document.getElementById('email').placeholder = 'user@website.tld';
    }
    if (option === 2) {
        showUpdateButton();
        
        // initialize values with current
        document.getElementById('fname').placeholder = focusContact.fname;
        document.getElementById('lname').placeholder = focusContact.lname;
        document.getElementById('email').placeholder = focusContact.email;
    }
}
document.getElementById('new_contact_button').addEventListener('click', ()=> {
    showNewContactsForm(1);
});   // brings up the form
document.getElementById('edit_contact_button').addEventListener('click', ()=> {
    showNewContactsForm(2);
}); // brings up the form

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
        console.log("Something went wrong in the createContact function!");
        console.error(error);
    }
}
createContactButton.addEventListener('click', createContact);

function updateRating(contact, change) { 
    let newRating = contact.rating + change;

    if (newRating < 1) { //ensuring rating doesn't pass boundry
        newRating = 1;
    } else if (newRating > 5) { 
        newRating = 5;
    }
    if (newRating === 1) { //pop up occurs when one
        document.getElementById('number_display').textContent = 1;
        contact.rating = 1; 
        document.getElementById('void_Container').style.display = 'block';
        document.getElementById('gray_out').style.display = 'block';
        document.getElementById('contactName').textContent = `${contact.fname} ${contact.lname}`;

        document.getElementById('cancelSpace').onclick = function () {
            contact.rating = 2; 
            document.getElementById('number_display').textContent = 2;  
            closeSpacePopup();  
        };

        document.getElementById('voidContact').onclick = function () { // void is clicked
            const detailsPane = document.getElementById('details_pane'); 
            if (detailsPane) {
                const voidScreen = document.createElement('div');
                voidScreen.id = 'voidScreen';
                detailsPane.appendChild(voidScreen); 

                detailsPane.classList.add('voiding');
                setTimeout(() => { //time for voiding ani

                    detailsPane.classList.remove('voiding');
        
                    detailsPane.classList.add('hidden'); 
                    detailsPane.removeChild(voidScreen);
                    detailsPane.classList.remove('hidden');  
                }, 4800); 
                setTimeout(() => { //delayed time for delete and default pane to reappear
                    deleteContact(); 
                }, 4600);
                closeSpacePopup(); 
            }
        };
        return; 
    }
    document.getElementById('number_display').textContent = newRating; 
    contact.rating = newRating;
    let cachedContact = cachedContacts.find(c => c.id === contact.id);
    if (cachedContact) {
        cachedContact.rating = newRating;
    }
    storeVals(contact);
}



function closeSpacePopup() {
    document.getElementById('void_Container').style.display = 'none';
    document.getElementById('gray_out').style.display = 'none';
}

// TODO: remove API calls and use existing CRUD functions where possible
async function storeVals(contact) { //update contact information
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
            throw new Error(`I'm dumb this no   work, status: ${response.status}`);
        }

        console.log('YAY IT WORKED.');
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
                    dynamicDetailsPane(fillerContact); //note to self: this is what is causing it to pop mid way
                    console.log(cachedContacts);
                    break;
                }
            }
        }
    } 
    catch(error) {
        console.log('Error with deleteContact() function!');
        console.error(error);
    }
}
document.getElementById('delete_contact_button').addEventListener('click', deleteContact);

async function editContact(contactID) {
    const url = `${urlBase}/${contactID}`;
    
    var fname = document.getElementById('fname').value;
    var lname = document.getElementById('lname').value;
    var emailText = document.getElementById('email').value;

    // ignore edit request if none selected
    if (contactID === fillerContact.id) {
        hideNewContactForm();
        return;
    }

    // send PUT request to server
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionToken 
            },
            body: JSON.stringify({
                id: contactID,
                firstName: fname,
                lastName: lname,
                email: emailText,
                rating: focusContact.rating
            })
        });

        // on some type of failure, alert user
        if (response.status != 204) {
            console.error(response.status);
            let error = await response.json();
            alert("Error: " + error.error);
        } else {
            // look through js array
            for (let i = 0; i < cachedContacts.length; i++) {
                if (cachedContacts[i].id == contactID) {
                    //update js array
                    cachedContacts[i].fname = fname;
                    cachedContacts[i].lname = lname;
                    cachedContacts[i].email = emailText;
                    dynamicDetailsPane(cachedContacts[i]); // update in details pane
                    break;
                }
            }
            
            
            // look through html array
            let mini_contacts = document.getElementsByClassName('mini_contact');
            for (let i = 0; i < mini_contacts.length; i++) {
                if (mini_contacts[i].id == contactID) {
                    mini_contacts[i].textContent = `${fname} ${lname}`;
                    break;
                }
            }

            hideNewContactForm();
        }

    } catch (error) {
        console.log("Something wen't wrong in the editContact function!");
        console.error(error);
    }
}   
document.getElementById('update_contact_submit').addEventListener('click', () => {
    editContact(focusContact.id);
});
// end of dynamic contacts list


// search functionality
let doSearchFast = document.getElementById('fast_search_toggle').checkd; // flag to determine if search is fast or slow

let searchBar = document.getElementById('search_bar');
function searchFast() {
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

async function searchSlow() {
    let search = searchBar.value.toLowerCase(); // standardize input
    let params = new URLSearchParams();
    params.append('query', search);
    let url = `${urlBase}/search?${params}`;

    // make fetch request to backend
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionToken,
            },
        });

        if (!response.ok) {
            throw new Error('Response status: ' + response.status);
        }   

        let jsonContacts = await response.json();
        let mini_contacts = document.getElementsByClassName('mini_contact');
        for (let i = 0; i < mini_contacts.length; i++) {
            let show = false;
            for (let j = 0; j < jsonContacts.contacts.length; j++) {
                let cur = jsonContacts.contacts[j];
                if (mini_contacts[i].id == cur.contact_id) show = true;
            }

            if (show === true) {
                mini_contacts[i].style.display = 'block';
            } else {
                mini_contacts[i].style.display = 'none';
            }
        }

    } catch (error) {  
        console.log('Error in searchSlow()');
        console.error(error);
    }
}

// determine which search function to use
document.getElementById('fast_search_toggle').addEventListener('click', ()=>{
    doSearchFast = document.getElementById('fast_search_toggle').checked; 
});

// execute search functionality everytime a key is pressed and search bar is focused
searchBar.addEventListener('keyup', () => {
    if (doSearchFast) {
        searchFast();
    } else {
        searchSlow();
    }
});

// changed to the bottom cause not working, too tired to figure out why
function dynamicDetailsPane(contact) { // populating the details pane 
    // TODO: add images field
    document.getElementById('contact_name').textContent = `${contact.fname} ${contact.lname}`;
    document.getElementById('contact_email').textContent = contact.email;
    document.getElementById('number_display').textContent = contact.rating;

    const contactImageSrc = alienImage(contact);
    document.getElementById('contact_image').src = contactImageSrc;
    focusContact = contact;
}  

function alienImage(contact) { //function to assign example images to image pane
    const firstLetter = contact.fname.charAt(0).toUpperCase();
    const charCode = firstLetter.charCodeAt(0);

    // Map letters A-I (65-73), J-R (74-82), S-Z (83-90) to images 1-9
    let exampleNum;
    if (charCode >= 65 && charCode <= 67) { // a-c
        exampleNum = 1;
    } else if (charCode >= 68 && charCode <= 70) { // d-f
        exampleNum = 2;
    } else if (charCode >= 71 && charCode <= 73) { // g-i
        exampleNum = 3;
    } else if (charCode >= 74 && charCode <= 76) { // j-l
        exampleNum = 4;
    } else if (charCode >= 77 && charCode <= 79) { // m-o
        exampleNum = 5;
    } else if (charCode >= 80 && charCode <= 82) { // p-r
        exampleNum = 6;
    } else if (charCode >= 83 && charCode <= 85) { // S-u
        exampleNum = 7;
    } else if (charCode >= 86 && charCode <= 88) { // v-x
        exampleNum = 8;
    } else { // y-Z
        exampleNum = 9; 
    }

    return `images/EXAMPLE${exampleNum}.PNG`; 
}