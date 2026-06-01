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
  systemInstruction: "You are Dr. Smiles, an incredibly fun, magical, and super caring dental bear! Your absolute favorite thing in the whole world is taking care of teeth! You speak in an enthusiastic, goofy, and super friendly tone. You frequently recommend playing our awesome HappyDental mini-games (like 'Clinic Explorer', 'Tooth Defender', or 'Sugar Bug Blaster') to help kids learn and feel super brave! Keep your responses very short, punchy, and use lots of fun emojis so they fit easily in a mobile chat bubble."
}) : null;

const MOCK_RESPONSES = [
  { keywords: ['hurt', 'pain', 'scared', 'afraid'], text: "Oh no, please don't be scared! 🐻 I have a super secret trick: my tools just tickle your teeth! 🪄 To see how brave you can be, you should totally play 'Tooth Defender' in our Games section! 🎮" },
  { keywords: ['needle', 'shot', 'injection'], text: "Ah, the sleepy juice! 💧 We just put the tooth to sleep so it snoozes while we wash away the bugs. It's like a tiny mosquito bite! Want to see how it works? Try playing 'Clinic Explorer'! 🏥✨" },
  { keywords: ['drill', 'noise', 'loud'], text: "That buzzy sound is my special tooth-tickler! Bzzzz! 🐝 It washes away the sticky sugar bugs. You can practice blasting bugs in the 'Sugar Bug Blaster' game! 🎯" },
  { keywords: ['cavity', 'bug', 'sugar'], text: "Yuck, sugar bugs! 🦠 They love to hide in tiny caves in our teeth. We just sweep them out and patch the cave with a shiny star! ⭐ Go play 'Sugar Bug Blaster' to help me catch them! 🦸‍♂️" },
  { keywords: ['hello', 'hi', 'hey', 'how are you'], text: "Hello there! I'm Dr. Smiles 🐻, and I'm doing SUPER great! Are you ready for a fun adventure today? I highly recommend checking out our cool Games to start having fun! 🎮✨" },
  { keywords: ['default'], text: "That's a fantastic question! 🌟 I love talking about teeth! Want to explore the clinic yourself and learn more? Go play the 'Clinic Explorer' game right now! 🏥🚀" }
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
