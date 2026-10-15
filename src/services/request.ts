import axios, { AxiosInstance, isAxiosError, isCancel } from 'axios';

import { getAuthHeaders } from '@/lib/getAuthHeaders';

function addApiAuthInterceptors(_axios: AxiosInstance) {
  let isRedirecting = false;

  _axios.interceptors.request.use((config) => ({
    ...config,
    ...getAuthHeaders(),
  }));

  _axios.interceptors.response.use(undefined, (error) => {
    if (isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      window.location.href = '/';
    }

    return Promise.reject(error);
  });

  return _axios;
}

const instance = axios.create({
  baseURL: '/api',
  responseType: 'json',
});

export const request = addApiAuthInterceptors(instance);

/** Текст ошибки из ответа API ({ error: '...' }), иначе fallback */
export const getApiErrorMessage = (error: unknown, fallback: string): string =>
  (isAxiosError(error) && typeof error.response?.data?.error === 'string' && error.response.data.error) || fallback;
