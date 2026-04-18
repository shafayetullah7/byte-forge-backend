import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    
    // Intercept response body
    let responseBody: any = null;
    const originalJson = response.json;
    const originalSend = response.send;
    
    response.json = function(data: any) {
      responseBody = data;
      return originalJson.call(this, data);
    };
    
    response.send = function(data: any) {
      responseBody = data;
      return originalSend.call(this, data);
    };

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length') || '0';

      // Only log error responses (4xx, 5xx) with detailed info
      if (statusCode >= 400) {
        // Format response body for readability
        let responseDetails = '';
        if (responseBody) {
          const body = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          if (body.validationErrors && body.validationErrors.length > 0) {
            responseDetails = '\n  Validation Errors:';
            body.validationErrors.forEach((err: any, i: number) => {
              responseDetails += `\n    [${i + 1}] ${err.field}: ${err.message}`;
            });
          } else if (body.message) {
            responseDetails = `\n  Message: ${Array.isArray(body.message) ? body.message.join(', ') : body.message}`;
          }
        }

        this.logger.error(
          `\n----------------------------------------\n` +
          `HTTP ERROR ${statusCode}\n` +
          `----------------------------------------\n` +
          `${method} ${originalUrl}\n` +
          `IP: ${ip}\n` +
          `User Agent: ${userAgent}\n` +
          `Content Length: ${contentLength}\n` +
          `----------------------------------------\n` +
          `Request Body:\n  ${JSON.stringify(request.body, null, 2).split('\n').join('\n  ')}\n` +
          `----------------------------------------\n` +
          `Response:${responseDetails}\n` +
          `----------------------------------------`,
        );
      }
    });

    next();
  }
}
