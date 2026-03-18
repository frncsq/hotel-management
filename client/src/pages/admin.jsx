import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import ConfirmModal from "../components/confirm-modal"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

// ─── Helpers ───────────────────────────────────────────────────
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const StatusBadge = ({ status }) => {
    const map = {
        pending:     'bg-yellow-900 text-yellow-200',
        confirmed:   'bg-green-900  text-green-200',
        checked_in:  'bg-blue-900   text-blue-200',
        checked_out: 'bg-purple-900 text-purple-200',
        cancelled:   'bg-red-900    text-red-200',
        available:   'bg-green-900  text-green-200',
        occupied:    'bg-purple-900 text-purple-200',
        maintenance: 'bg-yellow-900 text-yellow-200',
    }
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${map[status] || 'bg-gray-800 text-gray-300'}`}>
            {status?.replace('_', ' ')}
        </span>
    )
}

// ─── Modal ──────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
        <div className="w-full max-w-lg rounded-xl border border-red-900 shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 100%)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-900">
                <h3 className="text-lg font-bold" style={{ color: '#ff6b6b' }}>{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-red-400 text-2xl leading-none transition">&times;</button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
)

// ─── Room Form ──────────────────────────────────────────────────
const RoomForm = ({ initial, onSave, onClose }) => {
    const [form, setForm] = useState(initial || { room_number: '', type: '', price: '', capacity: 2, status: 'available' })
    const [imageFile, setImageFile] = useState(null)
    const [preview, setPreview] = useState(initial?.image_url ? `${API_URL.replace('/api', '')}${initial.image_url}` : null)
    const [saving, setSaving] = useState(false)
    const [err, setErr] = useState('')

    const field = (k) => ({
        value: form[k],
        onChange: e => setForm(f => ({ ...f, [k]: e.target.value }))
    })

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImageFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const save = async () => {
        if (!form.room_number || !form.type || !form.price) { setErr('Room number, type, and price are required.'); return }
        setSaving(true); setErr('')
        try {
            // Use FormData to support file upload alongside text fields
            const data = new FormData()
            data.append('room_number', form.room_number)
            data.append('type', form.type)
            data.append('price', form.price)
            data.append('capacity', form.capacity)
            data.append('status', form.status)
            if (imageFile) data.append('image', imageFile)

            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            }

            if (initial?.id) {
                await axios.put(`${API_URL}/rooms/${initial.id}`, data, config)
            } else {
                await axios.post(`${API_URL}/rooms`, data, config)
            }
            onSave()
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to save room.')
        } finally { setSaving(false) }
    }

    const inputClass = "w-full px-4 py-2 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-600"
    const inputStyle = { background: 'rgba(20,20,40,0.9)', border: '1px solid rgba(139,0,0,0.4)' }
    const labelClass = "block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider"

    return (
        <div className="space-y-4">
            {err && <p className="text-red-400 text-sm bg-red-900 bg-opacity-20 px-3 py-2 rounded-lg">{err}</p>}

            {/* Image Upload */}
            <div>
                <label className={labelClass}>Room Image</label>
                <div className="relative rounded-xl overflow-hidden border-2 border-dashed transition cursor-pointer"
                    style={{ borderColor: imageFile ? '#8b0000' : 'rgba(139,0,0,0.3)', background: 'rgba(20,20,40,0.5)' }}
                    onClick={() => document.getElementById('room-image-input').click()}>
                    {preview ? (
                        <img src={preview} alt="Room preview" className="w-full h-48 object-cover" />
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">🖼️</span>
                            <p className="text-sm text-gray-500">Click to upload a room image</p>
                            <p className="text-xs text-gray-600">JPG, PNG, GIF, WEBP — max 5MB</p>
                        </div>
                    )}
                    {preview && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition"
                            style={{ background: 'rgba(0,0,0,0.6)' }}>
                            <p className="text-white text-sm font-bold">Click to change image</p>
                        </div>
                    )}
                </div>
                <input id="room-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Room Number</label>
                    <input className={inputClass} style={inputStyle} placeholder="e.g. 101" {...field('room_number')} />
                </div>
                <div>
                    <label className={labelClass}>Type</label>
                    <select className={inputClass} style={inputStyle} {...field('type')}>
                        <option value="">Select type...</option>
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Presidential Suite">Presidential Suite</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Price per Night ($)</label>
                    <input type="number" className={inputClass} style={inputStyle} placeholder="e.g. 150" {...field('price')} />
                </div>
                <div>
                    <label className={labelClass}>Capacity (guests)</label>
                    <input type="number" className={inputClass} style={inputStyle} min="1" {...field('capacity')} />
                </div>
                <div className="col-span-2">
                    <label className={labelClass}>Status</label>
                    <select className={inputClass} style={inputStyle} {...field('status')}>
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving}
                    className="flex-1 py-2 rounded-lg font-bold text-sm transition"
                    style={{ background: saving ? '#4a0000' : '#8b0000', color: '#fff' }}>
                    {saving ? 'Saving...' : (initial?.id ? 'Update Room' : 'Add Room')}
                </button>
                <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-gray-700 transition">
                    Cancel
                </button>
            </div>
        </div>
    )
}

// ─── Reservations Tab ───────────────────────────────────────────
const ReservationsTab = () => {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    const fetch = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_URL}/reservations`, authHeaders())
            setReservations(Array.isArray(res.data) ? res.data : [])
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetch() }, [])

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/reservations/${id}/status`, { status }, authHeaders())
            setReservations(r => r.map(x => x.id === id ? { ...x, status } : x))
        } catch (e) { alert(e.response?.data?.message || 'Failed to update status.') }
    }

    const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter)

    const statuses = ['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']

    return (
        <div>
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
                {statuses.map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition"
                        style={{
                            background: filter === s ? '#8b0000' : 'rgba(139,0,0,0.15)',
                            color: filter === s ? '#fff' : '#a0a0a0',
                            border: `1px solid ${filter === s ? '#8b0000' : 'rgba(139,0,0,0.3)'}`
                        }}>
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {loading ? <p className="text-gray-500 py-8 text-center">Summoning records...</p> : (
                <div className="overflow-x-auto rounded-xl border border-red-900">
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ background: 'rgba(139,0,0,0.2)' }} className="text-red-300 border-b border-red-900">
                                <th className="p-4 text-xs uppercase tracking-wider">ID</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Guest</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Room</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Check In</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Check Out</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Amount</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="8" className="p-10 text-center text-gray-600 italic">No reservations found.</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} className="border-b border-red-900 border-opacity-30 hover:bg-black hover:bg-opacity-30 transition">
                                    <td className="p-4 text-sm text-gray-500">#{r.id}</td>
                                    <td className="p-4 text-sm font-semibold text-gray-200">{r.guest_name || `User #${r.user_id}`}</td>
                                    <td className="p-4 text-sm text-red-400 font-bold">{r.room_number || `RM ${r.room_id}`}</td>
                                    <td className="p-4 text-xs text-gray-400">{new Date(r.check_in_date).toLocaleDateString()}</td>
                                    <td className="p-4 text-xs text-gray-400">{new Date(r.check_out_date).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm font-bold text-green-400">${r.total_amount}</td>
                                    <td className="p-4"><StatusBadge status={r.status} /></td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {r.status === 'pending' && <>
                                                <button onClick={() => updateStatus(r.id, 'confirmed')} className="px-2 py-1 rounded text-xs bg-green-800 hover:bg-green-700 text-white transition">Confirm</button>
                                                <button onClick={() => updateStatus(r.id, 'cancelled')} className="px-2 py-1 rounded text-xs bg-red-800 hover:bg-red-700 text-white transition">Cancel</button>
                                            </>}
                                            {r.status === 'confirmed' && <>
                                                <button onClick={() => updateStatus(r.id, 'checked_in')} className="px-2 py-1 rounded text-xs bg-blue-800 hover:bg-blue-700 text-white transition">Check In</button>
                                                <button onClick={() => updateStatus(r.id, 'cancelled')} className="px-2 py-1 rounded text-xs bg-red-800 hover:bg-red-700 text-white transition">Cancel</button>
                                            </>}
                                            {r.status === 'checked_in' && (
                                                <button onClick={() => updateStatus(r.id, 'checked_out')} className="px-2 py-1 rounded text-xs bg-purple-800 hover:bg-purple-700 text-white transition">Check Out</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// ─── Rooms Tab ──────────────────────────────────────────────────
const RoomsTab = () => {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null) // null | 'add' | room object (edit)

    const fetch = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_URL}/rooms`)
            setRooms(res.data.rooms || res.data || [])
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetch() }, [])

    const [deleteModal, setDeleteModal] = useState(null)

    const triggerDelete = (id) => setDeleteModal(id)

    const executeDelete = async () => {
        if (!deleteModal) return
        try {
            await axios.delete(`${API_URL}/rooms/${deleteModal}`, authHeaders())
            setRooms(r => r.filter(x => x.id !== deleteModal))
        } catch (e) { alert(e.response?.data?.message || 'Failed to delete room.') }
        finally { setDeleteModal(null) }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500">{rooms.length} room{rooms.length !== 1 ? 's' : ''} total</p>
                <button onClick={() => setModal('add')}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition"
                    style={{ background: '#8b0000', color: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#a00000'}
                    onMouseLeave={e => e.currentTarget.style.background = '#8b0000'}>
                    + Add Room
                </button>
            </div>

            {loading ? <p className="text-gray-500 py-8 text-center">Loading chambers...</p> : (
                <div className="overflow-x-auto rounded-xl border border-red-900">
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ background: 'rgba(139,0,0,0.2)' }} className="text-red-300 border-b border-red-900">
                                <th className="p-4 text-xs uppercase tracking-wider">Room #</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Type</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Price/Night</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Capacity</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.length === 0 ? (
                                <tr><td colSpan="6" className="p-10 text-center text-gray-600 italic">No rooms yet. Add one!</td></tr>
                            ) : rooms.map(room => (
                                <tr key={room.id} className="border-b border-red-900 border-opacity-30 hover:bg-black hover:bg-opacity-30 transition">
                                    <td className="p-4 font-bold text-red-400">{room.room_number}</td>
                                    <td className="p-4 text-sm text-gray-300">{room.type}</td>
                                    <td className="p-4 text-sm font-bold text-green-400">${room.price}</td>
                                    <td className="p-4 text-sm text-gray-400">{room.capacity} guests</td>
                                    <td className="p-4"><StatusBadge status={room.status || (room.is_available ? 'available' : 'occupied')} /></td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => setModal(room)}
                                                className="px-3 py-1 rounded text-xs bg-yellow-900 hover:bg-yellow-800 text-yellow-200 transition">
                                                Edit
                                            </button>
                                            <button onClick={() => triggerDelete(room.id)}
                                                className="px-3 py-1 rounded text-xs bg-red-900 hover:bg-red-800 text-red-200 transition">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <Modal
                    title={modal === 'add' ? '🛏️ Add New Room' : `✏️ Edit Room ${modal.room_number}`}
                    onClose={() => setModal(null)}>
                    <RoomForm
                        initial={modal === 'add' ? null : modal}
                        onSave={() => { setModal(null); fetch() }}
                        onClose={() => setModal(null)} />
                </Modal>
            )}

            <ConfirmModal 
                isOpen={!!deleteModal}
                message="Grrrraawwrr... Smash the room...? Erase it from the graveyard forever...?"
                onConfirm={executeDelete}
                onCancel={() => setDeleteModal(null)}
                confirmText="Graargh! (Erase)"
                cancelText="Mmmmrrr (Keep)"
            />
        </div>
    )
}

// ─── Overview Stats ─────────────────────────────────────────────
const OverviewTab = () => {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                const [resRes, roomRes] = await Promise.all([
                    axios.get(`${API_URL}/reservations`, authHeaders()),
                    axios.get(`${API_URL}/rooms`)
                ])
                const res = Array.isArray(resRes.data) ? resRes.data : []
                const rooms = roomRes.data.rooms || roomRes.data || []
                setStats({
                    total: res.length,
                    pending: res.filter(r => r.status === 'pending').length,
                    confirmed: res.filter(r => r.status === 'confirmed').length,
                    checkedIn: res.filter(r => r.status === 'checked_in').length,
                    revenue: res.filter(r => r.status !== 'cancelled').reduce((s, r) => s + parseFloat(r.total_amount || 0), 0),
                    totalRooms: rooms.length,
                    availableRooms: rooms.filter(r => r.status === 'available' || r.is_available).length,
                })
            } catch (e) { console.error(e) }
        }
        load()
    }, [])

    const cards = stats ? [
        { label: 'Total Bookings', value: stats.total, icon: '📅', color: '#ff6b6b' },
        { label: 'Pending', value: stats.pending, icon: '⏳', color: '#f59e0b' },
        { label: 'Confirmed', value: stats.confirmed, icon: '✅', color: '#10b981' },
        { label: 'Checked In', value: stats.checkedIn, icon: '🔑', color: '#6366f1' },
        { label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: '💰', color: '#34d399' },
        { label: 'Total Rooms', value: stats.totalRooms, icon: '🏨', color: '#a78bfa' },
        { label: 'Available Rooms', value: stats.availableRooms, icon: '✨', color: '#38bdf8' },
    ] : []

    return (
        <div>
            {!stats ? (
                <p className="text-gray-500 text-center py-10">Gathering intelligence...</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cards.map(c => (
                        <div key={c.label} className="rounded-xl p-5 border border-red-900 border-opacity-40 transition-transform hover:-translate-y-1"
                            style={{ background: 'rgba(20,20,40,0.9)' }}>
                            <div className="text-3xl mb-2">{c.icon}</div>
                            <div className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
                            <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{c.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main Admin Dashboard ────────────────────────────────────────
function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        if (!token || !userStr) { navigate('/login'); return }
        try {
            const u = JSON.parse(userStr)
            if (u.role !== 'admin') { navigate('/home'); return }
            setUser(u)
        } catch { navigate('/login') }
    }, [navigate])

    const [logoutModal, setLogoutModal] = useState(false)

    const triggerLogout = () => {
        setLogoutModal(true)
    }

    const executeLogout = () => {
        setLogoutModal(false)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/')
    }

    const cancelLogout = () => setLogoutModal(false)

    const tabs = [
        { id: 'overview',      label: 'Overview',      icon: '📊' },
        { id: 'reservations',  label: 'Reservations',  icon: '📅' },
        { id: 'rooms',         label: 'Rooms',         icon: '🛏️' },
    ]

    if (!user) return null

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 50%, #16213e 100%)' }}>

            {/* ── Sidebar ── */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-red-900"
                style={{ background: 'rgba(10,5,20,0.95)' }}>

                {/* Logo */}
                <div className="p-6 border-b border-red-900">
                    <div className="flex items-center gap-3">
                        <img src="/gif_whites_removed_strong.gif" alt="bat" style={{ width: '36px', height: '36px' }} />
                        <div>
                            <p className="font-bold text-sm" style={{ color: '#ff6b6b' }}>Master's Dominion</p>
                            <p className="text-xs text-gray-500">Hotel Transylvania</p>
                        </div>
                    </div>
                </div>

                {/* Admin info */}
                <div className="px-6 py-4 border-b border-red-900">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Logged in as</p>
                    <p className="text-sm font-semibold text-gray-200">{user.name || user.username}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-900 text-red-300">Admin</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all"
                            style={{
                                background: activeTab === t.id ? 'rgba(139,0,0,0.35)' : 'transparent',
                                color: activeTab === t.id ? '#ff6b6b' : '#a0a0a0',
                                borderLeft: activeTab === t.id ? '3px solid #8b0000' : '3px solid transparent'
                            }}>
                            <span>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-red-900">
                    <button onClick={triggerLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-gray-400 hover:text-red-400"
                        style={{ background: 'rgba(139,0,0,0.1)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,0,0,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,0,0,0.1)'}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-auto">
                {/* Top bar */}
                <div className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between border-b border-red-900"
                    style={{ background: 'rgba(10,5,20,0.9)', backdropFilter: 'blur(8px)' }}>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: '#ff6b6b' }}>
                            {tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="text-xs text-gray-500">Hotel Transylvania Admin Panel</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <button onClick={triggerLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
                            style={{ background: 'rgba(139,0,0,0.2)', color: '#ff6b6b', border: '1px solid rgba(139,0,0,0.4)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,0,0,0.4)'; e.currentTarget.style.color = '#ff8888' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,0,0,0.2)'; e.currentTarget.style.color = '#ff6b6b' }}>
                            🚪 Logout
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                <div className="p-8">
                    {activeTab === 'overview'     && <OverviewTab />}
                    {activeTab === 'reservations' && <ReservationsTab />}
                    {activeTab === 'rooms'        && <RoomsTab />}
                </div>
            </main>

            <ConfirmModal 
                isOpen={logoutModal}
                message="Uuurgghh... Brrraaiinnss... You leaving the dark domain...?"
                onConfirm={executeLogout}
                onCancel={cancelLogout}
                confirmText="Graaawrr (Yes)"
                cancelText="Mmmmrrr (No)"
            />

            {/* Decorative bats */}
            <div className="bat bat-1 pointer-events-none" style={{ position: 'fixed', opacity: 0.15 }}>
                <img src="/gif_whites_removed_strong.gif" alt="" style={{ width: '50px' }} />
            </div>
            <div className="bat bat-2 pointer-events-none" style={{ position: 'fixed', opacity: 0.15 }}>
                <img src="/gif_whites_removed_strong.gif" alt="" style={{ width: '50px' }} />
            </div>
        </div>
    )
}

export default AdminDashboard
