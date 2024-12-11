import { AxiosError } from 'axios';

export function handleApiError(error: unknown): Error {
  if (error instanceof AxiosError) {
    return new Error(error.response?.data?.error?.message || 'An error occurred');
  }
  return new Error('An unexpected error occurred');
}