const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
var _ = require('lodash');
var fs = require('fs');
var glob = require('glob');
var YAML = require('yaml');
window.jQuery = require('jquery');

window.bootstrap = bootstrap;
currentPlugin = 'dashboard';
currentPluginType = 'core';

// Load

initializeCorePlugins();
initializeCustomPlugins();

initializeCoreConnectors();
initializeCustomConnectors();

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
        loadCustomTag('core', 'dashboard');
    });
    var reloadAppButton = document.getElementById('reload-app-button');
    reloadAppButton.addEventListener('click', function () {
        ipc.send('reload-application', '');
    });
    var settingsButton = document.getElementById('settings-button');
    settingsButton.addEventListener('click', function () {
        loadCustomTag('core', 'settings');
    });
    var extensionsButton = document.getElementById('extensions-button');
    extensionsButton.addEventListener('click', function () {
        loadCustomTag('core', 'extensions');
    });
}

function addItemToDropdown(dropdownItem, config, resourcesPath) {
    if (!config.hasOwnProperty('hide') || config['hide'] === true) {
        var itemElement = document.createElement('li');
        itemElement.classList.add('dropdown-item');

        var itemATag = document.createElement('a');
        const name = config.hasOwnProperty('display-name') ? config['display-name'] : config['name'];
        itemATag.appendChild(document.createTextNode(name));
        itemElement.appendChild(itemATag);
        itemElement.addEventListener('click', () => {
            if (config && config.hasOwnProperty('stencil-tag') && config.hasOwnProperty('stencil') && config.hasOwnProperty('stencil-esm')) {
                let stencilContainer = document.getElementById('stencil-container');
                stencilContainer.innerHTML = '';

                var script2 = document.createElement("script");
                script2.type = "module";
                script2.src = resourcesPath + '/' + config['name'] + '/' + config['stencil-esm'];
                stencilContainer.appendChild(script2);

                var script = document.createElement("script");
                script.noModule = true;
                script.src = resourcesPath + '/' + config['name'] + '/' + config['stencil'];
                stencilContainer.appendChild(script);

                loadStencilTag(config);
            } else {
                loadCustomTag('custom', config['name']);
            }
        });

        dropdownItem.appendChild(itemElement);
    }
}

function loadCustomTag(prefix, tagName) {
    currentPlugin = tagName;
    currentPluginType = prefix;
    tagName = _.kebabCase(prefix + '-' + tagName);
    content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(
        document.createElement(tagName));
}

async function loadStencilTag(config) {
    let content = document.getElementById('content');
    content.innerHTML = '';
    /*const pluginManager = remote.getGlobal('pluginManager');
    window.pluginHelperService = {
        getPluginHelper: (pluginName) => {
            return pluginManager.getPluginHelperByName(pluginName)
        }
    };*/
    let stencilTag = document.createElement(config['stencil-tag']);
    content.appendChild(stencilTag);
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
    loadCustomTag('core', 'dashboard');
    //document.getElementById('help-button').addEventListener('click', openCurrentHelper);
}

// Connectors

function prepareConnectorHelper(connectorManager) {
    window.connectorHelperService = window.connectorHelperService || {
        getConnectorHelper: (connectorName) => {
            return connectorManager.getConnectorHelperByName(connectorName);
        }
    };
}

function initializeCoreConnectors() {
    const connectorManager = remote.getGlobal('connectorManager');
    const resourcesPath = connectorManager.resourcesPathCore;
    prepareConnectorHelper(connectorManager);
    loadConnectors(resourcesPath);
}

function initializeCustomConnectors() {
    const connectorManager = remote.getGlobal('connectorManager');
    const resourcesPath = connectorManager.resourcesPath;
    prepareConnectorHelper(connectorManager);
    loadConnectors(resourcesPath);
}

function loadConnectors(resourcesPath) {
    var connectorConfigList = loadConnectorConfigs(`${resourcesPath}`);

    var dropDownConnectors = document.getElementById('dropdown-connectors');
    connectorConfigList.forEach(config => {
        addItemToDropdown(dropDownConnectors, config, resourcesPath);
    });
}

function loadConnectorConfigs(resourcesPath) {
    const fileConfigs = [];
    const configFiles = glob.sync(`${resourcesPath}/**/config.yaml`, null);
    _.each(configFiles, (configPath) => {
        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8');
            const config = YAML.parse(file);

            if (config &&
                config.hasOwnProperty('name') &&
                ((config.hasOwnProperty('ui-html') &&
                    config.hasOwnProperty('ui-js')) ||
                    (config.hasOwnProperty('stencil-tag') &&
                        config.hasOwnProperty('stencil') &&
                        config.hasOwnProperty('stencil-esm'))
                )
            ) {
                // Load plugin helper once so it's available
                const connectorManager = remote.getGlobal('connectorManager');
                connectorManager.loadConnectorHelper(config);

                config.tagname = _.kebabCase(config.name);
                fileConfigs.push(config);
                if (config.hasOwnProperty('ui-html') &&
                    config.hasOwnProperty('ui-js')) {
                    createWebComponentForConnector(resourcesPath, config);
                }
            }
        }
    });
    return fileConfigs;
}

function createWebComponentForConnector(resourcesPath, connector) {
    fetch(`${resourcesPath}/${connector['name']}/${connector['ui-html']}`)
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

function preparePluginHelper(pluginManager) {
    window.pluginHelperService = window.pluginHelperService || {
        getPluginHelper: (pluginName) => {
            return pluginManager.getPluginHelperByName(pluginName)
        }
    };
}

function initializeCorePlugins() {
    const pluginManager = remote.getGlobal('pluginManager');
    const resourcesPath = pluginManager.resourcesPathCore;
    preparePluginHelper(pluginManager);
    loadPlugins(resourcesPath);
}

function initializeCustomPlugins() {
    const pluginManager = remote.getGlobal('pluginManager');
    const resourcesPath = pluginManager.resourcesPath;
    preparePluginHelper(pluginManager);
    loadPlugins(resourcesPath);
}

function openCurrentHelper() {
    const pluginManager = remote.getGlobal('pluginManager');
    const resourcesPath = pluginManager.resourcesPath;

    let configPath = `${__dirname}/../plugins/${currentPlugin}/config.yaml`;
    configPath = fs.existsSync(configPath) ? configPath : `${resourcesPath}/${currentPlugin}/config.yaml`;

    if (fs.existsSync(configPath)) {
        const file = fs.readFileSync(configPath, 'utf8');
        const parsedConfig = YAML.parse(file);

        // TODO: make a nice modal or whatever
    }
}

function loadPlugins(resourcesPath) {
    var pluginConfigList = loadPluginConfigs(resourcesPath);

    var dropDownPlugins = document.getElementById('dropdown-plugins');
    pluginConfigList.forEach(config => {
        addItemToDropdown(dropDownPlugins, config, resourcesPath);
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
                ((parsedConfig.hasOwnProperty('ui-html') &&
                    parsedConfig.hasOwnProperty('ui-js')) ||
                    (parsedConfig.hasOwnProperty('stencil-tag') &&
                        parsedConfig.hasOwnProperty('stencil') &&
                        parsedConfig.hasOwnProperty('stencil-esm'))
                )
            ) {
                // Load plugin helper once so it's available
                const pluginManager = remote.getGlobal('pluginManager');
                pluginManager.loadPluginHelper(parsedConfig);

                parsedConfig.tagname = _.kebabCase(parsedConfig.name);
                fileConfigs.push(parsedConfig);
                if (parsedConfig.hasOwnProperty('ui-html') &&
                    parsedConfig.hasOwnProperty('ui-js')) {
                    createWebComponentForPlugin(resourcesPath, parsedConfig);
                }
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

