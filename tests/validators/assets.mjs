export const meta = {
  name: 'assets',
  tier: 1,
  description: 'Images have alt/width/height; videos have autoplay/muted/loop/playsinline + poster.',
};

export default async function run({ dom }) {
  const doc = dom.window.document;
  const errors = [];
  const warnings = [];
  const stats = { images: 0, videos: 0, imagesMissingAlt: 0, imagesMissingDims: 0 };

  const images = [...doc.querySelectorAll('img')];
  stats.images = images.length;
  for (const img of images) {
    const src = img.getAttribute('src') ?? '<inline>';
    if (!img.hasAttribute('alt')) {
      errors.push({ code: 'img-missing-alt', message: `<img src="${src}"> has no alt attribute (a11y failure)` });
      stats.imagesMissingAlt += 1;
    }
    if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
      warnings.push({
        code: 'img-missing-dims',
        message: `<img src="${src}"> is missing width/height — causes layout shift (CLS)`,
      });
      stats.imagesMissingDims += 1;
    }
    if (src && src.includes('unsplash.com') && !/[?&](w|q)=/.test(src)) {
      warnings.push({
        code: 'unsplash-no-params',
        message: `Unsplash image ${src} missing width/quality params — serves full-res by default`,
      });
    }
  }

  const videos = [...doc.querySelectorAll('video')];
  stats.videos = videos.length;
  const requiredVideoAttrs = ['autoplay', 'muted', 'loop', 'playsinline'];
  for (const video of videos) {
    for (const attr of requiredVideoAttrs) {
      if (!video.hasAttribute(attr)) {
        errors.push({
          code: 'video-missing-attr',
          message: `<video> missing required attribute "${attr}" — cross-browser autoplay will fail`,
        });
      }
    }
    if (!video.hasAttribute('poster')) {
      warnings.push({
        code: 'video-missing-poster',
        message: '<video> missing poster attribute — users see black frame before load',
      });
    }
  }

  return {
    ...meta,
    passed: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}
