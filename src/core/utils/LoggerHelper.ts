import {Logger} from "@tsed/logger";

export class LoggerHelper {

    static getLogger = (name?: string): Logger => {
        const logger = new Logger(name);
        const logFilePath = `${__dirname}/../../logs/`;
        logger.appenders
            .set("console",
                {
                    type: "stdout",
                    levels: ["DEBUG", "INFO", "WARN", "ERROR"]
                })
            .set("debug",
                {
                    type: "file",
                    filename: `${logFilePath}/debug.log`,
                    maxLogSize: 10*1024*1024,
                    layout: {type: "basic"},
                    levels: ["DEBUG", "INFO", "WARN", "ERROR"]
                })
            .set("error",
                {
                    type: "file",
                    filename: `${logFilePath}/error.log`,
                    maxLogSize: 10*1024*1024,
                    layout: {type: "basic"},
                    levels: ["ERROR"]
                })
            .set("info",
                {
                    type: "file",
                    filename: `${logFilePath}/app.log`,
                    maxLogSize: 10*1024*1024,
                    layout: {type: "basic"},
                    levels: ["INFO"]
                })
        ;

        return logger;
    }
}
