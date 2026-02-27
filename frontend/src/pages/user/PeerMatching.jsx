import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";

function PeerMatching() {
  const [matches, setMatches] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    interests: [],
    skills: [],
    academicLevel: "",
  });
  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [sendingConnection, setSendingConnection] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [showSentRequests, setShowSentRequests] = useState(false);
  const [loadingSentRequests, setLoadingSentRequests] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showReceivedRequests, setShowReceivedRequests] = useState(false);
  const [loadingReceivedRequests, setLoadingReceivedRequests] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [processingRequest, setProcessingRequest] = useState(null);

  // Load user profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get("/api/peer-matching/profile");
      if (response.success) {
        setProfile(response.data);
        setEditForm({
          interests: response.data.interests || [],
          skills: response.data.skills || [],
          academicLevel: response.data.academicLevel || "",
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const loadSentRequests = async () => {
    setLoadingSentRequests(true);
    try {
      const response = await api.get("/api/peer-matching/sent-requests");
      if (response.success) {
        setSentRequests(response.data.requests || []);
      }
    } catch (err) {
      console.error("Error loading sent requests:", err);
    } finally {
      setLoadingSentRequests(false);
    }
  };

  const loadReceivedRequests = async () => {
    setLoadingReceivedRequests(true);
    try {
      const response = await api.get("/api/peer-matching/received-requests");
      if (response.success) {
        setReceivedRequests(response.data.requests || []);
        setPendingCount(response.data.pendingCount || 0);
      }
    } catch (err) {
      console.error("Error loading received requests:", err);
    } finally {
      setLoadingReceivedRequests(false);
    }
  };

  const findMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/peer-matching/matches?limit=10");

      if (response.success) {
        setMatches(response.data.matches || []);
        setHasSearched(true);
      } else {
        setError("Failed to find matches");
      }
    } catch (err) {
      console.error("Error finding matches:", err);
      setError(err.message || "Failed to find matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await api.put("/api/peer-matching/profile", editForm);

      if (response.success) {
        setProfile(response.data);
        setShowEditModal(false);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile: " + err.message);
    }
  };

  const addInterest = () => {
    if (
      newInterest.trim() &&
      !editForm.interests.includes(newInterest.trim())
    ) {
      setEditForm({
        ...editForm,
        interests: [...editForm.interests, newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interest) => {
    setEditForm({
      ...editForm,
      interests: editForm.interests.filter((i) => i !== interest),
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter((s) => s !== skill),
    });
  };

  const handleConnectClick = (user) => {
    setSelectedUser(user);
    setConnectMessage("");
    setShowConnectModal(true);
  };

  const sendConnectionRequest = async () => {
    if (!selectedUser) return;

    setSendingConnection(true);
    try {
      const response = await api.post("/api/peer-matching/connect", {
        recipientId: selectedUser._id,
        message: connectMessage,
      });

      if (response.success) {
        alert(
          `Connection request sent to ${selectedUser.firstName} ${selectedUser.lastName}!`
        );
        setShowConnectModal(false);
        setSelectedUser(null);
        setConnectMessage("");
        // Reload sent requests if viewing that section
        if (showSentRequests) {
          loadSentRequests();
        }
      } else {
        alert("Failed to send connection request: " + response.message);
      }
    } catch (err) {
      console.error("Error sending connection request:", err);
      alert("Failed to send connection request: " + err.message);
    } finally {
      setSendingConnection(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const response = await api.put(
        `/api/peer-matching/requests/${requestId}/accept`
      );

      if (response.success) {
        alert("Connection request accepted!");
        loadReceivedRequests();
      } else {
        alert("Failed to accept request: " + response.message);
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Failed to accept request: " + err.message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const response = await api.put(
        `/api/peer-matching/requests/${requestId}/decline`
      );

      if (response.success) {
        alert("Connection request declined");
        loadReceivedRequests();
      } else {
        alert("Failed to decline request: " + response.message);
      }
    } catch (err) {
      console.error("Error declining request:", err);
      alert("Failed to decline request: " + err.message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 70) return "text-green-600 bg-green-50";
    if (score >= 50) return "text-blue-600 bg-blue-50";
    if (score >= 30) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 mt-15">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Find Your Perfect
          <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {" "}
            Study Buddy
          </span>
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Connect with like-minded students who share your interests and
          learning goals. Our K-means clustering algorithm finds your ideal
          study partners.
        </p>
      </div>

      {/* Profile Summary */}
      {profile && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Your Profile
            </h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-700">University:</span>{" "}
              <span className="text-slate-600">
                {profile.university || "Not set"}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Major:</span>{" "}
              <span className="text-slate-600">
                {profile.major || "Not set"}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">
                Academic Level:
              </span>{" "}
              <span className="text-slate-600 capitalize">
                {profile.academicLevel || "Not set"}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Plan:</span>{" "}
              <span className="text-slate-600">{profile.plan}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Interests:</span>{" "}
              <span className="text-slate-600">
                {profile.interests?.length || 0} added
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Skills:</span>{" "}
              <span className="text-slate-600">
                {profile.skills?.length || 0} added
              </span>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => {
            setShowSentRequests(false);
            setShowReceivedRequests(false);
          }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            !showSentRequests && !showReceivedRequests
              ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Find Matches
        </button>
        <button
          onClick={() => {
            setShowReceivedRequests(true);
            setShowSentRequests(false);
            loadReceivedRequests();
          }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${
            showReceivedRequests
              ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Received Requests
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setShowSentRequests(true);
            setShowReceivedRequests(false);
            loadSentRequests();
          }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            showSentRequests
              ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Sent Requests
          {sentRequests.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white text-teal-600 rounded-full text-xs font-bold">
              {sentRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Received Requests Section */}
      {showReceivedRequests ? (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Connection Requests Received
            </h2>
            <p className="text-slate-600">
              Review and respond to connection requests from other students
            </p>
          </div>

          {loadingReceivedRequests ? (
            <div className="text-center py-12">
              <div className="animate-spin w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <p className="text-slate-600">Loading received requests...</p>
            </div>
          ) : receivedRequests.length > 0 ? (
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {request.sender?.avatar ? (
                          <img
                            src={request.sender.avatar}
                            alt={request.sender.firstName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(
                            request.sender?.firstName,
                            request.sender?.lastName
                          )
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          {request.sender?.firstName} {request.sender?.lastName}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {request.sender?.major && `${request.sender.major}, `}
                          {request.sender?.university || "University not set"}
                        </p>
                        <div className="mb-3">
                          <span className="text-xs font-semibold text-slate-500 uppercase">
                            Academic Level:{" "}
                          </span>
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium capitalize">
                            {request.sender?.academicLevel}
                          </span>
                        </div>

                        {/* Interests */}
                        {request.sender?.interests &&
                          request.sender.interests.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                                Interests:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {request.sender.interests
                                  .slice(0, 3)
                                  .map((interest, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium"
                                    >
                                      {interest}
                                    </span>
                                  ))}
                                {request.sender.interests.length > 3 && (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                    +{request.sender.interests.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Skills */}
                        {request.sender?.skills &&
                          request.sender.skills.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                                Skills:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {request.sender.skills
                                  .slice(0, 3)
                                  .map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                {request.sender.skills.length > 3 && (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                    +{request.sender.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        <div className="bg-teal-50 rounded-lg p-3 mb-3 border border-teal-100">
                          <p className="text-xs font-semibold text-teal-700 mb-1">
                            Message:
                          </p>
                          <p className="text-sm text-slate-700 italic">
                            "{request.message}"
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>
                            Received:{" "}
                            {new Date(request.sentAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full font-medium ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : request.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          disabled={processingRequest === request._id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingRequest === request._id
                            ? "Processing..."
                            : "Accept"}
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request._id)}
                          disabled={processingRequest === request._id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingRequest === request._id
                            ? "Processing..."
                            : "Decline"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                No Connection Requests Yet
              </h3>
              <p className="text-slate-600">
                When someone wants to connect with you, their request will
                appear here
              </p>
            </div>
          )}
        </div>
      ) : showSentRequests ? (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Your Sent Connection Requests
            </h2>
            <p className="text-slate-600">
              View all the connection requests you've sent to other students
            </p>
          </div>

          {loadingSentRequests ? (
            <div className="text-center py-12">
              <div className="animate-spin w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <p className="text-slate-600">Loading your sent requests...</p>
            </div>
          ) : sentRequests.length > 0 ? (
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {request.recipient?.avatar ? (
                          <img
                            src={request.recipient.avatar}
                            alt={request.recipient.firstName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(
                            request.recipient?.firstName,
                            request.recipient?.lastName
                          )
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          {request.recipient?.firstName}{" "}
                          {request.recipient?.lastName}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {request.recipient?.major &&
                            `${request.recipient.major}, `}
                          {request.recipient?.university ||
                            "University not set"}
                        </p>
                        <div className="mb-3">
                          <span className="text-xs font-semibold text-slate-500 uppercase">
                            Academic Level:{" "}
                          </span>
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium capitalize">
                            {request.recipient?.academicLevel}
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 mb-2">
                          <p className="text-xs font-semibold text-slate-600 mb-1">
                            Your Message:
                          </p>
                          <p className="text-sm text-slate-700 italic">
                            "{request.message}"
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>
                            Sent:{" "}
                            {new Date(request.sentAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full font-medium ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : request.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                No Connection Requests Sent Yet
              </h3>
              <p className="text-slate-600 mb-4">
                Start by finding matches and sending connection requests!
              </p>
              <button
                onClick={() => setShowSentRequests(false)}
                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:brightness-105 transition-all"
              >
                Find Matches
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Find Friends Button */}
          <div className="text-center mb-12">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 mb-8">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 12a4 4 0 100-8 4 4 0 000 8zm8 8v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  Ready to Find Your Study Partners?
                </h2>
                <p className="text-slate-600 mb-6">
                  Click below to discover students with similar interests,
                  skills, and academic goals using our K-means clustering
                  algorithm.
                </p>
                <button
                  onClick={findMatches}
                  disabled={loading}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Finding Your Perfect Matches...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Find a Friend
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Analyzing Your Profile...
              </h3>
              <p className="text-slate-600">
                Using K-means clustering to find your perfect study matches
              </p>
            </div>
          )}

          {/* Match Results */}
          {hasSearched && !loading && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Your Study Buddy Matches
                  </h2>
                  <p className="text-slate-600">
                    Found {matches.length} compatible study partners
                  </p>
                </div>
                <button
                  onClick={findMatches}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-300"
                >
                  Refresh Matches
                </button>
              </div>

              {matches.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {matches.map((match) => (
                    <div
                      key={match._id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      {/* Match Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {match.avatar ? (
                                <img
                                  src={match.avatar}
                                  alt={match.firstName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                getInitials(match.firstName, match.lastName)
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-800">
                                {match.firstName} {match.lastName}
                              </h3>
                              <p className="text-slate-600 text-sm">
                                {match.major && `${match.major}, `}
                                {match.university || "University not set"}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full font-semibold text-sm ${getMatchColor(
                              match.matchScore
                            )}`}
                          >
                            {match.matchScore} pts
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                          {/* Academic Level */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                              Academic Level
                            </h4>
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                              {match.academicLevel}
                            </span>
                          </div>

                          {/* Plan */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                              Plan
                            </h4>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {match.plan}
                            </span>
                          </div>

                          {/* Interests */}
                          {match.interests && match.interests.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                Interests
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {match.interests
                                  .slice(0, 4)
                                  .map((interest, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
                                    >
                                      {interest}
                                    </span>
                                  ))}
                                {match.interests.length > 4 && (
                                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                    +{match.interests.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {match.skills && match.skills.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                Skills
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {match.skills
                                  .slice(0, 4)
                                  .map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                {match.skills.length > 4 && (
                                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                    +{match.skills.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-6 pb-6">
                        <button
                          onClick={() => handleConnectClick(match)}
                          className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:brightness-105 transition-all duration-300"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 12a4 4 0 100-8 4 4 0 000 8zm8 8v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    No Matches Found
                  </h3>
                  <p className="text-slate-600">
                    Try updating your profile or check back later for new users.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* How It Works Section */}
      <div className="mt-16 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          How K-Means Clustering Finds Your Perfect Match
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Profile Analysis</h3>
            <p className="text-sm text-slate-600">
              Analyzes your university, interests, skills, academic level, and
              plan to create your unique profile.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Smart Clustering</h3>
            <p className="text-sm text-slate-600">
              Groups students with similar profiles using K-means clustering
              algorithm for optimal matching.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 12a4 4 0 100-8 4 4 0 000 8zm8 8v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2"
                />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Perfect Matches</h3>
            <p className="text-sm text-slate-600">
              Get highly compatible study partners ranked by match score (up to
              100 points).
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Edit Your Profile
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Academic Level */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Academic Level
                  </label>
                  <select
                    value={editForm.academicLevel}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        academicLevel: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select level</option>
                    <option value="freshman">Freshman</option>
                    <option value="sophomore">Sophomore</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="graduate">Graduate</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Interests
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addInterest()}
                      placeholder="Add an interest..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      onClick={addInterest}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editForm.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                      >
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="hover:text-teal-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      placeholder="Add a skill..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editForm.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-orange-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={updateProfile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:brightness-105 font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(selectedUser.firstName, selectedUser.lastName)
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Connect with {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p className="text-slate-600">
                Send a message to introduce yourself!
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Your Message
              </label>
              <textarea
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                placeholder="Hi! I'd love to connect and study together..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                {selectedUser.firstName} will receive your connection request
                and can accept or decline it
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setSelectedUser(null);
                  setConnectMessage("");
                }}
                disabled={sendingConnection}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={sendConnectionRequest}
                disabled={sendingConnection}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:brightness-105 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingConnection ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PeerMatching;
