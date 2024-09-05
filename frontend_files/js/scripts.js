// script for dynamic contacts list
var dynamicContactList = document.getElementById("dynamic_contacts_list");
var newContactButton = document.getElementById("new_contact_button");
var counter = 0;

// TODO: change temporary code to pertinent & permanent code
// TODO: link this function to form completion instead of pressing the new contact button 
function appendContact() {
    // create new list item
    var tempNewItem = document.createElement('li');
    tempNewItem.textContent = 'This is a test' + counter++;
    
    // create delete button to add to it 
    var deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.classList.add('delete_button');
    deleteButton.addEventListener('click', function(event) {
        var thisItem = event.target.parentNode; // target li parent
        deleteContact(thisItem);
    });
    tempNewItem.appendChild(deleteButton);

    // add entire button to list
    dynamicContactList.appendChild(tempNewItem);
}

// function accepts an li element and removes it from the ul
function deleteContact(targetContact) {
    dynamicContactList.removeChild(targetContact);
}

newContactButton.addEventListener('click', appendContact);
// end of dynamic contacts list
