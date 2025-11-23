"use client";

import {
  Box,
  Flex,
  Text,
  IconButton,
  Link as ChakraLink,
  Divider,
} from "@chakra-ui/react";
import Link from "next/link";

// React Icons válidos
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaGithub,
} from "react-icons/fa";

export default function Footer() {
  return (
    <Box bg="#111111" color="white" py={10} px={8} mt={20}>
      <Divider borderColor="#5c212b" mb={8} />

      <Flex
        justify="space-between"
        align="flex-start"
        direction={{ base: "column", md: "row" }}
        gap={10}
      >
        <Flex direction="column" maxW="300px">
          <Text fontSize="2xl" fontWeight="bold">
            3DWORLD
          </Text>
          <Text fontSize="sm" mt={2} color="gray.400">
            Plataforma creada para ofrecer contenido útil, herramientas y
            recursos.
          </Text>
        </Flex>

        <Flex gap={20}>
          <Flex direction="column" gap={3}>
            <Text fontWeight="bold" mb={1}>
              Recursos
            </Text>

            <Link href="/sobre-mi" passHref>
              <ChakraLink fontSize="sm" color="gray.300" _hover={{ color: "white" }}>
                Sobre mí
              </ChakraLink>
            </Link>

            <Link href="/contacto" passHref>
              <ChakraLink fontSize="sm" color="gray.300" _hover={{ color: "white" }}>
                Contacto
              </ChakraLink>
            </Link>

            <Link href="/privacidad" passHref>
              <ChakraLink fontSize="sm" color="gray.300" _hover={{ color: "white" }}>
                Privacidad
              </ChakraLink>
            </Link>
          </Flex>

          <Flex direction="column" gap={3}>
            <Text fontWeight="bold" mb={1}>
              Soporte
            </Text>

            <Link href="/faq" passHref>
              <ChakraLink fontSize="sm" color="gray.300" _hover={{ color: "white" }}>
                Preguntas Frecuentes
              </ChakraLink>
            </Link>

            <Link href="/ayuda" passHref>
              <ChakraLink fontSize="sm" color="gray.300" _hover={{ color: "white" }}>
                Centro de Ayuda
              </ChakraLink>
            </Link>

            <Link href="/terminos" passHref>
              <ChakraLink fontSize="sm" color="gray.300" _hover={{ color: "white" }}>
                Términos y Condiciones
              </ChakraLink>
            </Link>
          </Flex>
        </Flex>

        <Flex direction="column" gap={3}>
          <Text fontWeight="bold" mb={1}>
            Síguenos
          </Text>

          <Flex gap={3}>
            <IconButton
              as="a"
              href="#"
              icon={<FaFacebookF />}
              aria-label="Facebook"
              variant="ghost"
              color="white"
              _hover={{ bg: "gray.700" }}
            />

            <IconButton
              as="a"
              href="#"
              icon={<FaTwitter />}
              aria-label="Twitter"
              variant="ghost"
              color="white"
              _hover={{ bg: "gray.700" }}
            />

            <IconButton
              as="a"
              href="#"
              icon={<FaYoutube />}
              aria-label="YouTube"
              variant="ghost"
              color="white"
              _hover={{ bg: "gray.700" }}
            />

            <IconButton
              as="a"
              href="#"
              icon={<FaInstagram />}
              aria-label="Instagram"
              variant="ghost"
              color="white"
              _hover={{ bg: "gray.700" }}
            />

            <IconButton
              as="a"
              href="#"
              icon={<FaGithub />}
              aria-label="Github"
              variant="ghost"
              color="white"
              _hover={{ bg: "gray.700" }}
            />
          </Flex>
        </Flex>
      </Flex>

      <Divider borderColor="#5c212b" mt={10} mb={5} />

      <Text fontSize="sm" textAlign="center" color="gray.500">
        © {new Date().getFullYear()} 3DWORLD — Todos los derechos reservados.
      </Text>
    </Box>
  );
}
