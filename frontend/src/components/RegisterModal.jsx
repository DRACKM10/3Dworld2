"use client";

import { Modal, ModalOverlay, ModalContent, ModalBody } from "@chakra-ui/react";
import RegisterForm from "./RegisterForm";

export default function RegisterModal({ isOpen, onClose, goToLogin }) {
  console.log("RegisterModal props:", { isOpen, onClose, goToLogin });
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(5px)" />
      <ModalContent bg="transparent" shadow="none">
        <ModalBody>
          <RegisterForm onClose={onClose} goToLogin={goToLogin} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
