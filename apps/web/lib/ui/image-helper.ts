export const returnOGImageUrl = (url?: string): string | null => {
  if (!url) return null;

  try {
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl.replace(/\.[^/.]+$/, "-og.jpg");
  } catch (e) {
    return url;
  }
};

/**
 * URL'deki dosya uzantısını silip yerine '-thumbnail.webp' ekler.
 * (Thumbnail için genelde webp tercih edilir ama jpg istersen değiştirebilirsin)
 * Örn: .../resim.webp -> .../resim-thumbnail.webp
 */
export const returnThumbnailUrl = (url?: string): string | null => {
  if (!url) return null;
  try {
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl.replace(/\.[^/.]+$/, "-thumbnail.webp");
  } catch (e) {
    return url;
  }
};
