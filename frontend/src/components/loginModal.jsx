"use client";

import { Modal, ModalOverlay, ModalContent, ModalBody } from "@chakra-ui/react";
import LoginForm from "./LoginForm";

export default function LoginModal({ isOpen, onClose, goToRegister }) {
  console.log("LoginModal props:", { isOpen, onClose, goToRegister });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(5px)" />
      <ModalContent bg="transparent" shadow="none">
        <ModalBody>
          <LoginForm onClose={onClose} goToRegister={goToRegister} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
