import Header from "../components/header"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"


function Home() {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

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

    useEffect(() => {
        fetchRooms()
    }, [])

    // Fetch rooms from API
    const fetchRooms = async () => {
        try {
            setLoading(true)
            setError("")
            // Replace with your actual API endpoint
            const response = await axios.get(`${API_URL}/rooms`)
            if (response.data.success) {
                setRooms(response.data.rooms || [])
            } else {
                // Mock data if API fails
                setRooms(getMockRooms())
            }
        } catch (error) {
            console.error("Error fetching rooms:", error)
            // Use mock data as fallback
            setRooms(getMockRooms())
        } finally {
            setLoading(false)
        }
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
    const handleBookRoom = (roomId) => {
        navigate(`/bookings?roomId=${roomId}`)
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
                    <p className="text-lg" style={{color: '#ff6b6b'}}>Loading rooms...</p>
                </div>
            </>
        )
    }

    return (
        <>
            <Header />
            <main className="min-h-screen" style={{background: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 50%, #16213e 100%)'}}>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 haunted-title">Available Rooms</h1>
                        <p className="text-sm" style={{color: '#c0c0c0', textShadow: '0 0 10px rgba(255, 107, 107, 0.3)'}}>
                            Browse and book our haunted chambers
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg border px-4 py-3 text-sm shadow-sm" style={{borderColor: '#ff6b6b', backgroundColor: 'rgba(139, 0, 0, 0.2)', color: '#ff6b6b'}}>
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Filters */}
                        <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            <div className="rounded-2xl border-2 p-6 shadow-md" style={{borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)'}}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold" style={{color: '#d0d0d0'}}>Filters</h2>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="lg:hidden text-2xl text-gray-400"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="mb-6">
                                    <label className="block text-xs font-medium uppercase tracking-wide mb-2 haunted-label">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Room number or type..."
                                        className="w-full rounded-xl border-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition haunted-input"
                                    />
                                </div>

                                {/* Room Type Filter */}
                                <div className="mb-6 pb-6 border-b" style={{borderColor: 'rgba(139, 0, 0, 0.3)'}}>
                                    <label className="block text-xs font-medium uppercase tracking-wide mb-3 haunted-label">
                                        Room Type
                                    </label>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setFilters({...filters, roomType: "all"})}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                                filters.roomType === "all"
                                                    ? "font-semibold text-white shadow-md"
                                                    : "text-gray-300 hover:bg-gray-700"
                                            }`}
                                            style={{backgroundColor: filters.roomType === "all" ? '#8b0000' : 'transparent', color: filters.roomType === "all" ? '#fff' : '#c0c0c0'}}
                                        >
                                            All Types
                                        </button>
                                        {roomTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilters({...filters, roomType: type})}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                                    filters.roomType === type
                                                        ? "font-semibold text-white shadow-md"
                                                        : "text-gray-300 hover:bg-gray-700"
                                                }`}
                                                style={{backgroundColor: filters.roomType === type ? '#8b0000' : 'transparent', color: filters.roomType === type ? '#fff' : '#c0c0c0'}}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range Filter */}
                                <div className="mb-6 pb-6 border-b" style={{borderColor: 'rgba(139, 0, 0, 0.3)'}}>
                                    <label className="block text-xs font-medium uppercase tracking-wide mb-3 haunted-label">
                                        Price Range
                                    </label>
                                    <div className="space-y-3">
                                        <div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="500"
                                                value={filters.priceRange[1]}
                                                onChange={(e) => 
                                                    setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)]})
                                                }
                                                className="w-full"
                                                style={{accentColor: '#8b0000'}}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs" style={{color: '#c0c0c0'}}>
                                            <span>${filters.priceRange[0]}</span>
                                            <span>${filters.priceRange[1]}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability Filter */}
                                <div className="mb-6 pb-6 border-b" style={{borderColor: 'rgba(139, 0, 0, 0.3)'}}>
                                    <label className="block text-xs font-medium uppercase tracking-wide mb-3 haunted-label">
                                        Availability
                                    </label>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setFilters({...filters, availability: "all"})}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                                filters.availability === "all"
                                                    ? "font-semibold text-white shadow-md"
                                                    : "text-gray-300 hover:bg-gray-700"
                                            }`}
                                            style={{backgroundColor: filters.availability === "all" ? '#8b0000' : 'transparent', color: filters.availability === "all" ? '#fff' : '#c0c0c0'}}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setFilters({...filters, availability: "available"})}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                                filters.availability === "available"
                                                    ? "font-semibold text-white shadow-md"
                                                    : "text-gray-300 hover:bg-gray-700"
                                            }`}
                                            style={{backgroundColor: filters.availability === "available" ? '#8b0000' : 'transparent', color: filters.availability === "available" ? '#fff' : '#c0c0c0'}}
                                        >
                                            Available
                                        </button>
                                        <button
                                            onClick={() => setFilters({...filters, availability: "booked"})}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                                filters.availability === "booked"
                                                    ? "font-semibold text-white shadow-md"
                                                    : "text-gray-300 hover:bg-gray-700"
                                            }`}
                                            style={{backgroundColor: filters.availability === "booked" ? '#8b0000' : 'transparent', color: filters.availability === "booked" ? '#fff' : '#c0c0c0'}}
                                        >
                                            Booked
                                        </button>
                                    </div>
                                </div>

                                {/* Amenities Filter */}
                                <div className="mb-6">
                                    <label className="block text-xs font-medium uppercase tracking-wide mb-3 haunted-label">
                                        Amenities
                                    </label>
                                    <div className="space-y-2">
                                        {amenitiesList.map((amenity) => (
                                            <label key={amenity} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.amenities.includes(amenity)}
                                                    onChange={() => toggleAmenity(amenity)}
                                                    className="rounded"
                                                    style={{accentColor: '#8b0000'}}
                                                />
                                                <span className="ml-2 text-sm" style={{color: '#c0c0c0'}}>{amenity}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Reset Filters Button */}
                                <button
                                    onClick={resetFilters}
                                    className="w-full rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md hover:shadow-lg transition"
                                    style={{backgroundColor: '#8b0000'}}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden mb-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md"
                                style={{backgroundColor: '#8b0000'}}
                            >
                                <span className="mr-2">🔍</span>
                                {showFilters ? "Hide Filters" : "Show Filters"}
                            </button>

                            {/* Results Count */}
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm" style={{color: '#c0c0c0'}}>
                                    Showing <span className="font-semibold" style={{color: '#ff6b6b'}}>{filteredRooms.length}</span> of <span className="font-semibold" style={{color: '#ff6b6b'}}>{rooms.length}</span> rooms
                                </p>
                            </div>

                            {/* Room Grid */}
                            {filteredRooms.length === 0 ? (
                                <div className="rounded-3xl border-2 border-dashed px-6 py-12 text-center shadow-sm" style={{borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)', color: '#c0c0c0'}}>
                                    <p className="text-lg font-medium mb-2">No rooms found</p>
                                    <p className="text-sm">Try adjusting your filters or search term</p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md"
                                        style={{backgroundColor: '#8b0000', color: '#fff'}}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className="group flex flex-col rounded-3xl border-2 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden"
                                            style={{borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)'}}
                                        >
                                            {/* Room Image Placeholder */}
                                            <div
                                                className="h-40 flex items-center justify-center"
                                                style={{background: 'linear-gradient(135deg, #8b0000 0%, #4a0000 100%)'}}
                                            >
                                                <span className="text-5xl font-bold" style={{color: '#ff6b6b'}}>
                                                    {room.roomNumber}
                                                </span>
                                            </div>

                                            {/* Room Details */}
                                            <div className="flex flex-1 flex-col p-5">
                                                <div className="mb-2 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium" style={{backgroundColor: 'rgba(139, 0, 0, 0.3)', color: '#ff6b6b'}}>
                                                    {room.type}
                                                </div>

                                                <h3 className="text-lg font-bold mb-1" style={{color: '#d0d0d0'}}>
                                                    Room {room.roomNumber}
                                                </h3>

                                                <div className="mb-4 flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold" style={{color: '#ff6b6b'}}>
                                                        ${room.price}
                                                    </span>
                                                    <span className="text-xs" style={{color: '#c0c0c0'}}>per night</span>
                                                </div>

                                                {/* Availability Badge */}
                                                <div className="mb-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                            room.availability === "available"
                                                                ? "bg-emerald-900 text-emerald-200"
                                                                : "bg-red-900 text-red-200"
                                                        }`}
                                                    >
                                                        <span className={`mr-1.5 h-2 w-2 rounded-full ${room.availability === "available" ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                        {room.availability === "available" ? "Available" : "Booked"}
                                                    </span>
                                                </div>

                                                {/* Amenities */}
                                                <div className="mb-4 flex-1">
                                                    <p className="text-xs font-medium mb-2" style={{color: '#c0c0c0'}}>Amenities:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {room.amenities?.slice(0, 3).map((amenity) => (
                                                            <span
                                                                key={amenity}
                                                                className="text-xs rounded-full px-2 py-1"
                                                                style={{backgroundColor: 'rgba(139, 0, 0, 0.3)', color: '#ff6b6b'}}
                                                            >
                                                                {amenity}
                                                            </span>
                                                        ))}
                                                        {room.amenities && room.amenities.length > 3 && (
                                                            <span className="text-xs rounded-full px-2 py-1" style={{backgroundColor: 'rgba(139, 0, 0, 0.3)', color: '#ff6b6b'}}>
                                                                +{room.amenities.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleBookRoom(room.id)}
                                                        disabled={room.availability !== "available"}
                                                        className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white`}
                                                        style={{backgroundColor: room.availability === "available" ? '#8b0000' : '#666', color: '#fff'}}
                                                    >
                                                        {room.availability === "available" ? "Book Now" : "Unavailable"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRoomDetails(room)}
                                                        className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition border-2"
                                                        style={{borderColor: '#8b0000', color: '#ff6b6b'}}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
                    <div className="relative w-full max-w-lg rounded-3xl border-2 overflow-hidden shadow-2xl scale-in" style={{borderColor: 'rgba(255, 107, 107, 0.8)', backgroundColor: 'rgba(20, 20, 40, 0.98)', boxShadow: '0 0 30px rgba(139, 0, 0, 0.5)', animation: 'fadeInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'}}>
                        {/* Close Button */}
                        <button
                            onClick={() => setShowDetailDialog(false)}
                            className="absolute top-4 right-4 z-10 text-2xl text-gray-400 hover:text-red-400 transition duration-200 transform hover:scale-110"
                        >
                            ✕
                        </button>

                        {/* Header Section */}
                        <div
                            className="h-40 flex items-center justify-center relative"
                            style={{background: 'linear-gradient(135deg, #ff6b6b 0%, #8b0000 50%, #4a0000 100%)', boxShadow: 'inset 0 0 20px rgba(139, 0, 0, 0.6)'}}
                        >
                            <div className="text-center">
                                <p className="text-sm uppercase tracking-wide" style={{color: '#c0c0c0'}}>Room</p>
                                <p className="text-6xl font-bold" style={{color: '#ff6b6b'}}>{selectedRoom.roomNumber}</p>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 max-h-96 overflow-y-auto" style={{background: 'linear-gradient(to bottom, rgba(20, 20, 40, 0.98), rgba(10, 10, 30, 0.98))'}}>
                            {/* Title and Price */}
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mb-3" style={{backgroundColor: 'rgba(139, 0, 0, 0.3)', color: '#ff6b6b'}}>
                                        {selectedRoom.type}
                                    </div>
                                    <h1 className="text-3xl font-bold" style={{color: '#d0d0d0'}}>
                                        {selectedRoom.type} Room {selectedRoom.roomNumber}
                                    </h1>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold" style={{color: '#ff6b6b'}}>
                                        ${selectedRoom.price}
                                    </p>
                                    <p style={{color: '#c0c0c0'}}>per night</p>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="mb-6">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-medium ${
                                        selectedRoom.availability === "available"
                                            ? "bg-emerald-900 text-emerald-200"
                                            : "bg-red-900 text-red-200"
                                    }`}
                                >
                                    <span className={`mr-2 h-2 w-2 rounded-full ${selectedRoom.availability === "available" ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    {selectedRoom.availability === "available" ? "Available for Booking" : "Currently Booked"}
                                </span>
                            </div>

                            {/* Amenities */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-3" style={{color: '#d0d0d0'}}>Amenities</h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedRoom.amenities?.map((amenity) => (
                                        <div
                                            key={amenity}
                                            className="rounded-lg px-3 py-2 flex items-center text-sm"
                                            style={{backgroundColor: 'rgba(139, 0, 0, 0.2)', borderLeft: '3px solid #8b0000'}}
                                        >
                                            <span style={{color: '#ff6b6b'}} className="mr-2">✓</span>
                                            <span style={{color: '#c0c0c0'}}>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 p-8 border-t" style={{borderTopColor: 'rgba(139, 0, 0, 0.3)'}}>
                            <button
                                onClick={() => {
                                    setShowDetailDialog(false)
                                    handleBookRoom(selectedRoom.id)
                                }}
                                disabled={selectedRoom.availability !== "available"}
                                className="flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                style={{backgroundColor: selectedRoom.availability === "available" ? '#8b0000' : '#666', color: '#fff'}}
                            >
                                {selectedRoom.availability === "available" ? "Book This Room" : "Room Unavailable"}
                            </button>
                            <button
                                onClick={() => setShowDetailDialog(false)}
                                className="flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition border-2"
                                style={{borderColor: '#8b0000', color: '#ff6b6b'}}
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
