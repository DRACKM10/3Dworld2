import { Box, Text, Flex } from '@chakra-ui/react';

export default function Footer() {
  return (
  <div container="footer" >
    <footer   style={{ textAlign: 'center' }} >
      <p>© 3Dworld - Todos los derechos reservados</p>
      <p>Contacto: 3Dworld@gmail.com | Tel: +57 (312) 274-7116</p>
      <p>Dirección:  Carrera 7 #1-13, Ginebra, colombia</p>
      <p>
        Síguenos: 
        <a href="https://twitter.com/miempresa" target="_blank" rel="noopener noreferrer">Twitter</a> | 
        <a href="https://facebook.com/miempresa" target="_blank" rel="noopener noreferrer">Facebook</a>
      </p>
    </footer>
  </div>
  );
}