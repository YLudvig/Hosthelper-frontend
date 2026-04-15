import {buttonUrl} from "./apiURLs.js";

// File for the button API calls

export async function getAllButtons(){

    const userId = localStorage.getItem('userId');

    // Sending the data to backend mapping
    const response = await fetch(`${buttonUrl}/getButtons/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    });

    // Error handling
    if(!response.ok){
        const error = await response.json();
        throw new Error(error || 'Fetch of buttons failed');
    }

    return await response.json();
}

export async function addButton(buttonName, command) {
    const userId = localStorage.getItem('userId');

    const payload = { userId, buttonName, command};

    const response = await fetch(`${buttonUrl}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })

    const data = await response.json();

    // Error handling
    if(!response.ok){
        throw new Error(data.message || 'Failed to add button');
    }

    return data;
}

// Function to remove buttons
export async function removeButton(buttonId){

    const response = await fetch(`${buttonUrl}/delete/${buttonId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json'}
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || 'Failed to delete button');
    }

    return data.message;
}


// Function to send edited buttons
export async function editButton(buttonId, updatedButton){

    const payload = {userId: localStorage.getItem('userId'),
        buttonName: updatedButton.buttonName,
        command: updatedButton.command
    };

    const response = await fetch(`${buttonUrl}/update/${buttonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })

    const data = await response.json();

    // Error handling
    if(!response.ok){
        throw new Error(data.message || 'Failed to edit button');
    }

    return data;

}
