// Timeline layout constants
export const TIMELINE_CONSTANTS = {
  // Time-based constants
  PIXELS_PER_HOUR: 100,
  MINUTES_PER_TICK: 30,
  MILLISECONDS_PER_HOUR: 1000 * 60 * 60,

  // Layout constants
  HEADER_HEIGHT: 84, // Total header height (date row + time row)
  DATE_ROW_HEIGHT: 48, // Height of the date display row
  TIME_ROW_HEIGHT: 36, // Height of the time ticks row

  // Row constants - these will be used for both sidebar and timeline rows
  DEFAULT_ROW_HEIGHT: 65, // Reduced height for each aircraft row (was 80px)
  ROW_BORDER_WIDTH: 1,

  // Sidebar constants
  SIDEBAR_WIDTH: 120,

  // Minimum timeline width
  MIN_TIMELINE_WIDTH: 800,
} as const;

// Hardcoded "current time" for demo purposes - April 17, 2024 11:15 UTC
export const DEMO_CURRENT_TIME = new Date(Date.UTC(2024, 3, 17, 11, 15, 0, 0));

// Calculate row height
export function getRowHeight(customHeight?: number): number {
  // For now, return default height, but this can be made dynamic later
  if (customHeight) return customHeight;
  return TIMELINE_CONSTANTS.DEFAULT_ROW_HEIGHT;
}

// Calculate cumulative top offset for a row
export function getRowTopOffset(
  rowIndex: number,
  rowHeights?: number[],
): number {
  if (!rowHeights) {
    // If no custom heights, use default height for all rows
    return rowIndex * TIMELINE_CONSTANTS.DEFAULT_ROW_HEIGHT;
  }

  // Calculate cumulative height of all previous rows
  return rowHeights.slice(0, rowIndex).reduce((sum, height) => sum + height, 0);
}
