"use server";

import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import { Writable } from 'stream';
import path from 'path';
import fs from 'fs';

export async function convertImageToPDF(file: File): Promise<{ data: { file: File, path: string } | null; error: string | null }> {
  try {
    if (!file) {
      return { data: null, error: 'Aucune image fournie' };
    }

    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return { data: null, error: 'Le fichier doit être au format JPG, JPEG ou PNG' };
    }

    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Vérifier les métadonnées de l'image
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (sharpError) {
      console.error('Erreur lors de la lecture des métadonnées avec sharp :', sharpError);
      return { data: null, error: 'Erreur lors de la lecture de l\'image' };
    }
    const width = metadata.width || 595; // A4 par défaut
    const height = metadata.height || 842;

    // Créer un buffer pour collecter les données du PDF
    const chunks: Buffer[] = [];
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    // Créer le PDF
    const doc = new PDFDocument({ size: [width, height], font: `${process.cwd()}/public/fonts/open-sans.ttf` });
    const fontPath = path.resolve(process.cwd(), 'public/fonts/');
    
    // Gérer les erreurs du flux
    writableStream.on('error', (streamError) => {
      console.error('Erreur dans le flux d\'écriture :', streamError);
    });

    doc.pipe(writableStream);

    // Ajouter l'image au PDF
    try {
      doc.image(buffer, 0, 0, { width, height });
    } catch (imageError) {
      console.error('Erreur lors de l\'ajout de l\'image au PDF :', imageError);
      return { data: null, error: 'Erreur lors de l\'ajout de l\'image au PDF' };
    }

    doc.end();

    // Attendre que le PDF soit généré
    await new Promise((resolve, reject) => {
      writableStream.on('finish', resolve);
      writableStream.on('error', reject);
    });

    const pdfBuffer = Buffer.concat(chunks);
    const fileName = `converted_${Date.now()}.pdf`;
    const pdfFile = new File([pdfBuffer], fileName, { type: 'application/pdf' });


    console.log('PDF généré avec succès :', fileName)
    console.log('le fichier PDF est de taille :', pdfBuffer.length, 'octets');
    return { data: { file: pdfFile, path: fileName }, error: null };
  } catch (error) {
    console.error('Erreur lors de la conversion en PDF :', error);
    return { data: null, error: `Erreur lors de la conversion en PDF : ${(error as Error).message}` };
  }
}

