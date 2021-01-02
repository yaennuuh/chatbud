import * as YAML from 'yaml';
import * as fs from "fs";
import { ICoreHelper } from './ICoreHelper';

export class CoreHelper implements ICoreHelper {
    private static instance: CoreHelper;

    private constructor() { }

    public static getInstance(): CoreHelper {
        if (!CoreHelper.instance) {
            CoreHelper.instance = new CoreHelper();
        }
        return CoreHelper.instance;
    }

    getResourcesPath = async(folder: string): Promise<string> => {
        const configuration = this.loadData();
        if (configuration && configuration.hasOwnProperty('resources-path') && configuration['resources-path'].length > 0 && fs.existsSync(configuration['resources-path']) && fs.existsSync(`${configuration['resources-path']}/${folder}`)) {
            return `${configuration['resources-path']}/${folder}`;
        }
        return undefined;
    }

    loadData = (): any => {
        let dataPath = `${__dirname}/configuration.yaml`;
        if (fs.existsSync(dataPath)) {
            const file = fs.readFileSync(dataPath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }

    saveData = (data: any): void => {
        let dataPath = `${__dirname}/configuration.yaml`;
        fs.writeFile(dataPath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }
}