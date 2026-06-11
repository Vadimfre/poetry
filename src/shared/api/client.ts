'use client';

import axios from 'axios';
import { LOCALE_COOKIE } from '@/src/shared/i18n/types';
import { getCookie } from '@/src/shared/i18n/cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Для cookies (JWT)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: locale + auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const locale = getCookie(LOCALE_COOKIE) ?? 'be';
      config.headers['Accept-Language'] = locale;
      config.headers['X-Locale'] = locale;

      const storage = localStorage.getItem('user-storage');
      if (storage) {
        try {
          const data = JSON.parse(storage);
          if (data?.state?.user?.token) {
            config.headers.Authorization = `Bearer ${data.state.user.token}`;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Не редиректим при 401 - просто возвращаем ошибку
    // Компоненты сами решат что делать
    return Promise.reject(error);
  }
);
