// File for the remote API calls

export async function getAllRemotes(){

    const userId = localStorage.getItem('userId');

    // Sending the data to backend mapping
    const response = await fetch(`http://localhost:8080/api/remote/getRemotes/${userId}`, {
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

export async function addRemote(nickname, ipAddress, username, remotePassword) {
    const userId = localStorage.getItem('userId');
    const port = 22;

    const payload = {userId, nickname, ipAddress, port, username, remotePassword};

    const response = await fetch('http://localhost:8080/api/remote/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })

    // Error handling
    if(!response.ok){
        const error = await response.json();
        throw new Error(error.message || 'Failed to add remote');
    }

    return await response.json();
}