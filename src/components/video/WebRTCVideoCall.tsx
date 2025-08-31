/**
 * TRINITY FAT LOSS - WebRTC Video Call Component
 * Componente per video chiamate reali P2P usando WebRTC
 */

import React, { useRef, useEffect, useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Settings,
  Users,
} from "lucide-react";

interface WebRTCVideoCallProps {
  currentUserId: string;
  participants: string[]; // Altri user IDs
  onCallEnd?: () => void;
  onError?: (error: string) => void;
}

interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate";
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidate;
}

interface ParticipantStream {
  userId: string;
  stream: MediaStream;
  name: string;
}

export const WebRTCVideoCall: React.FC<WebRTCVideoCallProps> = ({
  currentUserId,
  participants,
  onCallEnd,
  onError,
}) => {
  // Refs per elementi video
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Stati del componente
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<ParticipantStream[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // WebRTC connections per ogni partecipante
  const [peerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());

  // Configurazione ICE servers
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  /**
   * Inizializza lo stream locale (camera + microfono)
   */
  const initializeLocalStream = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });

      setLocalStream(stream);

      // Collega lo stream al video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore accesso camera/microfono";
      setConnectionError(errorMessage);
      onError?.(errorMessage);
      throw error;
    }
  };

  /**
   * Crea una connessione peer per un utente specifico
   */
  const createPeerConnection = (targetUserId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(rtcConfig);

    // Aggiungi stream locale alla connessione
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => {
        const existing = prev.find((p) => p.userId === targetUserId);
        if (existing) {
          return prev.map((p) =>
            p.userId === targetUserId ? { ...p, stream: remoteStream } : p
          );
        } else {
          return [
            ...prev,
            {
              userId: targetUserId,
              stream: remoteStream,
              name: `User ${targetUserId.slice(0, 8)}`, // Placeholder name
            },
          ];
        }
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // In produzione, invia tramite signaling server
        sendSignalingMessage(targetUserId, {
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${targetUserId}:`, pc.connectionState);

      if (pc.connectionState === "connected") {
        setIsConnected(true);
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        setConnectionError(`Connessione fallita con ${targetUserId}`);
      }
    };

    peerConnections.set(targetUserId, pc);
    return pc;
  };

  /**
   * Placeholder per signaling server (da implementare con Supabase)
   */
  const sendSignalingMessage = (
    targetUserId: string,
    message: SignalingMessage
  ) => {
    // TODO: Implementare con Supabase Realtime channels
    console.log(`Sending to ${targetUserId}:`, message);
  };

  /**
   * Avvia una chiamata con un utente specifico
   */
  const startCallWithUser = async (targetUserId: string) => {
    try {
      const pc = createPeerConnection(targetUserId);

      // Crea offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Invia offer tramite signaling
      sendSignalingMessage(targetUserId, {
        type: "offer",
        offer: offer,
      });
    } catch (error) {
      console.error(`Errore nell'avviare chiamata con ${targetUserId}:`, error);
      onError?.(`Errore connessione con ${targetUserId}`);
    }
  };

  /**
   * Toggle video on/off
   */
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  /**
   * Toggle audio on/off
   */
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  /**
   * Avvia/ferma screen sharing
   */
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Avvia screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Sostituisci track video in tutte le connessioni
        const videoTrack = screenStream.getVideoTracks()[0];

        peerConnections.forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Aggiorna local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);

        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error("Errore screen sharing:", error);
      onError?.("Errore nella condivisione schermo");
    }
  };

  /**
   * Ferma screen sharing e torna alla camera
   */
  const stopScreenShare = async () => {
    try {
      // Riavvia camera normale
      const normalStream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });

      const videoTrack = normalStream.getVideoTracks()[0];

      // Sostituisci track in tutte le connessioni
      peerConnections.forEach((pc) => {
        const sender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Aggiorna local stream
      setLocalStream(normalStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = normalStream;
      }

      setIsScreenSharing(false);
    } catch (error) {
      console.error("Errore nel fermare screen sharing:", error);
    }
  };

  /**
   * Termina la chiamata
   */
  const endCall = () => {
    // Chiudi tutte le connessioni peer
    peerConnections.forEach((pc) => {
      pc.close();
    });
    peerConnections.clear();

    // Ferma stream locale
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Reset stati
    setLocalStream(null);
    setRemoteStreams([]);
    setIsConnected(false);
    setIsConnecting(false);

    onCallEnd?.();
  };

  // Inizializza quando il componente viene montato
  useEffect(() => {
    initializeLocalStream();

    return () => {
      // Cleanup alla distruzione del componente
      endCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Avvia connessioni con tutti i partecipanti
  useEffect(() => {
    if (localStream && participants.length > 0) {
      participants.forEach((userId) => {
        if (userId !== currentUserId) {
          startCallWithUser(userId);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream, participants, currentUserId]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-full p-2">
        {/* Local Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            Tu {isScreenSharing ? "(Screen)" : ""}
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <VideoOff className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Remote Videos */}
        {remoteStreams.map((participant) => (
          <div
            key={participant.userId}
            className="relative bg-gray-900 rounded-lg overflow-hidden"
          >
            <video
              ref={(el) => {
                if (el) {
                  el.srcObject = participant.stream;
                  remoteVideosRef.current.set(participant.userId, el);
                }
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {participant.name}
            </div>
          </div>
        ))}

        {/* Placeholder per partecipanti non ancora connessi */}
        {participants
          .filter((id) => id !== currentUserId)
          .filter((id) => !remoteStreams.some((p) => p.userId === id))
          .map((userId) => (
            <div
              key={userId}
              className="relative bg-gray-800 rounded-lg flex items-center justify-center"
            >
              <div className="text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">In attesa di {userId.slice(0, 8)}...</p>
              </div>
            </div>
          ))}
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-70 rounded-full px-6 py-3">
        {/* Toggle Video */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoEnabled
              ? "bg-gray-600 hover:bg-gray-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isVideoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        {/* Toggle Audio */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            isAudioEnabled
              ? "bg-gray-600 hover:bg-gray-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isAudioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-colors ${
            isScreenSharing
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-white"
          }`}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Status Indicators */}
      {isConnecting && (
        <div className="absolute top-4 left-4 bg-yellow-600 text-white px-3 py-1 rounded text-sm">
          Connessione in corso...
        </div>
      )}

      {isConnected && (
        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded text-sm">
          Connesso
        </div>
      )}

      {connectionError && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm">
          {connectionError}
        </div>
      )}
    </div>
  );
};
