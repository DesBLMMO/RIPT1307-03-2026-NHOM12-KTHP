"use client";
import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react';
import { CheckCircle2, Circle, Zap } from 'lucide-react';

const QUEST_LABELS: Record<string, string> = {
  LEARN_5:   "Học 5 từ mới",
  LEARN_10:  "Học 10 từ hôm nay",
  PLAY_GAME: "Chơi 1 ván game",
  STREAK:    "Duy trì streak hôm nay",
};

export function DailyQuest() {
  const [quests, setQuests] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/user/quests')
      .then(r => r.json())
      .then(data => { if (data.success) setQuests(data.quests); });
  }, []);

  return (
    <Box bg="white" borderRadius="2xl" p={5} borderWidth="1px" borderColor="gray.200"
      boxShadow="0 3px 5px rgba(0,0,0,0.07), 0 5px 0 0 rgba(0,0,0,0.07)">
      <HStack mb={4} gap={2}>
        <Zap size={20} color="#f59e0b" fill="#f59e0b" />
        <Text fontWeight="black" color="gray.800">Nhiệm vụ hôm nay</Text>
      </HStack>
      <VStack align="stretch" gap={3}>
        {quests.map((quest) => (
          <Flex key={quest.id} align="center" gap={3} p={3}
            bg={quest.isCompleted ? "#f0fdf4" : "gray.50"}
            borderRadius="xl" borderWidth="1px"
            borderColor={quest.isCompleted ? "green.200" : "gray.100"}>
            {quest.isCompleted
              ? <CheckCircle2 size={20} color="#22c55e" fill="#22c55e" />
              : <Circle size={20} color="#cbd5e1" />}
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="bold"
                color={quest.isCompleted ? "green.700" : "gray.700"}>
                {QUEST_LABELS[quest.questType] || quest.questType}
              </Text>
              <Box w="full" h="4px" bg="gray.200" borderRadius="full" mt={1}>
                <Box h="full" bg={quest.isCompleted ? "#22c55e" : "#f59e0b"}
                  w={`${Math.min(100, (quest.current / quest.target) * 100)}%`}
                  borderRadius="full" transition="width 0.3s" />
              </Box>
            </Box>
            <HStack gap={1} flexShrink={0}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500">
                {quest.current}/{quest.target}
              </Text>
              <Text fontSize="xs" color="#f59e0b" fontWeight="bold">
                +{quest.rewardCoins}🪙
              </Text>
            </HStack>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}