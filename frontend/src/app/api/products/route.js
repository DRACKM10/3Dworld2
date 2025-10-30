import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// Ruta del archivo de datos persistentes
const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

async function loadProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const products = JSON.parse(data);
    console.log('Productos cargados desde archivo:', products); // Depuración
    return products;
  } catch (error) {
    console.error('Error al cargar productos:', error);
    await saveProducts([]);
    return [];
  }
}

async function saveProducts(products) {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
  console.log('Productos guardados en archivo:', products); // Depuración
}

export async function GET() {
  const products = await loadProducts();
  console.log('Productos enviados en GET:', products); // Depuración
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
        size: buffer.length / 1024,
        date: