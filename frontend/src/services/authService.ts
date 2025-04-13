import axios from 'axios';

// تكوين رمز CSRF من وسم meta في HTML
const getCsrfToken = (): string => {
  if (typeof document !== 'undefined') {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    return token || '';
  }
  return '';
};

// إنشاء نسخة axios مع الإعدادات المشتركة
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  withCredentials: false, // تعطيل لحل مشكلة CORS
});

// إضافة اعتراض للطلبات لإضافة رمز CSRF والتوكن
apiClient.interceptors.request.use(config => {
  const token = getCsrfToken();
  if (token) {
    config.headers['X-CSRF-TOKEN'] = token;
  }
  
  // إضافة توكن المصادقة إذا كان موجودًا
  const authToken = localStorage.getItem('auth_token');
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return config;
});

// الأنواع
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  is_guest: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message: string;
}

// خدمة المصادقة
const authService = {
  // تسجيل الدخول كضيف
  guestLogin: async (name: string): Promise<User> => {
    try {
      console.log('تسجيل دخول كضيف باسم:', name);
      
      const response = await apiClient.post<AuthResponse>('/auth/guest/login', { name });
      console.log('استجابة تسجيل الدخول:', response.data);
      
      if (response.data.success && response.data.token) {
        // حفظ توكن المصادقة في التخزين المحلي
        localStorage.setItem('auth_token', response.data.token);
        return response.data.user;
      } else {
        throw new Error(response.data.message || 'فشل تسجيل الدخول كضيف');
      }
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول كضيف:', error);
      console.error('تفاصيل الخطأ:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'فشل تسجيل الدخول كضيف';
      throw new Error(errorMessage);
    }
  },
  
  // تسجيل خروج المستخدم
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/guest/logout');
      // حذف التوكن من التخزين المحلي
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  },
  
  // الحصول على المستخدم الحالي
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return null;
      }
      
      const response = await apiClient.get<{success: boolean; user: User}>('/auth/user');
      return response.data.user;
    } catch (error) {
      console.error('خطأ في الحصول على المستخدم الحالي:', error);
      return null;
    }
  },
  
  // التحقق من حالة تسجيل الدخول
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('auth_token');
  }
};

export default authService; 