import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { useState, useRef, useEffect } from "react"
import ConfirmModal from "./confirm-modal"

function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
    const [expandedItem, setExpandedItem] = useState(null)
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const profileDropdownRef = useRef(null)

    // Close profile dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const [logoutModalOpen, setLogoutModalOpen] = useState(false)

    const triggerLogout = () => {
        setIsProfileDropdownOpen(false)
        setLogoutModalOpen(true)
    }

    const executeLogout = () => {
        setLogoutModalOpen(false)
        // JWT is stateless — logout is purely client-side
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate("/")
    }

    const cancelLogout = () => {
        setLogoutModalOpen(false)
    }

    const navItems = [
        { label: 'Dashboard', path: '/home', icon: '📊' },
        { label: 'Rooms', path: '/rooms', icon: '🛏️' },
        { label: 'Bookings', path: '/bookings', icon: '📅' },
        { label: 'Messages', path: '/contact', icon: '💬' },
        { label: 'Profile', path: '/profile', icon: '👤' },
    ]

    const isActive = (path) => location.pathname === path

    const handleNavItemClick = (path) => {
        navigate(path)
        setExpandedItem(null)
    }

    return (
        <header className="sticky top-0 z-50" 
            style={{
                background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(26, 10, 46, 0.92) 100%)',
                borderBottom: '1px solid rgba(139, 0, 0, 0.3)',
            }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div 
                        onClick={() => navigate('/home')}
                        className="flex items-center cursor-pointer group"
                    >
                        <div className="text-3xl mr-3 transition-transform duration-300 group-hover:scale-110">
                            🏨
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                                Hotel Transylvania
                            </h1>
                        </div>
                    </div>

                    {/* Expanding Hover Navigation Bar */}
                    <div className="flex items-center gap-2 px-4 py-3 rounded-full backdrop-blur-md"
                        style={{
                            background: 'rgba(26, 10, 46, 0.6)',
                            border: '1px solid rgba(139, 0, 0, 0.2)',
                        }}>
                        {navItems.map((item, index) => (
                            <div
                                key={item.path}
                                className="relative"
                                onMouseEnter={() => setExpandedItem(item.path)}
                                onMouseLeave={() => setExpandedItem(null)}
                            >
                                <button
                                    onClick={() => handleNavItemClick(item.path)}
                                    className="relative px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 group whitespace-nowrap"
                                    style={{
                                        background: isActive(item.path) 
                                            ? 'rgba(255, 107, 107, 0.2)' 
                                            : expandedItem === item.path 
                                            ? 'rgba(139, 0, 0, 0.15)'
                                            : 'transparent',
                                    }}
                                >
                                    <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                                        {item.icon}
                                    </span>
                                    
                                    {/* Expandable Label */}
                                    <span 
                                        className="font-medium transition-all duration-300 overflow-hidden"
                                        style={{
                                            color: isActive(item.path) ? '#ff6b6b' : '#c0c0c0',
                                            maxWidth: expandedItem === item.path ? '200px' : '0px',
                                            opacity: expandedItem === item.path ? 1 : 0,
                                            marginRight: expandedItem === item.path ? '4px' : '0px',
                                        }}
                                    >
                                        {item.label}
                                    </span>

                                    {/* Active indicator */}
                                    {isActive(item.path) && (
                                        <div 
                                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                                            style={{background: '#ff6b6b'}}
                                        />
                                    )}
                                </button>
                            </div>
                        ))}

                        {/* Separator */}
                        <div className="h-6 w-px" style={{background: 'rgba(139, 0, 0, 0.3)'}}></div>

                        {/* Profile & Logout */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="relative px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 group whitespace-nowrap"
                                style={{
                                    background: isProfileDropdownOpen 
                                        ? 'rgba(255, 107, 107, 0.2)' 
                                        : 'transparent',
                                }}
                                onMouseEnter={() => setExpandedItem('profile')}
                                onMouseLeave={() => setExpandedItem(null)}
                            >
                                <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                                    👤
                                </span>
                                
                                {/* Expandable Label */}
                                <span 
                                    className="font-medium transition-all duration-300 overflow-hidden"
                                    style={{
                                        color: '#c0c0c0',
                                        maxWidth: expandedItem === 'profile' ? '200px' : '0px',
                                        opacity: expandedItem === 'profile' ? 1 : 0,
                                        marginRight: expandedItem === 'profile' ? '4px' : '0px',
                                    }}
                                >
                                    Profile
                                </span>
                            </button>

                            {/* Profile Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div 
                                    className="absolute right-0 mt-3 w-56 rounded-lg shadow-xl border overflow-hidden animate-slideDown"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(26, 10, 46, 0.98) 0%, rgba(26, 10, 46, 0.96) 100%)',
                                        borderColor: 'rgba(139, 0, 0, 0.2)',
                                    }}>
                                    <div className="p-4 border-b" style={{borderColor: 'rgba(139, 0, 0, 0.2)'}}>
                                        <p className="text-sm font-semibold text-red-400">Account</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                navigate('/profile')
                                                setIsProfileDropdownOpen(false)
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 rounded-lg transition-all duration-200"
                                            style={{background: 'rgba(212, 175, 55, 0.1)', color: '#cbd5e0'}}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'
                                                e.currentTarget.style.color = '#d4af37'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'
                                                e.currentTarget.style.color = '#cbd5e0'
                                            }}
                                        >
                                            👤 My Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsProfileDropdownOpen(false)
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 rounded-lg transition-all duration-200 mt-1"
                                            style={{background: 'rgba(139, 0, 0, 0.15)', color: '#c0c0c0'}}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 0, 0, 0.25)'
                                                e.currentTarget.style.color = '#ff6b6b'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 0, 0, 0.15)'
                                                e.currentTarget.style.color = '#c0c0c0'
                                            }}
                                        >
                                            ⚙️ Settings
                                        </button>
                                    </div>
                                    <div className="border-t p-2" style={{borderColor: 'rgba(139, 0, 0, 0.2)'}}>
                                        <button
                                            onClick={() => {
                                                triggerLogout()
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200"
                                            style={{background: 'rgba(139, 0, 0, 0.2)', color: '#ff6b6b'}}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 0, 0, 0.35)'
                                                e.currentTarget.style.color = '#ff8888'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 0, 0, 0.2)'
                                                e.currentTarget.style.color = '#ff6b6b'
                                            }}
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <ConfirmModal 
                isOpen={logoutModalOpen}
                message="Uuurgghh... Brrraaiinnss... You leaving the dark domain...?"
                onConfirm={executeLogout}
                onCancel={cancelLogout}
                confirmText="Graaawrr (Logout)"
                cancelText="Mmmmrrr (Stay)"
            />
        </header>
    )
}

export default Header