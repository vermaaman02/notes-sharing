import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const userDataString = localStorage.getItem('user');
                if (userDataString && userDataString !== 'undefined') {
                    const userData = JSON.parse(userDataString);
                    setUser(userData);
                    setIsAdmin(userData?.adminId === '11663645');
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password
            });
            
            if (response.data && response.data.user) {
                setUser(response.data.user);
                setIsAdmin(response.data.user?.adminId === '11663645');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }
            
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            throw { message: errorMessage };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });
            
            if (response.data && response.data.user) {
                setUser(response.data.user);
                setIsAdmin(response.data.user?.adminId === '11663645');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            throw { message: errorMessage };
        }
    };

    const adminLogin = async (adminId, password) => {
        try {
            const response = await api.post('/auth/admin-login', {
                adminId,
                password
            });
            
            if (response.data && response.data.user) {
                setUser(response.data.user);
                setIsAdmin(true);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }
            
            return response.data;
        } catch (error) {
            console.error('Admin login error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Admin login failed';
            throw { message: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAdmin(false);
    };

    const value = {
        user,
        isAdmin,
        register,
        login,
        adminLogin,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};