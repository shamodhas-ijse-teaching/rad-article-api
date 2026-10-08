import { supabase } from "../config/supabase"
import crypto from "crypto"

export const uploadImage = async (
  file: Express.Multer.File,
  bucketName: string = "files"
): Promise<string> => {
  const uuid = crypto.randomUUID()
  const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "-")
  const fileName = `${uuid}-${sanitizedName}`

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, { contentType: file.mimetype })

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName)
  return data.publicUrl
}
