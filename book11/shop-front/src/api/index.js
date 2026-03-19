import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    "accept": "application/json",
  }
});

// Базовый URL для изображений
const IMAGE_BASE_URL = "http://localhost:3000";

// Функция для обработки изображения
const processImage = (imagePath) => {
  if (!imagePath || imagePath === 'image' || imagePath === '' || imagePath.includes('undefined')) {
    return null;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return `${IMAGE_BASE_URL}${imagePath}`;
};

// Сохраняем токены в localStorage
const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem('access_token', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
};

// Получаем токены из localStorage
const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

// Сохраняем пользователя
const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Получаем пользователя
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Очистка всех данных при выходе
const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Добавляем токен к запросам
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок 401 и обновление токена
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        // Пытаемся обновить токен
        const response = await axios.post('http://localhost:3000/api/auth/refresh', {
          refreshToken
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Сохраняем новые токены
        setTokens(accessToken, newRefreshToken);
        
        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Если не удалось обновить токен - разлогиниваем
        clearAuth();
        window.location.reload();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const api = {
  // Аутентификация
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    const { accessToken, refreshToken } = response.data;
    
    // Сохраняем токены
    setTokens(accessToken, refreshToken);
    
    // Получаем данные пользователя
    const userResponse = await apiClient.get("/auth/me");
    const user = userResponse.data;
    
    // Сохраняем пользователя
    setUser(user);
    
    return user;
  },

  logout: () => {
    clearAuth();
  },

  getCurrentUser: () => {
    return getUser();
  },

  // Получить свежие данные о пользователе с сервера
  fetchCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    const user = response.data;
    setUser(user);
    return user;
  },

  // Товары
  createProduct: async (product) => {
    const response = await apiClient.post("/products", product);
    return {
      ...response.data,
      image: processImage(response.data.image)
    };
  },

  getProducts: async () => {
    const response = await apiClient.get("/products");
    return response.data.map(product => ({
      ...product,
      image: processImage(product.image)
    }));
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return {
      ...response.data,
      image: processImage(response.data.image)
    };
  },

  updateProduct: async (id, product) => {
    const response = await apiClient.patch(`/products/${id}`, product);
    return {
      ...response.data,
      image: processImage(response.data.image)
    };
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};