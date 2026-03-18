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

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

    useEffect(() => {
        fetchRoomDetail()
    }, [roomId])

    // Fetch room details from API
    const fetchRoomDetail = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.get(`${API_URL}/rooms/${roomId}`)
            if (response.data) {
                setRoom(response.data)
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
                        <div className="relative h-56 overflow-hidden" style={{background: 'linear-gradient(135deg, #4a0000 0%, #1a0a2e 100%)'}}>
                            {room.image_url ? (
                                <img src={`${API_URL}${room.image_url}`} alt={`Room ${room.room_number}`} className="w-full h-full object-cover opacity-90" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-7xl font-bold" style={{color: '#ff6b6b', opacity: 0.5}}>{room.room_number}</p>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: '#8b0000', color: '#fff'}}>{room.type}</span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8">
                            {/* Title and Price */}
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold" style={{color: '#d0d0d0'}}>
                                        {room.type} Room {room.room_number}
                                    </h1>
                                    <p className="text-sm mt-1" style={{color: '#a0a0a0'}}>Capacity: {room.capacity || 2} guests</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold" style={{color: '#ff6b6b'}}>
                                        ${parseFloat(room.price || 0).toFixed(0)}
                                    </p>
                                    <p style={{color: '#c0c0c0'}}>per night</p>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="mb-6">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-medium ${
                                        room.status === 'available'
                                            ? "bg-emerald-900 text-emerald-200"
                                            : "bg-red-900 text-red-200"
                                    }`}
                                >
                                    <span className={`mr-2 h-2 w-2 rounded-full ${room.status === 'available' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    {room.status === 'available' ? "Available for Booking" : "Currently " + (room.status || 'Unavailable')}
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
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Capacity</p>
                                    <p className="text-2xl font-bold" style={{color: '#ff6b6b'}}>{room.capacity || 2}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Type</p>
                                    <p className="text-lg font-semibold" style={{color: '#d0d0d0'}}>{room.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Status</p>
                                    <p className="text-lg font-semibold capitalize" style={{color: room.status === 'available' ? '#86efac' : '#fca5a5'}}>{room.status || 'available'}</p>
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
                                    disabled={room.status !== 'available'}
                                    className="flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                    style={{backgroundColor: room.status === 'available' ? '#8b0000' : '#666', color: '#fff'}}
                                >
                                    {room.status === 'available' ? "Book This Room" : "Room Unavailable"}
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
