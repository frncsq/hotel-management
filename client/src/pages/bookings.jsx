import Header from "../components/header"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useSearchParams } from "react-router-dom"
import ConfirmModal from "../components/confirm-modal"

function Bookings() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId")
    
    // Modal state for cancellation
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [bookingToCancel, setBookingToCancel] = useState(null)
    
    // Booking form state
    const [bookingForm, setBookingForm] = useState({
        checkInDate: "",
        checkOutDate: "",
        adults: 4,
        children: 1,
        numberOfRooms: 2,
        fullName: "",
        email: "",
        phone: "",
        specialRequests: "",
        paymentMethod: "credit-card",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
    })
    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [bookingError, setBookingError] = useState("")
    const [roomDetails, setRoomDetails] = useState(null)
    const [agreeTerms, setAgreeTerms] = useState(false)
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
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
            const response = await axios.get(`${API_URL}/rooms/${roomId}`)
            if (response.data) {
                setRoomDetails(response.data)
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


    const fetchBookings = async (retries = 3) => {
        const token = localStorage.getItem('token')
        if (!token && retries === 3) {
            setError('Please log in to view bookings')
            navigate('/login')
            return
        }

        try {
            setLoading(true)
            setError("")

            const response = await axios.get(`${API_URL}/reservations`, {
                withCredentials: true,
                timeout: 10000,
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            })

            if (Array.isArray(response.data)) {
                const mappedBookings = response.data.map(b => ({
                    id: b.id,
                    roomNumber: b.room_number,
                    roomType: b.type || `Room ${b.room_number}`,
                    status: b.status,
                    checkInDate: b.check_in_date,
                    checkOutDate: b.check_out_date,
                    totalPrice: parseFloat(b.total_amount),
                    roomImage: b.image_url ? `${API_URL}${b.image_url}` : null,
                    guests: b.adult_count + b.children_count
                }))
                setBookings(mappedBookings)
                return true
            } else {
                throw new Error(response.data.message || 'Failed to load bookings')
            }
        } catch (error) {
            console.error(`Fetch attempt ${4-retries} failed:`, {
                url: `${API_URL}/reservations`,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            })

            let errorMsg = 'Error loading bookings'
            if (error.response) {
                errorMsg = error.response.data?.message || `Server error: ${error.response.status}`
            } else if (error.request) {
                errorMsg = 'No response from server. Check if backend is running on localhost:3000'
            } else {
                errorMsg = error.message
            }

            if (retries > 1) {
                console.log(`Retrying in ${Math.pow(2, 3-retries)}s... (${retries-1} attempts left)`)
                setTimeout(() => fetchBookings(retries - 1), Math.pow(2, 3-retries) * 1000)
                return false
            } else {
                // Final fallback: mock data
                console.warn('All retries failed. Using mock data.')
                setBookings(MOCK_BOOKINGS)
                setError(`${errorMsg} (using demo data)`)
                return false
            }
        } finally {
            setLoading(false)
        }
    }

    const MOCK_BOOKINGS = [
        {
            id: 1,
            roomNumber: '101',
            roomType: 'Deluxe Single',
            status: 'confirmed',
            checkInDate: '2024-12-15',
            checkOutDate: '2024-12-18',
            totalPrice: 360.00,
            guests: 1
        },
        {
            id: 2,
            roomNumber: '205',
            roomType: 'Luxury Suite',
            status: 'pending',
            checkInDate: '2024-12-20',
            checkOutDate: '2024-12-25',
            totalPrice: 1200.00,
            guests: 2
        }
    ]

    const triggerCancelBooking = (bookingId) => {
        setBookingToCancel(bookingId)
        setCancelModalOpen(true)
    }

    const executeCancelBooking = async () => {
        setCancelModalOpen(false)
        if (!bookingToCancel) return

        try {
            const response = await axios.delete(
                `${API_URL}/reservations/${bookingToCancel}`,
                { 
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            )
            if (response.status === 200) {
                setBookings(bookings.map(b => 
                    b.id === bookingToCancel ? { ...b, status: 'cancelled' } : b
                ))
            } else {
                setError("Failed to cancel booking")
            }
        } catch (error) {
            console.error("Error cancelling booking:", error)
            setError("Error cancelling booking")
        } finally {
            setBookingToCancel(null)
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

        if (!bookingForm.fullName || !bookingForm.email || !bookingForm.phone) {
            setBookingError("Please fill in guest information")
            return
        }

        if (!agreeTerms) {
            setBookingError("Please agree to terms and conditions")
            return
        }

        try {
            setBookingLoading(true)
            setBookingError("")
            
            const nights = calculateNights(bookingForm.checkInDate, bookingForm.checkOutDate)
            const totalPrice = nights * roomDetails.price

            const token = localStorage.getItem('token')
            const response = await axios.post(
                `${API_URL}/reservations`,
                {
                    room_id: roomDetails.id,
                    check_in_date: bookingForm.checkInDate,
                    check_out_date: bookingForm.checkOutDate,
                    total_price: totalPrice
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.data) {
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
            [name]: (name === "adults" || name === "children" || name === "numberOfRooms") ? parseInt(value) : value
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
        
        // Build the room image URL from the database
        const roomImageUrl = roomDetails.image_url ? `${API_URL}${roomDetails.image_url}` : null
        const roomPrice = parseFloat(roomDetails.price || 0)


        return (
            <>
                <Header />
                <main className="min-h-screen py-8" style={{ backgroundColor: '#0a0a15' }}>
                    <div className="max-w-6xl mx-auto px-4">
                        {/* Modal Dialog */}
                        <div className="rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'rgba(20, 20, 40, 0.95)', maxWidth: '1200px', margin: '0 auto' }}>
                            {/* Modal Header */}
                            <div className="px-8 py-6 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #8b0000 0%, #5c0000 100%)' }}>
                                <h2 className="text-3xl font-bold text-white">Book Your Room</h2>
                                <button
                                    onClick={() => navigate("/home")}
                                    className="text-white text-3xl font-light hover:opacity-80 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Content - Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                                {/* LEFT COLUMN - Room Details */}
                                <div>
                                    {/* Room Image */}
                                    <div className="mb-6 rounded-lg overflow-hidden relative" style={{ backgroundColor: 'rgba(40, 40, 60, 0.8)' }}>
                                        {roomImageUrl ? (
                                            <img src={roomImageUrl} alt={`Room ${roomDetails.room_number}`} className="w-full h-64 object-cover" />
                                        ) : (
                                            <div className="w-full h-64 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #2a0a0a 0%, #1a0a2e 100%)'}}>
                                                <span className="text-6xl font-bold" style={{color: '#ff6b6b', opacity: 0.4}}>{roomDetails.room_number}</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold" style={{background: '#8b0000', color: '#fff'}}>
                                            {roomDetails.type}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#d0d0d0' }}>
                                        {roomDetails.type} Room — {roomDetails.room_number}
                                    </h3>
                                    <p className="text-xl font-semibold mb-6" style={{ color: '#ff6b6b' }}>
                                        ${roomPrice.toFixed(0)} / Night
                                    </p>

                                    {/* Room Details Grid */}
                                    <div className="space-y-3 mb-6 pb-6" style={{ borderBottomColor: 'rgba(139, 0, 0, 0.3)', borderBottomWidth: '1px' }}>
                                        <div className="flex justify-between items-center">
                                            <span style={{ color: '#c0c0c0' }} className="text-sm">👥 Capacity:</span>
                                            <span style={{ color: '#d0d0d0' }} className="font-semibold">{roomDetails.capacity || 2} guests</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span style={{ color: '#c0c0c0' }} className="text-sm">🏷️ Type:</span>
                                            <span style={{ color: '#d0d0d0' }} className="font-semibold">{roomDetails.type}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span style={{ color: '#c0c0c0' }} className="text-sm">📋 Status:</span>
                                            <span style={{ color: roomDetails.status === 'available' ? '#86efac' : '#fca5a5' }} className="font-semibold capitalize">{roomDetails.status || 'available'}</span>
                                        </div>
                                    </div>



                                    {/* Additional Info */}
                                    <div className="mt-6 p-4 rounded-lg text-sm" style={{ backgroundColor: 'rgba(139, 0, 0, 0.1)', borderColor: 'rgba(139, 0, 0, 0.3)', borderWidth: '1px' }}>
                                        <p style={{ color: '#c0c0c0' }}>
                                            <strong>Check-in:</strong> 3 PM<br />
                                            <strong>Check-out:</strong> 11 AM<br />
                                            <strong>Cancellation:</strong> Free cancellation up to 48 hours before arrival. No pets.
                                        </p>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN - Booking Form */}
                                <div className="max-h-96 md:max-h-none md:overflow-y-auto">
                                    {bookingSuccess && (
                                        <div className="mb-6 p-4 rounded-lg text-center" style={{backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e', border: '1px solid #22c55e', color: '#86efac'}}>
                                            <p className="font-semibold">✓ Booking created successfully!</p>
                                            <p className="text-sm">Redirecting to your bookings...</p>
                                        </div>
                                    )}

                                    {bookingError && (
                                        <div className="mb-6 p-4 rounded-lg" style={{borderColor: '#ff6b6b', backgroundColor: 'rgba(139, 0, 0, 0.2)', color: '#ff6b6b', border: '1px solid #ff6b6b'}}>
                                            {bookingError}
                                        </div>
                                    )}

                                    {!bookingSuccess && (
                                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                                            {/* Stay Information */}
                                            <div>
                                                <h4 className="font-semibold mb-3" style={{ color: '#d0d0d0' }}>Stay Information</h4>
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <div>
                                                        <label className="block text-xs mb-2" style={{color: '#c0c0c0'}}>Check-in</label>
                                                        <input
                                                            type="date"
                                                            name="checkInDate"
                                                            value={bookingForm.checkInDate}
                                                            onChange={handleFormChange}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            required
                                                            className="w-full rounded px-3 py-2 text-sm"
                                                            style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs mb-2" style={{color: '#c0c0c0'}}>Check-out</label>
                                                        <input
                                                            type="date"
                                                            name="checkOutDate"
                                                            value={bookingForm.checkOutDate}
                                                            onChange={handleFormChange}
                                                            min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                                                            required
                                                            className="w-full rounded px-3 py-2 text-sm"
                                                            style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs mb-2" style={{color: '#c0c0c0'}}>Adults</label>
                                                        <select
                                                            name="adults"
                                                            value={bookingForm.adults}
                                                            onChange={handleFormChange}
                                                            className="w-full rounded px-3 py-2 text-sm"
                                                            style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                        >
                                                            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs mb-2" style={{color: '#c0c0c0'}}>Children</label>
                                                        <select
                                                            name="children"
                                                            value={bookingForm.children}
                                                            onChange={handleFormChange}
                                                            className="w-full rounded px-3 py-2 text-sm"
                                                            style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                        >
                                                            {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs mb-2" style={{color: '#c0c0c0'}}>Rooms</label>
                                                        <select
                                                            name="numberOfRooms"
                                                            value={bookingForm.numberOfRooms}
                                                            onChange={handleFormChange}
                                                            className="w-full rounded px-3 py-2 text-sm"
                                                            style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                        >
                                                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pricing Summary */}
                                            {nights > 0 && (
                                                <div className="p-3 rounded" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)', borderWidth: '1px'}}>
                                                    <h4 className="font-semibold mb-3 text-sm" style={{ color: '#d0d0d0' }}>Pricing Summary</h4>
                                                    <div className="space-y-2 text-xs">
                                                        <div className="flex justify-between">
                                                            <span style={{color: '#c0c0c0'}}>Room Price (${roomPrice} x {nights} nights):</span>
                                                            <span style={{color: '#d0d0d0'}} className="font-semibold">${roomPrice * nights}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span style={{color: '#c0c0c0'}}>Taxes & Fees:</span>
                                                            <span style={{color: '#d0d0d0'}} className="font-semibold">${Math.round(roomPrice * nights * 0.1)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span style={{color: '#c0c0c0'}}>Promo Code:</span>
                                                            <span style={{color: '#ff6b6b'}} className="font-semibold">[DISCOUNT10] -$100</span>
                                                        </div>
                                                        <div className="flex justify-between pt-2 border-t" style={{ borderTopColor: 'rgba(59, 130, 246, 0.3)' }}>
                                                            <span style={{color: '#c0c0c0'}} className="font-semibold">Total Price:</span>
                                                            <span style={{color: '#ff6b6b'}} className="text-lg font-bold">${totalPrice}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Guest Information */}
                                            <div>
                                                <h4 className="font-semibold mb-3 text-sm" style={{ color: '#d0d0d0' }}>Guest Information</h4>
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        name="fullName"
                                                        placeholder="Full Name"
                                                        value={bookingForm.fullName}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full rounded px-3 py-2 text-sm placeholder-gray-500"
                                                        style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                    />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        placeholder="Email Address"
                                                        value={bookingForm.email}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full rounded px-3 py-2 text-sm placeholder-gray-500"
                                                        style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                    />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        placeholder="Phone Number"
                                                        value={bookingForm.phone}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full rounded px-3 py-2 text-sm placeholder-gray-500"
                                                        style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                    />
                                                </div>
                                            </div>

                                            {/* Special Requests */}
                                            <div>
                                                <label className="block text-xs mb-2 font-semibold" style={{color: '#c0c0c0'}}>Special Requests (optional)</label>
                                                <textarea
                                                    name="specialRequests"
                                                    value={bookingForm.specialRequests}
                                                    onChange={handleFormChange}
                                                    placeholder="Special Requests"
                                                    rows="3"
                                                    className="w-full rounded px-3 py-2 text-sm placeholder-gray-500 resize-none"
                                                    style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                />
                                            </div>

                                            {/* Payment Method */}
                                            <div>
                                                <h4 className="font-semibold mb-3 text-sm" style={{ color: '#d0d0d0' }}>Payment Method</h4>
                                                <div className="flex gap-2 mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setBookingForm({...bookingForm, paymentMethod: 'credit-card'})}
                                                        className="flex-1 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                                                        style={{ backgroundColor: bookingForm.paymentMethod === 'credit-card' ? '#3b82f6' : 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000' }}
                                                    >
                                                    💳 Credit Card
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setBookingForm({...bookingForm, paymentMethod: 'paypal'})}
                                                        className="flex-1 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                                                        style={{ backgroundColor: bookingForm.paymentMethod === 'paypal' ? '#3b82f6' : 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000' }}
                                                    >
                                                    🅿️ PayPal
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setBookingForm({...bookingForm, paymentMethod: 'hotel'})}
                                                        className="flex-1 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                                                        style={{ backgroundColor: bookingForm.paymentMethod === 'hotel' ? '#3b82f6' : 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000' }}
                                                    >
                                                    🏨 Pay at Hotel
                                                    </button>
                                                </div>

                                                {bookingForm.paymentMethod === 'credit-card' && (
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            name="cardNumber"
                                                            placeholder="Card Number"
                                                            value={bookingForm.cardNumber}
                                                            onChange={handleFormChange}
                                                            className="w-full rounded px-3 py-2 text-sm placeholder-gray-500"
                                                            style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                        />
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input
                                                                type="text"
                                                                name="expiryDate"
                                                                placeholder="Expiry Date (MM/YY)"
                                                                value={bookingForm.expiryDate}
                                                                onChange={handleFormChange}
                                                                className="rounded px-3 py-2 text-sm placeholder-gray-500"
                                                                style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                            />
                                                            <input
                                                                type="text"
                                                                name="cvv"
                                                                placeholder="CVV"
                                                                value={bookingForm.cvv}
                                                                onChange={handleFormChange}
                                                                className="rounded px-3 py-2 text-sm placeholder-gray-500"
                                                                style={{borderColor: '#8b0000', backgroundColor: 'rgba(40, 40, 60, 0.8)', color: '#d0d0d0', border: '1px solid #8b0000'}}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Terms & Conditions */}
                                            <div className="flex items-start gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={agreeTerms}
                                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                                    className="mt-1"
                                                    style={{ accentColor: '#3b82f6' }}
                                                />
                                                <label style={{color: '#c0c0c0'}}>
                                                    I agree to the <a href="#" style={{color: '#3b82f6', textDecoration: 'underline'}}>Terms & Conditions</a> and <a href="#" style={{color: '#3b82f6', textDecoration: 'underline'}}>Privacy Policy</a>
                                                </label>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate("/home")}
                                                    className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition"
                                                    style={{borderColor: '#8b0000', color: '#ff6b6b', border: '2px solid #8b0000', backgroundColor: 'transparent' }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={bookingLoading || !agreeTerms}
                                                    className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    style={{backgroundColor: '#3b82f6'}}
                                                >
                                                    {bookingLoading ? "Booking..." : "Book Now"}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
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
        <div className="mb-6 p-6 rounded-xl" style={{borderColor: '#ff6b6b', backgroundColor: 'rgba(139, 0, 0, 0.15)', color: '#ff6b6b', border: '2px solid #ff6b6b'}}>
            <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl mt-0.5">⚠️</div>
                <div>
                    <p className="font-semibold text-lg mb-1">{error}</p>
                    <p className="text-sm opacity-90">API: {API_URL}</p>
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <button
                    onClick={() => fetchBookings()}
                    className="px-4 py-2 rounded-lg font-semibold text-white transition"
                    style={{ backgroundColor: '#8b0000' }}
                >
                    🔄 Retry
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 rounded-lg font-semibold transition"
                    style={{ color: '#ff6b6b', border: '1px solid #ff6b6b' }}
                >
                    Check Login
                </button>
            </div>
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
                                                    onClick={() => triggerCancelBooking(booking.id)}
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

            <ConfirmModal 
                isOpen={cancelModalOpen}
                message="Guuurrgh... You want to destroy this booking...? Brrraaiiinss... it cannot be undone..."
                onConfirm={executeCancelBooking}
                onCancel={() => { setCancelModalOpen(false); setBookingToCancel(null); }}
                confirmText="Grrr... Destroy"
                cancelText="Urgh... Nevermind"
            />
        </>
    )
}

export default Bookings
