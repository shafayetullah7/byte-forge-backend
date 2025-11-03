import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

export type LogMessage = string;

// Define a proper info type for printf
// interface LogInfo extends Record<string, unknown> {
//   timestamp?: string;
//   level: string;
//   message: string | Error;
//   stack?: string;
//   context?: string;
//   [key: string]: unknown;
// }

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf((info) => {
          const timestamp = new Date().toISOString();
          const level = info.level;
          const context = info.context as string | undefined;
          const msg = (
            info.message instanceof Error ? info.message.message : info.message
          ) as string | undefined;
          const stack = info.stack as string | undefined;
          const extra = Object.keys(info)
            .filter(
              (k) =>
                !['timestamp', 'level', 'message', 'stack', 'context'].includes(
                  k,
                ),
            )
            .map((k) => `${k}: ${JSON.stringify(info[k])}`)
            .join(' ');

          return `${timestamp} [${level}] ${context} ${msg}${stack}${extra ? ' ' + extra : ''}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: LogMessage, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: LogMessage, trace?: Error | string, context?: string): void {
    if (trace instanceof Error) {
      this.logger.error(message, { context, stack: trace.stack });
    } else {
      this.logger.error(message, { context, trace });
    }
  }

  warn(message: LogMessage, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: LogMessage, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: LogMessage, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
