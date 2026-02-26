import { useNavigate } from "react-router-dom"
import axios from "axios"

function Header() {
    const navigate = useNavigate()
    const API_URL = import.meta.env.VITE_API_URL

    const handleLogout = async () => {
        if (!window.confirm("Are you sure you want to logout?")) return

        try {
            const response = await axios.post(`${API_URL}/logout`, {}, {
                withCredentials: true
            })
            if (response.data.success) {
                navigate("/") 
            } else {
                console.error("Logout failed:", response.data.message)
            }
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return (
        <header className="hotel-gradient py-6 px-8 shadow-lg text-white">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h2 className="text-xl font-bold" style={{color: '#f5f1e8'}}>🏨 Hotel Management System</h2>
                <button
                    onClick={handleLogout}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg"
                    style={{backgroundColor: '#d4af37', color: '#1a3a52'}}
                >
                    Logout
                </button>
            </div>
        </header>
    )
}

export default Header