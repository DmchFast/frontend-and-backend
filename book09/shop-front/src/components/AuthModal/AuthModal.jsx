import React, { useState } from "react";
import "./AuthModal.css";

export default function AuthModal({ open, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Вход
        const response = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Ошибка входа");
        }

        onLogin(data.user);
        handleClose();
      } else {
        // Регистрация
        const response = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Ошибка регистрации");
        }

        // После успешной регистрации переключаемся на вход
        setIsLogin(true);
        setEmail(data.email);
        setPassword("");
        setError("Регистрация успешна! Теперь можно войти.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setError("");
    setIsLogin(true);
    onClose();
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isLogin ? "Вход в магазин" : "Регистрация"}</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </>
          )}
          
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? "Загрузка..." : (isLogin ? "Войти" : "Зарегистрироваться")}
          </button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          <button 
            type="button"
            onClick={switchMode}
            disabled={loading}
          >
            {isLogin ? "Создать аккаунт" : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}