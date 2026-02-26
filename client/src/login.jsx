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
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50 py-10 px-3 sm:px-5 lg:px-7">
            <div className="max-w-sm w-full bg-white shadow-2xl rounded-xl overflow-hidden border border-yellow-200">
                <div className="h-1 hotel-gradient"></div>
				<div className="p-6 md:p-8">
					<h2 className="text-3xl font-bold mb-2 text-center" style={{color: '#1a3a52'}}>Welcome</h2>
					<h3 className="text-sm font-medium mb-6 text-center" style={{color: '#8b7355'}}>Sign in to your hotel account</h3>
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
							<label className="block text-sm font-semibold" style={{color: '#1a3a52'}}>Username</label>
							<input type="text" 
							value={username} 
							onChange={(e) => setUsername(e.target.value)} required 
							placeholder='Enter your username'
							className="mt-1 block w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
							style={{borderColor: '#d4af37', color: '#1a3a52'}}
							onFocus={(e) => e.target.style.borderColor = '#d4af37'} />
						</div>

						<div>
							<label className="block text-sm font-semibold" style={{color: '#1a3a52'}}>Password</label>
							<input type="password" 
							value ={password}
							onChange={(e) => setPassword(e.target.value)} required
							placeholder='Enter your password'
							className="mt-1 block w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
							style={{borderColor: '#d4af37', color: '#1a3a52'}}
							onFocus={(e) => e.target.style.borderColor = '#d4af37'} />
						</div>

						<div className="flex items-center justify-between text-sm">
							<label className="flex items-center">
								<input type="checkbox" className="h-4 w-4 rounded" style={{accentColor: '#d4af37'}} />
								<span className="ml-2" style={{color: '#8b7355'}}>Remember me</span>
							</label>
							<a href="#" className="hover:underline transition" style={{color: '#d4af37'}}>Forgot password?</a>
						</div>

						<div>
							<button type="button" onClick={handleLogin} className="w-full py-2 px-4 text-white rounded-lg hover:shadow-lg transition font-semibold" style={{backgroundColor: '#1a3a52'}}>Sign in</button>
						</div>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm" style={{color: '#8b7355'}}>
							Don't have an account?{" "}
							<button
								type="button"
								onClick={() => navigate('/register')}
								className="hover:underline font-semibold bg-none border-none cursor-pointer transition"
								style={{color: '#d4af37'}}
							>
								Create account
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login