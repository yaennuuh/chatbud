const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
var _ = require('lodash');
var fs = require('fs');
var glob = require('glob');
var YAML = require('yaml');
window.jQuery = require('jquery');

window.bootstrap = bootstrap;

// Load

initializeCorePlugins();
initializePlugins();
initializeConnectors();
initializeDashboard();

initializeListeners();

// General

function initializeListeners() {
    var closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', function () {
        ipc.send('close-application', '');
    });
    var dashboardButton = document.getElementById('dashboard-button');
    dashboardButton.addEventListener('click', function () {
        loadCustomTag('core-dashboard');
    });
    var reloadAppButton = document.getElementById('reload-app-button');
    reloadAppButton.addEventListener('click', function () {
        ipc.send('reload-application', '');
    });
    var settingsButton = document.getElementById('settings-button');
    settingsButton.addEventListener('click', function () {
        loadCustomTag('core-settings');
    });
    var extensionsButton = document.getElementById('extensions-button');
    extensionsButton.addEventListener('click', function () {
        loadCustomTag('core-extensions');
    });
}

function loadCustomTag(tagName) {
    tagName = _.kebabCase(tagName);
    content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(
        document.createElement(tagName));
}

function createWebComponent(pageName) {
    fetch(`./pages/${pageName}/${pageName}.html`)
        .then(stream => stream.text())
        .then(text => {
            createTemplateTag(text, pageName);
        });
}

function createTemplateTag(html, pageName) {
    var templateTag = document.createElement('template');
    templateTag.id = `core-${pageName}-template`;
    document.getElementById("template-holder").appendChild(templateTag);
    loadTemplate(html, pageName);
}

function loadTemplate(html, pageName) {
    customElements.define(`core-${pageName}`,
        class extends HTMLElement {

            constructor() {
                super();
                this._shadowRoot = this.attachShadow({ mode: 'open' });
                this._shadowRoot.innerHTML = `<script src="./js/bootstrap.bundle.min.js"></script>
                <slot name="bot-content-section"></slot>`;
                this._pageName = pageName;
            }

            connectedCallback() {
                const template = document.getElementById(`core-${pageName}-template`);

                template.innerHTML = `
                    <style>
                        @import url('./css/main.css')
                    </style>
                    <section slot="bot-content-section">
                        ${html}
                    </section>
                `;

                this.appendChild(template.content.cloneNode(true));
                var CorePageUI = require(`./pages/${pageName}/${pageName}.js`);
                const coreHelper = remote.getGlobal('coreHelper');
                new CorePageUI(coreHelper);
            }
        }
    );
}

// Dashboard

function initializeDashboard() {
    createWebComponent('dashboard');
    createWebComponent('settings');
    createWebComponent('extensions');
    loadCustomTag('core-dashboard');
}

// Connectors

function initializeConnectors() {
    var connectorConfigList = loadConnectorConfigs();

    var dropDownConnectors = document.getElementById('dropdown-connectors');
    connectorConfigList.forEach(connectorConfig => {
        if (!connectorConfig.hasOwnProperty('hide-plugin') || connectorConfig['hide-plugin'] === true) {
            var itemElement = document.createElement('li');
            itemElement.classList.add('dropdown-item');

            var itemATag = document.createElement('a');
            const connectorName = connectorConfig.hasOwnProperty('display-name') ? connectorConfig['display-name'] : connectorConfig['name'];
            itemATag.appendChild(document.createTextNode(connectorName));
            itemElement.appendChild(itemATag);
            itemElement.addEventListener('click', () => {
                loadCustomTag(`custom-${connectorConfig['name']}`);
            });

            dropDownConnectors.appendChild(itemElement);
        }
    });
}

function loadConnectorConfigs() {
    const fileConfigs = [];
    const configFiles = glob.sync(__dirname + "/../connectors/**/config.yaml", null);
    _.each(configFiles, (configPath) => {
        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8')
            const parsedConfig = YAML.parse(file);

            if (parsedConfig &&
                parsedConfig.hasOwnProperty('name') &&
                parsedConfig.hasOwnProperty('ui-html') &&
                parsedConfig.hasOwnProperty('ui-js')
            ) {
                parsedConfig.tagname = _.kebabCase(parsedConfig.name);
                fileConfigs.push(parsedConfig);
                createWebComponentForConnector(parsedConfig);
            }
        }
    });
    return fileConfigs;
}

function createWebComponentForConnector(connector) {
    fetch(`../connectors/${connector['name']}/${connector['ui-html']}`)
        .then(stream => stream.text())
        .then(text => {
            createTemplateTagForConnector(text, connector);
        });
}

function createTemplateTagForConnector(html, connector) {
    var templateTag = document.createElement('template');
    templateTag.id = `custom-${connector['tagname']}-template`;
    document.getElementById("template-holder").appendChild(templateTag);
    loadTemplateForConnector(html, connector);
}

function loadTemplateForConnector(html, connector) {
    customElements.define(`custom-${connector['tagname']}`,
        class extends HTMLElement {

            constructor() {
                super();
                this._shadowRoot = this.attachShadow({ mode: 'open' });
                this._shadowRoot.innerHTML = `<script src="./js/bootstrap.bundle.min.js"></script>
                <slot name="bot-content-section"></slot>`;
                this._connector = connector;
            }

            connectedCallback() {
                const template = document.getElementById(`custom-${this._connector['tagname']}-template`);

                template.innerHTML = `
                    <style>
                        @import url('./css/main.css')
                    </style>
                    <span slot="bot-content-section">
                        ${html}
                    </span>
                `;

                this.appendChild(template.content.cloneNode(true));
                var CustomConnectorUI = require(`../connectors/${this._connector['name']}/${this._connector['ui-js']}`);
                const connectorManager = remote.getGlobal('connectorManager');
                const connectorHelper = connectorManager.getConnectorHelper(this._connector);
                new CustomConnectorUI(connectorHelper);
            }
        }
    );
}

// Plugins

function initializeCorePlugins() {
    const pluginManager = remote.getGlobal('pluginManager');
    const resourcesPath = pluginManager.resourcesPathCore;
    loadPlugins(resourcesPath);
}

function initializePlugins() {
    const pluginManager = remote.getGlobal('pluginManager');
    const resourcesPath = pluginManager.resourcesPath;
    loadPlugins(resourcesPath);
}

function loadPlugins(resourcesPath) {
    var pluginConfigList = loadPluginConfigs(resourcesPath);

    var dropDownPlugins = document.getElementById('dropdown-plugins');
    pluginConfigList.forEach(pluginConfig => {
        var itemElement = document.createElement('li');
        itemElement.classList.add('dropdown-item');

        var itemATag = document.createElement('a');
        const pluginName = pluginConfig.hasOwnProperty('display-name') ? pluginConfig['display-name'] : pluginConfig['name'];
        itemATag.appendChild(document.createTextNode(pluginName));
        itemElement.appendChild(itemATag);
        itemElement.addEventListener('click', () => {
            loadCustomTag(`custom-${pluginConfig.name}`);
        });

        dropDownPlugins.appendChild(itemElement);
    });
}

function loadPluginConfigs(resourcesPath) {
    const fileConfigs = [];
    const configFiles = glob.sync(`${resourcesPath}/**/config.yaml`, null);
    _.each(configFiles, (configPath) => {
        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8')
            const parsedConfig = YAML.parse(file);

            if (parsedConfig &&
                parsedConfig.hasOwnProperty('name') &&
                parsedConfig.hasOwnProperty('ui-html') &&
                parsedConfig.hasOwnProperty('ui-js')
            ) {
                parsedConfig.tagname = _.kebabCase(parsedConfig.name);
                fileConfigs.push(parsedConfig);
                createWebComponentForPlugin(resourcesPath, parsedConfig);
            }
        }
    });
    return fileConfigs;
}

function createWebComponentForPlugin(resourcesPath, plugin) {
    fetch(`${resourcesPath}/${plugin['name']}/${plugin['ui-html']}`)
        .then(stream => stream.text())
        .then(text => {
            createTemplateTagForPlugin(text, plugin, resourcesPath);
        });
}

function createTemplateTagForPlugin(html, plugin, resourcesPath) {
    var templateTag = document.createElement('template');
    templateTag.id = `custom-${plugin['tagname']}-template`;
    document.getElementById("template-holder").appendChild(templateTag);
    loadTemplateForPlugin(html, plugin, resourcesPath);
}

function loadTemplateForPlugin(html, plugin, resourcesPath) {
    customElements.define(`custom-${plugin['tagname']}`,
        class extends HTMLElement {

            constructor() {
                super();
                this._shadowRoot = this.attachShadow({ mode: 'open' });
                this._shadowRoot.innerHTML = `<script src="./js/bootstrap.bundle.min.js"></script>
                <slot name="bot-content-section"></slot>`;
                this._plugin = plugin;
            }

            connectedCallback() {
                const template = document.getElementById(`custom-${this._plugin['tagname']}-template`);

                template.innerHTML = `
                    <style>
                        @import url('./css/main.css')
                    </style>
                    <section slot="bot-content-section">
                        ${html}
                    </section>
                `;

                this.appendChild(template.content.cloneNode(true));
                const pluginManager = remote.getGlobal('pluginManager');
                const pluginHelper = pluginManager.getPluginHelper(this._plugin);

                var CustomPluginUI = require(`${resourcesPath}/${this._plugin['name']}/${this._plugin['ui-js']}`);
                new CustomPluginUI(pluginHelper);
            }
        }
    );
}

