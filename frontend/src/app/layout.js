// src/app/layout.js
import { Providers } from './providers';
import ClientLayout from '../components/ClientLayout';

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
      <body>
        <Providers> {}
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
