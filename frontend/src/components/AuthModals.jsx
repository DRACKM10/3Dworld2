"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function AuthModals() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  console.log("AuthModals render - isLoginOpen:", isLoginOpen, "isRegisterOpen:", isRegisterOpen);

  const openLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const openRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        goToRegister={openRegister}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        goToLogin={openLogin}
      />
    </>
  );
}
