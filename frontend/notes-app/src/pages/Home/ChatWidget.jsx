import React, { useState } from "react";
import { FaFacebookMessenger, FaTimes } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // store chat messages
  const [input, setInput] = useState("");
   const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuestion = input;

    setMessages((prevMessages) => [...prevMessages, { text: userQuestion, sender: "user" }]);
    setInput("");

    try {
      const response = await axiosInstance.get("/ai-get-all-nodes", {
        params: {
          query: userQuestion,
        },
      });

      const aiAnswer = response.data.answer;

      if (aiAnswer) {
        setMessages((prevMessages) => [...prevMessages, { text: aiAnswer, sender: "ai" }]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prevMessages) => [...prevMessages, { text: "Sorry, I couldn't get a response.", sender: "ai" }]);
    }
  };
  return (
    <div className="fixed bottom-28 right-8">
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg hover:bg-blue-700 transition"
      >
        {open ? <FaTimes /> : <FaFacebookMessenger />}
      </button>

      {/* Chat Box */}
      {open && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-xl shadow-xl overflow-hidden transition-all flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 font-semibold text-lg">
            Chat
          </div>

          {/* Messages */}
          <div className="p-4 flex-1 overflow-y-auto h-64 space-y-2">
            {messages.map((msg, index) => (
              <div
               key={index}
               className={`px-3 py-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-100 text-blue-800 self-end' : 'bg-gray-200 text-gray-800 self-start'}`}
               >
             {msg.text}
         </div>
       ))}
          </div>

          {/* Input */}
          <form
            className="p-4 border-t flex gap-2"
            onSubmit={handleSend}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
