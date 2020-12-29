var ipc = require('electron').ipcRenderer;
window.onload = function () {
    console.log('loaded');
    var closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', function () {
        console.log('i got clicked');
        ipc.send('close-application', '');
    });
}