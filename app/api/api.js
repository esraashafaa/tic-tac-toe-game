// خدمة API مركزية تستخدم المتغير البيئي
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://tic-tac-toe-game.test/api';

// دالة للتعامل مع الاستجابات
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    throw new Error('Response is not JSON');
  }
};

// دوال الـ API
export const api = {
  // جلب المباريات
  getMatches: async () => {
    const response = await fetch(`${API_BASE_URL}/game/matches`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  // إنشاء مباراة جديدة
  createMatch: async (matchData) => {
    const response = await fetch(`${API_BASE_URL}/game/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(matchData)
    });
    return handleResponse(response);
  },
  
  // البحث عن مباراة بواسطة الرمز
  getMatchByCode: async (code) => {
    const response = await fetch(`${API_BASE_URL}/game/matches/by-code/${code}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  // الانضمام إلى مباراة
  joinMatch: async (matchId, playerData) => {
    const response = await fetch(`${API_BASE_URL}/game/matches/${matchId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(playerData)
    });
    return handleResponse(response);
  },
  
  // إنهاء مباراة
  endMatch: async (matchId) => {
    const response = await fetch(`${API_BASE_URL}/game/matches/${matchId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  // إجراء حركة
  makeMove: async (matchId, moveData) => {
    const response = await fetch(`${API_BASE_URL}/game/matches/${matchId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(moveData)
    });
    return handleResponse(response);
  },
  
  // إرسال رسالة
  sendMessage: async (matchId, messageData) => {
    const response = await fetch(`${API_BASE_URL}/game/matches/${matchId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(messageData)
    });
    return handleResponse(response);
  }
};

export default api; 