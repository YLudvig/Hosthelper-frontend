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

