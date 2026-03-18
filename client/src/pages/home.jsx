import Header from "../components/header"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"


function Home() {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [retryCount, setRetryCount] = useState(0)

    // Filter states
    const [filters, setFilters] = useState({
        roomType: "all",
        priceRange: [0, 500],
        availability: "all",
        amenities: []
    })

    // Sidebar open/close for mobile
    const [showFilters, setShowFilters] = useState(false)

    // Room detail dialog state
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [showDetailDialog, setShowDetailDialog] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
    const navigate = useNavigate()
    const MAX_RETRIES = 3

    // Create axios instance with default config
    const apiClient = axios.create({
        baseURL: API_URL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    useEffect(() => {
        fetchRooms()
    }, [])

    // Fetch rooms from API
    const fetchRooms = async () => {
        try {
            setLoading(true)
            setError("")
            setMessage("")
            const response = await apiClient.get('/rooms')
            if (response.data.success && Array.isArray(response.data.rooms)) {
                setRooms(response.data.rooms)
            } else if (Array.isArray(response.data)) {
                setRooms(response.data)
            } else {
                setError("Failed to load rooms")
            }
        } catch (error) {
            console.error('Fetch rooms error:', error.message)
            setError("Unable to connect to server. Please make sure the backend is running.")
        } finally {
            setLoading(false)
        }
    }

    // Manual retry function
    const handleRetry = () => {
        setRetryCount(0)
        fetchRooms()
    }


    // Filter rooms based on search and filters (uses DB field names)
    const filteredRooms = rooms.filter((room) => {
        const roomNum = String(room.room_number || '')
        const roomType = String(room.type || '')
        if (searchTerm && !roomNum.toLowerCase().includes(searchTerm.toLowerCase()) && !roomType.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false
        }
        if (filters.roomType !== "all" && roomType !== filters.roomType) {
            return false
        }
        const price = parseFloat(room.price || 0)
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
            return false
        }
        if (filters.availability !== "all") {
            const isAvailable = room.status === 'available'
            if (filters.availability === 'available' && !isAvailable) return false
            if (filters.availability === 'booked' && isAvailable) return false
        }
        return true
    })

    // Get unique values for filter options
    const roomTypes = ["Single", "Double", "Suite", "Deluxe"]
    const amenitiesList = ["WiFi", "AC", "TV", "Minibar", "Balcony", "Jacuzzi", "Pool", "Gym"]

    // Toggle amenity filter
    const toggleAmenity = (amenity) => {
        setFilters((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity]
        }))
    }

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            roomType: "all",
            priceRange: [0, 500],
            availability: "all",
            amenities: []
        })
        setSearchTerm("")
    }

    // Handle room booking
    const handleBookRoom = async (roomId) => {
        try {
            const room = rooms.find(r => r.id === roomId)
            if (!room) { setMessage('Room not found'); setMessageType('error'); return }
            if (room.status !== 'available') { setMessage('This room is not available'); setMessageType('error'); return }
            setMessage('Redirecting to booking page...')
            setMessageType('success')
            setTimeout(() => navigate(`/bookings?roomId=${roomId}`), 300)
        } catch (error) {
            setMessage('Error processing booking. Please try again.')
            setMessageType('error')
        }
    }

    // Handle room details dialog
    const handleRoomDetails = (room) => {
        setSelectedRoom(room)
        setShowDetailDialog(true)
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="flex h-screen items-center justify-center" style={{background: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 50%, #16213e 100%)'}}>
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4 border-4" style={{borderColor: 'rgba(139, 0, 0, 0.3)', borderTopColor: '#ff6b6b'}}></div>
                        <p style={{color: '#c0c0c0'}}>Loading rooms...</p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Header />
            <main className="min-h-screen" style={{background: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 50%, #16213e 100%)'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Page Header */}
                    <div className="mb-12 animate-slideInLeft">
                        <h1 className="text-5xl font-bold mb-3 haunted-title" style={{color: '#ff6b6b', letterSpacing: '-0.02em'}}>
                            Discover Our Rooms
                        </h1>
                        <p className="text-lg max-w-2xl" style={{color: 'rgba(255, 107, 107, 0.8)'}}>
                            Explore our exquisite collection of premium accommodations, each designed for your comfort and luxury experience.
                        </p>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className={`mb-6 rounded-xl border px-5 py-4 text-sm shadow-lg flex items-center justify-between animate-slideDown transition-all ${
                            messageType === 'success' 
                                ? 'border-green-500/30 bg-green-900/20 text-green-300' 
                                : 'border-red-500/30 bg-red-900/20 text-red-300'
                        }`}>
                            <span>{message}</span>
                            <button
                                onClick={() => setMessage("")}
                                className="ml-4 text-lg hover:opacity-70 transition-opacity"
                            >
                                âœ•
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-xl border px-5 py-4 text-sm shadow-lg flex items-center justify-between animate-slideDown" 
                            style={{borderColor: '#ff6b6b', backgroundColor: 'rgba(139, 0, 0, 0.2)', color: '#ff6b6b'}}>
                            <span>{error} {retryCount > 0 && `(Attempt ${retryCount}/${MAX_RETRIES})`}</span>
                            <button
                                onClick={handleRetry}
                                className="ml-4 px-4 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition"
                                style={{backgroundColor: '#8b0000', color: '#fff'}}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            <div className="rounded-2xl border-2 p-7 shadow-lg sticky top-28" 
                                style={{borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)', backdropFilter: 'blur(10px)'}}>
                                <div className="flex items-center justify-between mb-7">
                                    <h2 className="text-lg font-bold" style={{color: '#ff6b6b'}}>Search & Filter</h2>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="lg:hidden text-2xl opacity-60 hover:opacity-100 transition"
                                        style={{color: '#ff6b6b'}}
                                    >
                                        âœ•
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="mb-8">
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{color: '#ff6b6b'}}>
                                        ðŸ” Search
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Room number, type..."
                                        className="w-full rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all focus:outline-none"
                                        style={{
                                            borderColor: 'rgba(139, 0, 0, 0.4)',
                                            backgroundColor: 'rgba(20, 20, 40, 0.8)',
                                            color: '#c0c0c0'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#ff6b6b'
                                            e.target.style.backgroundColor = 'rgba(20, 20, 40, 0.9)'
                                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.1)'
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(139, 0, 0, 0.4)'
                                            e.target.style.backgroundColor = 'rgba(20, 20, 40, 0.8)'
                                            e.target.style.boxShadow = 'none'
                                        }}
                                    />
                                </div>

                                {/* Room Type Filter */}
                                <div className="mb-8 pb-8 border-b" style={{borderColor: 'rgba(139, 0, 0, 0.3)'}}>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-4" style={{color: '#ff6b6b'}}>
                                        ðŸ›ï¸ Room Type
                                    </label>
                                    <div className="space-y-2">
                                        {["all", ...roomTypes].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilters({...filters, roomType: type})}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    filters.roomType === type
                                                        ? "shadow-md"
                                                        : "hover:bg-opacity-50"
                                                }`}
                                                style={{
                                                    backgroundColor: filters.roomType === type ? 'rgba(139, 0, 0, 0.2)' : 'transparent',
                                                    color: filters.roomType === type ? '#ff6b6b' : '#c0c0c0',
                                                    borderLeft: filters.roomType === type ? '3px solid #ff6b6b' : '3px solid transparent'
                                                }}
                                            >
                                                {type === "all" ? "All Types" : type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range Filter */}
                                <div className="mb-8 pb-8 border-b" style={{borderColor: 'rgba(139, 0, 0, 0.3)'}}>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-4" style={{color: '#ff6b6b'}}>
                                        ðŸ’° Price Range
                                    </label>
                                    <div className="space-y-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="500"
                                            value={filters.priceRange[1]}
                                            onChange={(e) => 
                                                setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)]})
                                            }
                                            className="w-full"
                                            style={{accentColor: '#d4af37'}}
                                        />
                                        <div className="flex justify-between text-sm font-semibold p-3 rounded-lg bg-opacity-20"
                                            style={{backgroundColor: 'rgba(139, 0, 0, 0.15)', color: '#ff6b6b'}}>
                                            <span>${filters.priceRange[0]}</span>
                                            <span>${filters.priceRange[1]}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability Filter */}
                                <div className="mb-8 pb-8 border-b" style={{borderColor: 'rgba(139, 0, 0, 0.3)'}}>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-4" style={{color: '#ff6b6b'}}>
                                        âœ“ Availability
                                    </label>
                                    <div className="space-y-2">
                                        {["all", "available", "booked"].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setFilters({...filters, availability: status})}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    filters.availability === status
                                                        ? "shadow-md"
                                                        : "hover:bg-opacity-50"
                                                }`}
                                                style={{
                                                    backgroundColor: filters.availability === status ? 'rgba(139, 0, 0, 0.2)' : 'transparent',
                                                    color: filters.availability === status ? '#ff6b6b' : '#c0c0c0',
                                                    borderLeft: filters.availability === status ? '3px solid #ff6b6b' : '3px solid transparent'
                                                }}
                                            >
                                                {status === "all" ? "All Rooms" : status.charAt(0).toUpperCase() + status.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amenities Filter */}
                                <div className="mb-8">
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-4" style={{color: '#ff6b6b'}}>
                                        â­ Amenities
                                    </label>
                                    <div className="space-y-3">
                                        {amenitiesList.map((amenity) => (
                                            <label key={amenity} className="flex items-center cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.amenities.includes(amenity)}
                                                    onChange={() => toggleAmenity(amenity)}
                                                    className="rounded transition-all"
                                                    style={{accentColor: '#ff6b6b'}}
                                                />
                                                <span className="ml-3 text-sm font-medium group-hover:text-red-300 transition-colors" style={{color: '#c0c0c0'}}>
                                                    {amenity}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Reset Filters Button */}
                                <button
                                    onClick={resetFilters}
                                    className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    style={{background: 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)', color: '#fff'}}
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden mb-6 inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                                style={{background: 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)', color: '#fff'}}
                            >
                                <span className="mr-2">ðŸ”</span>
                                {showFilters ? "Hide Filters" : "Show Filters"}
                            </button>

                            {/* Results Count */}
                            <div className="mb-8">
                                <p className="text-sm font-semibold" style={{color: 'rgba(255, 107, 107, 0.9)'}}>
                                    Showing <span style={{color: '#ff6b6b'}}>{filteredRooms.length}</span> of <span style={{color: '#ff6b6b'}}>{rooms.length}</span> rooms
                                </p>
                            </div>

                            {filteredRooms.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed px-8 py-16 text-center shadow-md animate-slideDown"
                                    style={{borderColor: 'rgba(139, 0, 0, 0.4)', backgroundColor: 'rgba(20, 20, 40, 0.8)'}}>
                                    <p className="text-2xl font-bold mb-2" style={{color: '#ff6b6b'}}>No Rooms Found</p>
                                    <p className="text-sm mb-6" style={{color: 'rgba(255, 107, 107, 0.7)'}}>Try adjusting your filters or search criteria</p>
                                    <button onClick={resetFilters}
                                        className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                                        style={{background: 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)'}}>
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredRooms.map((room, index) => {
                                        const isAvailable = room.status === 'available'
                                        const backendBase = import.meta.env.VITE_API_URL
                                        const imageUrl = room.image_url ? `${backendBase}${room.image_url}` : null
                                        return (
                                        <div key={room.id}
                                            className="group flex flex-col rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 card-hover animate-slideInRight"
                                            style={{ borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)', animationDelay: `${index * 50}ms` }}>

                                            {/* Room Image */}
                                            <div className="relative h-52 overflow-hidden" style={{background: 'linear-gradient(135deg, #2a0a0a 0%, #1a0a2e 100%)'}}>
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={`Room ${room.room_number}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-6xl font-bold" style={{color: '#ff6b6b', opacity: 0.5}}>{room.room_number}</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold" style={{background: '#8b0000', color: '#fff'}}>
                                                    {room.type}
                                                </div>
                                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${isAvailable ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                                    {isAvailable ? '✓ Available' : '✗ Occupied'}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-1 flex-col p-5">
                                                <h3 className="text-lg font-bold mb-1" style={{color: '#ff6b6b'}}>Room {room.room_number}</h3>
                                                <p className="text-xs mb-3" style={{color: '#808080'}}>Capacity: {room.capacity} guests</p>

                                                <div className="mt-auto">
                                                    <div className="flex items-baseline gap-2 mb-4 py-3 px-3 rounded-lg" style={{background: 'rgba(139,0,0,0.15)', borderLeft: '3px solid #ff6b6b'}}>
                                                        <span className="text-3xl font-bold" style={{color: '#ff6b6b'}}>${parseFloat(room.price).toFixed(0)}</span>
                                                        <span className="text-sm" style={{color: 'rgba(255,107,107,0.6)'}}>per night</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => handleBookRoom(room.id)} disabled={!isAvailable}
                                                            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            style={{ background: isAvailable ? 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)' : 'rgba(107,114,128,0.4)', color: '#fff' }}>
                                                            {isAvailable ? 'Book Now' : 'Unavailable'}
                                                        </button>
                                                        <button onClick={() => handleRoomDetails(room)}
                                                            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all border-2"
                                                            style={{ borderColor: '#ff6b6b', color: '#ff6b6b', background: 'rgba(139,0,0,0.1)' }}>
                                                            Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Room Detail Dialog */}
            {showDetailDialog && selectedRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                    <div className="relative w-full max-w-lg rounded-2xl border-2 overflow-hidden shadow-2xl animate-slideDown" style={{borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.98)', boxShadow: '0 0 30px rgba(255, 107, 107, 0.2)'}}>​
                        {/* Close Button */}
                        <button
                            onClick={() => setShowDetailDialog(false)}
                            className="absolute top-4 right-4 z-10 text-2xl opacity-60 hover:opacity-100 transition duration-200 transform hover:scale-110"
                            style={{color: '#ff6b6b'}}
                        >
                            âœ•
                        </button>

                        {/* Header Section */}
                        <div className="relative h-48 overflow-hidden" style={{background: 'linear-gradient(135deg, #4a0000 0%, #1a0a2e 100%)'}}>
                            {selectedRoom.image_url ? (
                                <img src={`${import.meta.env.VITE_API_URL}${selectedRoom.image_url}`} alt={`Room ${selectedRoom.room_number}`} className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-7xl font-bold" style={{color: '#ff6b6b', opacity: 0.5}}>{selectedRoom.room_number}</p>
                                </div>
                            )}
                            <div className="absolute bottom-3 left-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: '#8b0000', color: '#fff'}}>{selectedRoom.type}</span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 max-h-96 overflow-y-auto">
                            {/* Title and Price */}
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold" style={{color: '#ff6b6b'}}>
                                        Room {selectedRoom.room_number}
                                    </h1>
                                    <p className="text-sm mt-1" style={{color: '#a0a0a0'}}>Capacity: {selectedRoom.capacity} guests</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold" style={{color: '#ff6b6b'}}>${parseFloat(selectedRoom.price || 0).toFixed(0)}</p>
                                    <p className="text-sm" style={{color: 'rgba(255, 107, 107, 0.7)'}}>per night</p>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="mb-6">
                                <span className="inline-flex items-center rounded-full px-3 py-2 text-xs font-medium"
                                    style={{
                                        backgroundColor: selectedRoom.status === 'available' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                        color: selectedRoom.status === 'available' ? '#86efac' : '#fca5a5'
                                    }}>
                                    <span className="mr-2 h-2 w-2 rounded-full" style={{backgroundColor: selectedRoom.status === 'available' ? '#86efac' : '#fca5a5'}} />
                                    {selectedRoom.status === 'available' ? 'Available for Booking' : 'Currently ' + (selectedRoom.status || 'Unavailable')}
                                </span>
                            </div>

                            {/* Amenities */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-3" style={{color: '#ff6b6b'}}>Amenities</h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedRoom.amenities?.map((amenity) => (
                                        <div
                                            key={amenity}
                                            className="rounded-lg px-3 py-2 flex items-center text-sm"
                                            style={{backgroundColor: 'rgba(139, 0, 0, 0.15)', borderLeft: '3px solid #ff6b6b'}}
                                        >
                                            <span style={{color: '#ff6b6b'}} className="mr-2">✓</span>
                                            <span style={{color: '#c0c0c0'}}>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 p-6 border-t" style={{borderTopColor: 'rgba(139, 0, 0, 0.3)'}}>
                            <button
                                onClick={() => { setShowDetailDialog(false); handleBookRoom(selectedRoom.id) }}
                                disabled={selectedRoom.status !== 'available'}
                                className="flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: selectedRoom.status === 'available' ? 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)' : 'rgba(107,114,128,0.5)',
                                    color: '#fff'
                                }}
                            >
                                {selectedRoom.status === 'available' ? 'Book This Room' : 'Room Unavailable'}
                            </button>
                            <button
                                onClick={() => setShowDetailDialog(false)}
                                className="flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 border-2"
                                style={{borderColor: '#ff6b6b', color: '#ff6b6b', backgroundColor: 'rgba(139, 0, 0, 0.15)'}}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Home