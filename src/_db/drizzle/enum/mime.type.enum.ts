export const AllowedMimeType = {
  // Images
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',

  // Videos
  MP4: 'video/mp4',
  WEBM_VIDEO: 'video/webm',
  OGG_VIDEO: 'video/ogg',

  // Audio
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  OGG_AUDIO: 'audio/ogg',
  WEBM_AUDIO: 'audio/webm',

  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  XLS: 'application/vnd.ms-excel',
  PPT: 'application/vnd.ms-powerpoint',
  TXT: 'text/plain',
} as const;

export type TAllowedMimeType =
  (typeof AllowedMimeType)[keyof typeof AllowedMimeType];

export const ImageMimeType = [
  AllowedMimeType.JPEG,
  AllowedMimeType.PNG,
  AllowedMimeType.GIF,
  AllowedMimeType.WEBP,
  AllowedMimeType.SVG,
] as const satisfies readonly TAllowedMimeType[];
