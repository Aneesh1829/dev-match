import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messagesAPI, socialAPI, usersAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/UI/AnimatedPage';
import toast from 'react-hot-toast';
import { getSocket } from '../services/socket';
import { Send, User, ArrowLeft, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatPage() {
  const { userId: urlUserId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const fetchConversations = useCallback(async () => {
    try {
      const [convRes, friendsRes] = await Promise.all([
        messagesAPI.getConversations(),
        socialAPI.getFriends(),
      ]);
      const convs = convRes.data.conversations || [];
      const friends = friendsRes.data.friends || [];
      const existingIds = new Set(convs.map(c => c.partner?.id).filter(Boolean));
      const extraConvs = friends
        .filter(f => f && f.id && !existingIds.has(f.id))
        .map(f => ({ partner: f, lastMessage: null, unreadCount: 0 }));
      const allConvs = [...convs, ...extraConvs];
      setConversations(allConvs);
      return allConvs;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      return [];
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const init = async () => {
      const allConvs = await fetchConversations();
      if (urlUserId) {
        const existing = allConvs.find(c => c.partner?.id === urlUserId);
        if (existing && existing.partner) {
          selectChat(existing.partner);
        } else {
          try {
            const userRes = await usersAPI.getById(urlUserId);
            const found = userRes.data.user;
            if (found) {
              setConversations(prev => [{ partner: found, lastMessage: null, unreadCount: 0 }, ...prev]);
              selectChat(found);
            }
          } catch (e) { toast.error('User not found'); }
        }
      }
    };
    init();
  }, [urlUserId, fetchConversations]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleReceive = (message) => {
      if (!message) return;
      const current = activeChatRef.current;
      if (current?.id && (message.sender_id === current.id || message.receiver_id === current.id)) {
        setMessages(prev => [...prev, message]);
      }
      setConversations(prev => {
        const partnerId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
        return prev.map(c => c.partner?.id === partnerId
          ? { ...c, lastMessage: message, unreadCount: current?.id === partnerId ? c.unreadCount : c.unreadCount + 1 }
          : c
        );
      });
    };
    const handleSent = (message) => {
      if (!message) return;
      if (activeChatRef.current?.id && message.receiver_id === activeChatRef.current.id) {
        setMessages(prev => [...prev, message]);
      }
    };
    const handleTypingStart = ({ userId: typingUserId }) => { if (activeChatRef.current?.id === typingUserId) setTyping(true); };
    const handleTypingStop = ({ userId: typingUserId }) => { if (activeChatRef.current?.id === typingUserId) setTyping(false); };

    socket.on('message:receive', handleReceive);
    socket.on('message:sent', handleSent);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    return () => {
      socket.off('message:receive', handleReceive);
      socket.off('message:sent', handleSent);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [user?.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const selectChat = async (partner) => {
    if (!partner?.id) return;
    setActiveChat(partner);
    setMessages([]);
    setTyping(false);
    try {
      const res = await messagesAPI.getMessages(partner.id);
      setMessages(res.data.messages || []);
      const socket = getSocket();
      if (socket) socket.emit('message:read', { senderId: partner.id });
      setConversations(prev => prev.map(c => c.partner?.id === partner.id ? { ...c, unreadCount: 0 } : c));
    } catch (err) { console.error('Failed to load messages:', err); }
  };

  const sendMessage = () => {
    const text = newMessage.trim();
    if (!text || !activeChat?.id) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('message:send', { receiverId: activeChat.id, content: text });
      socket.emit('typing:stop', { receiverId: activeChat.id });
    }
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (socket && activeChat?.id) {
      socket.emit('typing:start', { receiverId: activeChat.id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { receiverId: activeChat.id });
      }, 2000);
    }
  };

  return (
    <AnimatedPage>
      <div className="flex h-[calc(100vh-140px)] glass-card !p-0 overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full sm:w-80 border-r border-ink-100 flex flex-col ${activeChat ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-ink-100">
            <h2 className="font-semibold text-ink-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent-600" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3 p-2">
                    <div className="w-10 h-10 bg-surface-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-200 rounded w-2/3" />
                      <div className="h-3 bg-surface-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length > 0 ? (
              conversations.map(conv => {
                if (!conv.partner) return null;
                const initial = conv.partner.username?.charAt(0)?.toUpperCase() || '?';
                return (
                  <motion.button
                    key={conv.partner.id}
                    whileHover={{ backgroundColor: 'rgba(245, 240, 240, 0.5)' }}
                    onClick={() => selectChat(conv.partner)}
                    className={`w-full flex items-center gap-3 p-4 transition-colors border-b border-ink-100/50 text-left ${
                      activeChat?.id === conv.partner.id ? 'bg-accent-50 border-l-2 border-l-accent-500' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-purple-100 rounded-xl flex items-center justify-center border border-ink-100">
                        <span className="text-accent-600 font-semibold text-sm">{initial}</span>
                      </div>
                      {conv.partner.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-ink-800 truncate">{conv.partner.full_name || conv.partner.username}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 shadow-warm">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage ? (
                        <p className="text-xs text-ink-400 truncate">
                          {conv.lastMessage.sender_id === user?.id ? 'You: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-xs text-ink-300 italic">No messages yet</p>
                      )}
                    </div>
                  </motion.button>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <User className="w-10 h-10 text-ink-300 mx-auto mb-3" />
                <p className="font-medium text-ink-500 text-sm">No conversations yet</p>
                <p className="text-xs text-ink-300 mt-1">Add friends to start chatting!</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden sm:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-ink-100 bg-surface-50">
                <button onClick={() => setActiveChat(null)} className="sm:hidden text-ink-500 hover:text-ink-900 p-1 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-purple-100 rounded-xl flex items-center justify-center border border-ink-100">
                    <span className="text-accent-600 font-semibold text-sm">{activeChat.username?.charAt(0)?.toUpperCase() || '?'}</span>
                  </div>
                  {activeChat.is_online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-ink-900 text-sm">{activeChat.full_name || activeChat.username}</p>
                  <p className="text-xs text-ink-400">
                    {typing ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-accent-600"
                      >
                        typing...
                      </motion.span>
                    ) : activeChat.is_online ? (
                      <span className="text-emerald-600">Online</span>
                    ) : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-ink-400">
                    <Send className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Send a message to start the conversation!</p>
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id || `msg-${i}`}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-accent-50 text-ink-800 rounded-br-md border border-accent-200'
                            : 'bg-surface-100 text-ink-700 border border-ink-100 rounded-bl-md'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-accent-400' : 'text-ink-300'}`}>
                            {msg.created_at
                              ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })
                              : 'just now'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-surface-100 border border-ink-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-accent-500 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-ink-100 bg-surface-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="btn-primary px-4 disabled:opacity-40"
                  >
                    <Send className="w-4 h-4 relative z-10" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 rounded-2xl flex items-center justify-center border border-ink-100">
                  <Send className="w-8 h-8 text-ink-300" />
                </div>
                <p className="font-medium text-ink-500">Select a conversation</p>
                <p className="text-sm text-ink-300 mt-1">Choose a friend to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
