import React, { useState } from 'react';
import { api } from '../services/api-simple';
import './authModal.css';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const result = await api.login(formData.email, formData.password);
                if (result && result.token && result.user) {
                    onSuccess && onSuccess(result.user);
                    onClose();
                } else {
                    setError('Login failed: Invalid response from server');
                }
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                
                const result = await api.register(
                    formData.email,
                    formData.username,
                    formData.password
                );
                if (result && result.token && result.user) {
                    onSuccess && onSuccess(result.user);
                    onClose();
                } else {
                    setError('Registration failed: Invalid response from server');
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'An error occurred during authentication');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({ email: '', username: '', password: '', confirmPassword: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>✕</button>
                
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                
                {error && <div className="auth-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="auth-toggle">
                    <span>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button 
                            type="button"
                            onClick={toggleMode}
                            className="auth-toggle-btn"
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
