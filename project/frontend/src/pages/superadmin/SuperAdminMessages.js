import React, { useState, useEffect, useRef } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import SuperAdminTopNav from '../../components/SuperAdminTopNav';
import './SuperAdminMessages.css';

const SuperAdminMessages = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMsgs, setThreadMsgs] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchThreadDetails(selectedThread.partnerId);
    }
  }, [selectedThread]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMsgs]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      // While the backend may not have fully implemented conversation grouping natively, 
      // we'll fetch all messages and group them locally by conversation partner.
      const response = await fetch('http://localhost:5000/api/superadmin/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = response.ok ? await response.json() : [];
      
      // We assume data is a flat list of all messages involving the superadmin
      // Let's group them by the 'other' user
      const currentUserStr = localStorage.getItem('user');
      const currentUserId = currentUserStr ? JSON.parse(currentUserStr).id : null;

      const threadsMap = {};
      
      data.forEach(msg => {
        // Find who the partner is
        const isSender = msg.sender?._id === currentUserId;
        const partner = isSender ? msg.recipient : msg.sender;
        
        if (!partner) return;

        if (!threadsMap[partner._id]) {
          threadsMap[partner._id] = {
            partnerId: partner._id,
            partnerName: partner.name,
            partnerRole: partner.role,
            lastMessage: msg,
            unread: !isSender && !msg.read
          };
        } else {
          // If this message is newer than the stored last message, update it
          if (new Date(msg.createdAt) > new Date(threadsMap[partner._id].lastMessage.createdAt)) {
            threadsMap[partner._id].lastMessage = msg;
            threadsMap[partner._id].unread = !isSender && !msg.read;
          }
        }
      });

      const threadsArray = Object.values(threadsMap).sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );

      setMessages(threadsArray);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetails = async (partnerId) => {
    try {
      const token = localStorage.getItem('token');
      // Attempt to hit the thread endpoint
      const response = await fetch(`http://localhost:5000/api/superadmin/messages/${partnerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const threadData = response.ok ? await response.json() : [];
      setThreadMsgs(threadData);

      // Mark unread messages as read (Simulated if backend doesn't support yet)
      const currentUserStr = localStorage.getItem('user');
      const currentUserId = currentUserStr ? JSON.parse(currentUserStr).id : null;

      const updatedThreads = messages.map(t => {
        if (t.partnerId === partnerId) return { ...t, unread: false };
        return t;
      });
      setMessages(updatedThreads);

    } catch (error) {
      console.error('Error fetching thread:', error);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/superadmin/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: selectedThread.partnerId,
          subject: `Re: ${selectedThread.lastMessage.subject || 'Message'}`,
          message: replyText
        })
      });

      if (response.ok) {
        const newMsg = await response.json();
        setReplyText('');
        // Optimistically update UI
        fetchThreadDetails(selectedThread.partnerId);
        fetchMessages();
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredThreads = messages.filter(thread => 
    thread.partnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.lastMessage?.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <SuperAdminTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content messages-container">
          <div className="premium-header">
            <h1 className="premium-title">📬 Secure Communications</h1>
            <button className="btn-new-msg">
              ✏️ Compose Global Broadcast
            </button>
          </div>

          <div className="messaging-layout">
            
            {/* INBOX PANEL */}
            <div className="inbox-panel">
              <div className="inbox-header">
                <input 
                  type="text"
                  placeholder="Search conversations..."
                  className="search-input"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="thread-list">
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Refreshing inbox...</div>
                ) : filteredThreads.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No conversations found.</div>
                ) : (
                  filteredThreads.map(thread => (
                    <div 
                      key={thread.partnerId} 
                      className={`thread-item ${selectedThread?.partnerId === thread.partnerId ? 'active' : ''} ${thread.unread ? 'unread' : ''}`}
                      onClick={() => setSelectedThread(thread)}
                    >
                      <div className="thread-avatar">
                        {thread.partnerName ? thread.partnerName.charAt(0) : '?'}
                      </div>
                      <div className="thread-content">
                        <div className="thread-sender">
                          <h4>
                            {thread.partnerName || 'Unknown User'} 
                            {thread.unread && <span style={{ color: '#22c55e', marginLeft: '0.4rem', fontSize: '0.8rem' }}>●</span>}
                          </h4>
                          <span className="thread-time">
                            {new Date(thread.lastMessage?.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="thread-subject">{thread.lastMessage?.subject || 'No Subject'}</p>
                        <p className="thread-preview">{thread.lastMessage?.message || '...'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CHAT PANEL */}
            <div className="chat-panel">
              {!selectedThread ? (
                <div className="empty-chat">
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
                  <h2>No Conversation Selected</h2>
                  <p>Choose a thread from the inbox to read and reply.</p>
                </div>
              ) : (
                <>
                  <div className="chat-header">
                    <div className="thread-avatar" style={{ width: '50px', height: '50px' }}>
                      {selectedThread.partnerName.charAt(0)}
                    </div>
                    <div className="chat-partner-info">
                      <h3>{selectedThread.partnerName} <span className="role-badge">{selectedThread.partnerRole}</span></h3>
                      <p>Subject: {selectedThread.lastMessage?.subject || 'General'}</p>
                    </div>
                  </div>

                  <div className="chat-history">
                    {threadMsgs.map((msg, index) => {
                      const currentUserStr = localStorage.getItem('user');
                      const currentUserId = currentUserStr ? JSON.parse(currentUserStr).id : null;
                      const isSentByMe = msg.sender?._id === currentUserId || msg.sender === currentUserId;

                      return (
                        <div key={msg._id || index} className={`message-bubble ${isSentByMe ? 'msg-sent' : 'msg-received'}`}>
                          <div className="msg-text">
                            {msg.message}
                          </div>
                          <div className="msg-meta">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  <form className="chat-input-area" onSubmit={handleSendReply}>
                    <textarea 
                      className="reply-input"
                      placeholder="Type a secure reply..."
                      rows="2"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(e);
                        }
                      }}
                    ></textarea>
                    <button type="submit" className="btn-send" disabled={!replyText.trim()}>
                      Send
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminMessages;
