import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// Ruta del archivo de datos persistentes
const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

// Función para cargar productos desde el archivo JSON
async function loadProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    await saveProducts([]);
    return [];
  }
}

// Función para guardar productos en el archivo JSON
async function saveProducts(products) {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
}

export async function GET() {
  const products = await loadProducts();
  return NextResponse.json(products);
}

export async function POST(request) {
  const formData = await request.formData();
  const name = formData.get('name');
  const description = formData.get('description');
  const price = formData.get('price');
  const images = formData.getAll('images');
  const mainImageIndex = parseInt(formData.get('mainImageIndex'), 10) || 0;

  if (!name || !description || !price || images.length === 0) {
    return NextResponse.json({ error: 'Todos los campos son requeridos e incluye al menos una imagen' }, { status: 400 });
  }

  if (mainImageIndex < 0 || mainImageIndex >= images.length) {
    return NextResponse.json({ error: 'Índice de imagen principal inválido' }, { status: 400 });
  }

  const imagePaths = [];
  for (const image of images) {
    try {
      const imageName = `${uuidv4()}.${image.name.split('.').pop() || 'jpg'}`;
      const imagePath = path.join(process.cwd(), 'public', 'images', imageName);
      const buffer = Buffer.from(await image.arrayBuffer());
      await fs.writeFile(imagePath, buffer);
      imagePaths.push(`/images/${imageName}`);
    } catch (error) {
      console.error(`Error al guardar la imagen ${image.name}:`, error);
      return NextResponse.json({ error: `Fallo al guardar una imagen: ${error.message}` }, { status: 500 });
    }
  }

  if (imagePaths.length === 0) {
    return NextResponse.json({ error: 'No se pudieron guardar las imágenes' }, { status: 500 });
  }

  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price: parseFloat(price),
    images: imagePaths,
    mainImageIndex,
    summary: '',
    printSettings: '',
    videoLink: '',
    pdf: null,
    files: [],
    comments: [],
  };

  const products = await loadProducts();
  products.push(newProduct);
  await saveProducts(products);

  return NextResponse.json(newProduct, { status: 201 });
}

export async function PUT(request) {
  const formData = await request.formData();
  const id = formData.get('id');
  const summary = formData.get('summary');
  const printSettings = formData.get('printSettings');
  const videoLink = formData.get('videoLink');
  const pdf = formData.get('pdf');
  const file = formData.get('file');
  const comment = formData.get('comment');
  const replyTo = formData.get('replyTo');

  const products = await loadProducts();
  const productIndex = products.findIndex((p) => p.id === id);
  if (productIndex === -1) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  let pdfPath = products[productIndex].pdf;
  if (pdf) {
    try {
      const pdfName = `${uuidv4()}.pdf`;
      const pdfFullPath = path.join(process.cwd(), 'public', 'pdfs', pdfName);
      const buffer = Buffer.from(await pdf.arrayBuffer());
      await fs.mkdir(path.join(process.cwd(), 'public', 'pdfs'), { recursive: true });
      await fs.writeFile(pdfFullPath, buffer);
      pdfPath = `/pdfs/${pdfName}`;
    } catch (error) {
      console.error(`Error al guardar el PDF:`, error);
      return NextResponse.json({ error: `Fallo al guardar el PDF: ${error.message}` }, { status: 500 });
    }
  }

  let newFile = null;
  if (file) {
    try {
      const fileName = `${uuidv4()}.${file.name.split('.').pop() || 'stl'}`;
      const fileFullPath = path.join(process.cwd(), 'public', 'files', fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.mkdir(path.join(process.cwd(), 'public', 'files'), { recursive: true });
      await fs.writeFile(fileFullPath, buffer);
      newFile = {
        name: file.name,
        size: buffer.length / 1024, // Tamaño en KB
        date: new Date().toISOString(),
        url: `/files/${fileName}`,
      };
      products[productIndex].files.push(newFile);
    } catch (error) {
      console.error(`Error al guardar el archivo:`, error);
      return NextResponse.json({ error: `Fallo al guardar el archivo: ${error.message}` }, { status: 500 });
    }
  }

  if (comment) {
    const newComment = {
      user: 'User', // Reemplazar con usuario real si hay autenticación
      date: new Date().toISOString(),
      content: comment,
      replies: [],
    };
    if (replyTo) {
      const commentIndex = parseInt(replyTo, 10);
      if (products[productIndex].comments[commentIndex]) {
        products[productIndex].comments[commentIndex].replies.push(newComment);
      }
    } else {
      products[productIndex].comments.push(newComment);
    }
  }

  products[productIndex] = {
    ...products[productIndex],
    summary: summary || products[productIndex].summary,
    printSettings: printSettings || products[productIndex].printSettings,
    videoLink: videoLink || products[productIndex].videoLink,
    pdf: pdfPath,
  };

  await saveProducts(products);
  return NextResponse.json(products[productIndex], { status: 200 });
}