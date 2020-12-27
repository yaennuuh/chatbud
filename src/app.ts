// import { app, BrowserWindow } from 'electron';
// import Main from './main';

import { IPluginManager } from "./core/plugins/IPluginManager";
import { PluginManager } from "./core/plugins/PluginManager";

const pluginManager: IPluginManager = new PluginManager();
pluginManager.loadConnectors();
pluginManager.loadPlugins();

//Main.main(app, BrowserWindow);