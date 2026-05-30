const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/DrSmilesChat.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add imports
if (!content.includes('GoogleGenerativeAI')) {
  content = content.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';\nimport { GoogleGenerativeAI } from '@google/generative-ai';"
  );
}

// Add API init
const apiInitCode = `
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are Dr. Smiles, a fun, friendly dental doctor who always cares about the user's teeth. You must speak in a fun, caring tone. Keep responses very short and concise (small small content) so they fit easily in a mobile chat bubble."
}) : null;
`;

if (!content.includes('import.meta.env.VITE_GEMINI_API_KEY')) {
  content = content.replace(
    'const MOCK_RESPONSES = [',
    apiInitCode + '\nconst MOCK_RESPONSES = ['
  );
}

// Add chatSessionRef
if (!content.includes('chatSessionRef')) {
  content = content.replace(
    'const messagesEndRef = useRef(null);',
    'const messagesEndRef = useRef(null);\n  const chatSessionRef = useRef(null);\n\n  useEffect(() => {\n    if (model && !chatSessionRef.current) {\n      chatSessionRef.current = model.startChat({ history: [] });\n    }\n  }, []);'
  );
}

// Replace setTimeout block
const newSetTimeout = `
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

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 500);
`;

// regex to replace the old setTimeout
content = content.replace(/setTimeout\(\(\) => \{[\s\S]*?\}, 1500\);/, newSetTimeout.trim());

fs.writeFileSync(filePath, content, 'utf8');
console.log('DrSmilesChat.jsx updated with Gemini AI');
