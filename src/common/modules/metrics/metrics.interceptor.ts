import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Request, Response } from 'express';
import { Counter, Histogram } from 'prom-client';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  HTTP_REQUEST_DURATION_SECONDS,
  HTTP_REQUESTS_TOTAL,
  METRICS_EXCLUDED_PATHS,
} from './metrics.constants';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric(HTTP_REQUESTS_TOTAL)
    private readonly requestsTotal: Counter<string>,
    @InjectMetric(HTTP_REQUEST_DURATION_SECONDS)
    private readonly requestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();

    if (METRICS_EXCLUDED_PATHS.has(request.path)) {
      return next.handle();
    }

    const method = request.method;
    const route = this.resolveRouteLabel(request);
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const status = String(response.statusCode);
        const durationSeconds =
          Number(process.hrtime.bigint() - start) / 1_000_000_000;
        const labels = { method, route, status };

        this.requestsTotal.inc(labels);
        this.requestDuration.observe(labels, durationSeconds);
      }),
    );
  }

  private resolveRouteLabel(request: Request): string {
    const routePath = request.route as { path?: string } | undefined;
    if (routePath?.path) {
      return routePath.path;
    }

    return 'unmatched';
  }
}
