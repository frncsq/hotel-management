import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Register() {
	const [name, setName] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');
	const navigate = useNavigate();

	const API_URL = import.meta.env.VITE_API_URL;

	const handleRegister = async () => {
		if (!name || !username || !password || !confirm) {
			setMessage('All fields are required');
			setMessageType('error');
			return;
		}

		try {
			const response = await axios.post(`${API_URL}/register`, {
				name: name,
				username: username,
				password: password,
				confirm: confirm
			});
			
			if (response.data.success) {
				setMessage('Registration successful! Redirecting to login...');
				setMessageType('success');
				setTimeout(() => {
					navigate('/');
				}, 2000);
			}
			else {
				setMessage(response.data.message || 'Registration failed');
				setMessageType('error');
			}
		} catch (error) {
			if (error.response?.status === 401) {
				setMessage(error.response.data.message || 'Passwords do not match');
				setMessageType('error');
			} else {
				setMessage('An error occurred during registration');
				setMessageType('error');
			}
		}
	};

	const handleLoginLink = () => {
		navigate('/');
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50 py-10 px-3 sm:px-5 lg:px-7">
			<div className="max-w-sm w-full bg-white shadow-2xl rounded-xl overflow-hidden border border-yellow-200">
				<div className="h-1 hotel-gradient"></div>
				<div className="p-6 md:p-8">
					<h2 className="text-3xl font-bold mb-2 text-center" style={{color: '#1a3a52'}}>Create Account</h2>
					<h3 className="text-sm font-medium mb-6 text-center" style={{color: '#8b7355'}}>Join our hotel system</h3>
					{message && (
						<div className={`mb-6 p-4 rounded-lg text-center font-medium ${
							messageType === 'success' 
								? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
								: 'bg-red-100 text-red-800 border border-red-300'
						}`}>
							{message}
						</div>
					)}
					<form className="space-y-4">
						<div>
							<label className="block text-sm font-semibold" style={{color: '#1a3a52'}}>Name</label>
							<input type="text" 
						value={name} 
						onChange={(e) => setName(e.target.value)} 
						required 
						placeholder='Enter your full name'
							className="mt-1 block w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
							style={{borderColor: '#d4af37', color: '#1a3a52'}} />
						</div>
						<div>
							<label className="block text-sm font-semibold" style={{color: '#1a3a52'}}>Username</label>
							<input type="text" 
							value={username} 
							onChange={(e) => setUsername(e.target.value)} 
							required 
							placeholder='Choose a username'
							className="mt-1 block w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
							style={{borderColor: '#d4af37', color: '#1a3a52'}} />
						</div>

						<div>
							<label className="block text-sm font-semibold" style={{color: '#1a3a52'}}>Password</label>
							<input type="password" 
							value={password}
							onChange={(e) => setPassword(e.target.value)} 
							required
							placeholder='Enter a password'
							className="mt-1 block w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
							style={{borderColor: '#d4af37', color: '#1a3a52'}} />
						</div>
						<div>
							<label className="block text-sm font-semibold" style={{color: '#1a3a52'}}>Confirm Password</label>
							<input type="password" 
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)} 
						placeholder='Confirm your password'
						className="mt-1 block w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
						style={{borderColor: '#d4af37', color: '#1a3a52'}}
						required />
						</div>

						<div>
							<button type="button" onClick={handleRegister} className="w-full py-2 px-4 text-white rounded-lg hover:shadow-lg transition font-semibold" style={{backgroundColor: '#1a3a52'}}>Create Account</button>
						</div>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm" style={{color: '#8b7355'}}>Already have an account? <button onClick={handleLoginLink} className="hover:underline font-semibold bg-none border-none cursor-pointer transition" style={{color: '#d4af37'}}>Sign in</button></p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Register