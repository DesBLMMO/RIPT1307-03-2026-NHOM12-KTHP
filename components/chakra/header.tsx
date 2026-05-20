"use client"

import { Box, Flex, Text, Button, Badge } from "@chakra-ui/react"
import { FiBell, FiStar } from "react-icons/fi"
import Link from "next/link"

export function Header() {
  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px="6"
      py="3"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex justify="space-between" align="center">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Text fontSize="xl" fontWeight="bold" color="orange.500">
            luyentu.com
          </Text>
        </Link>

        {/* Actions */}
        <Flex align="center" gap="3">
          {/* Notification */}
          <Box position="relative">
            <Button
              variant="ghost"
              borderRadius="full"
              p="2"
              minW="auto"
              h="auto"
            >
              <FiBell size={20} color="#4B5563" />
            </Button>
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              bg="red.500"
              color="white"
              borderRadius="full"
              fontSize="xs"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              1
            </Badge>
          </Box>

          {/* Streak */}
          <Box position="relative">
            <Button
              variant="ghost"
              borderRadius="full"
              p="2"
              minW="auto"
              h="auto"
            >
              <Text fontSize="lg">🔥</Text>
            </Button>
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              bg="orange.500"
              color="white"
              borderRadius="full"
              fontSize="xs"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              1
            </Badge>
          </Box>

          {/* Upgrade Button */}
          <Button
            bg="orange.500"
            color="white"
            _hover={{ bg: "orange.600" }}
            borderRadius="full"
            size="md"
            fontWeight="bold"
            display="flex"
            alignItems="center"
            gap="2"
          >
            <FiStar size={16} />
            NÂNG CẤP PRO
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
