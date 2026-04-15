import {remoteURL} from "./apiURLs.js";

// File for the remote API calls

export async function getAllRemotes(){

    const userId = localStorage.getItem('userId');

    // Sending the data to backend mapping
    const response = await fetch(`${remoteURL}/getRemotes/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    });

    // Error handling
    if(!response.ok){
        const error = await response.json();
        throw new Error(error || 'Fetch of remotes failed');
    }

    return await response.json();
}

export async function addRemote(nickname, description, ipAddress, username, remotePassword) {
    const userId = localStorage.getItem('userId');
    const port = 22;

    const payload = {userId, nickname, description, ipAddress, port, username, remotePassword};

    const response = await fetch(`${remoteURL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })

    const data = await response.json();

    // Error handling
    if(!response.ok){
        throw new Error(data.message || 'Failed to add remote');
    }

    return data;
}

// Function to remove remotes
export async function removeRemote(remoteId){

    const response = await fetch(`${remoteURL}/delete/${remoteId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json'}
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || 'Failed to delete remote');
    }

    return data.message;
}


// Function to send edited remotes
export async function editRemote(remoteId, updatedRemote){

    const payload = {userId: localStorage.getItem('userId'),
                        nickname: updatedRemote.nickname,
                        description: updatedRemote.description,
                        ipAddress: updatedRemote.ipAddress,
                        port: 22,
                        username: updatedRemote.username,
                        remotePassword : updatedRemote.remotePassword};

    const response = await fetch(`${remoteURL}/update/${remoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })

    const data = await response.json();

    // Error handling
    if(!response.ok){
        throw new Error(data.message || 'Failed to edit remote');
    }

    return data;

}