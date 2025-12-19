import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

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

          return `${timestamp} [${level}] ${context ? `[${context}] ` : ''}${msg}${stack ? `\n${stack}` : ''}${extra ? ' ' + extra : ''}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: any, ...optionalParams: any[]) {
    const { context, messages } = this.extractContext(optionalParams);
    this.logger.info(message, { context, ...messages });
  }

  error(message: any, ...optionalParams: any[]) {
    const { context, messages } = this.extractContext(optionalParams);
    // NestJS often passes the stack as the last or second to last param
    // But typically: error(message, stack, context) or error(message, context)
    // We need to be careful.
    // If param is a string and looks like a stack trace? rare.
    // Usually standard usage: logger.error('msg', trace, 'context')

    // Let's rely on type inspection or simplified logic
    let stack: string | undefined;

    // If the input message is an Error, use it directly
    if (message instanceof Error) {
      this.logger.error(message.message, {
        context,
        stack: message.stack,
        ...messages,
      });
      return;
    }

    // If 2nd arg (first optional) is typical stack/trace
    // In Nest default logger: (message: any, stack?: string, context?: string)
    // So 'context' extracted by `extractContext` might be the last string.

    // Custom extract logic for error to match NestJS Default Logger signature behavior better
    // Signature: error(message: any, stack?: string, context?: string)
    // Or: error(message: any, ...optionalParams: any[])

    // Re-evaluating extractContext for error:
    let trace: any;
    const ctx = context;

    if (optionalParams.length > 0) {
      // Assume last string is context if we didn't find one via extractContext/or if we assume Nest structure
      // Actually extractContext assumes the last param IS context if it's a string.

      // If we have (stack, context), optionalParams = [stack, context]
      // extractContext takes last -> context. messages = [stack]
      // So trace is messages[0]

      if (messages.length > 0) {
        trace = messages[0];
      }
    }

    this.logger.error(message, { context: ctx, stack: trace, ...messages });
  }

  warn(message: any, ...optionalParams: any[]) {
    const { context, messages } = this.extractContext(optionalParams);
    this.logger.warn(message, { context, ...messages });
  }

  debug?(message: any, ...optionalParams: any[]) {
    const { context, messages } = this.extractContext(optionalParams);
    this.logger.debug(message, { context, ...messages });
  }

  verbose?(message: any, ...optionalParams: any[]) {
    const { context, messages } = this.extractContext(optionalParams);
    this.logger.verbose(message, { context, ...messages });
  }

  private extractContext(params: any[]): {
    context: string | undefined;
    messages: any[];
  } {
    if (params.length === 0) {
      return { context: undefined, messages: [] };
    }

    const last = params[params.length - 1];
    if (typeof last === 'string') {
      return {
        context: last,
        messages: params.slice(0, params.length - 1),
      };
    }

    return { context: undefined, messages: params };
  }
}
