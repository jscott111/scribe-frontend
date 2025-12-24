interface SpeechRecognitionConfig {
  languageCode: string;
  speechStartTimeout: number; // seconds to wait for speech to start
  speechEndTimeout: number; // seconds to wait before finalizing speech
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
  onAudioLevel?: (level: number) => void; // New callback for audio level updates
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
  private wordCountTimer: NodeJS.Timeout | null = null;
  private socket: any = null; // Socket.IO connection
  private hasReceivedFinalResult = false; // Track if we've received a final result from Google Cloud
  private audioLevelInterval: NodeJS.Timeout | null = null; // For audio level monitoring
  private messageQueue: Array<{data: any, timestamp: number, retries: number}> = []; // Message queue for failed transmissions
  private maxRetries = 3; // Maximum number of retry attempts
  private queueProcessingInterval: NodeJS.Timeout | null = null; // Interval for processing queued messages

  constructor() {
    this.config = {
      languageCode: 'en-CA',
      speechStartTimeout: 5.0,
      speechEndTimeout: 1.0,
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
      // If already initialized with the same socket, don't reinitialize
      if (this.socket === socket) {
        console.log('🔄 Google Speech Service already initialized with this socket, skipping...');
        return;
      }
      
      // Clean up existing socket listeners before setting up new ones
      if (this.socket) {
        this.socket.removeAllListeners('transcriptionUpdate');
        this.socket.removeAllListeners('finalResultReceived');
        this.socket.removeAllListeners('streamRestarted');
      }
      
      this.socket = socket;
      
      // Listen for transcription updates from backend
      this.socket.on('transcriptionUpdate', (data: any) => {
        // Only process results for the current bubble
        if (data.bubbleId !== this.currentBubbleId) {
          return;
        }
        
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
      
      // Listen for stream restart notifications
      this.socket.on('streamRestarted', (data: any) => {
        console.log('🔄 Stream restarted with new bubble ID:', data.newBubbleId);
        this.currentBubbleId = data.newBubbleId;
        this.hasReceivedFinalResult = false;
      });
      
      // Listen for stream restart requests from backend
      this.socket.on('streamRestart', (data: any) => {
        console.log('🔄 Backend requested stream restart:', data.reason);
        if (this.isRecording) {
          // Generate new bubble ID and continue recording
          this.currentBubbleId = this.generateBubbleId();
          this.hasReceivedFinalResult = false;
          console.log('🔄 Stream restarted with new bubble ID:', this.currentBubbleId);
        }
      });
      
      // Handle socket reconnection - process any queued messages
      this.socket.on('connect', () => {
        console.log('🔗 GoogleSpeechService: Socket reconnected');
        // Process queued messages immediately after reconnection
        setTimeout(() => {
          this.processMessageQueue();
        }, 100);
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
      const bufferSize = 1024; // Buffer size for audio processing (larger for 1-second chunks)
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

      // Start audio level monitoring
      this.startAudioLevelMonitoring();

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

    // Stop audio level monitoring
    this.stopAudioLevelMonitoring();

    // Disconnect script processor
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
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
   * Check if service is initialized with a specific socket
   */
  isInitializedWithSocket(socket: any): boolean {
    return this.socket === socket;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    console.log('🧹 Cleaning up Google Speech Service...');
    
    this.stopRecognition();
    this.clearTimers();
    this.clearMessageQueue();

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
    
    const messageData = {
      audioData: base64Audio,
      sourceLanguage: this.config.languageCode,
      bubbleId: this.currentBubbleId,
      isFinal: false,
      interimTranscript: this.currentTranscript,
      finalTranscript: '',
      wordCount: this.currentWordCount,
      maxWordsPerBubble: this.config.maxWordsPerBubble,
      audioFormat: 'LINEAR16', // Indicate this is raw LINEAR16 data
      sampleRate: 48000 // Current sample rate from AudioContext
    };
    
    this.sendWithRetry('googleSpeechTranscription', messageData);
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
      
      console.log(`🎤 Frontend: Sending chunk immediately - Size: ${base64Audio.length} chars, Bubble ID: ${this.currentBubbleId}, speechEndTimeout: ${this.config.speechEndTimeout}s`);
      
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

  private clearTimers(): void {
    if (this.wordCountTimer) {
      clearTimeout(this.wordCountTimer);
      this.wordCountTimer = null;
    }
  }

  /**
   * Start monitoring audio levels for visual feedback
   */
  private startAudioLevelMonitoring(): void {
    if (!this.analyser || !this.callbacks?.onAudioLevel) {
      return;
    }

    // Configure analyser for better frequency analysis
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const monitorAudioLevel = () => {
      if (!this.isRecording || !this.analyser) {
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) for volume level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      
      // Normalize to 0-1 range and apply some smoothing
      const normalizedLevel = Math.min(1, rms / 128);
      
      // Call the callback with the audio level
      this.callbacks?.onAudioLevel?.(normalizedLevel);
    };

    // Monitor audio levels every 50ms for smooth updates
    this.audioLevelInterval = setInterval(monitorAudioLevel, 50);
  }

  /**
   * Stop monitoring audio levels
   */
  private stopAudioLevelMonitoring(): void {
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
      this.audioLevelInterval = null;
    }
  }

  /**
   * Send message with retry logic
   */
  private sendWithRetry(event: string, data: any): void {
    if (!this.socket) {
      console.log('📦 No socket available, queuing message');
      this.queueMessage(event, data);
      return;
    }
    
    if (!this.socket.connected) {
      console.log('📦 Socket not connected, queuing message and attempting reconnection');
      this.queueMessage(event, data);
      // Try to reconnect the socket
      try {
        this.socket.connect();
      } catch (e) {
        console.log('⚠️ Could not trigger socket reconnection:', e);
      }
      return;
    }

    try {
      this.socket.emit(event, data);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      this.queueMessage(event, data);
    }
  }

  /**
   * Queue message for retry
   */
  private queueMessage(event: string, data: any): void {
    this.messageQueue.push({
      data: { event, data },
      timestamp: Date.now(),
      retries: 0
    });

    // Start queue processing if not already running
    if (!this.queueProcessingInterval) {
      this.startQueueProcessing();
    }
  }

  /**
   * Start processing queued messages
   */
  private startQueueProcessing(): void {
    this.queueProcessingInterval = setInterval(() => {
      this.processMessageQueue();
    }, 1000); // Process queue every second
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    if (!this.socket || !this.socket.connected) {
      return; // Wait for connection
    }

    const now = Date.now();
    const messagesToProcess = this.messageQueue.filter(msg => 
      msg.retries < this.maxRetries && (now - msg.timestamp) > 1000
    );

    messagesToProcess.forEach(msg => {
      try {
        this.socket.emit(msg.data.event, msg.data.data);
        // Remove successfully sent message
        const index = this.messageQueue.indexOf(msg);
        if (index > -1) {
          this.messageQueue.splice(index, 1);
        }
      } catch (error) {
        console.error('❌ Failed to retry message:', error);
        msg.retries++;
      }
    });

    // Remove old messages that exceeded max retries
    this.messageQueue = this.messageQueue.filter(msg => 
      msg.retries < this.maxRetries && (now - msg.timestamp) < 30000 // Keep for 30 seconds max
    );

    // Stop processing if queue is empty
    if (this.messageQueue.length === 0 && this.queueProcessingInterval) {
      clearInterval(this.queueProcessingInterval);
      this.queueProcessingInterval = null;
    }
  }

  /**
   * Clear message queue
   */
  private clearMessageQueue(): void {
    this.messageQueue = [];
    if (this.queueProcessingInterval) {
      clearInterval(this.queueProcessingInterval);
      this.queueProcessingInterval = null;
    }
  }
}

export default new GoogleSpeechService();