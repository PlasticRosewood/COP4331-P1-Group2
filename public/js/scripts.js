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
    newContactsForm.style.display = 'none';
}


var dynamicContactList = document.getElementById('dynamic_contacts_list');
var newContactButton = document.getElementById('new_contact_button');   // brings up the form
var createContactButton = document.getElementById('new_contact_submit'); // submits the form

// TODO: change temporary code to pertinent & permanent code
// TODO: link this function to form completion instead of pressing the new contact button 
function appendContact() {
    showNewContactsForm();

    // create new list item
    var tempNewItem = document.createElement('li');
    tempNewItem.textContent = 'This is a test';
    // TODO: In reality, set text content to fname, lname, email, etc...
    
    // create delete button to add to it 
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete_button');
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

// event listener 


createContactButton.preventDefault(); // prevent form submission


// function accepts an li element and removes it from the ul
function deleteContact(targetContact) { // TODO: make call to remove from API
    dynamicContactList.removeChild(targetContact);
}

function editContact(targetContact) { // TODO: make call to edit contact from API
    alert('Cannot edit contacts right now!');
}
// end of dynamic contacts list


