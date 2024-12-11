import type { ToolType } from '@/types/recraft';

export const TOOL_NAMES: Record<ToolType, string> = {
  generate: 'Generated',
  vectorize: 'Vectorized',
  removeBackground: 'Background Removed',
  clarityUpscale: 'Clarity Enhanced',
  generativeUpscale: 'Generatively Enhanced',
  createStyle: 'Style Reference'
} as const;