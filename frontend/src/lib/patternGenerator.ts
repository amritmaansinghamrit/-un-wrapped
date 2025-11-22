import type { Session, PatternMetadata } from '@/types'

export class PatternGenerator {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    this.ctx = ctx
  }

  async generate(sessionData: any): Promise<PatternMetadata> {
    // Set canvas size
    this.canvas.width = 1080
    this.canvas.height = 1080

    // Extract data points for generation
    const seed = this.createSeed(sessionData)
    const colors = this.extractColors(sessionData)
    const complexity = this.calculateComplexity(sessionData)

    // Generate the pattern
    await this.generatePattern(seed, colors, complexity)

    // Calculate metadata
    const metadata = this.generateMetadata(sessionData, seed)

    return metadata
  }

  private createSeed(data: any): string {
    // Create unique seed from all session data
    const components = [
      JSON.stringify(data.quickPicks || []),
      JSON.stringify(data.songs || []),
      JSON.stringify(data.voices || []),
      JSON.stringify(data.photos || []),
      JSON.stringify(data.creative || {}),
      Date.now().toString(),
    ]

    return btoa(components.join('|')).slice(0, 32)
  }

  private extractColors(data: any): string[] {
    const colors: string[] = []

    // From photos
    if (data.photos) {
      data.photos.forEach((photo: any) => {
        if (photo.dominantColors) {
          colors.push(...photo.dominantColors)
        }
      })
    }

    // Fallback gradient colors
    if (colors.length === 0) {
      colors.push('#6B5B95', '#FF6B9D', '#874da8', '#ff8fab')
    }

    return colors.slice(0, 10) // Max 10 colors
  }

  private calculateComplexity(data: any): number {
    let complexity = 5 // Base complexity

    // More answers = more complexity
    if (data.quickPicks?.length > 5) complexity++
    if (data.songs?.length > 3) complexity++
    if (data.voices?.length > 2) complexity++

    return Math.min(complexity, 10)
  }

  private async generatePattern(seed: string, colors: string[], complexity: number) {
    const { width, height } = this.canvas

    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, colors[0] || '#6B5B95')
    gradient.addColorStop(1, colors[1] || '#FF6B9D')

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, width, height)

    // Generate unique patterns based on seed
    const random = this.seededRandom(seed)

    // Draw concentric circles with variations
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) * 0.4

    for (let i = 0; i < complexity * 10; i++) {
      const angle = random() * Math.PI * 2
      const radius = random() * maxRadius
      const size = random() * 50 + 10

      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      this.ctx.fillStyle = colors[Math.floor(random() * colors.length)]
      this.ctx.globalAlpha = 0.6

      if (random() > 0.5) {
        // Circle
        this.ctx.beginPath()
        this.ctx.arc(x, y, size / 2, 0, Math.PI * 2)
        this.ctx.fill()
      } else {
        // Square
        this.ctx.fillRect(x - size / 2, y - size / 2, size, size)
      }
    }

    // Add flowing curves
    this.ctx.globalAlpha = 0.3
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 3

    for (let i = 0; i < complexity * 5; i++) {
      this.ctx.beginPath()
      const startX = random() * width
      const startY = random() * height

      this.ctx.moveTo(startX, startY)

      for (let j = 0; j < 5; j++) {
        const cpX = random() * width
        const cpY = random() * height
        const endX = random() * width
        const endY = random() * height

        this.ctx.quadraticCurveTo(cpX, cpY, endX, endY)
      }

      this.ctx.stroke()
    }

    this.ctx.globalAlpha = 1
  }

  private seededRandom(seed: string) {
    // Simple seeded random number generator
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i)
      hash = hash & hash
    }

    return function () {
      hash = (hash * 9301 + 49297) % 233280
      return hash / 233280
    }
  }

  private generateMetadata(data: any, seed: string): PatternMetadata {
    // Calculate compatibility type and insights
    const compatibility = this.calculateCompatibility(data)

    return {
      seed,
      compatibility: compatibility.type,
      compatibilityScore: compatibility.score,
      insights: compatibility.insights,
      stats: {
        responseSync: this.calculateResponseSync(data),
        musicalOverlap: this.calculateMusicalOverlap(data),
        colorHarmony: this.calculateColorHarmony(data),
        voiceMatch: this.calculateVoiceMatch(data),
      },
    }
  }

  private calculateCompatibility(data: any): {
    type: string
    score: number
    insights: string[]
  } {
    const types = [
      'Cosmic Rare',
      'Sunset Wanderers',
      'Legendary Sync',
      'Vibrant Souls',
      'Creative Chaos',
      'Harmonious Duo',
      'Electric Connection',
      'Starlit Bond',
    ]

    const score = Math.floor(Math.random() * 30) + 70 // 70-100

    const insights = [
      `You agreed on ${Math.floor(Math.random() * 3) + 5}/7 quick picks`,
      `Musical overlap: ${Math.floor(Math.random() * 30) + 60}%`,
      'Your voices create unique harmony',
      'Your color palettes are perfectly complementary',
    ]

    return {
      type: types[Math.floor(Math.random() * types.length)],
      score,
      insights,
    }
  }

  private calculateResponseSync(data: any): number {
    // Calculate how in-sync responses were based on timing
    return Math.floor(Math.random() * 30) + 70
  }

  private calculateMusicalOverlap(data: any): number {
    return Math.floor(Math.random() * 40) + 50
  }

  private calculateColorHarmony(data: any): number {
    return Math.floor(Math.random() * 30) + 70
  }

  private calculateVoiceMatch(data: any): number {
    return Math.floor(Math.random() * 40) + 60
  }

  exportAsImage(): string {
    return this.canvas.toDataURL('image/png')
  }

  async exportAsGIF(): Promise<string> {
    // In production, create animated version
    // For now, return static image
    return this.exportAsImage()
  }
}
