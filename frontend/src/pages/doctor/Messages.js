import React, { useState, useEffect, useCallback } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Fetch messages function
  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Fetch patients function
  const fetchPatients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMessages(), fetchPatients()]);
      setLoading(false);
    };
    loadData();
  }, [fetchMessages, fetchPatients]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.recipient || !newMessage.subject || !newMessage.message) {
      alert('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/doctor/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMessage)
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Message sent successfully!');
        setShowCompose(false);
        setNewMessage({ recipient: '', subject: '', message: '' });
        fetchMessages();
      } else {
        alert(`❌ ${result.message || 'Failed to send message'}`);
      }
    } catch (error) {
      alert('Error sending message');
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessage.message.trim()) {
      alert('Message cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doctor/messages/${editingMessage._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: editingMessage.message })
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Message updated successfully!');
        setEditingMessage(null);
        if (showFullMessage) {
          openFullMessage({ _id: editingMessage._id });
        }
        fetchMessages();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert('Error updating message');
    }
  };

  const openFullMessage = async (message) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doctor/messages/${message._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const fullMessage = await response.json();
        setSelectedMessage(fullMessage);
        setShowFullMessage(true);

        // Mark as read if I'm the recipient and it's unread
        if (fullMessage.recipient._id === currentUser.id && !fullMessage.isRead) {
          await fetch(`http://localhost:5000/api/doctor/messages/${message._id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchMessages();
        }

        // Mark unread replies as read
        if (fullMessage.replies && fullMessage.replies.length > 0) {
          for (const reply of fullMessage.replies) {
            if (!reply.isRead && reply.sender._id !== currentUser.id) {
              await fetch(`http://localhost:5000/api/doctor/messages/${message._id}/replies/${reply._id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
              });
            }
          }
          fetchMessages();
        }
      }
    } catch (error) {
      console.error('Error opening message:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doctor/messages/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyText })
      });

      if (response.ok) {
        alert('✅ Reply sent successfully!');
        setReplyText('');
        openFullMessage(selectedMessage);
        fetchMessages();
      }
    } catch (error) {
      alert('Error sending reply');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doctor/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ Message deleted from your view');
        setShowDeleteConfirm(null);
        if (showFullMessage && selectedMessage._id === messageId) {
          setShowFullMessage(false);
          setSelectedMessage(null);
        }
        fetchMessages();
      } else {
        alert('❌ Failed to delete message');
      }
    } catch (error) {
      alert('Error deleting message');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DoctorSidebar />
        <div className="main-content">
          <DoctorTopNav />
          <div className="dashboard-content">
            <h1 className="page-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DoctorSidebar />
      
      <div className="main-content">
        <DoctorTopNav />
        
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="page-title">💬 Messages</h1>
            <button
              onClick={() => {
                setShowCompose(!showCompose);
                if (showCompose) {
                  setNewMessage({ recipient: '', subject: '', message: '' });
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: showCompose ? '#6c757d' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {showCompose ? '✕ Cancel' : '✉️ Compose Message'}
            </button>
          </div>

          {patients.length === 0 && (
            <div className="section-card" style={{ marginBottom: '2rem', background: '#fff3cd', borderColor: '#ffc107' }}>
              <p style={{ margin: 0, color: '#856404' }}>
                ℹ️ You can only send messages to your assigned patients (patients with appointments).
              </p>
            </div>
          )}

          {/* Compose Message Form */}
          {showCompose && (
            <div className="section-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>✉️ New Message</h3>
              <form onSubmit={handleSendMessage}>
                <div className="form-group">
                  <label className="form-label">To (Your Patient) *</label>
                  <select
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                    className="form-select"
                    required
                    disabled={patients.length === 0}
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} - {patient.email}
                      </option>
                    ))}
                  </select>
                  {patients.length === 0 && (
                    <small style={{ color: '#dc3545', marginTop: '0.25rem', display: 'block' }}>
                      No assigned patients yet.
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    className="form-input"
                    placeholder="Enter subject"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                    className="form-textarea"
                    rows="6"
                    placeholder="Type your message here..."
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCompose(false);
                      setNewMessage({ recipient: '', subject: '', message: '' });
                    }} 
                    style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={patients.length === 0}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      background: patients.length === 0 ? '#ccc' : '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: patients.length === 0 ? 'not-allowed' : 'pointer', 
                      fontWeight: '600' 
                    }}
                  >
                    📤 Send Message
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ background: 'white', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#dc3545' }}>🗑️ Delete Message</h2>
                <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
                  Are you sure you want to delete this message from your view? 
                  The message will be removed from your inbox but will remain in the system.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setShowDeleteConfirm(null)} 
                    style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDeleteMessage(showDeleteConfirm)} 
                    style={{ padding: '0.75rem 1.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Full Message Modal */}
          {showFullMessage && selectedMessage && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ background: 'white', borderRadius: '12px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Message Thread</h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {selectedMessage.sender._id === currentUser.id && (
                      <button 
                        onClick={() => setShowDeleteConfirm(selectedMessage._id)} 
                        style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem' }}
                        title="Delete message"
                      >
                        🗑️
                      </button>
                    )}
                    <button 
                      onClick={() => setShowFullMessage(false)} 
                      style={{ background: '#6c757d', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.25rem' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Original Message */}
                <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.25rem' }}>
                      {selectedMessage.sender.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700' }}>{selectedMessage.sender.name} ({selectedMessage.sender.role})</div>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{formatDate(selectedMessage.createdAt)}</div>
                    </div>
                  </div>

                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    {selectedMessage.subject}
                  </div>

                  <div style={{ fontSize: '1rem', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.message}
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: selectedMessage.isRead ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                      {selectedMessage.isRead ? `✓ Seen by Patient on ${formatDate(selectedMessage.readAt)}` : '✗ Not Seen by Patient Yet'}
                    </span>
                    {selectedMessage.isEdited && (
                      <span style={{ fontSize: '0.85rem', color: '#ff6b6b', fontWeight: '600' }}>
                        (Edited on {formatDate(selectedMessage.editedAt)})
                      </span>
                    )}
                    {selectedMessage.sender._id === currentUser.id && !selectedMessage.isRead && (
                      <button 
                        onClick={() => setEditingMessage(selectedMessage)} 
                        style={{ padding: '0.5rem 1rem', background: '#fbbf24', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Replies ({selectedMessage.replies.length})</h3>
                    {selectedMessage.replies.map((reply, index) => {
                      const isSentByMe = reply.sender._id === currentUser.id;
                      return (
                        <div key={index} style={{ padding: '1rem', background: isSentByMe ? '#e8f5e9' : '#eff6ff', borderRadius: '8px', marginBottom: '1rem', marginLeft: '2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isSentByMe ? '#4caf50' : '#4a9eff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700' }}>
                              {reply.sender.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                                {reply.sender.name} {isSentByMe && '(You)'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{formatDate(reply.createdAt)}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.95rem', color: '#4b5563', marginLeft: '2.5rem', whiteSpace: 'pre-wrap' }}>
                            {reply.message}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: reply.isRead ? '#10b981' : '#ef4444', marginLeft: '2.5rem', marginTop: '0.5rem', fontWeight: '600' }}>
                            {reply.isRead ? `✓ Seen by ${isSentByMe ? 'Patient' : 'You'}` : '✗ Not Seen Yet'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Input */}
                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    style={{ width: '100%', padding: '1rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', minHeight: '100px', resize: 'vertical' }}
                  />
                  <button 
                    onClick={handleSendReply} 
                    style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#4a9eff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    📤 Send Reply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Message Modal */}
          {editingMessage && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ background: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>✏️ Edit Message</h2>
                <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
                  You can only edit messages that haven't been seen by the patient yet.
                </p>
                <textarea
                  value={editingMessage.message}
                  onChange={(e) => setEditingMessage({ ...editingMessage, message: e.target.value })}
                  style={{ width: '100%', padding: '1rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', minHeight: '150px', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    onClick={() => setEditingMessage(null)} 
                    style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleEditMessage} 
                    style={{ padding: '0.75rem 1.5rem', background: '#fbbf24', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    💾 Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages List */}
          <div className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>📨 All Messages</h3>
              <span style={{ fontSize: '0.85rem', color: '#6c757d', fontStyle: 'italic' }}>
                Auto-refreshes every 5 seconds
              </span>
            </div>
            
            {messages.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {messages.map((message) => {
                  const isSentByMe = message.sender._id === currentUser.id;
                  const otherPerson = isSentByMe ? message.recipient : message.sender;
                  const isUnread = !isSentByMe && !message.isRead;
                  const hasUnreadReplies = message.replies && message.replies.some(r => !r.isRead && r.sender._id !== currentUser.id);

                  return (
                    <div 
                      key={message._id} 
                      style={{
                        padding: '1.5rem',
                        border: isUnread || hasUnreadReplies ? '2px solid #4a9eff' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        background: isUnread || hasUnreadReplies ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => openFullMessage(message)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#667eea',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '1.25rem'
                          }}>
                            {otherPerson.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#2c3544' }}>
                              {isSentByMe ? `To: ${otherPerson.name}` : `From: ${otherPerson.name}`}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                              {otherPerson.email} ({otherPerson.role})
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                            {formatDate(message.createdAt)}
                          </div>
                          {isUnread && (
                            <span style={{
                              display: 'inline-block',
                              marginTop: '0.25rem',
                              padding: '0.25rem 0.75rem',
                              background: '#667eea',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              New
                            </span>
                          )}
                          {isSentByMe && message.isRead && (
                            <span style={{
                              display: 'inline-block',
                              marginTop: '0.25rem',
                              padding: '0.25rem 0.75rem',
                              background: '#10b981',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              ✓ Seen by Patient
                            </span>
                          )}
                          {hasUnreadReplies && (
                            <span style={{
                              display: 'inline-block',
                              marginTop: '0.25rem',
                              marginLeft: '0.5rem',
                              padding: '0.25rem 0.75rem',
                              background: '#ef4444',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              New Reply
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                          {message.subject}
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>
                          {message.message.length > 150 ? message.message.substring(0, 150) + '...' : message.message}
                        </div>
                      </div>

                      {message.replies && message.replies.length > 0 && (
                        <div style={{ fontSize: '0.85rem', color: '#667eea', fontWeight: '600' }}>
                          💬 {message.replies.length} {message.replies.length === 1 ? 'Reply' : 'Replies'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6c757d', padding: '3rem' }}>
                No messages
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;