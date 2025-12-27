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
  private previousBubbleId: string | null = null; // Track previous bubble to handle late results
  private currentWordCount = 0;
  private currentTranscript = '';
  private config: SpeechRecognitionConfig;
  private callbacks: SpeechRecognitionCallbacks | null = null;
  private wordCountTimer: NodeJS.Timeout | null = null;
  private socket: any = null; // Socket.IO connection
  private lastSocketId: string | null = null; // Track socket ID to detect reconnections
  private hasReceivedFinalResult = false; // Track if we've received a final result from Google Cloud
  private audioLevelInterval: NodeJS.Timeout | null = null; // For audio level monitoring
  private keepAliveInterval: NodeJS.Timeout | null = null; // Keep-alive for audio stream
  private lastAudioSentTime: number = 0; // Track when last audio was sent
  private messageQueue: Array<{data: any, timestamp: number, retries: number}> = []; // Message queue for failed transmissions
  private maxRetries = 3; // Maximum number of retry attempts
  private queueProcessingInterval: NodeJS.Timeout | null = null; // Interval for processing queued messages
  private silenceDetectionInterval: NodeJS.Timeout | null = null; // For silence-based finalization
  private lastSpeechTime: number = 0; // Track when speech was last detected
  private silenceStartTime: number | null = null; // Track when silence started

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
      // Check if socket connection has changed (even if same reference, ID may be different after reconnect)
      const currentSocketId = socket?.id;
      const socketChanged = this.lastSocketId !== currentSocketId;
      
      if (this.socket === socket && !socketChanged) {
        console.log('🔄 Google Speech Service already initialized with this socket, skipping...');
        return;
      }
      
      if (socketChanged) {
        console.log(`🔄 Socket reconnected (${this.lastSocketId} -> ${currentSocketId}), reinitializing...`);
        // Reset recording state on reconnection so startRecognition can run again
        this.isRecording = false;
        this.isPaused = false;
        this.stopKeepAlive();
        this.stopAudioLevelMonitoring();
        if (this.scriptProcessor) {
          this.scriptProcessor.disconnect();
          this.scriptProcessor = null;
        }
      }
      
      // Clean up existing socket listeners before setting up new ones
      if (this.socket) {
        this.socket.removeAllListeners('transcriptionUpdate');
        this.socket.removeAllListeners('finalResultReceived');
        this.socket.removeAllListeners('streamRestarted');
        this.socket.removeAllListeners('streamRestartPending');
        this.socket.removeAllListeners('streamRestart');
      }
      
      this.socket = socket;
      this.lastSocketId = currentSocketId;
      
      // Listen for transcription updates from backend
      this.socket.on('transcriptionUpdate', (data: any) => {
        // Accept results from current or previous bubble (for late results after stream restart)
        const isCurrentBubble = data.bubbleId === this.currentBubbleId;
        const isPreviousBubble = data.bubbleId === this.previousBubbleId;
        
        // Debug logging for transcription flow
        console.log(`📝 transcriptionUpdate: "${data.transcript?.substring(0, 30)}..." isFinal=${data.isFinal}, bubbleId=${data.bubbleId?.substring(0, 15)}, current=${this.currentBubbleId?.substring(0, 15)}, match=${isCurrentBubble || isPreviousBubble}`);
        
        // For FINAL results: accept from current OR previous bubble (catch late finals)
        // For INTERIM results: ONLY accept from current bubble (prevents bouncing during restart)
        if (data.isFinal) {
          if (!isCurrentBubble && !isPreviousBubble) {
            console.log(`⚠️ Ignoring final result for unknown bubble: ${data.bubbleId}`);
            return;
          }
          
          if (this.callbacks?.onFinalResult) {
            this.callbacks.onFinalResult({
              transcript: data.transcript,
              isFinal: data.isFinal,
              confidence: data.confidence,
              wordCount: this.currentWordCount,
              bubbleId: data.bubbleId
            });
            // Clear current transcript since we've received a final result
            if (isCurrentBubble) {
              this.currentTranscript = '';
              this.hasReceivedFinalResult = true;
            }
            // Clear previous bubble ID after receiving its final result
            if (isPreviousBubble) {
              this.previousBubbleId = null;
            }
          }
        } else {
          // INTERIM results: only accept from current bubble to prevent bouncing
          if (!isCurrentBubble) {
            console.log(`⚠️ Ignoring interim result from non-current bubble: ${data.bubbleId?.substring(0, 15)}`);
            return;
          }
          
          if (this.callbacks?.onInterimResult) {
            // Track the current transcript so we can save it on stream restart
            this.currentTranscript = data.transcript;
            // Update word count for silence detection
            this.currentWordCount = data.transcript.trim().split(/\s+/).filter(w => w.length > 0).length;
            // Reset silence detection when we get new interim results (speech is active)
            this.lastSpeechTime = Date.now();
            this.silenceStartTime = null;
            
            this.callbacks.onInterimResult({
              transcript: data.transcript,
              isFinal: data.isFinal,
              confidence: data.confidence,
              wordCount: this.currentWordCount,
              bubbleId: data.bubbleId
            });
          }
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
      
      // Listen for PENDING stream restart - this is sent BEFORE the new stream starts
      // We MUST update bubbleId here so the new stream uses a different ID than the old stream
      this.socket.on('streamRestartPending', (data: any) => {
        console.log('🔄 Stream restart pending:', data.reason);
        if (this.isRecording) {
          // Save current bubble ID as previous to allow late FINAL results to come through
          this.previousBubbleId = this.currentBubbleId;
          // Generate new bubble ID IMMEDIATELY so new stream uses different ID
          this.currentBubbleId = this.generateBubbleId();
          console.log(`🔄 BubbleId updated: previous=${this.previousBubbleId?.substring(0, 15)}, new=${this.currentBubbleId?.substring(0, 15)}`);
          // DON'T clear currentTranscript here - InputApp handles saving the displayed text
          this.hasReceivedFinalResult = false;
        }
      });
      
      // Listen for stream restart requests from backend (for error recovery)
      // Note: InputApp.tsx handles saving displayed interim text on stream restart
      // This handler only manages internal state for the new stream
      this.socket.on('streamRestart', (data: any) => {
        console.log('🔄 Backend requested stream restart:', data.reason);
        console.log(`🔄 BEFORE restart: currentBubbleId=${this.currentBubbleId?.substring(0, 15)}, previousBubbleId=${this.previousBubbleId?.substring(0, 15)}`);
        if (this.isRecording) {
          // Note: We no longer save interim here - InputApp handles this to avoid duplicates
          // and ensure the displayed text (which may differ from internal state) is preserved
          
          // Save current bubble ID as previous to allow late results to come through
          this.previousBubbleId = this.currentBubbleId;
          // Generate new bubble ID and continue recording
          this.currentBubbleId = this.generateBubbleId();
          this.currentTranscript = ''; // Reset for new bubble
          this.hasReceivedFinalResult = false;
          console.log(`🔄 AFTER restart: currentBubbleId=${this.currentBubbleId?.substring(0, 15)}, previousBubbleId=${this.previousBubbleId?.substring(0, 15)}`);
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
      
      // Detect if we're on a mobile/tablet device (helper function)
      const detectMobileDevice = (): boolean => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (!!navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
      };
      
      const isMobileDevice = detectMobileDevice();
      
      // Request microphone access with device-appropriate audio processing
      // Mobile devices may need different settings for better silence detection
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      };
      
      // On mobile, sometimes less aggressive processing helps with silence detection
      if (isMobileDevice) {
        // Mobile devices: slightly less aggressive noise suppression for better silence detection
        audioConstraints.noiseSuppression = true;
        audioConstraints.echoCancellation = true;
        // Some mobile devices work better with specific sample rate
        audioConstraints.sampleRate = { ideal: 48000 };
      }
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints
      });
      
      // Set up audio context with device-appropriate sample rate
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      // Use 48000 Hz sample rate (required by backend) - some mobile devices default to 44100
      this.audioContext = new AudioContextClass({
        sampleRate: 48000
      });
      
      // If the context was created with a different sample rate, we need to handle it
      if (this.audioContext.sampleRate !== 48000) {
        console.warn(`⚠️ AudioContext sample rate is ${this.audioContext.sampleRate}Hz, expected 48000Hz. This may cause issues on mobile.`);
      }

      this.analyser = this.audioContext.createAnalyser();
      // Use larger FFT size for better frequency analysis on mobile
      this.analyser.fftSize = isMobileDevice ? 512 : 256;
      this.analyser.smoothingTimeConstant = isMobileDevice ? 0.7 : 0.8; // Less smoothing on mobile for faster response
      
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
    this.previousBubbleId = null; // Clear any previous bubble ID when starting fresh
    this.currentBubbleId = this.generateBubbleId();
    this.currentWordCount = 0;
    this.currentTranscript = '';
    this.hasReceivedFinalResult = false;

    try {
      // Use modern AudioWorklet if available, fallback to ScriptProcessorNode
      // AudioWorklet is more reliable on mobile devices
      const useAudioWorklet = this.audioContext!.audioWorklet !== undefined;
      
      if (useAudioWorklet) {
        // Modern approach: Use AudioWorklet (better for mobile)
        try {
          // Note: AudioWorklet requires a separate worklet file, so we'll use ScriptProcessorNode for now
          // but with better mobile compatibility
          const bufferSize = 4096; // Larger buffer for mobile stability
          this.scriptProcessor = this.audioContext!.createScriptProcessor(bufferSize, 1, 1);
        } catch (workletError) {
          console.warn('⚠️ AudioWorklet not available, using ScriptProcessorNode:', workletError);
          const bufferSize = 4096;
          this.scriptProcessor = this.audioContext!.createScriptProcessor(bufferSize, 1, 1);
        }
      } else {
        // Fallback: ScriptProcessorNode (deprecated but still works)
        const bufferSize = 4096; // Larger buffer for mobile devices
        this.scriptProcessor = this.audioContext!.createScriptProcessor(bufferSize, 1, 1);
      }
      
      // Connect microphone to script processor
      this.microphone!.connect(this.scriptProcessor);
      // Connect to destination to keep the audio processing active (required on some mobile browsers)
      this.scriptProcessor.connect(this.audioContext!.destination);
      
      // Process raw audio data
      this.scriptProcessor.onaudioprocess = (event) => {
        if (this.isRecording && !this.isPaused) {
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0); // Get mono channel
          
          // Calculate audio level for silence detection BEFORE processing
          const audioLevel = this.calculateAudioLevel(inputData);
          
          // Update last speech time if audio is detected
          if (audioLevel > 0.02) { // Threshold for speech detection
            this.lastSpeechTime = Date.now();
            this.silenceStartTime = null;
          } else {
            // Track silence start
            if (this.silenceStartTime === null) {
              this.silenceStartTime = Date.now();
            }
          }
          
          // Convert Float32Array to Int16Array (LINEAR16 format)
          const linear16Data = this.convertFloat32ToInt16(inputData);
          
          this.processRawAudioChunk(linear16Data);
        }
      };

      // Start processing
      this.callbacks?.onStart();

      // Start audio level monitoring
      this.startAudioLevelMonitoring();
      
      // Start silence detection for automatic finalization
      this.startSilenceDetection();
      
      // Start keep-alive mechanism to prevent audio timeout
      this.startKeepAlive();
      this.lastAudioSentTime = Date.now();
      this.lastSpeechTime = Date.now();

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
    
    // Stop silence detection
    this.stopSilenceDetection();
    
    // Stop keep-alive mechanism
    this.stopKeepAlive();

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
    return this.socket === socket && this.lastSocketId === socket?.id;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    console.log('🧹 Cleaning up Google Speech Service...');
    
    this.stopRecognition();
    this.clearTimers();
    this.clearMessageQueue();
    this.stopKeepAlive();
    this.stopSilenceDetection();

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
      this.lastAudioSentTime = Date.now();
      this.sendRawAudioChunk(int16Data);
    }
  }

  /**
   * Start keep-alive mechanism to prevent audio timeout
   */
  private startKeepAlive(): void {
    // Send keep-alive every 5 seconds if no audio has been sent
    this.keepAliveInterval = setInterval(() => {
      if (!this.isRecording || this.isPaused) {
        return;
      }
      
      const timeSinceLastAudio = Date.now() - this.lastAudioSentTime;
      
      // If no audio sent in 5 seconds, send a silent audio frame
      if (timeSinceLastAudio > 5000) {
        console.log('🔇 Sending keep-alive silent audio frame');
        // Create a small silent audio buffer (256 samples of silence)
        const silentAudio = new Int16Array(256);
        this.sendRawAudioChunk(silentAudio);
        this.lastAudioSentTime = Date.now();
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Stop keep-alive mechanism
   */
  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
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
   * Calculate audio level from raw audio data (for silence detection)
   */
  private calculateAudioLevel(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    return rms;
  }

  /**
   * Start monitoring audio levels for visual feedback
   * Uses both frequency and time domain data for better mobile compatibility
   */
  private startAudioLevelMonitoring(): void {
    if (!this.analyser || !this.callbacks?.onAudioLevel) {
      return;
    }

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    const timeData = new Uint8Array(this.analyser.fftSize);

    const monitorAudioLevel = () => {
      if (!this.isRecording || !this.analyser) {
        return;
      }

      // Use time domain data for more accurate volume detection on mobile
      this.analyser.getByteTimeDomainData(timeData);
      
      // Calculate RMS from time domain (more accurate for silence detection)
      let sum = 0;
      for (let i = 0; i < timeData.length; i++) {
        const normalized = (timeData[i] - 128) / 128; // Normalize to -1 to 1
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / timeData.length);
      
      // Normalize to 0-1 range
      // Mobile devices may have different baseline levels, so we adjust the threshold
      const normalizedLevel = Math.min(1, rms * 2); // Scale up for better sensitivity
      
      // Call the callback with the audio level
      this.callbacks?.onAudioLevel?.(normalizedLevel);
    };

    // Monitor audio levels every 50ms for smooth updates
    this.audioLevelInterval = setInterval(monitorAudioLevel, 50);
  }
  
  /**
   * Start silence detection for automatic finalization
   * This helps detect when speech has ended, especially on mobile devices
   */
  private startSilenceDetection(): void {
    if (!this.callbacks) {
      return;
    }
    
    const silenceDetection = () => {
      if (!this.isRecording || !this.currentTranscript.trim()) {
        return;
      }
      
      const now = Date.now();
      const timeSinceLastSpeech = now - this.lastSpeechTime;
      const silenceTimeout = this.config.speechEndTimeout * 1000; // Convert to milliseconds
      
      // If we've been silent for longer than the timeout, finalize the current transcript
      if (this.silenceStartTime !== null && timeSinceLastSpeech > silenceTimeout) {
        const silenceDuration = now - this.silenceStartTime;
        
        // Only finalize if we have a transcript and silence has been detected
        if (silenceDuration > silenceTimeout && this.currentTranscript.trim()) {
          console.log(`🔇 Silence detected (${Math.round(silenceDuration / 1000)}s), finalizing transcript`);
          
          // Create a final result from the current transcript
          if (this.callbacks?.onFinalResult) {
            this.callbacks.onFinalResult({
              transcript: this.currentTranscript.trim(),
              isFinal: true,
              confidence: 0.8, // Default confidence for silence-triggered finalization
              wordCount: this.currentWordCount,
              bubbleId: this.currentBubbleId || this.generateBubbleId()
            });
            
            // Reset state
            this.currentTranscript = '';
            this.currentBubbleId = this.generateBubbleId();
            this.currentWordCount = 0;
            this.lastSpeechTime = Date.now();
            this.silenceStartTime = null;
          }
        }
      }
    };
    
    // Check for silence every 100ms
    this.silenceDetectionInterval = setInterval(silenceDetection, 100);
  }
  
  /**
   * Stop silence detection
   */
  private stopSilenceDetection(): void {
    if (this.silenceDetectionInterval) {
      clearInterval(this.silenceDetectionInterval);
      this.silenceDetectionInterval = null;
    }
    this.lastSpeechTime = 0;
    this.silenceStartTime = null;
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