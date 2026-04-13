// JS file to handle my API calls for the application

// Handles the API part of the register user call,
// the html connection is done in renderer.js
export async function registerUser(username, password){
    const payload = {username, password};

    // Sending the data to backend mapping
    const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    // Error handling
    if(!response.ok){
        const error = await response.text();
        throw new Error(error || 'Registration failed');
    }

    return await response.text();
}