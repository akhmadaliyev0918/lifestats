import React, { useState, useEffect } from 'react';
import './navbar.css';
import 'mdui/components/button-icon.js';
import 'mdui/mdui.css';
import 'mdui';
import themeUrl from '../source/icons/theme.svg';
import languageUrl from '../source/icons/language.svg';
import profileUrl from '../source/icons/profile.svg';
import AuthModal from './AuthModal';
import { api } from '../services/api-simple';

const Navbar = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check login status on mount
        if (api.isLoggedIn()) {
            const user = api.getCurrentUser();
            setUser(user);
            setIsLoggedIn(true);
        }
    }, []);

    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        setShowAuthModal(false);
    };

    const handleLogout = async () => {
        await api.logout();
        setUser(null);
        setIsLoggedIn(false);
        setShowProfileMenu(false);
    };

    const handleProfileClick = () => {
        if (isLoggedIn) {
            setShowProfileMenu(!showProfileMenu);
        } else {
            setShowAuthModal(true);
        }
    };

    return (
        <>
            <nav className="navbar">
                <div id="nav-logo">LifeGraph</div>
                <div className="nav-right">
                    <div className="path-viewer">
                    </div>
                    <div id="nav-menu">
                        <mdui-button-icon className="nav-icon">
                            <mdui-icon src={themeUrl}></mdui-icon>
                        </mdui-button-icon>
                        <mdui-button-icon className="nav-icon">
                            <mdui-icon src={languageUrl}></mdui-icon>
                        </mdui-button-icon>
                        <div className="profile-container">
                            <mdui-button-icon
                                className="nav-icon"
                                onClick={handleProfileClick}
                            >
                                <mdui-icon src={profileUrl}></mdui-icon>
                            </mdui-button-icon>
                            {showProfileMenu && isLoggedIn && (
                                <div className="profile-menu">
                                    <div className="profile-menu-header">
                                        <p className="profile-name">{user?.username || user?.email}</p>
                                        <p className="profile-email">{user?.email}</p>
                                    </div>
                                    <div className="profile-menu-divider"></div>
                                    <button
                                        className="profile-menu-item logout-btn"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
            />
        </>
    );
};

export default Navbar;
