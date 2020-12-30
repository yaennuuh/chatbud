var ipc = require('electron').ipcRenderer;

window.onload = function () {
    console.log('loaded');
    var closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', function () {
        console.log('i got clicked');
        ipc.send('close-application', '');
    });
    createWebComponent('ui');
    var closeButton = document.getElementById('add-button');
    closeButton.addEventListener('click', function () {
        loadCustomTag('ui');
    });
}

function loadCustomTag(pluginName) {
    document.getElementById('content').appendChild(
        document.createElement(`custom-${pluginName}`));
}

function createWebComponent(pluginName) {
    fetch(`../plugins/TwitchTestPlugin/${pluginName}.html`)
        .then(stream => stream.text())
        .then(text => {
            createTemplateTag(text, pluginName);
        });
}

function createTemplateTag(html, pluginName) {
    var templateTag = document.createElement('template');
    templateTag.id = `custom-${pluginName}-template`;
    templateTag.innerHTML = html;
    document.getElementById("template-holder").appendChild(templateTag);
    loadTemplate(pluginName);
}

function loadTemplate(pluginName) {
    customElements.define(`custom-${pluginName}`,
        class extends HTMLElement {

            constructor() {
                super();
                const template = document
                    .getElementById(`custom-${pluginName}-template`)
                    .content;
                this._shadowRoot = this.attachShadow({ mode: 'open' });
                this._shadowRoot.appendChild(template.cloneNode(true));
                this._pluginName = pluginName;
            }

            connectedCallback() {
                var CustomFunction = require(`../plugins/TwitchTestPlugin/${this._pluginName}.js`);
                new CustomFunction(this._shadowRoot);
            }
        }
    );
}

