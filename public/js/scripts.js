const urlBase = '/api/contact';

// variables for new contacts popup
var newContactsForm = document.getElementById('new_contact_container');
var grayOutScreen = document.getElementById('gray_out');

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
                'Content-Type': 'application/json'
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

// fetch and append a specific contact by its contact ID
var dynamicContactList = document.getElementById('dynamic_contacts_list');
async function appendContact(contactID) {
    const url = urlBase + '/' + contactID;

    try {
        // request data for specific contact from DB
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Reponse status: ' + response.status);
        }

        

        // create new list item
        var newContact = document.createElement('li');
        newContact.classList.add('contact_card');
        
        // create delete button to add to it 
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('card_delete_button');
        deleteButton.addEventListener('click', function(event) {
            var thisItem = event.target.parentNode; // target li parent
            deleteContact(thisItem);
        });
        tempNewItem.appendChild(deleteButton);

        // create edit button to add to it
        var editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit_button');
        editButton.addEventListener('click', function(event) {
            var thisItem = event.target.parentNode;
            editContact(thisItem);
        });
        tempNewItem.appendChild(editButton);

        // add entire button to list
        dynamicContactList.appendChild(tempNewItem);

    } catch(error) {
        console.log('Error with appendContact() function!');
        console.error(error);
    }
}


// function accepts an li element and removes it from the ul
function deleteContact(targetContact) { // TODO: make call to remove from API
    dynamicContactList.removeChild(targetContact);
}

function editContact(targetContact) { // TODO: make call to edit contact from API
    alert('Cannot edit contacts right now!');
}
// end of dynamic contacts list


