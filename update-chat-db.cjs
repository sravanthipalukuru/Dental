const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/DrSmilesChat.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Import useStore
if (!content.includes("import { useStore }")) {
  content = content.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';\nimport { useStore } from '../store/useStore';"
  );
}

// Add userId and fetch logic
const useStoreLogic = `
  const userId = useStore(state => state.userId);
  const [messages, setMessages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(\`/api/chat/\${userId}\`)
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
      await fetch(\`/api/chat/\${userId}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
    } catch (err) {
      console.error('Failed to save message', err);
    }
  };
`;

// Replace initial state
content = content.replace(
  /const \[messages, setMessages\] = useState\(\[\s*\{[\s\S]*?\}\s*\]\);/,
  useStoreLogic.trim()
);

// Update handleSend for userMsg
const userMsgCode = `
    const newMsg = {
      id: Date.now(),
      text: userMsg,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    saveMessage(newMsg);
`;
content = content.replace(
  /setMessages\(prev => \[\.\.\.prev, \{[\s\S]*?\}\]\);/,
  userMsgCode.trim()
);

// Update handleSend for botMsg
const botMsgCode = `
      const botMsg = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
      saveMessage(botMsg);
`;
content = content.replace(
  /setMessages\(prev => \[\.\.\.prev, \{[\s\S]*?\}\]\);/,
  botMsgCode.trim()
);

// Add loading state rendering
content = content.replace(
  '<div className="chat-messages">',
  '<div className="chat-messages">\n          {!isLoaded && <div style={{textAlign: "center", padding: 20}}>Loading chat history...</div>}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('DrSmilesChat.jsx updated with DB persistence');
