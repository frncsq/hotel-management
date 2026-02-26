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
		<div className="haunted-background min-h-screen flex items-center justify-center py-10 px-3 sm:px-5 lg:px-7">
			<div className="haunted-card max-w-sm w-full bg-gray-900 rounded-xl overflow-hidden">
				<div className="h-1 bg-gradient-to-r from-red-900 via-black to-red-900"></div>
				<div className="p-6 md:p-8 relative z-10">
					<h2 className="haunted-title text-4xl mb-2 text-center">🧛‍♂️ BECOME UNDEAD 🧛‍♀️</h2>
					<h3 className="haunted-subtitle text-sm font-medium mb-6 text-center">Join the Eternal Night</h3>
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
							<label className="haunted-label block text-sm font-semibold mb-1">👻 Mortal Name</label>
							<input type="text" 
						value={name} 
						onChange={(e) => setName(e.target.value)} 
						required 
						placeholder='What were you called in life?'
							className="haunted-input mt-1 block w-full px-4 py-2 rounded-lg focus:outline-none transition" />
						</div>
						<div className="haunted-form-group">
							<label className="haunted-label block text-sm font-semibold mb-1">🧛 Creature Identity</label>
							<input type="text" 
							value={username} 
							onChange={(e) => setUsername(e.target.value)} 
							required 
							placeholder='Your new vampire name'
							className="haunted-input mt-1 block w-full px-4 py-2 rounded-lg focus:outline-none transition" />
						</div>

						<div className="haunted-form-group">
							<label className="haunted-label block text-sm font-semibold mb-1">🔮 Blood Curse</label>
							<input type="password" 
							value={password}
							onChange={(e) => setPassword(e.target.value)} 
							required
							placeholder='Create your sinister spell'
							className="haunted-input mt-1 block w-full px-4 py-2 rounded-lg focus:outline-none transition" />
						</div>
						<div className="haunted-form-group">
							<label className="haunted-label block text-sm font-semibold mb-1">⚡ Confirm Curse</label>
							<input type="password" 
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)} 
						placeholder='Repeat the incantation'
						className="haunted-input mt-1 block w-full px-4 py-2 rounded-lg focus:outline-none transition"
						required />
						</div>

						<div className="haunted-form-group">
							<button type="button" onClick={handleRegister} className="haunted-button w-full py-3 px-4 rounded-lg font-semibold">Rise as the Undead</button>
						</div>
					</form>

					<div className="haunted-form-group mt-6 text-center">
						<p className="text-sm text-gray-400">Already cursed? <button onClick={handleLoginLink} className="haunted-link font-semibold bg-none border-none cursor-pointer">Enter the Castle</button></p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Register