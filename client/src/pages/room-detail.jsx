import Header from "../components/header"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

function RoomDetail() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const [room, setRoom] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        fetchRoomDetail()
    }, [roomId])

    // Fetch room details from API
    const fetchRoomDetail = async () => {
        try {
            setLoading(true)
            setError("")
            
            // Try API first
            try {
                const response = await axios.get(`${API_URL}/rooms/${roomId}`)
                if (response.data.success) {
                    setRoom(response.data.room)
                    return
                }
            } catch (err) {
                console.error("API error:", err)
            }

            // Fallback to mock data
            const mockRoom = getMockRoomDetail(roomId)
            if (mockRoom) {
                setRoom(mockRoom)
            } else {
                setError("Room not found")
            }
        } catch (error) {
            console.error("Error fetching room:", error)
            setError("Error loading room details")
        } finally {
            setLoading(false)
        }
    }

    // Mock room data
    const getMockRoomDetail = (id) => {
        const mockRooms = [
            { 
                id: 1, 
                roomNumber: "101", 
                type: "Single", 
                price: 80, 
                availability: "available", 
                amenities: ["WiFi", "AC", "TV"],
                description: "A cozy single room perfect for solo travelers seeking comfort and convenience.",
                maxGuests: 1,
                bedType: "Single Bed",
                size: "20 sqm"
            },
            { 
                id: 2, 
                roomNumber: "102", 
                type: "Double", 
                price: 120, 
                availability: "available", 
                amenities: ["WiFi", "AC", "TV", "Minibar"],
                description: "Spacious double room with elegant furnishings and premium amenities.",
                maxGuests: 2,
                bedType: "Queen Bed",
                size: "30 sqm"
            },
            { 
                id: 3, 
                roomNumber: "103", 
                type: "Suite", 
                price: 250, 
                availability: "booked", 
                amenities: ["WiFi", "AC", "TV", "Minibar", "Jacuzzi"],
                description: "Luxurious suite with separate living area and premium bathroom.",
                maxGuests: 4,
                bedType: "King Bed + Sofa",
                size: "50 sqm"
            },
            { 
                id: 4, 
                roomNumber: "201", 
                type: "Single", 
                price: 85, 
                availability: "available", 
                amenities: ["WiFi", "AC", "TV"],
                description: "Upper floor single room with city view and modern amenities.",
                maxGuests: 1,
                bedType: "Single Bed",
                size: "20 sqm"
            },
            { 
                id: 5, 
                roomNumber: "202", 
                type: "Double", 
                price: 150, 
                availability: "available", 
                amenities: ["WiFi", "AC", "TV", "Balcony"],
                description: "Deluxe double room with private balcony overlooking the city.",
                maxGuests: 2,
                bedType: "Queen Bed",
                size: "35 sqm"
            },
            { 
                id: 6, 
                roomNumber: "203", 
                type: "Suite", 
                price: 300, 
                availability: "available", 
                amenities: ["WiFi", "AC", "TV", "Minibar", "Jacuzzi", "Balcony"],
                description: "Premium suite with all amenities and spectacular views.",
                maxGuests: 4,
                bedType: "King Bed + Sofa",
                size: "55 sqm"
            },
        ]
        return mockRooms.find(r => r.id === parseInt(id))
    }

    const handleBookRoom = () => {
        if (room) {
            navigate(`/bookings?roomId=${room.id}`)
        }
    }

    const handleBack = () => {
        navigate('/home')
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="flex h-screen items-center justify-center" style={{background: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 50%, #16213e 100%)'}}>
                    <p className="text-lg" style={{color: '#ff6b6b'}}>Loading room details...</p>
                </div>
            </>
        )
    }

    if (error || !room) {
        return (
            <>
                <Header />
                <main className="min-h-screen" style={{background: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 50%, #16213e 100%)'}}>
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <button
                            onClick={handleBack}
                            className="mb-6 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md"
                            style={{backgroundColor: '#8b0000'}}
                        >
                            ← Back to Rooms
                        </button>
                        <div className="rounded-3xl border-2 p-8 text-center" style={{borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)', color: '#c0c0c0'}}>
                            <p className="text-lg font-medium">{error || "Room not found"}</p>
                        </div>
                    </div>
                </main>
            </>
        )
    }

    return (
        <>
            <Header />
            <main className="min-h-screen py-8" style={{background: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 50%, #16213e 100%)'}}>
                <div className="max-w-4xl mx-auto px-4">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="mb-6 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
                        style={{backgroundColor: '#8b0000'}}
                    >
                        ← Back to Rooms
                    </button>

                    {/* Room Detail Card */}
                    <div className="rounded-3xl border-2 overflow-hidden shadow-lg" style={{borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)'}}>
                        {/* Header Section */}
                        <div
                            className="h-48 flex items-center justify-center relative"
                            style={{background: 'linear-gradient(135deg, #8b0000 0%, #4a0000 100%)'}}
                        >
                            <div className="text-center">
                                <p className="text-sm uppercase tracking-wide" style={{color: '#c0c0c0'}}>Room</p>
                                <p className="text-6xl font-bold" style={{color: '#ff6b6b'}}>{room.roomNumber}</p>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8">
                            {/* Title and Price */}
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mb-3" style={{backgroundColor: 'rgba(139, 0, 0, 0.3)', color: '#ff6b6b'}}>
                                        {room.type}
                                    </div>
                                    <h1 className="text-3xl font-bold" style={{color: '#d0d0d0'}}>
                                        {room.type} Room {room.roomNumber}
                                    </h1>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold" style={{color: '#ff6b6b'}}>
                                        ${room.price}
                                    </p>
                                    <p style={{color: '#c0c0c0'}}>per night</p>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="mb-6">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-medium ${
                                        room.availability === "available"
                                            ? "bg-emerald-900 text-emerald-200"
                                            : "bg-red-900 text-red-200"
                                    }`}
                                >
                                    <span className={`mr-2 h-2 w-2 rounded-full ${room.availability === "available" ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    {room.availability === "available" ? "Available for Booking" : "Currently Booked"}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-2" style={{color: '#d0d0d0'}}>Description</h2>
                                <p style={{color: '#c0c0c0'}}>{room.description}</p>
                            </div>

                            {/* Room Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                                <div>
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Max Guests</p>
                                    <p className="text-2xl font-bold" style={{color: '#ff6b6b'}}>{room.maxGuests}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Bed Type</p>
                                    <p className="text-lg font-semibold" style={{color: '#d0d0d0'}}>{room.bedType}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Room Size</p>
                                    <p className="text-lg font-semibold" style={{color: '#d0d0d0'}}>{room.size}</p>
                                </div>
                            </div>

                            {/* Amenities Section */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-4" style={{color: '#d0d0d0'}}>Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {room.amenities?.map((amenity) => (
                                        <div
                                            key={amenity}
                                            className="rounded-lg px-4 py-3 flex items-center"
                                            style={{backgroundColor: 'rgba(139, 0, 0, 0.2)', borderLeft: '3px solid #8b0000'}}
                                        >
                                            <span style={{color: '#ff6b6b'}} className="mr-2">✓</span>
                                            <span style={{color: '#c0c0c0'}}>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBookRoom}
                                    disabled={room.availability !== "available"}
                                    className="flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                    style={{backgroundColor: room.availability === "available" ? '#8b0000' : '#666', color: '#fff'}}
                                >
                                    {room.availability === "available" ? "Book This Room" : "Room Unavailable"}
                                </button>
                                <button
                                    onClick={handleBack}
                                    className="flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition border-2"
                                    style={{borderColor: '#8b0000', color: '#ff6b6b'}}
                                >
                                    Continue Searching
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default RoomDetail
