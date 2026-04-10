import React from 'react';

const MessagesSection = ({
  onRefreshMessages,
  userMessageForm,
  setUserMessageForm,
  sendUserMessage,
  sendingUserMessage,
  unreadUserMessagesCount,
  userMessagesLoading,
  userMessageTab,
  setUserMessageTab,
  incomingUserMessages,
  sentUserMessages,
  isUnreadForUser,
  deleteUserMessage,
  deletingUserMessageId
}) => (
  <div className="card">
    <div className="section-header">
      <h2><i className="fas fa-envelope"></i> Üzeneteim</h2>
      <button className="btn btn-secondary" onClick={onRefreshMessages}>
        <i className="fas fa-rotate-right"></i> Frissítés
      </button>
    </div>
    <div className="messages-layout">
      <div className="messages-compose-card">
        <h3>Új üzenet az adminnak</h3>
        <div className="form-group">
          <label>Tárgy</label>
          <input
            className="form-control"
            type="text"
            value={userMessageForm.subject}
            onChange={(e) => setUserMessageForm((prev) => ({ ...prev, subject: e.target.value }))}
            placeholder="Miről szeretnél írni?"
          />
        </div>
        <div className="form-group">
          <label>Üzenet</label>
          <textarea
            className="form-control admin-reply-box"
            value={userMessageForm.message}
            onChange={(e) => setUserMessageForm((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Írd meg az üzenetedet az adminnak..."
          />
        </div>
        <button className="btn btn-primary" onClick={sendUserMessage} disabled={sendingUserMessage}>
          <i className="fas fa-paper-plane"></i> {sendingUserMessage ? 'Küldés...' : 'Üzenet küldése'}
        </button>
      </div>

      <div className="messages-list-card">
        <div className="section-header compact">
          <h3>
            Üzenetek
            {unreadUserMessagesCount > 0 && <strong className="inline-unread-badge">{unreadUserMessagesCount} új</strong>}
          </h3>
        </div>
        {userMessagesLoading ? (
          <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Üzenetek betöltése...</div>
        ) : (
          <div className="admin-grid">
            <div className="admin-message-tabs user-message-tabs">
              <button
                type="button"
                className={`admin-message-tab ${userMessageTab === 'incoming' ? 'active' : ''}`}
                onClick={() => setUserMessageTab('incoming')}
              >
                Beérkezett üzenetek
                <span>{incomingUserMessages.length}</span>
                {unreadUserMessagesCount > 0 && <strong className="inline-unread-badge">{unreadUserMessagesCount} új</strong>}
              </button>
              <button
                type="button"
                className={`admin-message-tab ${userMessageTab === 'sent' ? 'active' : ''}`}
                onClick={() => setUserMessageTab('sent')}
              >
                Elküldött üzenetek
                <span>{sentUserMessages.length}</span>
              </button>
            </div>
            {(userMessageTab === 'incoming' ? incomingUserMessages : sentUserMessages).map((message) => (
              <div key={message.id} className={`admin-message-card user-message-thread ${isUnreadForUser(message) ? 'unread-thread' : ''}`}>
                <div className="admin-card-top">
                  <div>
                    <h4>{message.subject}</h4>
                    <p className="admin-meta">Elküldve: {new Date(message.createdAt).toLocaleString('hu-HU')}</p>
                  </div>
                  <span className={`admin-status-pill ${isUnreadForUser(message) ? 'unread' : message.status}`}>{isUnreadForUser(message) ? 'Új' : message.status === 'replied' ? 'Megválaszolva' : 'Függőben'}</span>
                </div>
                {userMessageTab === 'sent' && message.origin !== 'admin' && (
                  <div className="message-bubble user-message-bubble">
                    <strong>Te:</strong>
                    <p className="admin-message-body">{message.message}</p>
                  </div>
                )}
                {message.adminReply && (
                  <div className="message-bubble admin-message-bubble">
                    <strong>Admin:</strong>
                    <p className="admin-message-body">{message.adminReply}</p>
                    {message.repliedAt && <small>{new Date(message.repliedAt).toLocaleString('hu-HU')}</small>}
                  </div>
                )}
                {userMessageTab === 'sent' && message.origin !== 'admin' && (
                  <div className="user-message-actions">
                    <button className="btn btn-secondary admin-delete-btn" onClick={() => deleteUserMessage(message.id)} disabled={deletingUserMessageId === message.id}>
                      <i className="fas fa-trash"></i> {deletingUserMessageId === message.id ? 'Törlés...' : 'Saját üzenet törlése'}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {(userMessageTab === 'incoming' ? incomingUserMessages.length === 0 : sentUserMessages.length === 0) && (
              <p className="no-data">{userMessageTab === 'incoming' ? 'Még nincs beérkezett admin üzeneted.' : 'Még nincs elküldött üzeneted az admin felé.'}</p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default MessagesSection;