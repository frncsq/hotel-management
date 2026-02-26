import { useState } from 'react'
import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');

	const API_URL = import.meta.env.VITE_API_URL || "https://to-do-list-1-c0qq.onrender.com";
 

	const handleLogin = async () => {
		try {
			const response = await axios.post(`${API_URL}/login`, {
				username: username,
				password: password
			});
			
			if (response.data.success) {
				setMessage('Login successful!');
				setMessageType('success');
				setTimeout(() => {
					navigate('/home');
				}, 500);
			}
			else {
				setMessage(response.data.message);
				setMessageType('error');
			}
		} catch (error) {
			if (error.response?.status === 401) {
				setMessage('Invalid username or password');
				setMessageType('error');
			} else {
				setMessage('Invalid credentials.');
				setMessageType('error');
			}
		}
	};

	return (
		<div className="haunted-background min-h-screen flex items-center justify-center py-10 px-3 sm:px-5 lg:px-7">
            <div className="haunted-card max-w-sm w-full bg-gray-900 rounded-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-red-900 via-black to-red-900"></div>
				<div className="p-6 md:p-8 relative z-10">
					<h2 className="haunted-title text-4xl mb-2 text-center">🦇 TRANSYLVANIA 🦇</h2>
					<h3 className="haunted-subtitle text-sm font-medium mb-6 text-center">Enter the Dark Domain</h3>
					{message && (
						<div className={`haunted-message mb-6 p-4 rounded-lg text-center font-medium ${
							messageType === 'success' 
								? 'bg-green-900 text-green-200 border border-green-700' 
								: 'bg-red-900 text-red-200 border border-red-700'
						}`}>
							{message}
						</div>
					)}
					<form className="space-y-4">
						<div className="haunted-form-group">
							<label className="haunted-label block text-sm font-semibold mb-1">🧛 Creature Name</label>
							<input type="text" 
							value={username} 
							onChange={(e) => setUsername(e.target.value)} 
							required 
							placeholder='Enter your vampiric identity'
							className="haunted-input mt-1 block w-full px-4 py-2 rounded-lg focus:outline-none transition" />
						</div>

						<div className="haunted-form-group">
							<label className="haunted-label block text-sm font-semibold mb-1">🔐 Unholy Secret</label>
							<input type="password" 
							value ={password}
							onChange={(e) => setPassword(e.target.value)} 
							required
							placeholder='Speak your dark incantation'
							className="haunted-input mt-1 block w-full px-4 py-2 rounded-lg focus:outline-none transition" />
						</div>

						<div className="haunted-form-group flex items-center justify-between text-sm">
							<label className="flex items-center">
								<input type="checkbox" className="h-4 w-4 rounded" style={{accentColor: '#ff6b6b'}} />
								<span className="ml-2 text-gray-300">Haunt this device</span>
							</label>
							<a href="#" className="haunted-link hover:underline">Curse forgotten?</a>
						</div>

						<div className="haunted-form-group">
							<button type="button" onClick={handleLogin} className="haunted-button w-full py-3 px-4 rounded-lg font-semibold">Enter the Castle</button>
						</div>
					</form>

					<div className="haunted-form-group mt-6 text-center">
						<p className="text-sm text-gray-400">
							Not a resident of darkness?{" "}
							<button
								type="button"
								onClick={() => navigate('/register')}
								className="haunted-link font-semibold bg-none border-none cursor-pointer"
							>
								Join the Undead
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login