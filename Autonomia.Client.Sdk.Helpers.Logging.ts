namespace Autonomia.Client.Sdk.Helpers.Logging {

    // Contracts
    // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
    export enum LogType {
        Error,
        Warning,
        Info,
        Debug
    }

    var LogTypeAsString = [
        "Error  ",
        "Warning",
        "Info   ",
        "Debug  "
    ];

    export class LogEntity {
        public Type: LogType;
        public Message: string;
        public ExecutionInitialEpoch: number;

        constructor(type: LogType, message: string, executionInitialEpoch: number = null) {
            this.Type = type;
            this.Message = message;
            this.ExecutionInitialEpoch = executionInitialEpoch;
        }
    }

    export interface ILogger {
        Log(logEntity: LogEntity);
    }

    export interface ILogFormatter {
        Format(logEntity: LogEntity): string;
    }


    // Formatters
    // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
    export class SimpleLogFormatter implements ILogFormatter {
        Format(logEntity: LogEntity): string {
            var time = new Date();

            var executionTime = "";
            if (logEntity.ExecutionInitialEpoch !== null) {
                executionTime = "[Time: " + (time.getTime() - logEntity.ExecutionInitialEpoch) + "]";
            }

            var formattedLog = 
                  "[" + time.toLocaleString() + "]"
                + "[" + LogTypeAsString[logEntity.Type] + "]"
                + logEntity.Message
                + executionTime;

            return formattedLog;
        }
    }

    // Loggers
    // ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~ ~~~~
    export class NoLogger implements ILogger {
        public Log(logEntity: LogEntity) {}
    }

    export abstract class AbstractLogger implements ILogger {
        private _logFormatter: ILogFormatter;

        constructor(logFormatter: ILogFormatter) {
            this._logFormatter = logFormatter;
        }

        public Log(logEntity: LogEntity) {
            this.DoTheLogging(this._logFormatter.Format(logEntity), logEntity);
        }

        protected abstract DoTheLogging(log: string, logEntity: LogEntity);
    }

    export class ConsoleLogger extends AbstractLogger {
        protected DoTheLogging(log: string, logEntity: LogEntity) {
            if (logEntity.Type == LogType.Error) {
                console.error(log);
            }
            else if (logEntity.Type == LogType.Warning) {
                console.warn(log);
            }
            else if (logEntity.Type == LogType.Info) {
                console.info(log);
            }
            else if (logEntity.Type == LogType.Debug) {
                console.debug(log);
            }
            else {
                console.log(log);
            }
        }
    }

    var _defaultLogger: ILogger = new ConsoleLogger(new SimpleLogFormatter());
    export function Console() {
        return _defaultLogger; 
    }
}