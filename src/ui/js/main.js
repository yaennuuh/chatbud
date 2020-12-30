var ipc = require('electron').ipcRenderer;
var _ = require('lodash');
var fs = require('fs');
var glob = require('glob');
var YAML = require('yaml');

window.onload = function () {
    var closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', function () {
        ipc.send('close-application', '');
    });

    var pluginConfigList = loadConfigs();

    var dropDownPlugins = document.getElementById('dropdown-plugins');
    pluginConfigList.forEach(pluginConfig => {
        var itemElement = document.createElement('li');
        itemElement.classList.add('dropdown-item');
        var itemATag = document.createElement('a');
        itemATag.appendChild(document.createTextNode(pluginConfig.name));
        itemElement.appendChild(itemATag);
        itemElement.addEventListener('click', () => {
            loadCustomTag(pluginConfig.name);
        });
        dropDownPlugins.appendChild(itemElement);
    });
}

function loadConfigs() {
    const fileConfigs = [];
    const configFiles = glob.sync(__dirname + "/../plugins/**/config.yaml", null);
    _.each(configFiles, (configPath) => {
        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8')
            const parsedConfig = YAML.parse(file);

            if (parsedConfig &&
                parsedConfig.hasOwnProperty('name') &&
                parsedConfig.hasOwnProperty('folder') &&
                parsedConfig.hasOwnProperty('ui-html') &&
                parsedConfig.hasOwnProperty('ui-js')
            ) {
                parsedConfig.tagname = _.kebabCase(parsedConfig.name);
                fileConfigs.push(parsedConfig);
                createWebComponent(parsedConfig);
            }
        }
    });
    return fileConfigs;
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
    templateTag.innerHTML = `
        <style>
            @import url('./css/main.css')
        </style>
        ${html}
    `;
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

