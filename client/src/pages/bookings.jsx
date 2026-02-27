import Header from "../components/header"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useSearchParams } from "react-router-dom"

function Bookings() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId")
    
    // Booking form state
    const [bookingForm, setBookingForm] = useState({
        checkInDate: "",
        checkOutDate: "",
        guests: 1
    })
    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [bookingError, setBookingError] = useState("")
    const [roomDetails, setRoomDetails] = useState(null)
    
    const API_URL = import.meta.env.VITE_API_URL
    const navigate = useNavigate()

    useEffect(() => {
        if (roomId) {
            fetchRoomDetails()
        } else {
            fetchBookings()
        }
    }, [roomId])

    // Fetch room details if booking a specific room
    const fetchRoomDetails = async () => {
        try {
            setLoading(true)
            setError("")
            
            // Try API first
            try {
                const response = await axios.get(`${API_URL}/rooms/${roomId}`)
                if (response.data.success) {
                    setRoomDetails(response.data.room)
                    return
                }
            } catch (err) {
                console.error("API error:", err)
            }

            // Fallback to mock data
            const mockRoom = getMockRoomDetail(roomId)
            if (mockRoom) {
                setRoomDetails(mockRoom)
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

    // Mock room data for fallback
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

    const fetchBookings = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.get(`${API_URL}/get-bookings`, {
                withCredentials: true
            })
            if (response.data.success) {
                setBookings(response.data.bookings || [])
            } else {
                setError("Failed to load bookings")
            }
        } catch (error) {
            console.error("Error fetching bookings:", error)
            setError("Error loading bookings. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return

        try {
            const response = await axios.post(
                `${API_URL}/cancel-booking/${bookingId}`,
                {},
                { withCredentials: true }
            )
            if (response.data.success) {
                setBookings(bookings.map(b => 
                    b.id === bookingId ? { ...b, status: 'cancelled' } : b
                ))
            } else {
                setError("Failed to cancel booking")
            }
        } catch (error) {
            console.error("Error cancelling booking:", error)
            setError("Error cancelling booking")
        }
    }

    const filteredBookings = statusFilter === 'all' 
        ? bookings 
        : bookings.filter(b => b.status?.toLowerCase() === statusFilter.toLowerCase())

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const calculateNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0
        const start = new Date(checkIn)
        const end = new Date(checkOut)
        const diffMs = end - start
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    }

    // Handle booking form submission
    const handleBookingSubmit = async (e) => {
        e.preventDefault()
        
        if (!bookingForm.checkInDate || !bookingForm.checkOutDate) {
            setBookingError("Please select both check-in and check-out dates")
            return
        }

        if (new Date(bookingForm.checkInDate) >= new Date(bookingForm.checkOutDate)) {
            setBookingError("Check-out date must be after check-in date")
            return
        }

        if (bookingForm.guests < 1 || bookingForm.guests > roomDetails.maxGuests) {
            setBookingError(`Guests must be between 1 and ${roomDetails.maxGuests}`)
            return
        }

        try {
            setBookingLoading(true)
            setBookingError("")
            
            const nights = calculateNights(bookingForm.checkInDate, bookingForm.checkOutDate)
            const totalPrice = nights * roomDetails.price

            const response = await axios.post(
                `${API_URL}/create-booking`,
                {
                    roomId: roomDetails.id,
                    roomNumber: roomDetails.roomNumber,
                    roomType: roomDetails.type,
                    checkInDate: bookingForm.checkInDate,
                    checkOutDate: bookingForm.checkOutDate,
                    guests: bookingForm.guests,
                    pricePerNight: roomDetails.price,
                    totalPrice: totalPrice,
                    nights: nights
                },
                { withCredentials: true }
            )

            if (response.data.success) {
                setBookingSuccess(true)
                setBookingForm({ checkInDate: "", checkOutDate: "", guests: 1 })
                
                // Redirect to bookings after 2 seconds
                setTimeout(() => {
                    navigate("/bookings")
                }, 2000)
            } else {
                setBookingError(response.data.message || "Failed to create booking")
            }
        } catch (error) {
            console.error("Error creating booking:", error)
            setBookingError(error.response?.data?.message || "Error creating booking. Please try again.")
        } finally {
            setBookingLoading(false)
        }
    }

    // Handle form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target
        setBookingForm(prev => ({
            ...prev,
            [name]: name === "guests" ? parseInt(value) : value
        }))
        setBookingError("")
    }

    // Calculate total price and nights
    const calculateTotalPrice = () => {
        if (!bookingForm.checkInDate || !bookingForm.checkOutDate) return 0
        const nights = calculateNights(bookingForm.checkInDate, bookingForm.checkOutDate)
        return nights * (roomDetails?.price || 0)
    }

    // Show booking form if roomId is present
    if (roomId && roomDetails) {
        const nights = calculateNights(bookingForm.checkInDate, bookingForm.checkOutDate)
        const totalPrice = calculateTotalPrice()

        return (
            <>
                <Header />
                <main className="min-h-screen" style={{ backgroundColor: '#0a0a15' }}>
                    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate("/home")}
                            className="mb-6 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
                            style={{backgroundColor: '#8b0000'}}
                        >
                            ← Back to Rooms
                        </button>

                        {/* Page Title */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold" style={{ color: '#d0d0d0', textShadow: '0 0 10px rgba(255, 107, 107, 0.3)' }}>
                                Book Room {roomDetails.roomNumber}
                            </h1>
                            <p style={{color: '#c0c0c0', textShadow: '0 0 10px rgba(255, 107, 107, 0.3)'}} className="mt-2">{roomDetails.type} Room - ${roomDetails.price}/night</p>
                        </div>

                        {/* Booking Form Card */}
                        <div className="rounded-3xl border-2 shadow-md p-8" style={{borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)'}}>
                            {bookingSuccess && (
                                <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e', border: '1px solid #22c55e', color: '#86efac'}}>
                                    <p className="font-semibold">✓ Booking created successfully!</p>
                                    <p className="text-sm">Redirecting to your bookings...</p>
                                </div>
                            )}

                            {bookingError && (
                                <div className="mb-6 p-4 rounded-lg" style={{borderColor: '#ff6b6b', backgroundColor: 'rgba(139, 0, 0, 0.2)', color: '#ff6b6b', border: '1px solid #ff6b6b'}}>
                                    {bookingError}
                                </div>
                            )}

                            {loading && (
                                <div className="text-center py-12">
                                    <div className="inline-block">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ff6b6b' }}></div>
                                    </div>
                                    <p style={{ color: '#c0c0c0' }} className="mt-4">Loading room details...</p>
                                </div>
                            )}

                            {!loading && (
                                <form onSubmit={handleBookingSubmit}>
                                    {/* Room Summary */}
                                    <div className="mb-8 pb-8" style={{borderBottomColor: 'rgba(139, 0, 0, 0.3)', borderBottomWidth: '1px'}}>
                                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#d0d0d0' }}>Room Summary</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Room Number</p>
                                                <p className="text-lg font-semibold" style={{color: '#ff6b6b'}}>{roomDetails.roomNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Room Type</p>
                                                <p className="text-lg font-semibold" style={{color: '#d0d0d0'}}>{roomDetails.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Price/Night</p>
                                                <p className="text-lg font-semibold" style={{color: '#d0d0d0'}}>${roomDetails.price}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Max Guests</p>
                                                <p className="text-lg font-semibold" style={{color: '#d0d0d0'}}>{roomDetails.maxGuests}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Bed Type</p>
                                                <p className="text-lg font-semibold" style={{color: '#d0d0d0'}}>{roomDetails.bedType}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide mb-1" style={{color: '#c0c0c0'}}>Room Size</p>
                                                <p className="text-lg font-semibold" style={{color: '#d0d0d0'}}>{roomDetails.size}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Form Fields */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold mb-6" style={{ color: '#d0d0d0' }}>Booking Details</h3>
                                        
                                        {/* Check-in Date */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium mb-2" style={{color: '#c0c0c0'}}>Check-in Date</label>
                                            <input
                                                type="date"
                                                name="checkInDate"
                                                value={bookingForm.checkInDate}
                                                onChange={handleFormChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                                className="w-full rounded-lg border-2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition"
                                                style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0'}}
                                            />
                                        </div>

                                        {/* Check-out Date */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium mb-2" style={{color: '#c0c0c0'}}>Check-out Date</label>
                                            <input
                                                type="date"
                                                name="checkOutDate"
                                                value={bookingForm.checkOutDate}
                                                onChange={handleFormChange}
                                                min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                                                required
                                                className="w-full rounded-lg border-2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition"
                                                style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0'}}
                                            />
                                        </div>

                                        {/* Number of Guests */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium mb-2" style={{color: '#c0c0c0'}}>Number of Guests</label>
                                            <select
                                                name="guests"
                                                value={bookingForm.guests}
                                                onChange={handleFormChange}
                                                className="w-full rounded-lg border-2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition"
                                                style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0'}}
                                            >
                                                {[...Array(roomDetails.maxGuests)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1} Guest{i === 0 ? '' : 's'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Price Summary */}
                                    {nights > 0 && (
                                        <div className="mb-8 pb-8 rounded-lg p-6" style={{backgroundColor: 'rgba(139, 0, 0, 0.1)', borderColor: 'rgba(139, 0, 0, 0.3)', borderWidth: '1px'}}>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between">
                                                    <span style={{color: '#c0c0c0'}}>Nights:</span>
                                                    <span className="font-semibold" style={{color: '#d0d0d0'}}>{nights} {nights === 1 ? 'night' : 'nights'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span style={{color: '#c0c0c0'}}>Price per night:</span>
                                                    <span className="font-semibold" style={{color: '#d0d0d0'}}>${roomDetails.price}</span>
                                                </div>
                                                <div className="flex justify-between pt-3" style={{borderTopColor: 'rgba(139, 0, 0, 0.3)', borderTopWidth: '1px'}}>
                                                    <span style={{color: '#c0c0c0'}}>Total:</span>
                                                    <span className="text-2xl font-bold" style={{color: '#ff6b6b'}}>${totalPrice}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={bookingLoading || !bookingForm.checkInDate || !bookingForm.checkOutDate}
                                        className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{backgroundColor: '#8b0000'}}
                                    >
                                        {bookingLoading ? "Creating booking..." : `Confirm Booking - $${totalPrice}`}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </main>
            </>
        )
    }

    // Show error if room not found and roomId was provided
    if (roomId && error) {
        return (
            <>
                <Header />
                <main className="min-h-screen" style={{ backgroundColor: '#0a0a15' }}>
                    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12">
                        <button
                            onClick={() => navigate("/home")}
                            className="mb-6 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
                            style={{backgroundColor: '#8b0000'}}
                        >
                            ← Back to Rooms
                        </button>
                        <div className="rounded-3xl border-2 p-8 text-center" style={{borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)', color: '#c0c0c0'}}>
                            <p className="text-lg font-medium">{error}</p>
                        </div>
                    </div>
                </main>
            </>
        )
    }

    // Show existing bookings list when no roomId
    return (
        <>
            <Header />
            <main className="min-h-screen" style={{ backgroundColor: '#0a0a15' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold" style={{ color: '#d0d0d0', textShadow: '0 0 10px rgba(255, 107, 107, 0.3)' }}>
                            My Bookings
                        </h1>
                        <p style={{color: '#c0c0c0', textShadow: '0 0 10px rgba(255, 107, 107, 0.3)'}} className="mt-2">View and manage all your haunted chambers</p>
                    </div>

                    {/* Status Filter */}
                    <div className="mb-8 flex gap-3 flex-wrap">
                        {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                                    statusFilter === status
                                        ? 'text-white'
                                        : 'text-gray-300'
                                }`}
                                style={
                                    statusFilter === status
                                        ? { backgroundColor: '#8b0000' }
                                        : { borderColor: 'rgba(139, 0, 0, 0.6)', backgroundColor: 'rgba(20, 20, 40, 0.9)' }
                                }
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg" style={{borderColor: '#ff6b6b', backgroundColor: 'rgba(139, 0, 0, 0.2)', color: '#ff6b6b', border: '1px solid #ff6b6b'}}>
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ff6b6b' }}></div>
                            </div>
                            <p style={{ color: '#c0c0c0' }} className="mt-4">Loading bookings...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredBookings.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#d0d0d0' }}>
                                No bookings found
                            </h2>
                            <p style={{ color: '#c0c0c0' }} className="mb-6">
                                {statusFilter === 'all'
                                    ? "You haven't made any bookings yet."
                                    : `No ${statusFilter} bookings.`}
                            </p>
                            <button
                                onClick={() => navigate('/home')}
                                className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                                style={{ backgroundColor: '#8b0000' }}
                            >
                                Browse Rooms
                            </button>
                        </div>
                    )}

                    {/* Bookings Grid */}
                    {!loading && filteredBookings.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border-t-4"
                                    style={{ borderColor: '#ff6b6b', backgroundColor: 'rgba(20, 20, 40, 0.9)', borderWidth: '2px', borderTopWidth: '4px', borderTopColor: '#ff6b6b' }}
                                >
                                    {/* Room Image */}
                                    {booking.roomImage && (
                                        <img
                                            src={booking.roomImage}
                                            alt={booking.roomType}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}

                                    {/* Card Content */}
                                    <div className="p-6">
                                        {/* Room Type & Status */}
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-bold" style={{ color: '#d0d0d0' }}>
                                                {booking.roomType || 'Room Booking'}
                                            </h3>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#8b0000', color: '#fff' }}>
                                                {booking.status || 'unknown'}
                                            </span>
                                        </div>

                                        {/* Booking Dates */}
                                        <div className="mb-4 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span style={{ color: '#c0c0c0' }}>Check-in:</span>
                                                <span className="font-semibold" style={{ color: '#d0d0d0' }}>
                                                    {formatDate(booking.checkInDate)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: '#c0c0c0' }}>Check-out:</span>
                                                <span className="font-semibold" style={{ color: '#d0d0d0' }}>
                                                    {formatDate(booking.checkOutDate)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between pt-2" style={{ borderTopColor: 'rgba(139, 0, 0, 0.3)', borderTopWidth: '1px' }}>
                                                <span style={{ color: '#c0c0c0' }}>Duration:</span>
                                                <span className="font-semibold" style={{ color: '#d0d0d0' }}>
                                                    {calculateNights(booking.checkInDate, booking.checkOutDate)} nights
                                                </span>
                                            </div>
                                        </div>

                                        {/* Guests & Room Info */}
                                        <div className="mb-4 space-y-1 text-sm pt-3" style={{ borderTopColor: 'rgba(139, 0, 0, 0.3)', borderTopWidth: '1px' }}>
                                            {booking.guests && (
                                                <div className="flex justify-between">
                                                    <span style={{ color: '#c0c0c0' }}>Guests:</span>
                                                    <span className="font-semibold" style={{ color: '#d0d0d0' }}>{booking.guests}</span>
                                                </div>
                                            )}
                                            {booking.roomNumber && (
                                                <div className="flex justify-between">
                                                    <span style={{ color: '#c0c0c0' }}>Room #:</span>
                                                    <span className="font-semibold" style={{ color: '#d0d0d0' }}>{booking.roomNumber}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="mb-4 pb-3" style={{ borderBottomColor: 'rgba(139, 0, 0, 0.3)', borderBottomWidth: '1px' }}>
                                            <div className="flex justify-between items-center">
                                                <span style={{ color: '#c0c0c0' }}>Total Price:</span>
                                                <span className="text-2xl font-bold" style={{ color: '#ff6b6b' }}>
                                                    ${booking.totalPrice?.toFixed(2) || booking.price?.toFixed(2) || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => navigate(`/bookings/${booking.id}`)}
                                                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                                                style={{ backgroundColor: '#8b0000' }}
                                            >
                                                Details
                                            </button>
                                            {booking.status?.toLowerCase() !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-80"
                                                    style={{ color: '#ff6b6b', borderColor: '#ff6b6b', borderWidth: '2px' }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>

                                        {/* Booking Number */}
                                        {booking.bookingNumber && (
                                            <p style={{ color: '#808080' }} className="text-xs text-center mt-3">
                                                Booking #: {booking.bookingNumber}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}

export default Bookings
