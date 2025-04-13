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

// إضافة اعتراض للاستجابات للتعامل مع الأخطاء بشكل أفضل
apiClient.interceptors.response.use(
  response => response,
  error => {
    // التحقق من نوع الخطأ وتحسين الرسالة
    if (error.response) {
      // الخادم أجاب برمز حالة خارج نطاق 2xx
      console.error('Server error:', error.response.status, error.response.data);
      const errorMessage = error.response.data.message || 'حدث خطأ في الخادم';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // الطلب تم إرساله لكن لم يتم استلام استجابة
      console.error('Network error:', error.request);
      return Promise.reject(new Error('تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت'));
    } else {
      // حدث خطأ أثناء إعداد الطلب
      console.error('Request error:', error.message);
      return Promise.reject(error);
    }
  }
);

// الأنواع
export interface GameMatch {
  id: number;
  match_code: string;
  status: 'waiting' | 'playing' | 'completed';
  player1_id: number;
  player2_id: number | null;
  player1_name: string;
  player2_name: string | null;
  player1_symbol: string;
  player2_symbol: string;
  board_state: string[];
  current_turn: string;
  winner: string | null;
  moves_count: number;
  started_at: string | null;
  ended_at: string | null;
}

export interface GameMove {
  position: number;
  symbol: string;
  board_state: string[];
}

export interface GameService {
  createMatch: (data: { name: string }) => Promise<GameMatch>;
  joinMatch: (code: string, playerName: string) => Promise<GameMatch>;
  getMatchByCode: (code: string) => Promise<GameMatch>;
  makeMove: (matchId: number, move: GameMove) => Promise<GameMove>;
  endMatch: (matchId: number, winner: string | 'draw', boardState: string[]) => Promise<any>;
  sendMessage: (matchId: number, message: string) => Promise<any>;
}

// تنفيذ خدمة اللعبة
const gameService: GameService = {
  // إنشاء مباراة جديدة
  createMatch: async (data) => {
    try {
      console.log('Attempting to create match with name:', data.name);
      
      // التأكد من وجود اسم، وإذا لم يوجد، استخدم "badr" كاسم افتراضي
      const playerName = data.name.trim() ? data.name : 'badr';
      
      const response = await apiClient.post('/game/matches', {
        mode: 'online',
        player1_name: playerName
      });
      return response.data.match;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  // الانضمام إلى مباراة موجودة بواسطة الرمز
  joinMatch: async (code, playerName) => {
    try {
      // التأكد من وجود اسم، وإذا لم يوجد، استخدم "badr" كاسم افتراضي
      const name = playerName.trim() ? playerName : 'badr';
      
      // أولاً، احصل على تفاصيل المباراة بواسطة الرمز
      const matchResponse = await apiClient.get(`/game/matches/by-code/${code}`);
      const match = matchResponse.data.match;
      
      // ثم انضم إلى المباراة
      const response = await apiClient.post(`/game/matches/${match.id}/join`, {
        player2_name: name
      });
      
      return response.data.match;
    } catch (error) {
      console.error('Error joining match:', error);
      throw error;
    }
  },

  // الحصول على مباراة بواسطة الرمز
  getMatchByCode: async (code) => {
    try {
      const response = await apiClient.get(`/game/matches/by-code/${code}`);
      return response.data.match;
    } catch (error) {
      console.error('Error fetching match:', error);
      throw error;
    }
  },

  // إجراء حركة في مباراة
  makeMove: async (matchId, move) => {
    try {
      const response = await apiClient.post(`/game/matches/${matchId}/move`, move);
      return response.data.move;
    } catch (error) {
      console.error('Error making move:', error);
      throw error;
    }
  },

  // إنهاء مباراة
  endMatch: async (matchId, winner, boardState) => {
    try {
      const response = await apiClient.post(`/game/matches/${matchId}/end`, {
        winner,
        board_state: boardState
      });
      return response.data;
    } catch (error) {
      console.error('Error ending match:', error);
      throw error;
    }
  },

  // إرسال رسالة دردشة
  sendMessage: async (matchId, message) => {
    try {
      const response = await apiClient.post(`/game/matches/${matchId}/message`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

export default gameService; 
