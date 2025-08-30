// WebRTC Service - Gestione connessioni video e signaling
export class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private onIceCandidateCallback?: (candidate: RTCIceCandidate) => void;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;

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

  // === SIGNALING METHODS ===

  // Configura i callback per signaling
  setSignalingCallbacks(
    onIceCandidate: (candidate: RTCIceCandidate) => void,
    onRemoteStream: (stream: MediaStream) => void
  ): void {
    this.onIceCandidateCallback = onIceCandidate;
    this.onRemoteStreamCallback = onRemoteStream;
  }

  // Inizializza connessione P2P con eventi
  initializePeerConnectionWithSignaling(): RTCPeerConnection {
    const pc = this.initializePeerConnection();

    // Gestisce ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate);
      }
    };

    // Gestisce stream remoto ricevuto
    pc.ontrack = (event) => {
      if (event.streams[0] && this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(event.streams[0]);
      }
    };

    // Aggiunge lo stream locale alla connessione
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    return pc;
  }

  // Crea un'offerta per iniziare la chiamata
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const pc = this.initializePeerConnectionWithSignaling();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  // Crea una risposta alla chiamata
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const pc = this.initializePeerConnectionWithSignaling();
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  // Gestisce la risposta ricevuta
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(answer);
    }
  }

  // Aggiunge ICE candidate ricevuto
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(candidate);
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
