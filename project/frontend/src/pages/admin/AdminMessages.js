import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopNav from '../../components/AdminTopNav';

const AdminMessages = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // State management
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showCompose, setShowCompose] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [showBroadcastStatus, setShowBroadcastStatus] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [broadcastStatus, setBroadcastStatus] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('mine'); // mine, all, patient-doctor
  
  // Message Form
  const [messageForm, setMessageForm] = useState({
    messageType: 'individual', 
    recipientType: 'patient', 
    recipient: '',
    broadcastType: '', 
    subject: '',
    message: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Fetch functions
  const fetchMyMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/messages/mine', {
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

  const fetchAllMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching all messages:', error);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [patientsRes, doctorsRes, superAdminsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users/patients', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/users/doctors', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/users/superadmins', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (patientsRes.ok) setPatients(await patientsRes.json());
      if (doctorsRes.ok) setDoctors(await doctorsRes.json());
      if (superAdminsRes.ok) setSuperAdmins(await superAdminsRes.json());
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/messages/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStatistics(await response.json());
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMyMessages(), fetchUsers(), fetchStatistics()]);
      setLoading(false);
    };
    loadData();
  }, [fetchMyMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'mine') {
        fetchMyMessages();
      } else if (activeTab === 'all') {
        fetchAllMessages();
      }
      fetchStatistics();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, fetchMyMessages, fetchAllMessages]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'mine') {
      fetchMyMessages();
    } else if (tab === 'all') {
      fetchAllMessages();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageForm.subject || !messageForm.message) {
      alert('Subject and message are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let endpoint, body;

      if (messageForm.messageType === 'broadcast') {
        if (!messageForm.broadcastType) {
          alert('Please select broadcast type');
          return;
        }
        endpoint = 'http://localhost:5000/api/admin/messages/broadcast';
        body = {
          broadcastType: messageForm.broadcastType,
          subject: messageForm.subject,
          message: messageForm.message
        };
      } else {
        if (!messageForm.recipient) {
          alert('Please select a recipient');
          return;
        }
        endpoint = 'http://localhost:5000/api/admin/messages/individual';
        body = {
          recipient: messageForm.recipient,
          subject: messageForm.subject,
          message: messageForm.message
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ ' + result.message);
        setShowCompose(false);
        setMessageForm({
          messageType: 'individual',
          recipientType: 'patient',
          recipient: '',
          broadcastType: '',
          subject: '',
          message: ''
        });
        fetchMyMessages();
        fetchStatistics();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      alert('Error sending message');
    }
  };

  const viewConversation = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/messages/${messageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedMessage(data);
        setShowConversation(true);
      }
    } catch (error) {
      console.error('Error viewing conversation:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/messages/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyText })
      });

      if (response.ok) {
        setReplyText('');
        viewConversation(selectedMessage._id);
        fetchMyMessages();
      }
    } catch (error) {
      alert('Error sending reply');
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

  const getRecipientList = () => {
    switch (messageForm.recipientType) {
      case 'patient': return patients;
      case 'doctor': return doctors;
      case 'superadmin': return superAdmins;
      default: return [];
    }
  };

  return (
    <div className="dashboard-layout" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <AdminTopNav toggleSidebar={toggleSidebar} />
        <div className="dashboard-content" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1a202c', margin: 0 }}>Message Control Center</h1>
              <p style={{ color: '#718096', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Coordinate care and manage administrative communications portal-wide</p>
            </div>
            <button onClick={() => setShowCompose(true)} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>✉️ New Message</button>
          </div>

          {/* Stats Summary */}
          {statistics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
               {[
                 { label: 'Total Volume', val: statistics.totalMessages, icon: '📊', color: '#667eea' },
                 { label: 'Unread Alerts', val: statistics.unreadMessages, icon: '🔥', color: '#ef4444' },
                 { label: 'Broadcasts', val: statistics.broadcastMessages, icon: '📢', color: '#f59e0b' },
                 { label: 'Successful', val: statistics.readMessages, icon: '✅', color: '#10b981' }
               ].map(s => (
                <div key={s.label} style={{ background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{s.icon}</div>
                   <div>
                      <div style={{ color: '#a0aec0', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>{s.label}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1a202c' }}>{s.val}</div>
                   </div>
                </div>
               ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
             {[
               { id: 'mine', label: 'My Inbox', icon: '📬' },
               { id: 'all', label: 'All Messages', icon: '🌐' }
             ].map(tab => (
               <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent', color: activeTab === tab.id ? '#667eea' : '#a0aec0', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s' }}>
                  <span>{tab.icon}</span> {tab.label}
               </button>
             ))}
          </div>

          {/* Messages List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
             {messages.length > 0 ? messages.map(msg => {
               const isSentByMe = msg.sender._id === currentUser.id;
               const otherPerson = isSentByMe ? msg.recipient : msg.sender;
               const unread = !isSentByMe && !msg.isRead && !msg.isBroadcast;

               return (
                 <div key={msg._id} onClick={() => viewConversation(msg._id)} style={{ background: 'white', borderRadius: '24px', border: unread ? '2px solid #667eea' : '1px solid #e2e8f0', padding: '1.5rem', cursor: 'pointer', transition: '0.2s', position: 'relative' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 25px -10px rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    {unread && <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '10px', height: '10px', borderRadius: '50%', background: '#667eea' }}></div>}
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                       <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '1px solid #e2e8f0' }}>
                          {msg.isBroadcast ? '📢' : '👤'}
                       </div>
                       <div>
                          <div style={{ fontWeight: '800', color: '#1a202c', fontSize: '0.95rem' }}>
                            {msg.isBroadcast ? 'Global Broadcast' : (isSentByMe ? `To: ${otherPerson?.name}` : otherPerson?.name)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{formatDate(msg.createdAt)}</div>
                       </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                       <div style={{ fontWeight: '700', color: '#4a5568', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{msg.subject}</div>
                       <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {msg.message}
                       </p>
                    </div>

                    {msg.replies?.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#667eea', fontWeight: '800', background: '#667eea10', padding: '0.3rem 0.6rem', borderRadius: '8px', display: 'inline-block' }}>
                        💬 {msg.replies.length} REPLIES
                      </div>
                    )}
                 </div>
               )
             }) : (
                <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                   <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
                   <h3>Your mailbox is currently empty</h3>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
          <div style={{ background: 'white', width: '550px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
             <div style={{ background: '#667eea', padding: '1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>New Correspondence</h3>
                <button onClick={() => setShowCompose(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
             </div>
             
             <div style={{ padding: '2rem' }}>
                <form onSubmit={handleSendMessage}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase' }}>Type</label>
                        <select value={messageForm.messageType} onChange={e => setMessageForm({ ...messageForm, messageType: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                          <option value="individual">Direct Message</option>
                          <option value="broadcast">Broadcast</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase' }}>To Role</label>
                        <select value={messageForm.recipientType} onChange={e => setMessageForm({ ...messageForm, recipientType: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                          <option value="patient">Patients</option>
                          <option value="doctor">Doctors</option>
                        </select>
                      </div>
                   </div>

                   {messageForm.messageType === 'individual' ? (
                     <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase' }}>Recipient</label>
                        <select value={messageForm.recipient} onChange={e => setMessageForm({ ...messageForm, recipient: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                           <option value="">Choose individual...</option>
                           {getRecipientList().map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                        </select>
                     </div>
                   ) : (
                     <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', textTransform: 'uppercase' }}>Broadcast Target</label>
                        <select value={messageForm.broadcastType} onChange={e => setMessageForm({ ...messageForm, broadcastType: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                           <option value="">Select pool...</option>
                           <option value="all_patients">Everyone (Patients)</option>
                           <option value="all_doctors">Medical Staff (Doctors)</option>
                        </select>
                     </div>
                   )}

                   <div style={{ marginBottom: '1.5rem' }}>
                      <input type="text" placeholder="Subject" value={messageForm.subject} onChange={e => setMessageForm({ ...messageForm, subject: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                   </div>

                   <div style={{ marginBottom: '1.5rem' }}>
                      <textarea placeholder="Write your message..." value={messageForm.message} onChange={e => setMessageForm({ ...messageForm, message: e.target.value })} style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', border: '1px solid #e2e8f0', minHeight: '120px', outline: 'none' }} />
                   </div>

                   <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: 'none', background: '#667eea', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Dispatch Correspondence</button>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Conversation Thread Modal */}
      {showConversation && selectedMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
          <div style={{ background: 'white', width: '600px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', height: '80vh' }}>
             <div style={{ background: '#f8fafc', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <div style={{ fontSize: '0.75rem', color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase' }}>Conversation Re:</div>
                   <div style={{ fontWeight: '800', color: '#1a202c' }}>{selectedMessage.subject}</div>
                </div>
                <button onClick={() => setShowConversation(false)} style={{ background: 'none', border: 'none', color: '#a0aec0', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
             </div>

             <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f1f5f9' }}>
                {/* Original Message */}
                <div style={{ alignSelf: selectedMessage.sender._id === currentUser.id ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                   <div style={{ fontSize: '0.65rem', color: '#a0aec0', marginBottom: '0.5rem', textAlign: selectedMessage.sender._id === currentUser.id ? 'right' : 'left' }}>
                      {selectedMessage.sender.name} ({selectedMessage.sender.role})
                   </div>
                   <div style={{ background: selectedMessage.sender._id === currentUser.id ? '#667eea' : 'white', color: selectedMessage.sender._id === currentUser.id ? 'white' : '#1a202c', padding: '1rem', borderRadius: '20px', borderBottomLeftRadius: selectedMessage.sender._id === currentUser.id ? '20px' : '4px', borderBottomRightRadius: selectedMessage.sender._id === currentUser.id ? '4px' : '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      {selectedMessage.message}
                   </div>
                </div>

                {/* Replies */}
                {selectedMessage.replies?.map((reply, idx) => (
                   <div key={idx} style={{ alignSelf: reply.sender === currentUser.id ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      <div style={{ background: reply.sender === currentUser.id ? '#667eea' : 'white', color: reply.sender === currentUser.id ? 'white' : '#1a202c', padding: '1rem', borderRadius: '20px', borderBottomLeftRadius: reply.sender === currentUser.id ? '20px' : '4px', borderBottomRightRadius: reply.sender === currentUser.id ? '4px' : '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                         {reply.message}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#a0aec0', marginTop: '0.3rem', textAlign: reply.sender === currentUser.id ? 'right' : 'left' }}>
                         {new Date(reply.createdAt).toLocaleTimeString()}
                      </div>
                   </div>
                ))}
             </div>

             <div style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                 <div style={{ display: 'flex', gap: '1rem' }}>
                    <input type="text" placeholder="Type your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendReply()} style={{ flex: 1, padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }} />
                    <button onClick={handleSendReply} style={{ padding: '0 1.5rem', borderRadius: '14px', border: 'none', background: '#667eea', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Reply</button>
                 </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;