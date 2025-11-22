export const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',

  // Audio
  'audio/mpeg', // mp3
  'audio/wav',
  'audio/ogg',
  'audio/webm',

  // Documents
  'application/pdf', // PDF
  'application/msword', // DOC
  //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.ms-excel', // XLS
  //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-powerpoint', // PPT
  //   'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'text/plain', // TXT
] as const;

export type MimeType = (typeof allowedMimeTypes)[number];
