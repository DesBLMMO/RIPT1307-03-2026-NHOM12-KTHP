'use client'

import React from 'react'

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
} from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: {
          value: `'Be Vietnam Pro', sans-serif`,
        },
        body: {
          value: `'Be Vietnam Pro', sans-serif`,
        },
      },
    },
  },
})

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </SessionProvider>
  )
}