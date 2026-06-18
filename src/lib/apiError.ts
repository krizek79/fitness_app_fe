import { AxiosError } from 'axios';
import type { ProblemDetails } from '@/src/api/generated/model';

export type ApiErrorKind = 'network' | 'client' | 'server' | 'unknown';

export interface ParsedApiError {
  kind: ApiErrorKind;
  /** Short headline shown as toast text1 */
  title: string;
  /** Optional detail shown as toast text2 */
  detail?: string;
  status?: number;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!(error instanceof AxiosError)) {
    return { kind: 'unknown', title: 'Unexpected error' };
  }

  // No response → server is unreachable
  if (!error.response) {
    return {
      kind: 'network',
      title: 'No connection',
      detail: 'Check your internet connection or try again later.',
    };
  }

  const status = error.response.status;
  const body = error.response.data as ProblemDetails | undefined;

  const detail = body?.detail ?? body?.title ?? undefined;

  if (status === 403) {
    return { kind: 'client', title: 'Access denied', detail, status };
  }

  if (status === 404) {
    return { kind: 'client', title: 'Not found', detail, status };
  }

  if (status === 422 || status === 400) {
    return { kind: 'client', title: 'Invalid request', detail, status };
  }

  if (status >= 400 && status < 500) {
    return { kind: 'client', title: body?.title ?? 'Request failed', detail, status };
  }

  if (status >= 500) {
    return {
      kind: 'server',
      title: 'Server error',
      detail: detail ?? 'Something went wrong on our end. Please try again.',
      status,
    };
  }

  return { kind: 'unknown', title: 'Unexpected error', detail, status };
}
