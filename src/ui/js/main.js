var ipc = require('electron').ipcRenderer;
var _ = require('lodash');

window.onload = function () {
    var closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', function () {
        ipc.send('close-application', '');
    });
    var pluginList = [{
        "name": "TwitchTestPlugin",
        "folder": "TwitchTestPlugin",
        "ui-html": "ui.html",
        "ui-js":  "ui.js"
    }];
    pluginList.forEach(plugin => {
        plugin.tagname = _.kebabCase(plugin.name);
        createWebComponent(plugin);
    });
    //createWebComponent('ui');
    var addButton = document.getElementById('add-button');
    addButton.addEventListener('click', function () {
        var componentnamefield = document.getElementById('componentname');
        console.log(componentnamefield.value);
        loadCustomTag(componentnamefield.value);
    });
}

function loadCustomTag(pluginName) {
    pluginName = _.kebabCase(pluginName);
    content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(
        document.createElement(`custom-${pluginName}`));
}

function createWebComponent(plugin) {
    fetch(`../plugins/${plugin['folder']}/${plugin['ui-html']}`)
        .then(stream => stream.text())
        .then(text => {
            createTemplateTag(text, plugin);
        });
}

function createTemplateTag(html, plugin) {
    var templateTag = document.createElement('template');
    templateTag.id = `custom-${plugin['tagname']}-template`;
    templateTag.innerHTML = html;
    document.getElementById("template-holder").appendChild(templateTag);
    loadTemplate(plugin);
}

function loadTemplate(plugin) {
    customElements.define(`custom-${plugin['tagname']}`,
        class extends HTMLElement {

            constructor() {
                super();
                const template = document
                    .getElementById(`custom-${plugin['tagname']}-template`)
                    .content;
                this._shadowRoot = this.attachShadow({ mode: 'open' });
                this._shadowRoot.appendChild(template.cloneNode(true));
                this._plugin = plugin;
            }

            connectedCallback() {
                var CustomFunction = require(`../plugins/${this._plugin['folder']}/${this._plugin['ui-js']}`);
                new CustomFunction(this._shadowRoot);
            }
        }
    );
}

