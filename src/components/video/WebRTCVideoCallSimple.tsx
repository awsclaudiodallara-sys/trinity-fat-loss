/**
 * TRINITY FAT LOSS - Simple WebRTC Video Call Component
 * Versione semplificata per test e demo
 */

import React, { useRef, useEffect, useState } from "react";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";

interface WebRTCVideoCallSimpleProps {
  onCallEnd?: () => void;
  onError?: (error: string) => void;
}

export const WebRTCVideoCallSimple: React.FC<WebRTCVideoCallSimpleProps> = ({
  onCallEnd,
  onError,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Inizializza lo stream locale
   */
  const initializeStream = async () => {
    try {
      setIsLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsLoading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Errore accesso camera/microfono";

      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  /**
   * Toggle video
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
   * Toggle audio
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
   * Termina la chiamata
   */
  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    onCallEnd?.();
  };

  // Inizializza al mount
  useEffect(() => {
    initializeStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Avviando camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Overlay quando video è disabilitato */}
      {!isVideoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <VideoOff className="w-16 h-16 text-gray-400" />
        </div>
      )}

      {/* User Label */}
      <div className="absolute bottom-16 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
        Tu (Solo Test)
      </div>

      {/* Controls */}
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

        {/* End Call */}
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
