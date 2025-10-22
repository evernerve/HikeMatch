import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import {
  sendConnectionRequest,
  getSentRequests,
  getReceivedRequests,
  getConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  sendResetRequest,
  getSentResetRequests,
  getReceivedResetRequests,
  acceptResetRequest,
  rejectResetRequest,
  ConnectionRequest,
  Connection,
  ResetRequest
} from '../lib/firestoreHelpers';
import { CategoryType } from '../types/categories';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import ResetMatchesModal from '../components/ResetMatchesModal';

export default function Connections() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sentResetRequests, setSentResetRequests] = useState<ResetRequest[]>([]);
  const [receivedResetRequests, setReceivedResetRequests] = useState<ResetRequest[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [actionRequest, setActionRequest] = useState<{ id: string; action: 'accept' | 'reject' } | null>(null);
  const [resetActionRequest, setResetActionRequest] = useState<{ id: string; action: 'accept' | 'reject' } | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{ userId: string; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!auth.currentUser) return;

    try {
      const [sent, received, conns, sentResets, receivedResets] = await Promise.all([
        getSentRequests(),
        getReceivedRequests(),
        getConnections(),
        getSentResetRequests(),
        getReceivedResetRequests()
      ]);

      setSentRequests(sent);
      setReceivedRequests(received);
      setConnections(conns);
      setSentResetRequests(sentResets);
      setReceivedResetRequests(receivedResets);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || sending) return;

    setSending(true);

    try {
      await sendConnectionRequest(username.trim());
      setToast({ message: `Connection request sent to @${username}!`, type: 'success' });
      setUsername('');
      await loadData();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to send request', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    if (!actionRequest || actionRequest.action !== 'accept') return;

    try {
      await acceptConnectionRequest(actionRequest.id);
      setToast({ message: 'Connection request accepted!', type: 'success' });
      await loadData();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to accept request', type: 'error' });
    } finally {
      setActionRequest(null);
    }
  };

  const handleReject = async () => {
    if (!actionRequest || actionRequest.action !== 'reject') return;

    try {
      await rejectConnectionRequest(actionRequest.id);
      setToast({ message: 'Connection request rejected', type: 'info' });
      await loadData();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to reject request', type: 'error' });
    } finally {
      setActionRequest(null);
    }
  };

  const handleSendResetRequest = async (userId: string, category: CategoryType) => {
    try {
      await sendResetRequest(userId, category);
      setToast({ 
        message: `Reset request sent! Your friend will be notified.`, 
        type: 'success' 
      });
      await loadData();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to send reset request', type: 'error' });
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleAcceptResetRequest = async () => {
    if (!resetActionRequest || resetActionRequest.action !== 'accept') return;

    try {
      await acceptResetRequest(resetActionRequest.id);
      setToast({ 
        message: 'Matches reset! You can now swipe fresh together.', 
        type: 'success' 
      });
      await loadData();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to accept reset request', type: 'error' });
    } finally {
      setResetActionRequest(null);
    }
  };

  const handleRejectResetRequest = async () => {
    if (!resetActionRequest || resetActionRequest.action !== 'reject') return;

    try {
      await rejectResetRequest(resetActionRequest.id);
      setToast({ message: 'Reset request declined', type: 'info' });
      await loadData();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to decline request', type: 'error' });
    } finally {
      setResetActionRequest(null);
    }
  };

  const openResetModal = (userId: string, name: string) => {
    setSelectedFriend({ userId, name });
    setResetModalOpen(true);
  };

  const closeResetModal = () => {
    setResetModalOpen(false);
    setSelectedFriend(null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-primary-50 via-forest-50 to-primary-100 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            👥 Connections
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Connect with friends to see your matches and share recommendations
          </p>
        </div>

        {/* Send Invite */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">🔗 Send Connection Request</h2>
          <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field flex-1 text-sm sm:text-base"
              placeholder="Enter username..."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !username.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            >
              {sending ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        </div>

        {/* Received Requests */}
        {receivedRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              📨 Received Requests ({receivedRequests.length})
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-blue-50 rounded-lg gap-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {request.fromDisplayName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">@{request.fromUsername}</p>
                  </div>
                  <div className="flex gap-2 sm:gap-2">
                    <button
                      onClick={() => setActionRequest({ id: request.id, action: 'accept' })}
                      className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-sm flex-1 sm:flex-none"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => setActionRequest({ id: request.id, action: 'reject' })}
                      className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-800 font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-sm flex-1 sm:flex-none"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sent Requests */}
        {sentRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              📤 Sent Requests ({sentRequests.length})
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-yellow-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {request.toUsername}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Pending...</p>
                  </div>
                  <span className="text-gray-400 text-xl sm:text-2xl">⏳</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected Friends */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
            ✅ Connected ({connections.length})
          </h2>
          {connections.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <span className="text-5xl sm:text-6xl mb-3 sm:mb-4 block">🤝</span>
              <p className="text-sm sm:text-base text-gray-600">No connections yet</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Send a request to start matching with friends!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {connections.map((connection, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-lg group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
                    {connection.connectedDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {connection.connectedDisplayName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      @{connection.connectedUsername}
                    </p>
                  </div>
                  <button
                    onClick={() => openResetModal(connection.connectedUserId, connection.connectedDisplayName)}
                    className="flex-shrink-0 bg-orange-100 hover:bg-orange-200 active:bg-orange-300 text-orange-700 font-semibold py-2 px-3 rounded-lg transition text-xs sm:text-sm whitespace-nowrap"
                    title="Reset matches"
                  >
                    🔄 Reset
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Received Reset Requests */}
        {receivedResetRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              🔄 Reset Requests ({receivedResetRequests.length})
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {receivedResetRequests.map((request) => {
                const categoryEmoji = 
                  request.category === 'hikes' ? '🥾' :
                  request.category === 'movies' ? '🎬' :
                  request.category === 'tv' ? '📺' : '🍽️';
                const categoryLabel =
                  request.category === 'hikes' ? 'Hikes' :
                  request.category === 'movies' ? 'Movies' :
                  request.category === 'tv' ? 'TV Shows' : 'Restaurants';
                
                return (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-orange-50 rounded-lg gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {categoryEmoji} {request.fromDisplayName} wants to reset {categoryLabel}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        All mutual matches and swipes will be cleared
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setResetActionRequest({ id: request.id, action: 'accept' })}
                        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-sm flex-1 sm:flex-none"
                      >
                        ✓ Reset
                      </button>
                      <button
                        onClick={() => setResetActionRequest({ id: request.id, action: 'reject' })}
                        className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-800 font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-sm flex-1 sm:flex-none"
                      >
                        ✗ Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sent Reset Requests */}
        {sentResetRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              ⏳ Pending Reset Requests ({sentResetRequests.length})
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {sentResetRequests.map((request) => {
                const categoryEmoji = 
                  request.category === 'hikes' ? '🥾' :
                  request.category === 'movies' ? '🎬' :
                  request.category === 'tv' ? '📺' : '🍽️';
                const categoryLabel =
                  request.category === 'hikes' ? 'Hikes' :
                  request.category === 'movies' ? 'Movies' :
                  request.category === 'tv' ? 'TV Shows' : 'Restaurants';
                
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-yellow-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {categoryEmoji} Reset {categoryLabel} with {request.toDisplayName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Waiting for {request.toDisplayName} to respond...
                      </p>
                    </div>
                    <span className="text-gray-400 text-xl sm:text-2xl">⏳</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reset Matches Modal */}
      {selectedFriend && (
        <ResetMatchesModal
          isOpen={resetModalOpen}
          friendName={selectedFriend.name}
          friendUserId={selectedFriend.userId}
          onClose={closeResetModal}
          onSendRequest={handleSendResetRequest}
        />
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={actionRequest?.action === 'accept'}
        title="Accept Connection?"
        message="You'll be able to see matches and share recommendations with this user."
        confirmText="Accept"
        cancelText="Cancel"
        onConfirm={handleAccept}
        onCancel={() => setActionRequest(null)}
        type="info"
      />

      <ConfirmModal
        isOpen={actionRequest?.action === 'reject'}
        title="Reject Connection?"
        message="This request will be declined."
        confirmText="Reject"
        cancelText="Cancel"
        onConfirm={handleReject}
        onCancel={() => setActionRequest(null)}
        type="warning"
      />

      <ConfirmModal
        isOpen={resetActionRequest?.action === 'accept'}
        title="Accept Reset Request?"
        message="This will delete all mutual matches and swipes for this category with your friend. You'll both be able to swipe fresh on these items."
        confirmText="Accept & Reset"
        cancelText="Cancel"
        onConfirm={handleAcceptResetRequest}
        onCancel={() => setResetActionRequest(null)}
        type="warning"
      />

      <ConfirmModal
        isOpen={resetActionRequest?.action === 'reject'}
        title="Decline Reset Request?"
        message="Your friend's reset request will be declined."
        confirmText="Decline"
        cancelText="Cancel"
        onConfirm={handleRejectResetRequest}
        onCancel={() => setResetActionRequest(null)}
        type="info"
      />

      {/* Toast */}
      {toast && (
        <Toast
          isOpen={true}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
