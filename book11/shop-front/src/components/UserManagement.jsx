import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function UserManagement({ open, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки пользователей');
      console.error('Ошибка загрузки пользователей', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (userId, newData) => {
    try {
      const updated = await api.updateUser(userId, newData);
      setUsers(users.map(u => u.id === userId ? updated : u));
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка обновления');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Заблокировать пользователя?')) return;
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка блокировки');
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Управление пользователями</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="auth-error" style={{ margin: '1rem' }}>{error}</div>}
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <div style={{ overflowX: 'auto', padding: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #107c10' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Имя</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Фамилия</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Роль</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.5rem' }}>{user.email}</td>
                    <td style={{ padding: '0.5rem' }}>{user.first_name}</td>
                    <td style={{ padding: '0.5rem' }}>{user.last_name}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {editingUser?.id === user.id ? (
                        <select
                          value={editingUser.role}
                          onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                          style={{ padding: '0.3rem', borderRadius: '4px' }}
                        >
                          <option value="user">Пользователь</option>
                          <option value="seller">Продавец</option>
                          <option value="admin">Администратор</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {editingUser?.id === user.id ? (
                        <>
                          <button
                            className="btn btn-edit"
                            onClick={() => handleUpdate(user.id, { role: editingUser.role })}
                            style={{ marginRight: '0.5rem' }}
                          >
                            Сохранить
                          </button>
                          <button
                            className="btn"
                            onClick={() => setEditingUser(null)}
                          >
                            Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-edit"
                            onClick={() => setEditingUser(user)}
                            style={{ marginRight: '0.5rem' }}
                          >
                            Редактировать
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => handleDelete(user.id)}
                          >
                            Блокировать
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}