// variables for new contacts popup
var newContactsForm = document.getElementById('new_contact_container');
var grayOutScreen = document.getElementById('gray_out');

// function for bringing up new contacts form
function showNewContactsForm() {
    newContactsForm.style.display = 'grid';
    grayOutScreen.style.display = 'block';
}

function hideNewContactForm() {
    newContactsForm.style.display = 'none';
    grayOutScreen.style.display = 'none';
}
document.getElementById('form_close_button').addEventListener('click', hideNewContactForm);

// prevent page reload on form submission
var form = document.getElementById('new_contact_form');
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);

var dynamicContactList = document.getElementById('dynamic_contacts_list');

var newContactButton = document.getElementById('new_contact_button');   // brings up the form
newContactButton.addEventListener('click', showNewContactsForm);

var createContactButton = document.getElementById('new_contact_submit'); // submits the form

function appendContact(contactID) {
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
}


// function accepts an li element and removes it from the ul
function deleteContact(targetContact) { // TODO: make call to remove from API
    dynamicContactList.removeChild(targetContact);
}

function editContact(targetContact) { // TODO: make call to edit contact from API
    alert('Cannot edit contacts right now!');
}
// end of dynamic contacts list


