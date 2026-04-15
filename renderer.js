/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

import {loginUser, registerUser} from "./api.js";
import {addRemote, editRemote, getAllRemotes, removeRemote} from "./apiRemote.js";

// Global list of currentRemotes, used for dropdown of remotes to edit
let currentRemotes = [];

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

// Function to handle hiding or showing the input form for editing remotes
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('btn-toggle-editremoteform');
    const remoteFormContainer = document.getElementById('editremote-form-container');

    if(toggleBtn){
        toggleBtn.addEventListener('click', () => {
            remoteFormContainer.classList.toggle('hidden');

            if(remoteFormContainer.classList.contains('hidden')){
                toggleBtn.textContent = 'Edit Existing Remote';
            } else {
                toggleBtn.textContent = 'Minimize Edit Remote Form'
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
                alert("Successfully added remote: " + message.nickname);
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

    currentRemotes = remotes;
    const remotesDropdown = document.getElementById('remote-to-edit');

    remotesDropdown.innerHTML = '<option value="""" disabled selected">Select a remote...</option>';

    remotes.forEach(remote => {
       const div = document.createElement('div');
       div.className = 'remote-card';
       div.innerHTML = `
            <h3>${remote.nickname}</h3>
            <p>${remote.ipAddress}</p>
            <button class="delete-remote-btn">Delete remote</button>
            <div class="commands">
                <button class="ping-btn">
                    Ping Remote
                </button>
                <button class="clear-terminal-btn">
                    Clear terminal for this remote
                </button>
                <button class="ssh-connect-btn">
                    Connect to remote with SSH
                </button>
                <button class="check-processes-btn">
                    Check processes and ports
                </button>    
                <button class="check-docker-processes-btn">
                    Check Docker Processes
                </button>
                <button class="exit-remote-btn">
                    Exit Remote
                </button>
            </div>
            <pre id="terminal-${remote.remoteId}" class="mini-terminal"></pre>
       `;
       container.appendChild(div);

       // Dropdown
        const option = document.createElement('option');
        option.value = remote.remoteId;
        option.textContent = remote.nickname;
        remotesDropdown.appendChild(option);

       // Button to ping a remote and check that it responds
       const pingBtn = div.querySelector('.ping-btn');
       pingBtn.addEventListener('click', () => {
           triggerCommand(remote.remoteId, `ping -c 4 ${remote.ipAddress}`);
       })

        // Adds functionality to the SSH button
        const sshBtn = div.querySelector('.ssh-connect-btn');
       sshBtn.addEventListener('click', () => {
           triggerCommand(remote.remoteId, `ssh-init ${remote.username}@${remote.ipAddress}`);
       })

        // Adds functionality so that the default processes button works
        const processBtn = div.querySelector('.check-processes-btn');
       processBtn.addEventListener('click', () => {
           triggerCommand(remote.remoteId, `ss -tulpn`)
       })

        // Adds functionality so that the default processes button works
        const dockerProcessBtn = div.querySelector('.check-docker-processes-btn');
        dockerProcessBtn.addEventListener('click', () => {
            triggerCommand(remote.remoteId, `docker ps`)
        })

        // Adds functionality so that the default processes button works
        const exitRemoteBtn = div.querySelector('.exit-remote-btn');
        exitRemoteBtn.addEventListener('click', () => {
            triggerCommand(remote.remoteId, `exit`)
        })

        // Button to empty remotes terminal
       const clearTerminalBtn = div.querySelector('.clear-terminal-btn');
       clearTerminalBtn.addEventListener('click', () => {
            clearTerminal(remote.remoteId);
       })

        // Button to delete remote
       const deleteRemoteBtn = div.querySelector('.delete-remote-btn');
       deleteRemoteBtn.addEventListener('click', async () => {
           // Asks user to confirm before deleting the remote
           const confirmed = confirm(`Confirm deletion of ${remote.nickname}?`)

           if (confirmed) {
               // If user confirms the deletion we remove the remote and refetch remotes and rerender the remotes
               try {

                   await removeRemote(remote.remoteId);

                   alert(`Remote deleted ${remote.nickname}`);

                   const remotes = await getAllRemotes();
                   showRemotes(remotes);
                   // Display error if deletion runs into problem
               } catch (err) {
                   alert(`Error occurred when attempting to delete: ${err.message}`)
               }
           }
       });

       window.api.onTerminalOutput(remote.remoteId, (textData) => {
            const terminalElement = document.getElementById(`terminal-${remote.remoteId}`);
            if (terminalElement) {
                terminalElement.textContent += textData;
                terminalElement.scrollTop = terminalElement.scrollHeight;
            }
       })
    });
}


// Dropdown/edit listener
document.addEventListener('DOMContentLoaded', () => {

    // Find selected remote and render auto fill that remotes value in the editable inputs
    const selectedForEdit = document.getElementById('remote-to-edit');

    if (selectedForEdit){
        selectedForEdit.addEventListener('change', (e) => {
            const selectedId = e.target.value;

            // Loops through remotes and finds matching remote by remoteId
            const remote = currentRemotes.find(r => r.remoteId === selectedId);

            if (remote) {
                document.getElementById('editremote-nickname').value = remote.nickname;
                document.getElementById('editremote-ip').value = remote.nickname;
                document.getElementById('editremote-username').value = remote.username;
                document.getElementById('editremote-password').value = remote.remotePassword;
            }
        })
    }

    // Submission of edits made
    const editForm = document.getElementById('editremote-form');
    if (editForm){
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const remoteId = document.getElementById('remote-to-edit').value;

            const updatedRemote = {
                nickname: document.getElementById('editremote-nickname').value,
                ipAddress: document.getElementById('editremote-ip').value,
                username: document.getElementById('editremote-username').value,
                remotePassword: document.getElementById('editremote-password').value
            };

            try {
                const response = await editRemote(remoteId, updatedRemote);
                alert(response.message);
                const refreshremotes = await getAllRemotes();
                showRemotes(refreshremotes);
            } catch (err){
                alert(err.message);
            }
        })
    }
})


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