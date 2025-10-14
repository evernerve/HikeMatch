import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import {
  sendConnectionRequest,
  getSentRequests,
  getReceivedRequests,
  getConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  ConnectionRequest,
  Connection
} from '../lib/firestoreHelpers';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function Connections() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [actionRequest, setActionRequest] = useState<{ id: string; action: 'accept' | 'reject' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!auth.currentUser) return;

    try {
      const [sent, received, conns] = await Promise.all([
        getSentRequests(),
        getReceivedRequests(),
        getConnections()
      ]);

      setSentRequests(sent);
      setReceivedRequests(received);
      setConnections(conns);
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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            👥 Connections
          </h1>
          <p className="text-gray-600">
            Connect with friends to see your trail matches
          </p>
        </div>

        {/* Send Invite */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔗 Send Connection Request</h2>
          <form onSubmit={handleSendRequest} className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field flex-1"
              placeholder="Enter username..."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !username.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        </div>

        {/* Received Requests */}
        {receivedRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📨 Received Requests ({receivedRequests.length})
            </h2>
            <div className="space-y-3">
              {receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {request.fromDisplayName}
                    </p>
                    <p className="text-sm text-gray-600">@{request.fromUsername}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActionRequest({ id: request.id, action: 'accept' })}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => setActionRequest({ id: request.id, action: 'reject' })}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
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
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📤 Sent Requests ({sentRequests.length})
            </h2>
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {request.toUsername}
                    </p>
                    <p className="text-sm text-gray-600">Pending...</p>
                  </div>
                  <span className="text-gray-400">⏳</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected Friends */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            ✅ Connected ({connections.length})
          </h2>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">🤝</span>
              <p className="text-gray-600">No connections yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Send a request to start matching trails with friends!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((connection, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {connection.connectedDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {connection.connectedDisplayName}
                    </p>
                    <p className="text-sm text-gray-600">
                      @{connection.connectedUsername}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={actionRequest?.action === 'accept'}
        title="Accept Connection?"
        message="You'll be able to see trail matches with this user."
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
