"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Text,
  Button,
  Flex,
  Input,
  Portal,
  Select,
  Image,
} from "@chakra-ui/react"
import {
  FiCalendar,
  FiMail,
  FiEdit2,
  FiGlobe,
  FiX,
  FiChevronDown,
  FiDownload,
  FiLogOut,
  FiBell,
} from "react-icons/fi"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [voice, setVoice] = useState("Tự động chọn giọng tốt nhất")
  const [language, setLanguage] = useState("GB Tiếng Anh")
  const [reminderEnabled, setReminderEnabled] = useState(false)

  useEffect(() => {
    const body = document.body
    if (isOpen) {
      body.style.overflow = "hidden"
    } else {
      body.style.overflow = ""
    }
    return () => {
      body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <Portal>
      <Box
        position="fixed"
        inset="0"
        bg="blackAlpha.500"
        backdropFilter="blur(8px)"
        zIndex="1000"
        onClick={onClose}
      />

      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        bg="white"
        borderRadius="3xl"
        boxShadow="2xl"
        width="460px"
        maxWidth="92vw"
        maxHeight="92vh"
        overflowY="auto"
        sx={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        zIndex="1001"
      >
        <Button
          position="absolute"
          top="4"
          right="4"
          size="sm"
          variant="ghost"
          onClick={onClose}
          borderRadius="full"
          minW="auto"
          p="1"
        >
          <FiX size={20} />
        </Button>

        <Box px="6" pt="6" pb="5">
          <Flex direction="column" align="center" gap="4" pb="5" borderBottom="1px solid" borderColor="gray.100">
            <Box
              boxSize="96px"
              borderRadius="full"
              overflow="hidden"
              border="4px solid"
              borderColor="gray.100"
              bg="gray.50"
            >
              <Image
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=d1fae5"
                alt="Avatar"
                boxSize="96px"
                objectFit="cover"
              />
            </Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Dũng Trần
            </Text>
          </Flex>

          <Box pt="4" pb="6" display="grid" gap="5">
            <Box bg="gray.50" borderRadius="2xl" p="5" boxShadow="sm">
              <Flex justify="space-between" align="center" mb="3">
                <Flex align="center" gap="3">
                  <Box bg="green.100" color="green.600" borderRadius="xl" p="2">
                    <FiCalendar size={18} />
                  </Box>
                  <Text fontWeight="semibold" color="gray.800">
                    Ngày thi mục tiêu
                  </Text>
                </Flex>
                <Input
                  type="date"
                  w="150px"
                  size="sm"
                  borderRadius="2xl"
                  bg="white"
                />
              </Flex>
              <Text fontSize="sm" color="gray.500">
                Chọn ngày thi để hiển thị đồng hồ đếm ngược trên Header.
              </Text>
            </Box>

            <Box bg="white" borderRadius="2xl" p="5" border="1px solid" borderColor="gray.200" boxShadow="sm">
              <Flex align="center" gap="4" mb="4">
                <Box bg="blue.50" color="blue.500" borderRadius="lg" p="2">
                  <FiMail size={18} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Email
                  </Text>
                  <Text fontWeight="semibold" color="gray.800">
                    trandunghy020906@gmail.com
                  </Text>
                </Box>
              </Flex>
              <Flex align="center" gap="3">
                <Box bg="blue.50" color="blue.500" borderRadius="lg" p="2">
                  <FiCalendar size={18} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Ngày tham gia
                  </Text>
                  <Text fontWeight="semibold" color="gray.800">
                    20/01/2026
                  </Text>
                </Box>
              </Flex>
            </Box>

            <Box bg="white" borderRadius="2xl" p="5" border="1px solid" borderColor="gray.200" boxShadow="sm">
              <Flex justify="space-between" align="center" mb="4">
                <Flex align="center" gap="3">
                  <Box bg="green.50" color="green.500" borderRadius="lg" p="2">
                    <FiGlobe size={18} />
                  </Box>
                  <Text fontWeight="semibold" color="gray.800">
                    Giọng phát âm
                  </Text>
                </Flex>
                <Button size="sm" variant="outline" borderRadius="full">
                  Nghe thử
                </Button>
              </Flex>
              <Select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                borderRadius="2xl"
                size="sm"
                bg="gray.50"
              >
                <option value="Tự động chọn giọng tốt nhất">Tự động chọn giọng tốt nhất</option>
                <option value="Giọng Anh (UK)">Giọng Anh (UK)</option>
                <option value="Giọng Mỹ (US)">Giọng Mỹ (US)</option>
              </Select>
              <Text fontSize="sm" color="gray.500" mt="3">
                Edge chỉ hiển thị các giọng mà trình duyệt hoặc thiết bị của bạn đang có.
              </Text>
              <Text fontSize="sm" color="gray.500">
                Nếu giọng đã chọn không còn khả dụng, hệ thống sẽ tự quay về chế độ tự động.
              </Text>
            </Box>

            <Box bg="white" borderRadius="2xl" p="5" border="1px solid" borderColor="gray.200" boxShadow="sm">
              <Flex justify="space-between" align="center" mb="3" gap="4">
                <Flex align="center" gap="3">
                  <Box bg="yellow.100" color="yellow.700" borderRadius="xl" p="2">
                    <FiBell size={18} />
                  </Box>
                  <Text fontWeight="semibold" color="gray.800">
                    Nhắc nhở học từ
                  </Text>
                </Flex>
                <Box
                  as="button"
                  width="50px"
                  height="26px"
                  borderRadius="full"
                  bg={reminderEnabled ? "green.500" : "gray.200"}
                  position="relative"
                  transition="all 0.2s"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                >
                  <Box
                    position="absolute"
                    top="3px"
                    left={reminderEnabled ? "27px" : "3px"}
                    width="20px"
                    height="20px"
                    borderRadius="full"
                    bg="white"
                    boxShadow="sm"
                    transition="all 0.2s"
                  />
                </Box>
              </Flex>
              <Text fontSize="sm" color="gray.500" mb="2">
                Khi bật, hệ thống sẽ nhắc lúc 8h sáng với từ đến hạn và 15h chiều với từ đến hạn kèm 5 từ chưa thuộc.
              </Text>
              <Text fontSize="sm" color="gray.500">
                Danh sách 15h ưu tiên các từ chưa thuộc trong những bộ từ do bạn sở hữu.
              </Text>
            </Box>

            <Button
              variant="outline"
              width="100%"
              borderRadius="2xl"
              py="5"
              borderColor="gray.200"
              color="gray.700"
              fontWeight="medium"
              _hover={{ bg: "gray.50" }}
            >
              <Flex align="center" gap="2" justify="center">
                <FiDownload size={18} />
                <Text>Cập nhật Avatar từ Google</Text>
              </Flex>
            </Button>

            <Button
              variant="outline"
              width="100%"
              borderRadius="2xl"
              py="5"
              borderColor="gray.200"
              color="gray.700"
              fontWeight="medium"
              _hover={{ bg: "gray.50" }}
            >
              <Flex align="center" gap="2" justify="center">
                <FiDownload size={18} />
                <Text>Cài đặt ứng dụng</Text>
              </Flex>
            </Button>

            <Button
              variant="ghost"
              width="100%"
              borderRadius="2xl"
              py="5"
              color="blue.500"
              fontWeight="semibold"
              _hover={{ bg: "blue.50" }}
              leftIcon={<FiLogOut />}
            >
              Đăng xuất
            </Button>
          </Box>
        </Box>
      </Box>
    </Portal>
  )
}
