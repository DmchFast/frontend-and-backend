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
  // Если изображения нет или это заглушка, возвращаем null
  if (!imagePath || imagePath === 'image' || imagePath === '' || imagePath.includes('undefined')) {
    return null;
  }
  
  // Если это уже полный URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Относительный путь, добавляем базовый URL бэкенда
  return `${IMAGE_BASE_URL}${imagePath}`;
};

export const api = {
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