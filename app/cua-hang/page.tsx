"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Flex, Text, HStack, SimpleGrid, Button, Image, VStack, Badge, Spinner
} from '@chakra-ui/react';
import { Eye, User, CheckCircle2 } from 'lucide-react';
import { storeTabs, storeItems } from '@/lib/data';

export default function CuaHangPage() {
  const [activeTab, setActiveTab] = useState(storeTabs[0]?.id || 'avatar');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [coins, setCoins] = useState(0); 
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingItem, setUploadingItem] = useState<any>(null);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const res = await fetch('/api/user/store', { cache: 'no-store' }); 
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCoins(data.coins);
            setPurchasedItems(data.purchasedItems);
            setEquippedItems(data.equippedItems || {});
          }
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoreData();
  }, []);

  const filteredItems = storeItems.filter((item: any) => {
    return item.category ? item.category === activeTab : true;
  });

  const handleAction = async (item: any) => {
    if (isProcessing) return;
    const itemIdStr = String(item.id);
    const isPurchased = purchasedItems.includes(itemIdStr);
    const isEquipped = equippedItems[activeTab] === itemIdStr;

    if (isEquipped) return;
    setIsProcessing(true);

    try {
      if (isPurchased) {
        const res = await fetch('/api/user/store', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: activeTab, itemId: itemIdStr })
        });
        
        if (item.image) {
          await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coverImage: item.image })
          });
        }
        
        if (res.ok) {
          setEquippedItems({ ...equippedItems, [activeTab]: itemIdStr });
          window.dispatchEvent(new Event('updateProfile')); 
          alert(`Đã trang bị thành công: ${item.title}`);
        }
        setIsProcessing(false);
        return;
      }

      if (item.type === 'upload') {
        if (coins >= item.price) {
          setUploadingItem(item);
          fileInputRef.current?.click();
        } else {
          alert("Bạn không đủ xu để tải ảnh/GIF lên!");
        }
        setIsProcessing(false);
        return;
      }

      if (coins >= item.price) {
        if (window.confirm(`Xác nhận dùng ${item.price} xu mua "${item.title}"?`)) {
          const res = await fetch('/api/user/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: itemIdStr, cost: item.price, isUploadAction: false })
          });
          
          if (res.ok) {
            setCoins(coins - item.price);
            setPurchasedItems([...purchasedItems, itemIdStr]);
            window.dispatchEvent(new Event('updateProfile')); 
            alert("Mua thành công! Nhấn 'Sử dụng' để trang bị.");
          } else {
            alert("Mua thất bại, vui lòng thử lại.");
          }
        }
      } else {
        alert("Bạn không đủ xu! Cố gắng học thêm nhé.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔥 NÂNG CẤP XỬ LÝ ẢNH & GIF (Nâng giới hạn lên 3.5MB)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingItem) {
      // 3.5MB = 3.5 * 1024 * 1024 bytes (Dành cho các GIF chuyển động ngắn)
      if (file.size > 3.5 * 1024 * 1024) {
        alert("Dung lượng ảnh/GIF quá lớn! Hệ thống chỉ hỗ trợ dưới 3.5MB. (Nếu GIF của bạn nặng hơn, hãy dùng các trang nén GIF online nhé).");
        setUploadingItem(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          const res = await fetch('/api/user/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              itemId: uploadingItem.id, 
              cost: uploadingItem.price, 
              isUploadAction: true,
              customImage: base64String 
            })
          });
          
          if (res.ok) {
            setCoins(coins - uploadingItem.price);
            window.dispatchEvent(new Event('updateProfile'));
            alert("Tải lên thành công! Ảnh/GIF của bạn đã được tự động áp dụng và lưu vào mục Đã mua.");
          } else {
            alert("Giao dịch thất bại do file quá tải máy chủ.");
          }
        } catch (error) {
          alert("Có lỗi xảy ra khi upload.");
        } finally {
          setUploadingItem(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <Flex w="full" h="100vh" align="center" justify="center"><Spinner size="xl" color="orange.400" /></Flex>;
  }

  return (
    <Box p={8} maxW="1400px" mx="auto" minH="full" bg="#f8f9fa">
      {/* CẬP NHẬT ACCEPT ĐỂ ƯU TIÊN HIỂN THỊ CẢ ẢNH TĨNH LẪN GIF */}
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/jpeg, image/png, image/gif, image/webp" onChange={handleFileChange} />

      <Flex justify="space-between" align="center" mb={6}>
        <HStack gap={6} align="center">
          <Text fontSize="3xl" fontWeight="black" color="gray.900">Cửa hàng</Text>
          <Button variant="ghost" color="gray.500" fontSize="sm" fontWeight="bold" gap={2} _hover={{ bg: 'white', shadow: 'sm' }} borderRadius="full" px={5}>
            <Eye size={18} /> Xem toàn cảnh
          </Button>
        </HStack>

        <Flex bg="#f59e0b" borderRadius="2xl" px={6} py={2} color="white" direction="column" align="center" shadow="md" borderBottomWidth="4px" borderColor="#d97706">
          <HStack gap={2}>
            <Flex w={5} h={5} bg="#d97706" borderRadius="full" align="center" justify="center" fontSize="xs" fontWeight="black" color="white" shadow="sm">$</Flex>
            <Text fontSize="xl" fontWeight="black">{coins.toLocaleString()}</Text>
          </HStack>
          <Text fontSize="10px" fontWeight="bold" opacity={0.9} textTransform="uppercase" letterSpacing="widest">Coins của bạn</Text>
        </Flex>
      </Flex>

      <HStack borderBottomWidth="2px" borderColor="gray.200" pb={0} mb={8} gap={10} overflowX="auto" css={{ "&::-webkit-scrollbar": { display: "none" } }}>
        {storeTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Flex key={tab.id} as="button" onClick={() => setActiveTab(tab.id)} pb={3} mb="-2px" borderBottomWidth="3px" borderColor={isActive ? 'gray.800' : 'transparent'} color={isActive ? 'gray.800' : 'gray.400'} fontWeight="bold" fontSize="sm" align="center" gap={2} transition="all 0.2s" _hover={!isActive ? { color: 'gray.600' } : {}} whiteSpace="nowrap">
              <tab.icon size={18} />
              <Text>{tab.label}</Text>
            </Flex>
          )
        })}
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
        {filteredItems.map((item: any) => {
          const itemIdStr = String(item.id);
          const isPurchased = purchasedItems.includes(itemIdStr);
          const isEquipped = equippedItems[activeTab] === itemIdStr;

          let buttonBg = "#c0eb8c"; 
          let buttonHoverBg = "#b2e07a";
          let buttonText = item.type === 'upload' ? 'Mua & upload' : 'Mua';
          let textColor = "white";

          if (isEquipped) {
            buttonBg = "gray.200";
            buttonHoverBg = "gray.200";
            buttonText = "Đang dùng";
            textColor = "gray.500";
          } else if (isPurchased) {
            buttonBg = "#38bdf8"; 
            buttonHoverBg = "#0ea5e9";
            buttonText = "Sử dụng";
          }

          return (
            <Flex 
              key={item.id} direction="column" bg="white" borderWidth="3px" 
              borderColor={isEquipped ? "blue.400" : "gray.200"} 
              borderStyle={item.type === 'upload' ? 'dashed' : 'solid'} 
              borderRadius="3xl" p={4}
              boxShadow={isEquipped ? "0px 4px 0px #60a5fa" : "0px 4px 0px #cbd5e1"} 
              transition="all 0.2s ease-in-out" 
              cursor={isProcessing ? "not-allowed" : "pointer"}
              opacity={isProcessing ? 0.7 : 1}
              _hover={isProcessing ? {} : { transform: 'translateY(-4px)', boxShadow: isEquipped ? '0px 8px 0px #60a5fa' : '0px 8px 0px #cbd5e1', borderColor: isEquipped ? 'blue.400' : 'gray.300' }}
              onClick={() => handleAction(item)}
            >
              {item.type === 'upload' ? (
                <Flex bg="#f0fdf4" h="140px" borderRadius="2xl" align="center" justify="center" direction="column" color="gray.400" mb={4}>
                  <User size={40} strokeWidth={1.5} />
                  <Text mt={2} fontWeight="bold" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Upload ảnh / GIF</Text>
                </Flex>
              ) : (
                <Box h="140px" borderRadius="2xl" overflow="hidden" mb={4} borderWidth="1px" borderColor="gray.100" position="relative">
                  <Image src={item.image} w="full" h="full" objectFit="cover" alt={item.title} />
                  {isEquipped && (
                    <Flex position="absolute" top={2} right={2} bg="white" color="blue.500" borderRadius="full" p={1} shadow="md">
                      <CheckCircle2 size={20} />
                    </Flex>
                  )}
                </Box> 
              )}

              <VStack flex={1} gap={1} textAlign="center" mb={5}>
                <Text fontWeight="extrabold" fontSize="md" color="gray.800" css={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</Text>
                {item.desc && <Text fontSize="11px" color="gray.500" fontWeight="medium" css={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.desc}</Text>}
              </VStack>

              <Flex justify="space-between" align="center" mt="auto">
                <HStack color="#f59e0b" gap={2}>
                  {isPurchased ? (
                    <Badge colorScheme="green" variant="subtle" borderRadius="md" px={2} py={1} fontSize="10px">ĐÃ SỞ HỮU</Badge>
                  ) : (
                    <>
                      <Flex w={5} h={5} bg="#f59e0b" borderRadius="full" align="center" justify="center" color="white" fontWeight="black" fontSize="10px" shadow="sm">$</Flex>
                      <Text fontWeight="black" fontSize="md" letterSpacing="tighter">{item.price.toLocaleString()}</Text>
                    </>
                  )}
                </HStack>
                
                <Button 
                  bg={buttonBg} color={textColor} borderRadius="full" px={5} py={1.5} h="auto" 
                  fontWeight="black" fontSize="10px" textTransform="uppercase" letterSpacing="widest"
                  shadow={isEquipped ? "none" : "sm"}
                  _hover={isEquipped || isProcessing ? {} : { bg: buttonHoverBg, shadow: 'md' }}
                  _active={isEquipped || isProcessing ? {} : { transform: 'scale(0.95)' }}
                >
                  {buttonText}
                </Button>
              </Flex>
            </Flex>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}