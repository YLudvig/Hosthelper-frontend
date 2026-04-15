import {authURL} from "./apiURLs.js";
// JS file to handle my API calls for the application

// Handles the API part of the register user call,
// the html connection is done in renderer.js

export async function registerUser(name, password){
    const payload = {name, password};

    // Sending the data to backend mapping
    const response = await fetch(`${authURL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Error handling
    if(!response.ok){
        throw new Error(data.message || 'Registration failed');
    }

    return data.message;
}


// Handles the API part of login user call,
// the html connection is done in renderer.js
export async function loginUser(name, password){
    const payload = {name, password};

    // Sending the data to backend mapping
    const response = await fetch(`${authURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Error handling
    if(!response.ok){
        throw new Error(data.message || 'Login failed');
    }

    return data;
}