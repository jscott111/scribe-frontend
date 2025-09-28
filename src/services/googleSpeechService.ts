interface SpeechRecognitionConfig {
  languageCode: string;
  speechEndTimeout: number; // seconds of silence before finalizing
  speechStartTimeout: number; // seconds to wait for speech to start
  maxWordsPerBubble: number; // maximum words before forcing finalization
  sampleRateHertz: number;
  encoding: string;
}

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  wordCount: number;
  bubbleId: string;
}

interface SpeechRecognitionCallbacks {
  onInterimResult: (result: SpeechRecognitionResult) => void;
  onFinalResult: (result: SpeechRecognitionResult) => void;
  onError: (error: Error) => void;
  onStart: () => void;
  onEnd: () => void;
}

class GoogleSpeechService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isRecording = false;
  private isPaused = false;
  private currentBubbleId: string | null = null;
  private currentWordCount = 0;
  private currentTranscript = '';
  private config: SpeechRecognitionConfig;
  private callbacks: SpeechRecognitionCallbacks | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;
  private wordCountTimer: NodeJS.Timeout | null = null;
  private socket: any = null; // Socket.IO connection
  private hasReceivedFinalResult = false; // Track if we've received a final result from Google Cloud

  constructor() {
    this.config = {
      languageCode: 'en-CA',
      speechEndTimeout: 2.0,
      speechStartTimeout: 5.0,
      maxWordsPerBubble: 15,
      sampleRateHertz: 48000,
      encoding: 'WEBM_OPUS'
    };
  }

  /**
   * Initialize the speech recognition service
   */
  async initialize(socket: any): Promise<void> {
    try {
      this.socket = socket;
      
      // Listen for transcription updates from backend
      this.socket.on('transcriptionUpdate', (data: any) => {
        // Forward to callbacks if available
        if (data.isFinal && this.callbacks?.onFinalResult) {
          this.callbacks.onFinalResult({
            transcript: data.transcript,
            isFinal: data.isFinal,
            confidence: data.confidence,
            wordCount: this.currentWordCount,
            bubbleId: data.bubbleId
          });
        } else if (!data.isFinal && this.callbacks?.onInterimResult) {
          this.callbacks.onInterimResult({
            transcript: data.transcript,
            isFinal: data.isFinal,
            confidence: data.confidence,
            wordCount: this.currentWordCount,
            bubbleId: data.bubbleId
          });
        }
      });
      
      // Listen for final result notifications to prevent duplicate finalization
      this.socket.on('finalResultReceived', (data: any) => {
        if (data.bubbleId === this.currentBubbleId) {
          this.hasReceivedFinalResult = true;
        }
      });
      
      // Request microphone access with simpler constraints
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Set up audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

    } catch (error) {
      console.error('❌ Failed to initialize Google Speech Service:', error);
      throw new Error('Failed to access microphone. Please ensure microphone permissions are granted.');
    }
  }

  /**
   * Start speech recognition
   */
  async startRecognition(callbacks: SpeechRecognitionCallbacks): Promise<void> {
    if (this.isRecording) {
      return;
    }


    if (!this.stream || !this.audioContext || !this.socket) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    this.callbacks = callbacks;
    this.isRecording = true;
    this.isPaused = false;
    this.currentBubbleId = this.generateBubbleId();
    this.currentWordCount = 0;
    this.currentTranscript = '';
    this.hasReceivedFinalResult = false;

    try {
      // Set up ScriptProcessorNode for raw PCM audio capture
      const bufferSize = 8192; // Buffer size for audio processing (larger for 1-second chunks)
      this.scriptProcessor = this.audioContext!.createScriptProcessor(bufferSize, 1, 1);
      
      // Connect microphone to script processor
      this.microphone!.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext!.destination);
      
      // Process raw audio data
      this.scriptProcessor.onaudioprocess = (event) => {
        if (this.isRecording && !this.isPaused) {
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0); // Get mono channel
          
          // Convert Float32Array to Int16Array (LINEAR16 format)
          const linear16Data = this.convertFloat32ToInt16(inputData);
          
          this.processRawAudioChunk(linear16Data);
        }
      };

      // Start processing
      this.callbacks?.onStart();
      this.startSilenceDetection();

    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      // Stop streaming on error
      this.socket.emit('stopStreaming');
      this.callbacks?.onError(new Error('Failed to start speech recognition'));
    }
  }

  /**
   * Stop speech recognition
   */
  stopRecognition(): void {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;
    this.isPaused = false;
    this.clearTimers();

    // Disconnect script processor
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    // Finalize current transcript if there's content
    if (this.currentTranscript.trim()) {
      this.finalizeCurrentTranscript();
    }

    // Notify backend to stop streaming
    this.socket.emit('stopStreaming');

    this.callbacks?.onEnd();
  }

  /**
   * Pause speech recognition
   */
  pauseRecognition(): void {
    if (this.isRecording && !this.isPaused) {
      this.isPaused = true;
      this.clearTimers();
    }
  }

  /**
   * Resume speech recognition
   */
  resumeRecognition(): void {
    if (this.isRecording && this.isPaused) {
      this.isPaused = false;
      this.startSilenceDetection();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SpeechRecognitionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): SpeechRecognitionConfig {
    return { ...this.config };
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.stream !== null && this.audioContext !== null && this.socket !== null;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    console.log('🧹 Cleaning up Google Speech Service...');
    
    this.stopRecognition();
    this.clearTimers();

    // Notify backend to stop streaming
    if (this.socket) {
      this.socket.emit('stopStreaming');
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaRecorder = null;
    this.analyser = null;
    this.microphone = null;
    this.scriptProcessor = null;
    this.callbacks = null;
    this.socket = null;
    this.hasReceivedFinalResult = false;
  }

  // Private methods

  private generateBubbleId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private convertFloat32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Convert from [-1, 1] range to [-32768, 32767] range
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return int16Array;
  }

  private processRawAudioChunk(int16Data: Int16Array): void {
    // Send raw LINEAR16 data immediately
    if (int16Data.length > 0) {
      this.sendRawAudioChunk(int16Data);
    }
  }

  private sendRawAudioChunk(int16Data: Int16Array): void {
    if (!this.socket) {
      console.error('❌ No socket connection available');
      return;
    }

    // Convert Int16Array to base64
    const buffer = new ArrayBuffer(int16Data.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < int16Data.length; i++) {
      view.setInt16(i * 2, int16Data[i], true); // little-endian
    }
    
    const base64Audio = this.arrayBufferToBase64(buffer);
    
    
    this.socket.emit('googleSpeechTranscription', {
      audioData: base64Audio,
      sourceLanguage: this.config.languageCode,
      bubbleId: this.currentBubbleId,
      isFinal: false,
      interimTranscript: this.currentTranscript,
      finalTranscript: '',
      wordCount: this.currentWordCount,
      maxWordsPerBubble: this.config.maxWordsPerBubble,
      speechEndTimeout: this.config.speechEndTimeout,
      audioFormat: 'LINEAR16', // Indicate this is raw LINEAR16 data
      sampleRate: 48000 // Current sample rate from AudioContext
    });
  }

  private processAudioChunk(audioBlob: Blob): void {
    console.log(`🎤 Frontend: Processing chunk immediately, size: ${audioBlob.size} bytes`);
    
    // Send chunk immediately for real-time streaming
    if (audioBlob.size > 0) {
      this.sendAudioChunkImmediately(audioBlob);
    }
  }

  private sendAudioChunkImmediately(audioBlob: Blob): void {
    if (!this.socket) {
      console.error('❌ No socket connection available');
      return;
    }

    // Convert blob to base64 and send immediately
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);
      
      console.log(`🎤 Frontend: Sending chunk immediately - Size: ${base64Audio.length} chars, Bubble ID: ${this.currentBubbleId}`);
      
      this.socket.emit('googleSpeechTranscription', {
        audioData: base64Audio,
        sourceLanguage: this.config.languageCode,
        bubbleId: this.currentBubbleId,
        isFinal: false,
        interimTranscript: this.currentTranscript,
        finalTranscript: '',
        wordCount: this.currentWordCount,
        maxWordsPerBubble: this.config.maxWordsPerBubble,
        speechEndTimeout: this.config.speechEndTimeout
      });
    };
    reader.readAsArrayBuffer(audioBlob);
  }



  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }


  // private setupSocketListeners(): void {
  //   if (!this.socket) return;

  //   // Listen for interim results from backend
  //   this.socket.on('interimTranscription', (data: any) => {
  //     console.log('🎤 Received interim transcription:', data);
  //     if (data.bubbleId === this.currentBubbleId) {
  //       this.currentTranscript = data.transcript;
  //       this.currentWordCount = data.wordCount;

  //       console.log('🎤 Calling onInterimResult with:', data.transcript);
  //       this.callbacks?.onInterimResult({
  //         transcript: data.transcript,
  //         isFinal: false,
  //         confidence: 0.8,
  //         wordCount: data.wordCount,
  //         bubbleId: data.bubbleId
  //       });

  //       // Check word count limit
  //       if (data.wordCount >= this.config.maxWordsPerBubble) {
  //         this.finalizeCurrentTranscript();
  //       } else {
  //         // Reset silence timer when we get new interim results
  //         this.startSilenceDetection();
  //       }
  //     }
  //   });

  //   // Listen for final results from backend
  //   this.socket.on('transcriptionComplete', (data: any) => {
  //     if (data.bubbleId === this.currentBubbleId) {
  //       this.callbacks?.onFinalResult({
  //         transcript: data.transcription,
  //         isFinal: true,
  //         confidence: 0.9,
  //         wordCount: this.currentWordCount,
  //         bubbleId: data.bubbleId
  //       });

  //       this.currentTranscript = '';
  //       this.currentWordCount = 0;
  //     }
  //   });

  //   // Listen for errors
  //   this.socket.on('error', (error: any) => {
  //     console.error('❌ Speech recognition error:', error);
  //     this.callbacks?.onError(new Error(error.message || 'Speech recognition error'));
  //   });
  // }

  private startSilenceDetection(): void {
    this.clearTimers();
    
    // Set up silence timeout
    this.silenceTimer = setTimeout(() => {
      if (this.currentTranscript.trim()) {
        this.finalizeCurrentTranscript();
      }
    }, this.config.speechEndTimeout * 1000);
  }

  private finalizeCurrentTranscript(): void {
    if (this.currentTranscript.trim() && this.socket) {
      // Only finalize if we haven't already received a final result from Google Cloud
      // This prevents duplicate finalization when Google Cloud already sent a final result
      if (!this.hasReceivedFinalResult) {
        // Send finalization request to backend
        this.socket.emit('googleSpeechTranscription', {
          audioData: '', // No new audio data
          sourceLanguage: this.config.languageCode,
          bubbleId: this.currentBubbleId,
          isFinal: true,
          interimTranscript: '',
          finalTranscript: this.currentTranscript.trim(),
          wordCount: this.currentWordCount,
          maxWordsPerBubble: this.config.maxWordsPerBubble,
          speechEndTimeout: this.config.speechEndTimeout
        });
      }
    }

    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.wordCountTimer) {
      clearTimeout(this.wordCountTimer);
      this.wordCountTimer = null;
    }
  }
}

export default new GoogleSpeechService();