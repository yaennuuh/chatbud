import * as YAML from 'yaml';
import * as fs from "fs";
import { ICoreHelper } from './ICoreHelper';
import { app } from 'electron';

export class CoreHelper implements ICoreHelper {
    private static instance: CoreHelper;
    private dataPathFolder = `${app ? app.getPath('userData') : '.'}/configs`;
    private dataPath = `${this.dataPathFolder}/configuration.yaml`;

    private constructor() {
        this.createFolderIfNotExists();
    }

    public static getInstance(): CoreHelper {
        if (!CoreHelper.instance) {
            CoreHelper.instance = new CoreHelper();
        }
        return CoreHelper.instance;
    }

    getResourcesPath = (folder: string): string => {
        const configuration = this.loadData();
        if (configuration && configuration.hasOwnProperty('resources-path') && configuration['resources-path'].length) {
            if (fs.existsSync(`${configuration['resources-path']}/${folder}`)) {
                return `${configuration['resources-path']}/${folder}`;
            } else {
                fs.mkdirSync(`${configuration['resources-path']}/${folder}`, { recursive: true });
            }
        }
        return undefined;
    }

    getDatabasesPath = (): string => {
        return `${app.getPath('userData')}/databases`;
    }

    loadData = (): any => {
        if (fs.existsSync(this.dataPath)) {
            const file = fs.readFileSync(this.dataPath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }

    saveData = (data: any): void => {
        fs.writeFile(this.dataPath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }

    createFolderIfNotExists() {
        if (!fs.existsSync(this.dataPathFolder)) {
            fs.mkdirSync(this.dataPathFolder);
        }
    }
}
