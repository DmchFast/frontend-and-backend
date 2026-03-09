import React from "react";
import ProductItem from "./ProductItem";

export default function ProductsList({ products, onEdit, onDelete }) {
  if (!products.length) {
    return <div className="empty">Игр пока нет</div>;
  }

  return (
    <div className="products-list">
      {products.map((product) => (
        <ProductItem 
          key={product.id} 
          product={product} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}