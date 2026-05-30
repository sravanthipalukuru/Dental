import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, Mic, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './DrSmilesChat.css';


const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are Dr. Smiles, a fun, friendly dental doctor who always cares about the user's teeth. You must speak in a fun, caring tone. Keep responses very short and concise (small small content) so they fit easily in a mobile chat bubble."
}) : null;

const MOCK_RESPONSES = [
  { keywords: ['hurt', 'pain', 'scared', 'afraid'], text: "I understand you might be feeling a bit scared. It's completely normal! But I promise, I use special magic tools that just tickle your teeth. We can take breaks whenever you want. You are in control!" },
  { keywords: ['needle', 'shot', 'injection'], text: "Ah, the sleepy juice! We use a tiny magic wand to put the tooth to sleep so it doesn't feel anything while we wash away the sugar bugs. You'll just feel a little pinch, like a mosquito bite, and then... asleep!" },
  { keywords: ['drill', 'noise', 'loud'], text: "That buzzy sound is my special tooth-tickler! It helps wash away the sticky sugar bugs. We can even give you cool headphones to listen to your favorite music while it buzzes." },
  { keywords: ['cavity', 'bug', 'sugar'], text: "Sugar bugs love to hide in tiny caves in our teeth. We just need to sweep them out and patch the cave with a super strong, shiny star so they can't come back!" },
  { keywords: ['hello', 'hi', 'hey'], text: "Hello there! I'm Dr. Smiles 🐻. Are you ready for a fun adventure today? Do you have any questions about your checkup?" },
  { keywords: ['default'], text: "That's a great question! At the clinic, we explain everything before we do it. Would you like to play the 'Clinic Explorer' game to see what it looks like?" }
];

export default function DrSmilesChat() {
  const userId = useStore(state => state.userId);
  const [messages, setMessages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/chat/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([{ id: 1, text: "Hi! I'm Dr. Smiles 🐻. I'm here to answer any questions you have about visiting the dentist. What's on your mind?", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }
        setIsLoaded(true);
      })
      .catch(err => {
        console.error('Failed to fetch chat history', err);
        setIsLoaded(true);
      });
  }, [userId]);

  // Helper to save message
  const saveMessage = async (msg) => {
    if (!userId) return;
    try {
      await fetch(`/api/chat/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
    } catch (err) {
      console.error('Failed to save message', err);
    }
  };
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatSessionRef = useRef(null);

  useEffect(() => {
    if (model && !chatSessionRef.current) {
      chatSessionRef.current = model.startChat({ history: [] });
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message
    const newMsg = {
      id: Date.now(),
      text: userMsg,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    saveMessage(newMsg);

    setIsTyping(true);

    // Simulate AI thinking and responding
    // AI or Fallback Response
    setTimeout(async () => {
      let responseText = "";
      try {
        if (chatSessionRef.current) {
          const result = await chatSessionRef.current.sendMessage(userMsg);
          responseText = result.response.text();
        } else {
          throw new Error("No API key provided, using fallback");
        }
      } catch (err) {
        console.warn("AI fallback:", err.message);
        const lowerMsg = userMsg.toLowerCase();
        responseText = MOCK_RESPONSES.find(r => r.keywords.some(kw => lowerMsg.includes(kw)))?.text;
        
        if (!responseText) {
          responseText = MOCK_RESPONSES.find(r => r.keywords.includes('default')).text;
        }
      }

      const botMsg = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
      saveMessage(botMsg);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <Link to="/" className="back-btn"><ArrowLeft /> Back</Link>
        <div className="chat-profile">
          <div className="avatar bg-pink float">🐻</div>
          <div>
            <h2>Dr. Smiles</h2>
            <span className="status">AI Companion</span>
          </div>
        </div>
      </header>

      <div className="chat-container">
        <div className="chat-messages">
          {!isLoaded && <div style={{textAlign: "center", padding: 20}}>Loading chat history...</div>}
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                className={`message ${msg.sender}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
              >
                <div className="message-content">
                  <p>{msg.text}</p>
                </div>
                <span className="message-time">{msg.time}</span>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div 
                className="message bot typing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="message-content">
                  <div className="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form className="chat-input-wrapper card" onSubmit={handleSend}>
            <button type="button" className="icon-btn"><Smile size={24} color="var(--gray-400)"/></button>
            <input 
              type="text" 
              placeholder="Ask Dr. Smiles anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="button" className="icon-btn"><ImageIcon size={24} color="var(--gray-400)"/></button>
            <button type="button" className="icon-btn"><Mic size={24} color="var(--gray-400)"/></button>
            <button type="submit" className="send-btn" disabled={!input.trim()}><Send size={20} color="white"/></button>
          </form>
        </div>
      </div>
    </div>
  );
}
