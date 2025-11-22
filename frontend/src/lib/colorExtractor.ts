export function extractDominantColors(
  imageFile: File
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Resize for performance
        const maxSize = 100
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data

        // Simple color extraction (get most common colors)
        const colorMap: { [key: string]: number } = {}

        for (let i = 0; i < pixels.length; i += 4) {
          const r = Math.floor(pixels[i] / 32) * 32
          const g = Math.floor(pixels[i + 1] / 32) * 32
          const b = Math.floor(pixels[i + 2] / 32) * 32

          const colorKey = `rgb(${r},${g},${b})`
          colorMap[colorKey] = (colorMap[colorKey] || 0) + 1
        }

        // Sort by frequency and get top 5
        const sortedColors = Object.entries(colorMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([color]) => color)

        resolve(sortedColors)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(imageFile)
  })
}

export function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return rgb

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
