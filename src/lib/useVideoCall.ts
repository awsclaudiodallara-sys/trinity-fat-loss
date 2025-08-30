import { useState, useEffect } from "react";
import { webrtcService } from "./webrtc";

export interface VideoState {
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isConnected: boolean;
  error: string | null;
}

export const useVideoCall = () => {
  const [videoState, setVideoState] = useState<VideoState>({
    localStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isConnected: false,
    error: null,
  });

  // Inizializza la chiamata video
  const startVideo = async () => {
    try {
      setVideoState((prev) => ({ ...prev, error: null }));

      const stream = await webrtcService.getLocalStream(
        videoState.isVideoEnabled,
        videoState.isAudioEnabled
      );

      setVideoState((prev) => ({
        ...prev,
        localStream: stream,
        isConnected: true,
      }));
    } catch (error) {
      console.error("Errore nell'avviare il video:", error);
      setVideoState((prev) => ({
        ...prev,
        error: "Impossibile accedere a fotocamera/microfono",
        isConnected: false,
      }));
    }
  };

  // Stoppa la chiamata video
  const stopVideo = () => {
    webrtcService.stopLocalStream();
    setVideoState({
      localStream: null,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isConnected: false,
      error: null,
    });
  };

  // Toggle video
  const toggleVideo = () => {
    setVideoState((prev) => ({
      ...prev,
      isVideoEnabled: !prev.isVideoEnabled,
    }));

    if (videoState.localStream) {
      const videoTrack = videoState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoState.isVideoEnabled;
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    setVideoState((prev) => ({
      ...prev,
      isAudioEnabled: !prev.isAudioEnabled,
    }));

    if (videoState.localStream) {
      const audioTrack = videoState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !videoState.isAudioEnabled;
      }
    }
  };

  // Cleanup quando il componente viene smontato
  useEffect(() => {
    return () => {
      webrtcService.disconnect();
    };
  }, []);

  return {
    videoState,
    startVideo,
    stopVideo,
    toggleVideo,
    toggleAudio,
  };
};
