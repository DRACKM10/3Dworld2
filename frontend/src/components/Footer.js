import { Box, Text } from "@chakra-ui/react";

export default function Footer() {
  return (
    <div container="footer">
      <Box
        as="footer"
        textAlign="center"
        color="white"
        bgGradient="linear(to-r, #0b2b33, #0f0f0f)"
        py={5}
      >
        <Text>© 3Dworld - Todos los derechos reservados</Text>
        <Text>Contacto: 3Dworld@gmail.com | Tel: +57 (312) 274-7116</Text>
        <Text>Dirección: Carrera 7 #1-13, Ginebra, Colombia</Text>

        <Text>
          Síguenos:{" "}
          <a
            href="https://twitter.com/miempresa"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "white",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.color = "#9B4DFF")}
            onMouseOut={(e) => (e.target.style.color = "white")}
          >
            Twitter
          </a>{" "}
          |{" "}
          <a
            href="https://facebook.com/miempresa"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "white",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.color = "#9B4DFF")}
            onMouseOut={(e) => (e.target.style.color = "white")}
          >
            Facebook
          </a>
        </Text>
      </Box>
    </div>
  );
}
