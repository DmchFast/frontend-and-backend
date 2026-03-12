import React, { useState, useEffect } from "react";
import "./ProductsPage.css";
import axios from "axios";
import ProductsList from "../components/ProductsList";
import ProductModal from "../components/ProductModal";
import AuthModal from "../components/AuthModal/AuthModal.jsx";
import { api } from "../api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  loadProducts();
  const checkUser = async () => {
    const user = api.getCurrentUser();
    if (user) {
      try {
        // Проверяем валидность токена
        const freshUser = await api.fetchCurrentUser();
        setCurrentUser(freshUser);
      } catch (err) {
        // Если токен невалидный - пробуем обновить
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            // Отправляем запрос на обновление токена
            const response = await axios.post('http://localhost:3000/api/auth/refresh', {
              refreshToken
            });
            
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            
            // Сохраняем новые токены
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', newRefreshToken);
            
            // Пробуем снова получить пользователя
            const freshUser = await api.fetchCurrentUser();
            setCurrentUser(freshUser);
          } else {
            api.logout();
            setCurrentUser(null);
          }
        } catch (refreshError) {
          console.error('Не удалось обновить токен:', refreshError);
          api.logout();
          setCurrentUser(null);
        }
      }
    }
  };
  
  checkUser();
}, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setModalMode("create");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setModalMode("edit");
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    
    if (!window.confirm("Удалить игру?")) return;
    
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  const handleSubmit = async (productData) => {
    try {
      if (modalMode === "create") {
        const newProduct = await api.createProduct(productData);
        setProducts([...products, newProduct]);
      } else {
        const updated = await api.updateProduct(productData.id, productData);
        setProducts(products.map(p => p.id === productData.id ? updated : p));
      }
      closeModal();
    } catch (err) {
      console.error("Ошибка сохранения:", err);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Xbox Games Store</h1>
        <div className="header-actions">
          {currentUser ? (
            <div className="user-info">
              <span className="user-name">
                {currentUser.first_name} {currentUser.last_name}
              </span>
              <button className="btn-logout" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          ) : (
            <button className="btn-login" onClick={() => setAuthModalOpen(true)}>
              Войти
            </button>
          )}
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h2>Assassin's Creed</h2>
            {currentUser && ( // <<< Кнопка только для авторизованных
              <button className="btn-add" onClick={openCreate}>
                Добавить
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <ProductsList
              products={products}
              onEdit={openEdit}
              onDelete={handleDelete}
              canEdit={!!currentUser}
            />
          )}
        </div>
      </main>
      
      <footer className="footer">
        © {new Date().getFullYear()} Xbox Games
      </footer>
      
      <ProductModal
        open={modalOpen}
        mode={modalMode}
        initialProduct={editingProduct}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
      
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}