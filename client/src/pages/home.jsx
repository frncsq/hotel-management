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

    const API_URL = import.meta.env.VITE_API_URL
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

    // Validate room data structure
    const validateRoomData = (rooms) => {
        return Array.isArray(rooms) && rooms.every(room =>
            room.id &&
            room.roomNumber &&
            room.type &&
            typeof room.price === 'number' &&
            room.availability &&
            Array.isArray(room.amenities)
        )
    }

    // Fetch rooms from API with retry logic
    const fetchRooms = async (attempt = 0) => {
        try {
            setLoading(true)
            setError("")
            setMessage("")

            const response = await apiClient.get('/rooms')

            // Validate response structure
            if (!response.data) {
                throw new Error("Invalid response: no data received")
            }

            if (response.data.success && response.data.rooms) {
                // Validate rooms data structure
                if (validateRoomData(response.data.rooms)) {
                    setRooms(response.data.rooms)
                    setRetryCount(0)
                    console.log(`Successfully fetched ${response.data.rooms.length} rooms`)
                } else {
                    throw new Error("Invalid room data structure received from API")
                }
            } else if (Array.isArray(response.data)) {
                // Handle case where API returns array directly
                if (validateRoomData(response.data)) {
                    setRooms(response.data)
                    setRetryCount(0)
                    console.log(`Successfully fetched ${response.data.length} rooms`)
                } else {
                    throw new Error("Invalid room data structure")
                }
            } else {
                throw new Error("Unexpected API response format")
            }
        } catch (error) {
            console.error(`Fetch attempt ${attempt + 1}/${MAX_RETRIES}:`, error.message)

            // Retry logic
            if (attempt < MAX_RETRIES - 1) {
                setRetryCount(attempt + 1)
                const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
                setTimeout(() => fetchRooms(attempt + 1), delay)
            } else {
                // Max retries reached, use mock data and show error
                console.warn("Max retries reached, using mock data")
                setRooms(getMockRooms())
                const errorMessage = `Failed to load rooms from server after ${MAX_RETRIES} attempts. Displaying cached data. ${error.code === 'ECONNREFUSED' ? 'Server is not responding.' : ''}`
                setError(errorMessage)
                setMessage(errorMessage)
                setMessageType('error')
            }
        } finally {
            setLoading(false)
        }
    }

    // Manual retry function
    const handleRetry = () => {
        setRetryCount(0)
        fetchRooms()
    }

    // Mock data for demonstration
    const getMockRooms = () => [
        { id: 1, roomNumber: "101", type: "Single", price: 80, availability: "available", amenities: ["WiFi", "AC", "TV"] },
        { id: 2, roomNumber: "102", type: "Double", price: 120, availability: "available", amenities: ["WiFi", "AC", "TV", "Minibar"] },
        { id: 3, roomNumber: "103", type: "Suite", price: 250, availability: "booked", amenities: ["WiFi", "AC", "TV", "Minibar", "Jacuzzi"] },
        { id: 4, roomNumber: "201", type: "Single", price: 85, availability: "available", amenities: ["WiFi", "AC", "TV"] },
        { id: 5, roomNumber: "202", type: "Double", price: 150, availability: "available", amenities: ["WiFi", "AC", "TV", "Balcony"] },
        { id: 6, roomNumber: "203", type: "Suite", price: 300, availability: "available", amenities: ["WiFi", "AC", "TV", "Minibar", "Jacuzzi", "Balcony"] },
    ]

    // Filter rooms based on search and filters
    const filteredRooms = rooms.filter((room) => {
        // Search term filter
        if (searchTerm && !room.roomNumber.includes(searchTerm) && !room.type.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false
        }

        // Room type filter
        if (filters.roomType !== "all" && room.type !== filters.roomType) {
            return false
        }

        // Price range filter
        if (room.price < filters.priceRange[0] || room.price > filters.priceRange[1]) {
            return false
        }

        // Availability filter
        if (filters.availability !== "all" && room.availability !== filters.availability) {
            return false
        }

        // Amenities filter
        if (filters.amenities.length > 0) {
            const hasAllAmenities = filters.amenities.every((amenity) =>
                room.amenities?.includes(amenity)
            )
            if (!hasAllAmenities) return false
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
            
            if (!room) {
                setMessage('Room not found')
                setMessageType('error')
                return
            }

            if (room.availability !== 'available') {
                setMessage('This room is no longer available')
                setMessageType('error')
                return
            }

            setMessage('Redirecting to booking page...')
            setMessageType('success')
            
            setTimeout(() => {
                navigate(`/bookings?roomId=${roomId}`)
            }, 300)
        } catch (error) {
            console.error('Booking error:', error)
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

                            {/* Room Grid */}
                            {filteredRooms.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed px-8 py-16 text-center shadow-md animate-slideDown"
                                    style={{borderColor: 'rgba(139, 0, 0, 0.4)', backgroundColor: 'rgba(20, 20, 40, 0.8)'}}>
                                    <p className="text-2xl font-bold mb-2" style={{color: '#ff6b6b'}}>No Rooms Found</p>
                                    <p className="text-sm mb-6" style={{color: 'rgba(255, 107, 107, 0.7)'}}>
                                        Try adjusting your filters or search criteria
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                                        style={{background: 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)', color: '#fff'}}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredRooms.map((room, index) => (
                                        <div
                                            key={room.id}
                                            className="group flex flex-col rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 card-hover animate-slideInRight"
                                            style={{
                                                borderColor: 'rgba(139, 0, 0, 0.6)',
                                                backgroundColor: 'rgba(20, 20, 40, 0.9)',
                                                animationDelay: `${index * 50}ms`
                                            }}>
                                            {/* Image with Badge Overlay */}
                                            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-red-900 to-red-950">
                                                <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                                                    <span className="text-6xl font-bold text-center" style={{color: '#ff6b6b', textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'}}>
                                                        {room.roomNumber}
                                                    </span>
                                                </div>
                                                {/* Badge on top */}
                                                <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-lg" 
                                                    style={{backgroundColor: '#ff6b6b', color: '#fff'}}>
                                                    â­ Premium
                                                </div>
                                                {/* Heart icon */}
                                                <button className="absolute top-4 right-4 text-xl bg-white rounded-full p-2 hover:scale-110 transition-transform duration-300 shadow-lg opacity-0 group-hover:opacity-100"
                                                    style={{color: '#ff6b6b'}}>
                                                    â™¡
                                                </button>
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex flex-1 flex-col p-6">
                                                {/* Title and Type Badge */}
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-bold mb-2" style={{color: '#ff6b6b'}}>
                                                        Room {room.roomNumber}
                                                    </h3>
                                                    <div className="inline-flex items-center gap-2">
                                                        <span className="text-sm font-semibold" style={{color: '#ff6b6b'}}>★★★★★</span>
                                                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" 
                                                            style={{backgroundColor: 'rgba(139, 0, 0, 0.15)', color: '#ff6b6b'}}>
                                                            {room.type}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm mb-4 leading-relaxed" style={{color: 'rgba(192, 192, 192, 0.8)'}}>
                                                    Luxuriously appointed with premium amenities and thoughtful design details.
                                                </p>

                                                {/* Amenities/Features */}
                                                <div className="mb-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {room.amenities?.slice(0, 3).map((amenity) => (
                                                            <span
                                                                key={amenity}
                                                                className="text-xs font-medium rounded-full px-3 py-1 inline-flex items-center gap-1 transition-all duration-200"
                                                                style={{backgroundColor: 'rgba(139, 0, 0, 0.15)', color: '#ff6b6b'}}
                                                            >
                                                                âœ“ {amenity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Price Section */}
                                                <div className="mb-5 py-4 px-4 rounded-lg" 
                                                    style={{backgroundColor: 'rgba(139, 0, 0, 0.15)', borderLeft: '3px solid #ff6b6b'}}>
                                                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                                                        <span className="text-3xl font-bold" style={{color: '#ff6b6b'}}>
                                                            ${room.price}
                                                        </span>
                                                        <span className="text-sm" style={{color: 'rgba(255, 107, 107, 0.6)'}}>
                                                            per night
                                                        </span>
                                                    </div>
                                                    <span className="text-xs opacity-60" style={{color: 'rgba(255, 107, 107, 0.8)'}}>
                                                        Save up to ${Math.round(room.price * 0.2)} with longer stays
                                                    </span>
                                                </div>

                                                {/* Availability Status */}
                                                <div className="mb-5">
                                                    <div className="text-xs font-semibold px-3 py-2 rounded-lg text-center transition-all"
                                                        style={{
                                                            backgroundColor: room.availability === "available" ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                            color: room.availability === "available" ? '#86efac' : '#fca5a5'
                                                        }}>
                                                        {room.availability === "available" ? "âœ“ Available" : "âœ• Unavailable"}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3 mt-auto">
                                                    <button
                                                        onClick={() => handleBookRoom(room.id)}
                                                        disabled={room.availability !== "available"}
                                                        className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:scale-95`}
                                                        style={{
                                                            background: room.availability === "available" 
                                                                ? 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)' 
                                                                : 'rgba(107, 114, 128, 0.5)',
                                                            color: room.availability === "available" ? '#fff' : '#9ca3af'
                                                        }}
                                                    >
                                                        {room.availability === "available" ? "Book Now" : "Unavailable"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRoomDetails(room)}
                                                        className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 border-2 hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                                                        style={{
                                                            borderColor: '#ff6b6b',
                                                            color: '#ff6b6b',
                                                            backgroundColor: 'rgba(139, 0, 0, 0.15)'
                                                        }}
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                        <div
                            className="h-40 flex items-center justify-center relative"
                            style={{background: 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 50%, #993333 100%)'}}>
                            <div className="text-center">
                                <p className="text-sm uppercase tracking-wide" style={{color: '#fff'}}>Room</p>
                                <p className="text-6xl font-bold" style={{color: '#fff'}}>{selectedRoom.roomNumber}</p>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 max-h-96 overflow-y-auto">
                            {/* Title and Price */}
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mb-3" style={{backgroundColor: 'rgba(139, 0, 0, 0.15)', color: '#ff6b6b'}}>
                                        {selectedRoom.type}
                                    </div>
                                    <h1 className="text-3xl font-bold" style={{color: '#ff6b6b'}}>
                                        {selectedRoom.type} Room
                                    </h1>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold" style={{color: '#ff6b6b'}}>
                                        ${selectedRoom.price}
                                    </p>
                                    <p className="text-sm" style={{color: 'rgba(255, 107, 107, 0.7)'}}>per night</p>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="mb-6">
                                <span
                                    className="inline-flex items-center rounded-full px-3 py-2 text-xs font-medium"
                                    style={{
                                        backgroundColor: selectedRoom.availability === "available" ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: selectedRoom.availability === "available" ? '#86efac' : '#fca5a5'
                                    }}>
                                    <span className="mr-2 h-2 w-2 rounded-full" style={{
                                        backgroundColor: selectedRoom.availability === "available" ? '#86efac' : '#fca5a5'
                                    }} />
                                    {selectedRoom.availability === "available" ? "Available for Booking" : "Currently Booked"}
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
                                onClick={() => {
                                    setShowDetailDialog(false)
                                    handleBookRoom(selectedRoom.id)
                                }}
                                disabled={selectedRoom.availability !== "available"}
                                className="flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                                style={{
                                    background: selectedRoom.availability === "available" ? 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)' : 'rgba(107, 114, 128, 0.5)',
                                    color: selectedRoom.availability === "available" ? '#fff' : '#9ca3af'
                                }}
                            >
                                {selectedRoom.availability === "available" ? "Book This Room" : "Room Unavailable"}
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