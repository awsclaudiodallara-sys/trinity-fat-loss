import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  Users,
  MessageCircle,
  Clock,
} from "lucide-react";
import { useVideoCall } from "../lib/useVideoCall";
import { useWebRTCSignaling } from "../lib/useWebRTCSignaling";
import { VideoCallScheduling } from "../components/video/VideoCallScheduling";
import { useAuth } from "../hooks/useAuth";
import { dashboardService } from "../lib/supabase";

interface VideoCallParticipant {
  id: string;
  name: string;
  avatar?: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isConnected: boolean;
  isHost: boolean;
}

interface VideoCallSession {
  id: string;
  scheduledTime: string;
  duration: number; // in minutes
  participants: VideoCallParticipant[];
  status: "waiting" | "active" | "ended";
  agenda?: string[];
}

interface TrinityVideoProps {
  onGoBack?: () => void; // Navigation function
}

export const TrinityVideo: React.FC<TrinityVideoProps> = ({ onGoBack }) => {
  // Get real user data from auth
  const { user } = useAuth();

  // State for trio data
  const [trioData, setTrioData] = useState<{
    id: string;
    members: { id: string; name: string }[];
  } | null>(null);
  const [isLoadingTrio, setIsLoadingTrio] = useState(true);

  const [callSession, setCallSession] = useState<VideoCallSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);

  // Load trio data on mount
  useEffect(() => {
    const loadTrioData = async () => {
      if (!user) {
        setIsLoadingTrio(false);
        return;
      }

      try {
        const status = await dashboardService.getUserStatus(user.id);
        if (status.status === "in_trio" && status.trio) {
          setTrioData({
            id: status.trio.id,
            members: status.trio.members || [],
          });
        } else {
          console.log("User not in trio, status:", status.status);
        }
      } catch (error) {
        console.error("Error loading trio data:", error);
      } finally {
        setIsLoadingTrio(false);
      }
    };

    loadTrioData();
  }, [user]);

  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Hook per gestire la video chiamata reale
  const {
    videoState,
    startVideo: startRealVideo,
    stopVideo: stopRealVideo,
  } = useVideoCall();

  // Debug log per vedere lo stato del video
  useEffect(() => {
    console.log("VideoState changed:", videoState);
  }, [videoState]);

  // Auto-start video quando la pagina si carica per il test
  useEffect(() => {
    if (!videoState.localStream && !videoState.isLoading && !videoState.error) {
      console.log("Auto-starting video for testing...");
      startRealVideo();
    }
  }, [
    videoState.localStream,
    videoState.isLoading,
    videoState.error,
    startRealVideo,
  ]);

  // Refs per evitare re-render dei video
  const localVideoRef = useRef<HTMLVideoElement>(null); // Per preview
  const inCallVideoRef = useRef<HTMLVideoElement>(null); // Per griglia partecipanti
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>(
    {}
  );

  // Hook per gestire il signaling WebRTC P2P
  const callId = "trinity_call_demo"; // In produzione, sarà dinamico
  const currentUserId = user?.id || "anonymous"; // Safe access to user.id
  const {
    state: signalingState,
    startCall: startP2PCall,
    endCall: endP2PCall,
  } = useWebRTCSignaling(callId, currentUserId);

  // Mock data per ora - sarà sostituito con dati reali
  useEffect(() => {
    if (!user || !trioData) {
      setIsLoading(false);
      return;
    }

    // Crea partecipanti basati sui membri reali del trio
    const participants: VideoCallParticipant[] = trioData.members.map(
      (member, index) => ({
        id: member.id,
        name: member.name,
        videoEnabled: member.id === user.id ? localVideoEnabled : false, // Altri sempre disconnessi per ora
        audioEnabled: member.id === user.id ? localAudioEnabled : false,
        isConnected: member.id === user.id ? false : false, // Solo user può connettersi, altri sempre disconnessi per demo
        isHost: index === 0, // Primo membro è host
      })
    );

    const mockSession: VideoCallSession = {
      id: `trinity_call_${trioData.id}`,
      scheduledTime: new Date().toISOString(),
      duration: 30,
      participants,
      status: "waiting",
      agenda: [
        "Weekly progress review",
        "Goal adjustments",
        "Next week planning",
        "Mutual support check-in",
      ],
    };

    setTimeout(() => {
      setCallSession(mockSession);
      setIsLoading(false);
    }, 500);
  }, [user, trioData, localVideoEnabled, localAudioEnabled]);

  // TEMP: Crea una sessione di default per testing quando connesso
  useEffect(() => {
    if (isConnected && !callSession && trioData && user) {
      const defaultSession: VideoCallSession = {
        id: "demo-session",
        scheduledTime: new Date().toISOString(),
        duration: 0,
        status: "active",
        participants: trioData.members.map((member) => ({
          id: member.id,
          name: member.name,
          isConnected: member.id === user.id,
          videoEnabled: member.id === user.id ? localVideoEnabled : false,
          audioEnabled: member.id === user.id ? localAudioEnabled : false,
          isHost: member.id === user.id,
        })),
        agenda: ["Test della camera", "Test dell'audio", "Test dei toggle"],
      };
      setCallSession(defaultSession);
    }
  }, [
    isConnected,
    callSession,
    trioData,
    user,
    localVideoEnabled,
    localAudioEnabled,
  ]);

  // Effect per gestire il video locale in modo stabile (preview e in-call)
  useEffect(() => {
    console.log("useEffect localVideo:", {
      hasPreviewRef: !!localVideoRef.current,
      hasInCallRef: !!inCallVideoRef.current,
      hasStream: !!videoState.localStream,
      localVideoEnabled,
      streamTracks: videoState.localStream?.getTracks().length || 0,
    });

    const assignStreamToVideo = (video: HTMLVideoElement, label: string) => {
      if (video.srcObject !== videoState.localStream) {
        console.log(`Setting video srcObject for ${label}`);
        video.srcObject = videoState.localStream;

        // Force refresh
        video.load();

        video
          .play()
          .then(() => {
            console.log(`Video playing successfully for ${label}`);
          })
          .catch((error) => {
            console.error(`Error playing video for ${label}:`, error);
          });
      } else {
        console.log(`Video srcObject already set correctly for ${label}`);
      }
    };

    // Assegna stream a entrambi i video se esistono
    if (videoState.localStream) {
      if (localVideoRef.current) {
        assignStreamToVideo(localVideoRef.current, "preview");
      }
      if (inCallVideoRef.current) {
        assignStreamToVideo(inCallVideoRef.current, "in-call");
      }
    } else {
      console.log("Missing stream:", {
        hasPreviewRef: !!localVideoRef.current,
        hasInCallRef: !!inCallVideoRef.current,
        hasStream: !!videoState.localStream,
      });
    }
  }, [videoState.localStream]);

  // Effect per gestire i video remoti in modo stabile
  useEffect(() => {
    if (signalingState.remoteStream) {
      Object.values(remoteVideoRefs.current).forEach((video) => {
        if (video) {
          video.srcObject = signalingState.remoteStream;
          video.play().catch(console.error);
        }
      });
    }
  }, [signalingState.remoteStream]);

  // Timer per durata chiamata
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const joinCall = async () => {
    try {
      // Avvia la video chiamata reale
      await startRealVideo();

      // Per demo, avvia connessione P2P con un utente simulato
      // In produzione, questo sarà basato sui partecipanti reali
      const targetUserId = "demo_user_2"; // Simulato per test
      await startP2PCall(targetUserId);

      setIsConnected(true);
      if (callSession) {
        const updatedSession = {
          ...callSession,
          status: "active" as const,
          participants: callSession.participants.map((p) =>
            p.id === user?.id
              ? {
                  ...p,
                  isConnected: true,
                  videoEnabled: localVideoEnabled,
                  audioEnabled: localAudioEnabled,
                }
              : p
          ),
        };
        setCallSession(updatedSession);
      }
    } catch (error) {
      console.error("Errore nel joining della call:", error);
      // Gestire l'errore mostrando un messaggio all'utente
    }
  };

  const leaveCall = () => {
    // Ferma la video chiamata reale
    stopRealVideo();

    // Termina la connessione P2P
    endP2PCall();

    setIsConnected(false);
    setCallDuration(0);
    if (callSession) {
      const updatedSession = {
        ...callSession,
        status: "ended" as const,
        participants: callSession.participants.map((p) =>
          p.id === user?.id ? { ...p, isConnected: false } : p
        ),
      };
      setCallSession(updatedSession);
    }
  };

  // Utilizziamo le funzioni reali dal hook invece delle mock
  const toggleVideo = async () => {
    const newVideoState = !localVideoEnabled;

    // SEMPRE aggiorna lo stato UI
    setLocalVideoEnabled(newVideoState);

    // Se c'è già uno stream attivo, aggiorna i track
    if (videoState.localStream) {
      const videoTrack = videoState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newVideoState;
        console.log("Video track enabled:", newVideoState);
      }
    }

    // Aggiorna anche lo stato del partecipante nella sessione
    if (callSession) {
      const updatedSession = {
        ...callSession,
        participants: callSession.participants.map((p) =>
          p.id === user?.id ? { ...p, videoEnabled: newVideoState } : p
        ),
      };
      setCallSession(updatedSession);
    }
  };

  const toggleAudio = async () => {
    const newAudioState = !localAudioEnabled;
    setLocalAudioEnabled(newAudioState);

    // Se c'è già uno stream attivo, aggiorna i track
    if (videoState.localStream) {
      const audioTrack = videoState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newAudioState;
        console.log("Audio track enabled:", newAudioState);
      }
    }

    // Aggiorna anche lo stato del partecipante nella sessione
    if (callSession) {
      const updatedSession = {
        ...callSession,
        participants: callSession.participants.map((p) =>
          p.id === user?.id ? { ...p, audioEnabled: newAudioState } : p
        ),
      };
      setCallSession(updatedSession);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const goBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      console.log("Going back to dashboard...");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing Trinity Video Call...</p>
        </div>
      </div>
    );
  }

  // Return early if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access video calls</p>
          <button
            onClick={onGoBack}
            className="mt-2 text-purple-600 hover:text-purple-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!callSession) return null;

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={goBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Trinity Video Call
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {
                      callSession.participants.filter((p) => p.isConnected)
                        .length
                    }{" "}
                    connected
                  </span>
                </div>
                {isConnected && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(callDuration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Scheduling Section */}
      {!isConnected && user && (
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          {isLoadingTrio ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-2">Loading trio...</p>
            </div>
          ) : trioData ? (
            <VideoCallScheduling
              trioId={trioData.id} // ID reale del trio
              currentUserId={user.id}
              onJoinCall={(callId) => {
                console.log("Joining scheduled call:", callId);
                // Qui si può avviare automaticamente la call
                joinCall();
              }}
            />
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">
                You need to be in a trio to schedule video calls.
              </p>
              <button
                onClick={onGoBack}
                className="mt-2 text-purple-600 hover:text-purple-800"
              >
                Go back to dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Video Area */}
      <div className="flex-1 p-4">
        {!isConnected ? (
          /* Pre-call Screen */
          <div className="h-full flex flex-col items-center justify-center space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Ready to join your Trinity call?
              </h2>
              {videoState.error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm">{videoState.error}</p>
                </div>
              )}
              <p className="text-gray-600">
                {
                  callSession.participants.filter(
                    (p) => p.isConnected && user && p.id !== user.id
                  ).length
                }{" "}
                members waiting
              </p>

              {/* Stato connessione P2P */}
              {signalingState.isConnecting && (
                <div className="mt-2 flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Connecting to peer...</span>
                </div>
              )}

              {signalingState.isConnected && (
                <div className="mt-2 flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">P2P Connected</span>
                </div>
              )}

              {signalingState.error && (
                <div className="mt-2 text-red-600 text-sm">
                  P2P Error: {signalingState.error}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="relative w-80 h-60 bg-gray-800 rounded-xl overflow-hidden">
              {videoState.isLoading ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Starting camera...</p>
                  </div>
                </div>
              ) : videoState.localStream ? (
                <div className="relative w-full h-full">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!localVideoEnabled && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <VideoOff className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
              ) : !localVideoEnabled ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoOff className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera off</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Click "Test Camera" to start</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <span>You</span>
                  {videoState.localStream &&
                    localVideoEnabled &&
                    !videoState.isLoading && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs">Live</span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  localVideoEnabled
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {localVideoEnabled ? (
                  <Video className="h-6 w-6" />
                ) : (
                  <VideoOff className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  localAudioEnabled
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {localAudioEnabled ? (
                  <Mic className="h-6 w-6" />
                ) : (
                  <MicOff className="h-6 w-6" />
                )}
              </button>

              {/* Test Camera button - solo se non c'è già uno stream */}
              {!videoState.localStream && (
                <button
                  onClick={startRealVideo}
                  disabled={videoState.isLoading}
                  className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center space-x-2 ${
                    videoState.isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  {videoState.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      <span>Test Camera</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={joinCall}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Join Call</span>
              </button>
            </div>

            {/* Agenda */}
            {callSession.agenda && (
              <div className="bg-white rounded-xl p-6 shadow-lg max-w-md">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Today's Agenda
                </h3>
                <ul className="space-y-2">
                  {callSession.agenda.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-sm text-gray-600"
                    >
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* In-call Screen */
          <div className="h-full flex flex-col">
            {/* Participants Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {(() => {
                const connectedParticipants = callSession.participants.filter(
                  (p) => p.isConnected
                );
                console.log("Rendering participants grid:", {
                  totalParticipants: callSession.participants.length,
                  connectedParticipants: connectedParticipants.length,
                  participants: callSession.participants.map((p) => ({
                    id: p.id,
                    name: p.name,
                    isConnected: p.isConnected,
                    isCurrentUser: p.id === user?.id,
                  })),
                  currentUserId: user?.id,
                  hasLocalStream: !!videoState.localStream,
                });

                // Debug per ogni partecipante connesso
                connectedParticipants.forEach((participant, index) => {
                  console.log(`Participant ${index}:`, {
                    id: participant.id,
                    name: participant.name,
                    isCurrentUser: participant.id === user?.id,
                    willShowVideo:
                      participant.id === user?.id && !!videoState.localStream,
                    videoEnabled: participant.videoEnabled,
                    hasLocalStream: !!videoState.localStream,
                  });
                });

                return connectedParticipants;
              })().map((participant) => (
                <div
                  key={participant.id}
                  className="relative bg-gray-800 rounded-xl overflow-hidden"
                >
                  {/* Mostra sempre il video se disponibile, con overlay se disabilitato */}
                  {participant.id === user?.id && videoState.localStream ? (
                    <div className="relative w-full h-full">
                      <video
                        ref={(video) => {
                          if (video) {
                            console.log(
                              "🎥 Setting inCallVideoRef for current user:",
                              {
                                participantId: participant.id,
                                userId: user?.id,
                                hasStream: !!videoState.localStream,
                                participantName: participant.name,
                              }
                            );
                            inCallVideoRef.current = video;

                            // Assign stream immediately if available
                            if (
                              videoState.localStream &&
                              video.srcObject !== videoState.localStream
                            ) {
                              console.log(
                                "🚀 Assigning stream directly in ref callback for in-call video"
                              );
                              video.srcObject = videoState.localStream;
                              video.load();
                              video
                                .play()
                                .then(() => {
                                  console.log(
                                    "✅ In-call video playing successfully from ref callback"
                                  );
                                })
                                .catch((error) => {
                                  console.error(
                                    "❌ Error playing in-call video from ref callback:",
                                    error
                                  );
                                });
                            }
                          }
                        }}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {!participant.videoEnabled && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                          <VideoOff className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                  ) : participant.id !== user?.id &&
                    signalingState.remoteStream ? (
                    <div className="relative w-full h-full">
                      <video
                        ref={(video) => {
                          if (video && signalingState.remoteStream) {
                            remoteVideoRefs.current[participant.id] = video;
                          }
                        }}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {!participant.videoEnabled && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                          <VideoOff className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    (() => {
                      console.log(
                        "❌ Showing fallback (no video) for participant:",
                        {
                          participantId: participant.id,
                          participantName: participant.name,
                          isCurrentUser: participant.id === user?.id,
                          hasLocalStream: !!videoState.localStream,
                          hasRemoteStream: !!signalingState.remoteStream,
                          condition1:
                            participant.id === user?.id &&
                            videoState.localStream,
                          condition2:
                            participant.id !== user?.id &&
                            signalingState.remoteStream,
                        }
                      );
                      return (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <div className="text-center text-white">
                            <VideoOff className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">{participant.name}</p>
                            <p className="text-xs opacity-75">Camera off</p>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* Participant Info */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                    <span className="text-white text-sm font-medium">
                      {participant.id === user?.id ? "You" : participant.name}
                    </span>
                    {participant.id === user?.id &&
                      videoState.localStream &&
                      participant.videoEnabled && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-white">Live</span>
                        </div>
                      )}
                    {participant.isHost && (
                      <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                        Host
                      </span>
                    )}
                  </div>

                  {/* Status indicators */}
                  <div className="absolute bottom-4 right-4 flex items-center space-x-1">
                    {!participant.audioEnabled && (
                      <div className="bg-red-500 p-1 rounded-full">
                        <MicOff className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {!participant.videoEnabled && (
                      <div className="bg-red-500 p-1 rounded-full">
                        <VideoOff className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Call Controls */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    localVideoEnabled
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {localVideoEnabled ? (
                    <Video className="h-6 w-6" />
                  ) : (
                    <VideoOff className="h-6 w-6" />
                  )}
                </button>

                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-colors ${
                    localAudioEnabled
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {localAudioEnabled ? (
                    <Mic className="h-6 w-6" />
                  ) : (
                    <MicOff className="h-6 w-6" />
                  )}
                </button>

                <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors">
                  <Monitor className="h-6 w-6" />
                </button>

                <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </button>

                <button
                  onClick={leaveCall}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors flex items-center space-x-2"
                >
                  <PhoneOff className="h-5 w-5" />
                  <span>Leave</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
