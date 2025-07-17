import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); 
  const [loading, setLoading] = useState(false);
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const userMessage = input;
    setInput(""); 
    try {
      const response = await fetch('https://waraqh.buildship.run/quickApi-ccc1f5022b0d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          string: userMessage
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Use response.text() instead of response.json() since we're getting plain text
      const botResponse = await response.text();
      
      setMessages(prev => [...prev, { 
        question: userMessage, 
        answer: botResponse 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        question: userMessage, 
        answer: "عذراً، حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center z-50"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-24 right-6 w-80 rounded-lg shadow-xl z-50 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                AI Assistant
              </h3>
            </div>

            <div className={`h-80 overflow-y-auto p-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {messages.map((msg, index) => (
                <div key={index} className="mb-4">
                  <div className="mb-2 flex justify-end">
                    <div className="inline-block rounded-lg py-2 px-3 bg-primary text-white">
                      {msg.question}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className={`inline-block rounded-lg py-2 px-3 ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                    isDark 
                      ? 'bg-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chat;
