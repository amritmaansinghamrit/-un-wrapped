export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private analyser: AnalyserNode | null = null
  private audioContext: AudioContext | null = null

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create audio context for waveform analysis
      this.audioContext = new AudioContext()
      const source = this.audioContext.createMediaStreamSource(this.stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      source.connect(this.analyser)

      this.mediaRecorder = new MediaRecorder(this.stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      // Start with timeslice to collect data continuously for waveform
      this.mediaRecorder.start(100) // Collect data every 100ms
    } catch (error) {
      console.error('Error starting recording:', error)
      throw new Error('Failed to access microphone')
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        resolve(audioBlob)

        // Cleanup
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop())
        }
        if (this.audioContext) {
          this.audioContext.close()
        }
      }

      this.mediaRecorder.stop()
    })
  }

  getWaveform(): number[] {
    if (!this.analyser) return []

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteTimeDomainData(dataArray)

    return Array.from(dataArray).slice(0, 50) // Return first 50 points for visualization
  }

  getFrequencies(): number[] {
    if (!this.analyser) return []

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteFrequencyData(dataArray)

    return Array.from(dataArray).slice(0, 50) // Return first 50 frequency bins
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}
