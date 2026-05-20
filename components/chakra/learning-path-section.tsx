"use client"

import { Box, Flex, Text, Card, SimpleGrid } from "@chakra-ui/react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { useState } from "react"

interface CourseCardProps {
  title: string
  vocabCount: number
  difficulty: number
  maxDifficulty: number
  difficultyColor: string
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  vocabCount,
  difficulty,
  maxDifficulty,
  difficultyColor,
}) => {
  return (
    <Card.Root
      borderRadius="xl"
      bg="gray.800"
      borderColor="gray.700"
      borderWidth="1px"
      minW="200px"
      flexShrink={0}
    >
      <Card.Body p="4">
        <Text fontSize="sm" fontWeight="semibold" color="white" mb="3">
          {title}
        </Text>
        <Flex align="center" gap="2" mb="3">
          <Box w="4" h="4" bg="blue.400" borderRadius="md" />
          <Text fontSize="sm" color="gray.300">
            {vocabCount} bộ từ
          </Text>
        </Flex>
        <Box mb="3">
          <Text fontSize="xs" color="gray.400" mb="2">
            ĐỘ KHÓ
          </Text>
          <Flex align="center" gap="2">
            <Box
              flex={1}
              h="1.5"
              bg="gray.700"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                h="full"
                bg={difficultyColor}
                w={`${(difficulty / maxDifficulty) * 100}%`}
                transition="width 0.3s"
              />
            </Box>
            <Text fontSize="xs" fontWeight="bold" color={difficultyColor} minW="fit-content">
              {difficulty}/{maxDifficulty}
            </Text>
          </Flex>
        </Box>
      </Card.Body>
    </Card.Root>
  )
}

interface LearningPathSectionProps {
  title: string
  subtitle?: string
  courses: CourseCardProps[]
}

export function LearningPathSection({ title, subtitle, courses }: LearningPathSectionProps) {
  const [scrollPos, setScrollPos] = useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const amount = 250
      const newPos = direction === "left" ? scrollPos - amount : scrollPos + amount
      containerRef.current.scrollLeft = newPos
      setScrollPos(newPos)
    }
  }

  return (
    <Box mb="8">
      <Flex justify="space-between" align="center" mb="4">
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="white">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="sm" color="gray.400">
              {subtitle}
            </Text>
          )}
        </Box>
        <Flex gap="2">
          <Box
            as="button"
            onClick={() => scroll("left")}
            p="2"
            borderRadius="md"
            bg="gray.700"
            _hover={{ bg: "gray.600" }}
            cursor="pointer"
            transition="all 0.2s"
          >
            <FiChevronLeft size={20} color="white" />
          </Box>
          <Box
            as="button"
            onClick={() => scroll("right")}
            p="2"
            borderRadius="md"
            bg="gray.700"
            _hover={{ bg: "gray.600" }}
            cursor="pointer"
            transition="all 0.2s"
          >
            <FiChevronRight size={20} color="white" />
          </Box>
        </Flex>
      </Flex>

      <Box
        ref={containerRef}
        overflow="auto"
        css={{
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#4B5563",
            borderRadius: "3px",
          },
        }}
      >
        <Flex gap="4">
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              title={course.title}
              vocabCount={course.vocabCount}
              difficulty={course.difficulty}
              maxDifficulty={course.maxDifficulty}
              difficultyColor={course.difficultyColor}
            />
          ))}
        </Flex>
      </Box>

      <Box h="1.5" bg="green.400" borderRadius="full" mt="4" w="50%" />
    </Box>
  )
}
