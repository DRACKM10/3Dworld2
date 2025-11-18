// src/app/layout.js
import { Providers } from './providers';
import ClientLayout from '../components/ClientLayout';
import { GoogleOAuthProvider } from "@react-oauth/google";
import Footer from '../components/Footer';
import AuthModals from '@/components/AuthModal';

 
export const metadata = {
  title: 'Mi Tienda 3D',
  description: 'Tienda en línea con visualización de productos en 3D',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bree+Serif&family=Lexend+Deca:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body > 
        <GoogleOAuthProvider
          clientId="249291398337-5a8qjno84eobru6m1hg7u553cjn0bjkr.apps.googleusercontent.com"
        >
          <Providers>
        <AuthModals />
            
            <ClientLayout>{children}<Footer/></ClientLayout>
          </Providers>  
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}