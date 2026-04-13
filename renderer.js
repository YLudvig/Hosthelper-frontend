/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

//Function to handle what is showed for user
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
    // When register link clicked we run the showpage function that makes all
    // other sections invisible and leaves only the register section visible
    document.getElementById('register-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('register-page');
    });

    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login-page');
    })

})

