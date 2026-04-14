/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

import {loginUser, registerUser} from "./api.js";
import {addRemote, getAllRemotes} from "./apiRemote.js";

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
    });

    document.getElementById('logout-user').addEventListener('click', async () => {
        localStorage.removeItem('userId');
        showPage('login-page')
    });

});

// Function to catch input values on register page and then use the API register
// method to send that to backend and then display backend response
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');


    if (registerForm){
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            try {
                const message = await registerUser(name, password);
                alert("Success: " + message);
                registerForm.reset();
                showPage('login-page');
            } catch (err){
                alert(err.message);
            }
        })
    }
})


// Function to catch input values of login and then use the API login method to send to backend
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if(loginForm){
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                loginForm.reset();
                showPage('main-page');
            } catch (err){
                alert(err.message);
            }
        })
    }
})


// Function to handle hiding or showing the input form for creating remotes
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('btn-toggle-remoteform');
    const remoteFormContainer = document.getElementById('remote-form-container');

    if(toggleBtn){
        toggleBtn.addEventListener('click', () => {
            remoteFormContainer.classList.toggle('hidden');

            if(remoteFormContainer.classList.contains('hidden')){
                toggleBtn.textContent = 'Add New Remote';
            } else {
                toggleBtn.textContent = 'Minimize Remote Form'
            }
        })
    }
})


// Function to add remotes to backend
document.addEventListener('DOMContentLoaded', () => {
    const remoteForm = document.getElementById('remote-form');

    if(remoteForm){
        remoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nickname = document.getElementById('remote-nickname').value;
            const ipAddress = document.getElementById('remote-ip').value;
            const username = document.getElementById('remote-username').value;
            const remotePassword = document.getElementById('remote-password').value;

            try {
                const message = await addRemote(nickname, ipAddress, username, remotePassword);
                alert("Successfully added remote: " + message);
                remoteForm.reset();
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
            } catch (err){
                alert(err.message);
            }
        })
    }
})


// Function to refetch remotes on demand
document.addEventListener('DOMContentLoaded', () => {
    const refetchRemoteBtn = document.getElementById('refetch-remotes');

    if(refetchRemoteBtn){
        refetchRemoteBtn.addEventListener('click', async () =>{
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
        })
    }
})

// Function to display fetched remotes on main page
function showRemotes(remotes){
    const container = document.getElementById('remote-container');
    container.innerHTML = '';

    remotes.forEach(remote => {
       const div = document.createElement('div');
       div.className = 'remote-card';
       div.innerHTML = `
            <h3>${remote.nickname}</h3>
            <p>${remote.ipAddress}</p>
            <div class="commands">
                <button class="ping-btn">
                    Ping Remote
                </button>
                <button class="clear-terminal-btn">
                    Clear terminal for this remote
                </button>
            </div>
            <pre id="terminal-${remote.remoteId}" class="mini-terminal"></pre>
       `;
       container.appendChild(div);

       // Button to ping a remote and check that it responds
       const pingBtn = div.querySelector('.ping-btn');
       pingBtn.addEventListener('click', () => {
           triggerCommand(remote.remoteId, `ping -c 4 ${remote.ipAddress}`);
       })

        // Button to empty remotes terminal
       const clearTerminalBtn = div.querySelector('.clear-terminal-btn');
       clearTerminalBtn.addEventListener('click', () => {
            clearTerminal(remote.remoteId);
       })

       window.api.onTerminalOutput(remote.remoteId, (textData) => {
            const terminalElement = document.getElementById(`terminal-${remote.remoteId}`);
            if (terminalElement) {
                terminalElement.textContent += textData;
                terminalElement.scrollTop = terminalElement.scrollHeight;
            }
       })
    });
}

// Sender that sends command to preload and then to main to be ran
window.triggerCommand = (remoteId, fullCommand) => {
    const remote = document.getElementById(`terminal-${remoteId}`);

    // Error handling for if no terminal
    if (remote){
        remote.textContent += `\n ${fullCommand}\n`;
        remote.scrollTop = remote.scrollHeight;
        window.api.sendCommand(remoteId, fullCommand);
    } else {
        console.error(`Could not find terminal for ID: ${remoteId}`);
    }

}

// Function to clear a remotes terminal if user wishes to do so
window.clearTerminal = (remoteId) => {
    const terminal = document.getElementById(`terminal-${remoteId}`);

    // Checks that it exists before doing anything
    if (terminal) {
        terminal.textContent = '>'
    } else {
        console.error('Could not find the terminal to empty');
    }
}