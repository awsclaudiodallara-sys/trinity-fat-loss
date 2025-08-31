import { useState, useEffect } from "react";
import { webrtcService } from "./webrtc";

export interface VideoState {
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useVideoCall = (autoStart: boolean = false) => {
  const [videoState, setVideoState] = useState<VideoState>({
    localStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isConnected: false,
    isLoading: false,
    error: null,
  });

  // Auto-start video se richiesto
  useEffect(() => {
    if (autoStart) {
      startVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Inizializza la chiamata video
  const startVideo = async () => {
    try {
      setVideoState((prev) => ({ ...prev, error: null, isLoading: true }));

      // Usa getUserMedia direttamente invece di webrtcService per più controllo
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoState.isVideoEnabled,
        audio: videoState.isAudioEnabled,
      });

      setVideoState((prev) => ({
        ...prev,
        localStream: stream,
        isConnected: true,
        isLoading: false,
      }));

      return stream;
    } catch (error) {
      console.error("Errore nell'avviare il video:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossibile accedere a fotocamera/microfono";
      setVideoState((prev) => ({
        ...prev,
        error: errorMessage,
        isConnected: false,
        isLoading: false,
      }));
      throw error;
    }
  };

  // Stoppa la chiamata video
  const stopVideo = () => {
    // Ferma tutti i track dello stream locale
    if (videoState.localStream) {
      videoState.localStream.getTracks().forEach((track) => track.stop());
    }

    // Ferma anche tramite webrtcService per consistenza
    webrtcService.stopLocalStream();

    setVideoState({
      localStream: null,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isConnected: false,
      isLoading: false,
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
