import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  fonts: {
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
  },
  colors: {
    primary: {
      50: '#E6EEFF',
      100: '#C2D5FF',
      200: '#99BBFF',
      300: '#7099FF',
      400: '#4C77FF',
      500: '#3366FF',
      600: '#2952CC',
      700: '#1F3D99',
      800: '#152D73',
      900: '#0A1A40'
    },
    secondary: {
      50: '#F2EAFF',
      100: '#E0CCFF',
      200: '#C299FF',
      300: '#AA77FF',
      400: '#9966FF',
      500: '#8044FF',
      600: '#6633CC',
      700: '#4D2699',
      800: '#331A66',
      900: '#1A0D33'
    },
    accent: {
      50: '#FFEEE6',
      100: '#FFD5C2',
      200: '#FFBB99',
      300: '#FFA070',
      400: '#FF8547',
      500: '#FF6633',
      600: '#CC5229',
      700: '#993D1F',
      800: '#662914',
      900: '#331400'
    },
    success: {
      500: '#38C976'
    },
    warning: {
      500: '#FFCC00'
    },
    error: {
      500: '#FF3B30'
    },
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },
  space: {
    px: '1px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
    40: '160px',
    48: '192px'
  },
  radii: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  styles: {
    global: {
      body: {
        bg: 'neutral.50',
        color: 'neutral.900'
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 500,
        borderRadius: 'md'
      },
      variants: {
        solid: {
          bg: 'primary.500',
          color: 'white',
          _hover: {
            bg: 'primary.600'
          },
          _active: {
            bg: 'primary.700'
          }
        },
        outline: {
          borderColor: 'primary.500',
          color: 'primary.500',
          _hover: {
            bg: 'primary.50'
          }
        },
        ghost: {
          color: 'primary.500',
          _hover: {
            bg: 'primary.50'
          }
        },
        secondary: {
          bg: 'secondary.500',
          color: 'white',
          _hover: {
            bg: 'secondary.600'
          },
          _active: {
            bg: 'secondary.700'
          }
        },
        accent: {
          bg: 'accent.500',
          color: 'white',
          _hover: {
            bg: 'accent.600'
          },
          _active: {
            bg: 'accent.700'
          }
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'lg',
          boxShadow: 'md',
          overflow: 'hidden'
        }
      }
    }
  }
})