import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  formatBitrate,
  formatDuration,
  calculateAspectRatio,
  calculateOrientation,
  calculateSavings,
  getResolutionDimensions,
  buildFfmpegArgs
} from './videoUtils';

test('formatBytes formats file sizes accurately', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024 * 25.5), '25.5 MB');
  assert.equal(formatBytes(1024 * 1024 * 1024 * 2.1), '2.1 GB');
});

test('formatBitrate formats bps correctly', () => {
  assert.equal(formatBitrate(0), 'Unknown');
  assert.equal(formatBitrate(128_000), '128 kbps');
  assert.equal(formatBitrate(8_500_000), '8.50 Mbps');
  assert.equal(formatBitrate(12_000_000), '12.00 Mbps');
});

test('formatDuration formats seconds to MM:SS or HH:MM:SS', () => {
  assert.equal(formatDuration(45), '00:45');
  assert.equal(formatDuration(84), '01:24');
  assert.equal(formatDuration(3665), '01:01:05');
});

test('calculateAspectRatio correctly identifies standard ratios', () => {
  assert.equal(calculateAspectRatio(1920, 1080), '16:9');
  assert.equal(calculateAspectRatio(3840, 2160), '16:9');
  assert.equal(calculateAspectRatio(1080, 1920), '9:16 (Portrait)');
  assert.equal(calculateAspectRatio(1080, 1080), '1:1 (Square)');
  assert.equal(calculateAspectRatio(1440, 1080), '4:3');
});

test('calculateOrientation distinguishes landscape, portrait, square', () => {
  assert.equal(calculateOrientation(1920, 1080), 'Landscape');
  assert.equal(calculateOrientation(1080, 1920), 'Portrait');
  assert.equal(calculateOrientation(1080, 1080), 'Square');
});

test('calculateSavings computes file size reduction percentage', () => {
  assert.equal(calculateSavings(100, 40), 60);
  assert.equal(calculateSavings(50_000_000, 15_000_000), 70);
  assert.equal(calculateSavings(100, 100), 0);
});

test('getResolutionDimensions calculates target dimensions', () => {
  const landscape4k = getResolutionDimensions('4k', 1920, 1080);
  assert.deepEqual(landscape4k, { width: 3840, height: 2160 });

  const portrait1080 = getResolutionDimensions('1080p', 1080, 1920);
  assert.deepEqual(portrait1080, { width: 1080, height: 1920 });
});

test('buildFfmpegArgs builds valid FFmpeg arguments', () => {
  const args = buildFfmpegArgs(
    '/tmp/input.mp4',
    '/tmp/output.mp4',
    {
      preset: 'esports_high_fps',
      targetResolution: '1080p',
      targetFps: '60',
      videoCodec: 'libx264',
      crf: 20,
      speedPreset: 'fast',
      audioCodec: 'aac',
      audioBitrate: '192k'
    },
    { width: 1920, height: 1080 }
  );

  assert.ok(args.includes('-i'));
  assert.ok(args.includes('/tmp/input.mp4'));
  assert.ok(args.includes('-c:v'));
  assert.ok(args.includes('libx264'));
  assert.ok(args.includes('-crf'));
  assert.ok(args.includes('20'));
  assert.ok(args.includes('-b:a'));
  assert.ok(args.includes('192k'));
  assert.ok(args.includes('/tmp/output.mp4'));
});
