import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  Settings,
  Users,
  MessageCircle,
  Clock,
} from "lucide-react";
import { useVideoCall } from "../lib/useVideoCall";

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
  // Mock user for now - will be replaced with real auth
  const user = useMemo(() => ({ id: "current_user", name: "You" }), []);

  const [callSession, setCallSession] = useState<VideoCallSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Hook per gestire la video chiamata reale
  const {
    videoState,
    startVideo: startRealVideo,
    stopVideo: stopRealVideo,
    toggleVideo: toggleRealVideo,
    toggleAudio: toggleRealAudio,
  } = useVideoCall();

  // Mock data per ora - sarà sostituito con dati reali
  useEffect(() => {
    const mockSession: VideoCallSession = {
      id: "trinity_call_1",
      scheduledTime: new Date().toISOString(),
      duration: 30,
      participants: [
        {
          id: "user1",
          name: "Marco",
          videoEnabled: true,
          audioEnabled: true,
          isConnected: true,
          isHost: true,
        },
        {
          id: "user2",
          name: "Lisa",
          videoEnabled: false,
          audioEnabled: true,
          isConnected: true,
          isHost: false,
        },
        {
          id: user.id,
          name: user.name,
          videoEnabled: localVideoEnabled,
          audioEnabled: localAudioEnabled,
          isConnected: false,
          isHost: false,
        },
      ],
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
  }, [user, localVideoEnabled, localAudioEnabled]);

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

      setIsConnected(true);
      if (callSession) {
        const updatedSession = {
          ...callSession,
          status: "active" as const,
          participants: callSession.participants.map((p) =>
            p.id === user.id
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

    setIsConnected(false);
    setCallDuration(0);
    if (callSession) {
      const updatedSession = {
        ...callSession,
        status: "ended" as const,
        participants: callSession.participants.map((p) =>
          p.id === user.id ? { ...p, isConnected: false } : p
        ),
      };
      setCallSession(updatedSession);
    }
  };

  // Utilizziamo le funzioni reali dal hook invece delle mock
  const toggleVideo = () => {
    const newVideoState = !localVideoEnabled;
    setLocalVideoEnabled(newVideoState);
    toggleRealVideo(); // Chiamata reale per gestire il video hardware

    // Aggiorna anche lo stato del partecipante nella sessione
    if (callSession) {
      const updatedSession = {
        ...callSession,
        participants: callSession.participants.map((p) =>
          p.id === user.id ? { ...p, videoEnabled: newVideoState } : p
        ),
      };
      setCallSession(updatedSession);
    }
  };

  const toggleAudio = () => {
    const newAudioState = !localAudioEnabled;
    setLocalAudioEnabled(newAudioState);
    toggleRealAudio(); // Chiamata reale per gestire l'audio hardware

    // Aggiorna anche lo stato del partecipante nella sessione
    if (callSession) {
      const updatedSession = {
        ...callSession,
        participants: callSession.participants.map((p) =>
          p.id === user.id ? { ...p, audioEnabled: newAudioState } : p
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
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

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
                    (p) => p.isConnected && p.id !== user.id
                  ).length
                }{" "}
                members waiting
              </p>
            </div>

            {/* Preview */}
            <div className="relative w-80 h-60 bg-gray-800 rounded-xl overflow-hidden">
              {localVideoEnabled ? (
                videoState.localStream ? (
                  <video
                    ref={(video) => {
                      if (video && videoState.localStream) {
                        video.srcObject = videoState.localStream;
                      }
                    }}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-6xl">📹</div>
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoOff className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera off</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <span>You</span>
                  {videoState.localStream && localVideoEnabled && (
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
              {callSession.participants
                .filter((p) => p.isConnected)
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="relative bg-gray-800 rounded-xl overflow-hidden"
                  >
                    {participant.videoEnabled ? (
                      participant.name === "You" && videoState.localStream ? (
                        <video
                          ref={(video) => {
                            if (video && videoState.localStream) {
                              video.srcObject = videoState.localStream;
                            }
                          }}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                          <div className="text-white text-4xl">
                            {participant.name === "You" ? "📹" : "👤"}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
                            {participant.name.charAt(0)}
                          </div>
                          <p className="text-sm">{participant.name}</p>
                        </div>
                      </div>
                    )}

                    {/* Participant Info */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">
                        {participant.name}
                      </span>
                      {participant.name === "You" &&
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
