import React, { useState, useEffect } from "react";
import "./ProductsPage.css";
import ProductsList from "../components/ProductsList";
import ProductModal from "../components/ProductModal";
import { api } from "../api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
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
    setModalMode("create");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setModalMode("edit");
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
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

  return (
    <div className="page">
      <header className="header">
        <h1>Xbox Games Store</h1>
      </header>
      
      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h2>Assassin's Creed</h2>
            <button className="btn-add" onClick={openCreate}>
              Добавить
            </button>
          </div>
          
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <ProductsList
              products={products}
              onEdit={openEdit}
              onDelete={handleDelete}
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
    </div>
  );
}