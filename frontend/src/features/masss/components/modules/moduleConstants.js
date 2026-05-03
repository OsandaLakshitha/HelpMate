// src/features/masss/components/modules/moduleConstants.js

export const CATEGORY_OPTIONS = [
  { value: 'coding',          label: 'Coding'          },
  { value: 'math_logic',      label: 'Math / Logic'    },
  { value: 'language',        label: 'Language'        },
  { value: 'creative_design', label: 'Creative Design' },
  { value: 'memorization',    label: 'Memorization'    },
  { value: 'other',           label: 'Other'           },
]

export const ENERGY_TIMES = ['morning', 'afternoon', 'evening']

export const COLOURS = [
  '#0FA89E', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#10B981', '#EC4899', '#6366F1',
]

export const EMPTY_MODULE = {
  name:        '',
  category:    'other',
  color:       '#0FA89E',
  energy_time: 'afternoon',
}

export const getCategoryLabel = (value) =>
  CATEGORY_OPTIONS.find(o => o.value === value)?.label || value