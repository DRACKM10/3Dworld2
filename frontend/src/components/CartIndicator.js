// components/CartIndicator.js
"use client";

import { useCart } from '../context/CartContext';
import { Badge, IconButton, Box, Tooltip } from '@chakra-ui/react';
import Link from 'next/link';

export default function CartIndicator() {
  const { getCartItemsCount } = useCart();
  const itemCount = getCartItemsCount();

  return (
    <Box position="relative">
      <Tooltip 
        label="Ver carrito" 
        hasArrow 
        color="#EDEDED"
        variant="surface"
        _hover={{
          bg:"#18181873",
          transform: "scale(1.05)",
        }}
        transition="all 0.2s ease-in-out"
      >
        <IconButton
          as={Link}
          href="/carrito"
          aria-label="Carrito de compras"
          icon={<>🛒</>}
          variant="surface"
          color="#EDEDED"
          bg="blackAlpha.700"
          borderColor="#000000ff"
          fontSize="18px"
          size="md"
          _hover={{
            bg:"#18181873",
            transform: "scale(1.05)",
          }}
          transition="all 0.2s ease-in-out"
        />
      </Tooltip>
      
      {itemCount > 0 && (
        <Badge
          position="absolute"
          top="-8px"
          right="-8px"
          borderRadius="full"
          bg="red.500"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          minW="20px"
          height="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 0 8px rgba(255, 0, 0, 0.6)"
          border="1px solid white"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Box>
  );
}