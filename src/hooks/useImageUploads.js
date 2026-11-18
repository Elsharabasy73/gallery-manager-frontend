import { compressImage, prepareImages, IMAGE_PRESETS } from '../utils/compressImage'

export { IMAGE_PRESETS }

export async function compressImageUpload(file, preset, previousPreview, setFile, setPreview) {
  const { file: compressedFile } = await compressImage(file, preset)
  if (previousPreview?.startsWith('blob:')) URL.revokeObjectURL(previousPreview)
  setFile(compressedFile)
  setPreview(URL.createObjectURL(compressedFile))
}

export async function prepareImageUploads(files, preset, { onSkipped, onFiles, onPreviews }) {
  const { files: ready, skipped } = await prepareImages(files, preset)
  if (skipped.length) onSkipped(skipped)
  if (!ready.length) return
  onFiles(ready)
  const previews = ready.map((file) => URL.createObjectURL(file))
  onPreviews(previews)
}
