import { useState, useEffect } from 'react'
import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');
	const [zombieDialog, setZombieDialog] = useState('Welcome, guest! Enter the dark domain...');
	const [displayedText, setDisplayedText] = useState('Welcome, guest! Enter the dark domain...');
	const [typingTimeout, setTypingTimeout] = useState(null);

	const API_URL = import.meta.env.VITE_API_URL || "https://to-do-list-1-c0qq.onrender.com";

	const zombieThoughts = [
		'Join us, mortal! Become one of the undead...',
		'Your transformation awaits...',
		'*groans* Welcome to the fold...',
		'Eternity is calling...',
		'*shambles forward* Rise as the undead!',
		'Say goodbye to mortality...',
		'We are forever... join us...',
		'*moans* A new soul for Hotel Transylvania...',
		'Darkness welcomes you...',
		'The curse is quite pleasant, really...',
		'Zombies don’t need sleep — they already look tired.',
		'Classic zombies walk slow… because cardio is hard when you’re dead.',
		'Destroy the brain to stop them — finally, a use for “use your head.”',
		'Zombies are the original “undead” — they’ve been around since the dawn of horror.',
		'They love brains — high in protein, low in survival rate.',
		'Modern zombies spread by virus — basically the worst group project ever.',
		'Zombies don’t diet — they eat whatever “comes to mind.”',
		'They’re the only creatures that can be “dead tired” and still keep going.',
		'Zombies are the ultimate “slow and steady” — they may be slow, but they never give up.',
		'They’re the only ones who can say “I’m dying to meet you” and mean it literally.',
		'Zombies are the original “horde” — they’ve been overwhelming survivors since forever.',
	];

	const getRandomThought = () => {
		return zombieThoughts[Math.floor(Math.random() * zombieThoughts.length)];
	};

	const typeText = (fullText) => {
		// Clear previous timeout
		if (typingTimeout) clearTimeout(typingTimeout);
		
		setDisplayedText('');
		let charIndex = 0;
		
		const typeNextChar = () => {
			if (charIndex < fullText.length) {
				setDisplayedText(fullText.slice(0, charIndex + 1));
				charIndex++;
				const timeout = setTimeout(typeNextChar, 50);
				setTypingTimeout(timeout);
			}
		};
		
		typeNextChar();
	};

	const handleZombieClick = () => {
		const thought = getRandomThought();
		setZombieDialog(thought);
		typeText(thought);
		speakZombieThought(thought);
	};

	const speakZombieThought = (text) => {
		// Cancel any ongoing speech
		window.speechSynthesis.cancel();
		
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = 0.9;
		utterance.pitch = 0.8;
		utterance.volume = 1;
		window.speechSynthesis.speak(utterance);
	};

	useEffect(() => {
		const timer = setInterval(() => {
			const thought = getRandomThought();
			setZombieDialog(thought);
			typeText(thought);
			speakZombieThought(thought);
		}, 30000);

		return () => {
			clearInterval(timer);
			if (typingTimeout) clearTimeout(typingTimeout);
		};
	}, [typingTimeout]);
 

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
			{/* Flying Bats */}
			<div className="bat bat-1"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			<div className="bat bat-2"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			<div className="bat bat-1"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			<div className="bat bat-2"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			<div className="bat bat-1"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			<div className="bat bat-2"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			<div className="bat bat-1"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			<div className="bat bat-2"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			<div className="bat bat-1"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			<div className="bat bat-2"><img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '80px', height: '80px'}} /></div>
			{/* Zombie Attendant */}
			<div className="fixed bottom-0 left-0 z-0 pointer-events-auto cursor-pointer" style={{maxWidth: '250px'}} onClick={handleZombieClick}>
				<img src="/zombie.gif" alt="attendant" style={{width: '100%', height: 'auto'}} />
			</div>
			
			{/* Welcome Dialog */}
			<div className="fixed bottom-56 left-12 z-5 pointer-events-none text-sm">
				<div className="bg-red-900 text-white px-4 py-3 rounded-lg border-2 border-red-700 shadow-lg" style={{maxWidth: '150px'}}>
					<p>{displayedText}</p>
					{/* Dialog pointer */}
					<div className="absolute -bottom-2 left-6 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-red-900" style={{borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #7f1d1d'}}></div>
				</div>
			</div>
			
            <div className="haunted-card max-w-sm w-full bg-gray-900 rounded-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-red-900 via-black to-red-900"></div>
				<div className="p-6 md:p-8 relative z-10">
					<div className="flex items-center justify-center gap-4 mb-2">
						<img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '40px', height: '40px'}} />
						<h2 className="haunted-title text-4xl">TRANSYLVANIA</h2>
						<img src="/gif_whites_removed_strong.gif" alt="bat" style={{width: '40px', height: '40px'}} />
					</div>
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
							<label className="haunted-label block text-sm font-semibold mb-1 flex items-center gap-2"><img src="/gif_whites_removed_strong.gif" alt="vampire" style={{width: '20px', height: '20px'}} /> Creature Name</label>
							<input type="text" 
							value={username} 
							onChange={(e) => setUsername(e.target.value)} 
							required 
							placeholder='Enter your identity'
							className="haunted-input mt-1 block w-full px-4 py-2 rounded-lg focus:outline-none transition" />
						</div>

						<div className="haunted-form-group">
							<label className="haunted-label block text-sm font-semibold mb-1 flex items-center gap-2"><img src="/gif_whites_removed_strong.gif" alt="lock" style={{width: '20px', height: '20px'}} /> Unholy Secret</label>
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