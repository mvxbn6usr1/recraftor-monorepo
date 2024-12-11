import type { StyleType, ImageSize } from '@/types/recraft';

export const RECRAFT_V3_SUBSTYLES = {
  realistic_image: [
    'b_and_w', 'enterprise', 'evening_light', 'faded_nostalgia', 'forest_life',
    'hard_flash', 'hdr', 'motion_blur', 'mystic_naturalism', 'natural_light',
    'natural_tones', 'organic_calm', 'real_life_glow', 'retro_realism',
    'retro_snapshot', 'studio_portrait', 'urban_drama', 'village_realism', 'warm_folk'
  ],
  digital_illustration: [
    '2d_art_poster', '2d_art_poster_2', 'engraving_color', 'grain', 'hand_drawn',
    'hand_drawn_outline', 'handmade_3d', 'infantile_sketch', 'pixel_art', 'antiquarian',
    'bold_fantasy', 'child_book', 'child_books', 'cover', 'crosshatch', 'digital_engraving',
    'expressionism', 'freehand_details', 'grain_20', 'graphic_intensity', 'hard_comics',
    'long_shadow', 'modern_folk', 'multicolor', 'neon_calm', 'noir', 'nostalgic_pastel',
    'outline_details', 'pastel_gradient', 'pastel_sketch', 'pop_art', 'pop_renaissance',
    'street_art', 'tablet_sketch', 'urban_glow', 'urban_sketching', 'vanilla_dreams',
    'young_adult_book', 'young_adult_book_2'
  ],
  vector_illustration: [
    'bold_stroke', 'chemistry', 'colored_stencil', 'contour_pop_art', 'cosmics',
    'cutout', 'depressive', 'editorial', 'emotional_flat', 'engraving', 'infographical',
    'line_art', 'line_circuit', 'linocut', 'marker_outline', 'mosaic', 'naivector',
    'roundish_flat', 'segmented_colors', 'sharp_contrast', 'thin', 'vector_photo',
    'vivid_shapes'
  ]
} as const;

export const RECRAFT_20B_SUBSTYLES = {
  realistic_image: [
    'b_and_w', 'enterprise', 'hard_flash', 'hdr', 'motion_blur',
    'natural_light', 'studio_portrait'
  ],
  digital_illustration: [
    '2d_art_poster', '2d_art_poster_2', '3d', '80s', 'engraving_color',
    'glow', 'grain', 'hand_drawn', 'hand_drawn_outline', 'handmade_3d',
    'infantile_sketch', 'kawaii', 'pixel_art', 'psychedelic', 'seamless',
    'voxel', 'watercolor'
  ],
  vector_illustration: [
    'cartoon', 'doodle_line_art', 'engraving', 'flat_2', 'kawaii',
    'line_art', 'line_circuit', 'linocut', 'seamless'
  ],
  icon: [
    'broken_line', 'colored_outline', 'colored_shapes', 'colored_shapes_gradient',
    'doodle_fill', 'doodle_offset_fill', 'offset_fill', 'outline',
    'outline_gradient', 'uneven_fill'
  ]
} as const;

export const IMAGE_SIZES: ImageSize[] = [
  '1024x1024', '1365x1024', '1024x1365', '1536x1024', '1024x1536',
  '1820x1024', '1024x1820', '1024x2048', '2048x1024', '1434x1024',
  '1024x1434', '1024x1280', '1280x1024', '1024x1707', '1707x1024'
];

export const STYLES: StyleType[] = [
  'any',
  'realistic_image',
  'digital_illustration',
  'vector_illustration',
  'icon'
];