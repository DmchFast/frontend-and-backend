import React from "react";

export default function ProductItem({ product, onEdit, onDelete, canEdit }) {
  const hasImage = product.image && product.image !== 'image' && !product.image.includes('undefined');

  return (
    <div className="product-card">
      <div className="product-image">
        {hasImage ? (
          <img src={product.image} alt={product.name} />
        ) : (
          // Заглушка при отс фото
          <div className="product-image-placeholder">🎮</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-category">{product.category}</div>
        <p className="product-description">{product.description}</p>
        <div className="product-details">
          <span className="product-price">{product.price} ₽</span>
          <span className="product-stock">В наличии: {product.stock}</span>
          {product.rating > 0 && (
            <span className="product-rating">⭐ {product.rating}</span>
          )}
        </div>
      </div>
      {canEdit && ( //показ кнопок при входе в акк
        <div className="product-actions">
          <button className="btn btn-edit" onClick={() => onEdit(product)}>
            Изменить
          </button>
          <button className="btn btn-delete" onClick={() => onDelete(product.id)}>
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}