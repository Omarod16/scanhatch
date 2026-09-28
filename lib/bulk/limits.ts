/**
 * Browser-safe batch limits.
 *
 * Measured in headless desktop Chromium (PNG output, default sizes):
 *   500 rows   ~8 s QR / ~11 s barcode, ~+150 MB memory, no main-thread block over 60 ms
 *   1000 rows  ~18 s QR / ~15 s barcode, up to ~+240 MB
 *   2000 rows  ~45 s QR / ~39 s barcode, up to ~+430 MB, blocks up to 130 ms
 * 500 keeps a wide margin for phones, which are typically several times slower
 * and have tighter per-tab memory (not measured on real devices).
 */
export const MAX_BATCH_ROWS = 500;
export const MAX_CSV_BYTES = 1024 * 1024; // 1 MB: ~2 KB per row at the maximum row count
export const MAX_NAME_LENGTH = 100;
