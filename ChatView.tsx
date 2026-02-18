
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { Message } from '../types';
import { GenerateContentResponse } from '@google/genai';

interface ChatViewProps {
  searchQuery?: string;
}

const ChatView: React.FC<ChatViewProps> = ({ searchQuery = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "System Online. I am Giga AI, the premium intelligence engine. How can I assist your workflow today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          base64: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const currentInput = input;
    const currentImage = selectedImage;

    const userMsg: Message = { 
      role: 'user', 
      content: currentInput, 
      timestamp: new Date(),
      metadata: currentImage ? { image: currentImage.base64 } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setLoading(true);

    const modelMessageId = Date.now();
    setMessages(prev => [...prev, { 
      role: 'model', 
      content: "", 
      timestamp: new Date(), 
      metadata: { id: modelMessageId, sources: [] } 
    }]);

    try {
      let fullContent = "";
      let groundingChunks: any[] = [];
      const stream = gemini.generateTextStream(
        currentInput || "Analyze visual data", 
        messages, 
        currentImage?.base64, 
        currentImage?.mimeType
      );

      for await (const chunk of stream) {
        const text = chunk.text || "";
        fullContent += text;
        
        // Extract search grounding metadata if available
        const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          groundingChunks = [...groundingChunks, ...chunks];
        }

        setMessages(prev => prev.map(msg => 
          msg.metadata?.id === modelMessageId 
            ? { 
                ...msg, 
                content: fullContent, 
                metadata: { ...msg.metadata, sources: groundingChunks } 
              } 
            : msg
        ));
      }
    } catch (err) {
      setMessages(prev => prev.map(msg => 
        msg.metadata?.id === modelMessageId 
          ? { ...msg, content: "Neural lag detected. Re-processing required." } 
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text: string) => {
    // Basic text formatting for production feel (handles bold, lists, and breaks)
    return text.split('\n').map((line, i) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\* (.*)/g, '• $1');
      return <div key={i} dangerouslySetInnerHTML={{ __html: processed }} className="min-h-[1.5em]" />;
    });
  };

  const filteredMessages = searchQuery.trim() 
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 custom-scrollbar" ref={scrollRef}>
        {filteredMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-[32px] p-6 relative group transition-all duration-300 shadow-2xl ${
              msg.role === 'user' 
              ? 'bg-accent-gold text-black rounded-tr-none' 
              : 'glass rounded-tl-none border-white/5'
            }`}>
              {msg.metadata?.image && (
                <div className="relative group/img overflow-hidden rounded-2xl mb-4 shadow-xl border border-white/5">
                  <img src={msg.metadata.image} alt="Input" className="max-w-full hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              
              <div className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                {msg.content ? renderContent(msg.content) : (msg.role === 'model' && loading && i === messages.length - 1 ? (
                  <span className="flex items-center gap-3 italic opacity-60 animate-pulse">
                    <div className="w-4 h-4 border-2 border-accent-gold border-t-transparent rounded-full animate-spin"></div>
                    Synthesizing response...
                  </span>
                ) : null)}
              </div>

              {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent-gold mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3"><path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" /></svg>
                    Verified Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.metadata.sources.map((source: any, idx: number) => source.web && (
                      <a 
                        key={idx} 
                        href={source.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition-all flex items-center gap-2"
                      >
                        {source.web.title || 'Source'}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4">
                <span className={`text-[9px] font-black tracking-widest opacity-30 uppercase ${msg.role === 'user' ? 'text-black' : 'text-slate-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  className={`p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg ${msg.role === 'user' ? 'hover:bg-black/10 text-black' : 'hover:bg-white/5 text-slate-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-8 pb-8 pt-4">
        <div className="max-w-4xl mx-auto">
          {selectedImage && (
            <div className="mb-4 flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-[28px] border border-white/10 animate-in slide-in-from-bottom-2">
              <img src={selectedImage.base64} alt="Preview" className="h-14 w-14 object-cover rounded-xl shadow-lg" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-accent-gold uppercase tracking-[0.2em]">Vision Module Active</p>
                <p className="text-xs text-white/60">Image ready for multimodal analysis.</p>
              </div>
              <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-white/10 rounded-xl text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
          
          <div className="glass p-2.5 rounded-[36px] flex items-center gap-2 focus-within:ring-2 ring-accent-gold/40 transition-all shadow-2xl">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-3xl hover:bg-white/5 text-slate-400 hover:text-accent-gold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              placeholder={loading ? "Generating response..." : "Initialize command..."}
              className="flex-1 bg-transparent border-none focus:outline-none px-4 py-3.5 text-slate-200 placeholder:text-slate-600 font-medium disabled:opacity-50"
            />
            
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || loading}
              className="bg-accent-gold hover:bg-yellow-500 text-black p-4 rounded-[28px] transition-all disabled:opacity-20 shadow-lg shadow-accent-gold/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-center text-[8px] text-slate-800 mt-4 font-black uppercase tracking-[0.6em] select-none">
            Architecture Optimized for Production Excellence
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
