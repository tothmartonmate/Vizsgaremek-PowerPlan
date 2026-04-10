import React from 'react';

const AdminSection = ({
  adminLoading,
  adminActivePanel,
  setAdminActivePanel,
  unreadAdminMessagesCount,
  adminMessages,
  adminMessageTab,
  setAdminMessageTab,
  incomingAdminMessages,
  sentAdminMessages,
  isUnreadForAdmin,
  handleAdminMessageReplyChange,
  saveAdminReply,
  deleteAdminMessage,
  deletingAdminMessageId,
  adminUsers,
  handleAdminUserFieldChange,
  sendAdminDirectMessage,
  openDeleteAdminUserModal,
  deletingAdminUserId,
  savedAdminUserIds,
  saveAdminUser,
  onRefreshAdmin
}) => (
  <div className="card">
    <div className="section-header">
      <h2><i className="fas fa-user-shield"></i> Admin felület</h2>
      <button className="btn btn-secondary" onClick={onRefreshAdmin}>
        <i className="fas fa-rotate-right"></i> Frissítés
      </button>
    </div>

    {adminLoading ? (
      <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Admin adatok betöltése...</div>
    ) : (
      <div className="admin-layout">
        <div className={`admin-panel ${adminActivePanel === 'messages' ? 'active' : 'hidden'}`}>
          <button
            type="button"
            className={`admin-panel-header admin-panel-tab ${adminActivePanel === 'messages' ? 'active' : ''}`}
            onClick={() => setAdminActivePanel('messages')}
          >
            <h3>
              Kapcsolati üzenetek
              {unreadAdminMessagesCount > 0 && <strong className="inline-unread-badge">{unreadAdminMessagesCount} új</strong>}
            </h3>
            <span>{adminMessages.length} db</span>
          </button>
          <div className={`admin-grid ${adminActivePanel === 'messages' ? 'active' : ''}`}>
            <div className="admin-message-tabs">
              <button
                type="button"
                className={`admin-message-tab ${adminMessageTab === 'incoming' ? 'active' : ''}`}
                onClick={() => setAdminMessageTab('incoming')}
              >
                Beérkezett üzenetek
                <span>{incomingAdminMessages.length}</span>
                {unreadAdminMessagesCount > 0 && <strong className="inline-unread-badge">{unreadAdminMessagesCount} új</strong>}
              </button>
              <button
                type="button"
                className={`admin-message-tab ${adminMessageTab === 'sent' ? 'active' : ''}`}
                onClick={() => setAdminMessageTab('sent')}
              >
                Elküldött üzenetek
                <span>{sentAdminMessages.length}</span>
              </button>
            </div>
            {(adminMessageTab === 'incoming' ? incomingAdminMessages : sentAdminMessages).map((message) => (
              <div key={message.id} className={`admin-message-card ${isUnreadForAdmin(message) ? 'unread-thread' : ''}`}>
                <div className="admin-card-top">
                  <div>
                    <h4>{message.subject}</h4>
                    <p className="admin-meta">{message.name} • {message.email}</p>
                  </div>
                  <span className={`admin-status-pill ${isUnreadForAdmin(message) ? 'unread' : message.status}`}>{isUnreadForAdmin(message) ? 'Új' : message.status === 'replied' ? 'Megválaszolva' : 'Feldolgozás alatt'}</span>
                </div>
                {message.origin === 'admin' ? (
                  <div className="message-bubble admin-message-bubble admin-sent-bubble">
                    <strong>Elküldött admin üzenet:</strong>
                    <p className="admin-message-body">{message.adminReply || 'Nincs üzenetszöveg.'}</p>
                  </div>
                ) : (
                  <>
                    <p className="admin-message-body">{message.message}</p>
                    <textarea
                      className="form-control admin-reply-box"
                      placeholder="Admin válasz..."
                      value={message.adminReply || ''}
                      onChange={(e) => handleAdminMessageReplyChange(message.id, e.target.value)}
                    />
                  </>
                )}
                <div className="admin-card-actions">
                  <small>{new Date(message.createdAt).toLocaleString('hu-HU')}</small>
                  <div className="admin-user-actions">
                    {message.origin !== 'admin' && (
                      <button className="btn btn-primary" onClick={() => saveAdminReply(message.id)}>
                        <i className="fas fa-paper-plane"></i> Válasz mentése
                      </button>
                    )}
                    <button className="btn btn-secondary admin-delete-btn" onClick={() => deleteAdminMessage(message.id)} disabled={deletingAdminMessageId === message.id}>
                      <i className="fas fa-trash"></i> {deletingAdminMessageId === message.id ? 'Törlés...' : 'Üzenet törlése'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setAdminActivePanel(null)}>
                      <i className="fas fa-xmark"></i> Bezárás
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {(adminMessageTab === 'incoming' ? incomingAdminMessages.length === 0 : sentAdminMessages.length === 0) && (
              <p className="no-data">{adminMessageTab === 'incoming' ? 'Még nincs beérkezett üzenet.' : 'Még nincs elküldött admin üzenet.'}</p>
            )}
          </div>
        </div>

        <div className={`admin-panel ${adminActivePanel === 'users' ? 'active' : 'hidden'}`}>
          <button
            type="button"
            className={`admin-panel-header admin-panel-tab ${adminActivePanel === 'users' ? 'active' : ''}`}
            onClick={() => setAdminActivePanel('users')}
          >
            <h3>Felhasználók kezelése</h3>
            <span>{adminUsers.length} db</span>
          </button>
          <div className={`admin-grid ${adminActivePanel === 'users' ? 'active' : ''}`}>
            {adminUsers.map((user) => (
              <div key={user.id} className="admin-user-card">
                <div className="admin-card-top">
                  <div>
                    <h4>{user.fullName}</h4>
                    <p className="admin-meta">#{user.id} • {user.email}</p>
                  </div>
                  <label className="admin-role-toggle">
                    <span>Jogosultság</span>
                    <select
                      className="form-control"
                      value={user.role || 'user'}
                      onChange={(e) => handleAdminUserFieldChange(user.id, 'role', e.target.value)}
                    >
                      <option value="user">Felhasználó</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                </div>
                <div className="profile-info-grid admin-form-grid">
                  <div className="form-group">
                    <label>Név</label>
                    <input className="form-control" type="text" value={user.fullName || ''} onChange={(e) => handleAdminUserFieldChange(user.id, 'fullName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input className="form-control" type="email" value={user.email || ''} onChange={(e) => handleAdminUserFieldChange(user.id, 'email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Cél</label>
                    <input className="form-control" type="text" value={user.fitnessGoal || ''} onChange={(e) => handleAdminUserFieldChange(user.id, 'fitnessGoal', e.target.value)} />
                  </div>
                  <div className="form-group admin-message-compose">
                    <label>Admin üzenet tárgya</label>
                    <input className="form-control" type="text" value={user.adminMessageSubject || ''} onChange={(e) => handleAdminUserFieldChange(user.id, 'adminMessageSubject', e.target.value)} placeholder="Pl. Fiókoddal kapcsolatban" />
                  </div>
                  <div className="form-group admin-message-compose">
                    <label>Admin üzenet</label>
                    <textarea className="form-control admin-reply-box" value={user.adminMessageDraft || ''} onChange={(e) => handleAdminUserFieldChange(user.id, 'adminMessageDraft', e.target.value)} placeholder="Írj közvetlen üzenetet a felhasználónak..." />
                  </div>
                </div>
                <div className="admin-card-actions">
                  <small>{new Date(user.createdAt).toLocaleDateString('hu-HU')}</small>
                  <div className="admin-user-actions">
                    <button className="btn btn-secondary" onClick={() => sendAdminDirectMessage(user.id)}>
                      <i className="fas fa-paper-plane"></i> Üzenet küldése
                    </button>
                    {user.role !== 'admin' && (
                      <button className="btn btn-secondary admin-delete-btn" onClick={() => openDeleteAdminUserModal(user)} disabled={deletingAdminUserId === user.id}>
                        <i className="fas fa-trash"></i> {deletingAdminUserId === user.id ? 'Törlés...' : 'Törlés'}
                      </button>
                    )}
                    <button className={`btn ${savedAdminUserIds[user.id] ? 'btn-secondary saved' : 'btn-primary'}`} onClick={() => saveAdminUser(user.id)}>
                      <i className="fas fa-save"></i> {savedAdminUserIds[user.id] ? 'Mentve' : 'Mentés'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default AdminSection;