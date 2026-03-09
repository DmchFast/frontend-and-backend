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

// Сохраняем токен в localStorage
const setToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

// Получаем токен из localStorage
const getToken = () => {
  return localStorage.getItem('auth_token');
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

// Добавляем токен к запросам
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // ===== Аутентификация =====
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    const { user } = response.data;
    
    // В 7-й работе токена еще нет, сохраняем только пользователя
    setUser(user);
    return user;
  },

  logout: () => {
    setToken(null);
    setUser(null);
  },

  getCurrentUser: () => {
    return getUser();
  },

  // ===== Товары =====
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