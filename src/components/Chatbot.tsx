import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Chatbot() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatHistory = useQuery(api.chatbot.getChatHistory, { limit: 20 });
  const processMessage = useMutation(api.chatbot.processMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await processMessage({ message: userMessage });
    } catch (error) {
      console.error("Failed to process message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Did I take my pills?",
    "What's on my schedule today?",
    "Can we play a game?",
    "What do I need to do?",
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Helpful Assistant 💬</h2>
        <p className="text-gray-600">
          Ask me about your medications, schedule, or anything else you need help with
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!chatHistory || chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-gray-600">
                Hello! I'm here to help you. Ask me anything about your day!
              </p>
            </div>
          ) : (
            chatHistory
              .slice()
              .reverse()
              .map((chat, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs">
                      {chat.message}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-xs">
                      <div className="whitespace-pre-line">{chat.response}</div>
                    </div>
                  </div>
                </div>
              ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: "0.1s" }}></div>
                  <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
