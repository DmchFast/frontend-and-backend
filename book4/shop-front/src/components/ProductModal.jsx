import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState(""); // Добавляем поле для изображения

  useEffect(() => {
    if (!open) return;
    
    setName(initialProduct?.name ?? "");
    setCategory(initialProduct?.category ?? "");
    setDescription(initialProduct?.description ?? "");
    setPrice(initialProduct?.price ?? "");
    setStock(initialProduct?.stock ?? "");
    setRating(initialProduct?.rating ?? "");
    setImage(initialProduct?.image ?? ""); // Загружаем существующее изображение
  }, [open, initialProduct]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSubmit({
      id: initialProduct?.id,
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      rating: rating ? Number(rating) : 0,
      image: image.trim() || "image" // Если поле пустое, отправляем "image" для заглушки
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === "edit" ? "Редактировать" : "Добавить"} игру</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Категория"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
          <input
            type="number"
            placeholder="Цена"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Количество"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.1"
            placeholder="Рейтинг (0-5)"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          
          <input
            type="text"
            placeholder="URL картинка"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          
          <div className="modal-footer">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit">
              {mode === "edit" ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}