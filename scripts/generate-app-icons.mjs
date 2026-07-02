/**
 * Generate Android mipmap + iOS AppIcon from src/assets/eddva_logo.png
 * Run: node scripts/generate-app-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcLogo = path.join(root, 'src', 'assets', '1.png');

const ANDROID_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const IOS_ICONS = [
  { name: 'Icon-App-20x20@2x.png', size: 40 },
  { name: 'Icon-App-20x20@3x.png', size: 60 },
  { name: 'Icon-App-29x29@2x.png', size: 58 },
  { name: 'Icon-App-29x29@3x.png', size: 87 },
  { name: 'Icon-App-40x40@2x.png', size: 80 },
  { name: 'Icon-App-40x40@3x.png', size: 120 },
  { name: 'Icon-App-60x60@2x.png', size: 120 },
  { name: 'Icon-App-60x60@3x.png', size: 180 },
  { name: 'Icon-App-1024x1024@1x.png', size: 1024 },
];

async function main() {
  if (!fs.existsSync(srcLogo)) {
    console.error('Missing logo:', srcLogo);
    process.exit(1);
  }

  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('Install sharp: npm install --save-dev sharp');
    process.exit(1);
  }

  const resRoot = path.join(root, 'android', 'app', 'src', 'main', 'res');
  for (const [folder, size] of Object.entries(ANDROID_SIZES)) {
    const dir = path.join(resRoot, folder);
    fs.mkdirSync(dir, { recursive: true });
    const buf = await sharp(srcLogo)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
      fs.writeFileSync(path.join(dir, name), buf);
    }
    console.log('Android', folder, size);
  }

  const iosDir = path.join(
    root,
    'ios',
    'StudentLearningApp',
    'Images.xcassets',
    'AppIcon.appiconset',
  );
  fs.mkdirSync(iosDir, { recursive: true });
  for (const { name, size } of IOS_ICONS) {
    await sharp(srcLogo)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(iosDir, name));
    console.log('iOS', name, size);
  }

  const drawableDir = path.join(resRoot, 'drawable');
  fs.mkdirSync(drawableDir, { recursive: true });

  const notifLarge = path.join(drawableDir, 'ic_eddva_large.png');
  await sharp(srcLogo)
    .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(notifLarge);
  console.log('Android drawable/ic_eddva_large.png');

  /** White silhouette for Android smallIcon (shows in colored circle like other apps). */
  const { data, info } = await sharp(srcLogo)
    .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = a > 48 ? 255 : 0;
  }

  const statPath = path.join(drawableDir, 'ic_stat_eddva.png');
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(statPath);
  console.log('Android drawable/ic_stat_eddva.png (notification small icon)');

  console.log('Done — EDDVA launcher icons generated.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
