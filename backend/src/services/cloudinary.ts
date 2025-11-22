import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadAudio(
  audioBuffer: Buffer,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video', // Audio files are uploaded as video type
        folder: 'unwrapped/audio',
        public_id: filename,
        format: 'mp3',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result!.secure_url)
        }
      }
    )

    streamifier.createReadStream(audioBuffer).pipe(uploadStream)
  })
}

export async function uploadPhoto(
  imageBuffer: Buffer,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'unwrapped/photos',
        public_id: filename,
        transformation: [
          { width: 1080, height: 1080, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result!.secure_url)
        }
      }
    )

    streamifier.createReadStream(imageBuffer).pipe(uploadStream)
  })
}

export async function uploadPattern(
  imageBuffer: Buffer,
  sessionId: string
): Promise<{ static: string; animated?: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'unwrapped/patterns',
        public_id: `pattern_${sessionId}`,
        transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve({
            static: result!.secure_url,
            animated: result!.secure_url, // Can create GIF version later
          })
        }
      }
    )

    streamifier.createReadStream(imageBuffer).pipe(uploadStream)
  })
}
