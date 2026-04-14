/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

import {loginUser, registerUser} from "./api.js";
import {getAllRemotes} from "./apiRemote.js";

// Function to handle what is shown for user
// We essentially have all sections have the view tag, when a redirect is made
// we make all but the selected page to swap to invisible, through this we get a fast SPA (Single Page Applciation) type experience
function showPage(pageId){
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.style.display = 'none');

    const target = document.getElementById(pageId);
    if (target){
        target.style.display = 'block';
    }
}

// This combined with the showPage function constitutes the routing logic for the application
document.addEventListener('DOMContentLoaded', () => {
    // When register link clicked we run the showPage function that makes all
    // other sections invisible and leaves only the register section visible
    document.getElementById('register-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('register-page');
    });

    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login-page');
    })

});

// Function to catch input values on register page and then use the API register
// method to send that to backend and then display backend response
document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('register-user');

    registerBtn.addEventListener('click', async () => {
        const name = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            const message = await registerUser(name, password);
            alert("Success: " + message);
            showPage('login-page');
        } catch (err){
            alert(err.message);
        }

    })
})


// Function to catch input values of login and then use the API login method to send to backend
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-user');


    loginBtn.addEventListener('click', async () => {
        const name = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const message = await loginUser(name, password);

            // Set the userId in localstorage
            localStorage.setItem('userId', message.userId);

            // Fetches remotes
            const remotes = await getAllRemotes();

            // Checks return of getAllRemotes fetch and checks
            // that it's a list and not empty to avoid breaking the rendering
            if (Array.isArray(remotes) && remotes.length > 0){
                // Render the fetched remotes
                showRemotes(remotes);
            } else {
                console.log("No remotes in db for this user")
            }

            // Alerts user of successful login and on closing the alert user is redirected to the main-page
            alert("Success: " + message.message);
            showPage('main-page');
        } catch (err){
            alert(err.message);
        }
    })
})


// Function to log out from profile
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-user');

    logoutBtn.addEventListener('click', async () => {
        localStorage.removeItem('userId');
        showPage('login-page')
    })
})


// Function to display fetched remotes on main page
function showRemotes(remotes){
    const container = document.getElementById('remote-container');
    container.innerHTML = '';

    remotes.forEach(remote => {
       const div = document.createElement('div');
       div.className = 'remote-card';
       div.innerHTML = `
            <h3>${remote.name}</h3>
            <p>${remote.status}</p>
            <div id="terminal-${remote.id}" class="mini-terminal"></div>
       `;
       container.appendChild(div);
    });
}


// Function to handle hiding or showing the input form for creating remotes
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('btn-toggle-remoteform');
    const remoteFormContainer = document.getElementById('remote-form-container');

    toggleBtn.addEventListener('click', () => {
        remoteFormContainer.classList.toggle('hidden');

        if(remoteFormContainer.classList.contains('hidden')){
            toggleBtn.textContent = 'Add New Remote';
        } else {
            toggleBtn.textContent = 'Minimize Remote Form'
        }
    })
})
