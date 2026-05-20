'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
} from '@chakra-ui/react'

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: {
          value: 'var(--font-be-vietnam-pro), sans-serif',
        },
        body: {
          value: 'var(--font-be-vietnam-pro), sans-serif',
        },
      },
    },
  },
})

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </NextThemesProvider>
  )
}