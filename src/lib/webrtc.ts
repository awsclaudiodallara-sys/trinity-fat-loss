// WebRTC Service - Gestione base delle connessioni video
export class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;

  // Configurazione STUN server per attraversare NAT/firewall
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Inizializza la connessione peer-to-peer
  initializePeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      return this.peerConnection;
    }

    this.peerConnection = new RTCPeerConnection(this.rtcConfig);
    return this.peerConnection;
  }

  // Ottiene stream video/audio locale
  async getLocalStream(
    videoEnabled: boolean = true,
    audioEnabled: boolean = true
  ): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      });
      return this.localStream;
    } catch (error) {
      console.error("Errore nell'ottenere stream locale:", error);
      throw error;
    }
  }

  // Stoppa lo stream locale
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  // Chiude la connessione
  disconnect(): void {
    this.stopLocalStream();

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  // Getters
  getCurrentLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getPeerConnection(): RTCPeerConnection | null {
    return this.peerConnection;
  }
}

// Istanza singleton
export const webrtcService = new WebRTCService();
