// index.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Necessario per usare __dirname in moduli ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// 1) Diciamo ad Express di interpretare il body come testo se "Content-Type" è "application/xml"
app.use(express.text({ type: 'application/xml' }));

// 2) Servire la cartella "public" come contenuto statico
//    Tutto ciò che sta in "public" è accessibile via URL:
//    https://mio-servizio.onrender.com/nomedelFile
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint di test
app.get('/', (req, res) => {
  res.send('Benvenuto! Per caricare XML: POST /upload-xml. Per vedere l’XML: GET /parametri.xml');
});

// Endpoint per ricevere e salvare il file XML
app.post('/upload-xml', (req, res) => {
  try {
    const xmlContent = req.body; // L'XML inviato dal form
    console.log('Ricevuto XML:', xmlContent);

    // Salviamo (o sovrascriviamo) il file parametri.xml dentro la cartella "public"
    const filePath = path.join(__dirname, 'public', 'parametri.xml');
    fs.writeFileSync(filePath, xmlContent, 'utf8');

    // Risposta al client
    res.status(200).send('XML caricato con successo! Accessibile su /parametri.xml');
  } catch (error) {
    console.error('Errore nel salvataggio:', error);
    res.status(500).send('Errore nel salvataggio del file XML.');
  }
});

// *** NUOVO: Endpoint per PDF Proxy ***
app.get('/pdf-proxy', async (req, res) => {
  const pdfUrl = req.query.url; // es: /pdf-proxy?url=https://www.example.com/file.pdf
  if (!pdfUrl) {
    return res.status(400).send('Manca parametro url');
  }

  try {
    // Node 18+ supporta fetch nativamente
    const fetchRes = await fetch(pdfUrl);
    if (!fetchRes.ok) {
      return res.status(500).send('Errore fetch PDF: ' + fetchRes.statusText);
    }

    // Leggi come ArrayBuffer
    const pdfArrayBuffer = await fetchRes.arrayBuffer();

    // Imposta header "Content-Type: application/pdf"
    res.setHeader('Content-Type', 'application/pdf');

    // Se vuoi forzare il download:
    // res.setHeader('Content-Disposition', 'attachment; filename="myfile.pdf"');
    // Altrimenti inline:
    // res.setHeader('Content-Disposition', 'inline; filename="myfile.pdf"');

    // Invia come buffer
    res.send(Buffer.from(pdfArrayBuffer));
  } catch (err) {
    console.error(err);
    res.status(500).send('Errore interno proxy');
  }
});


// Render e gli hosting PaaS usano process.env.PORT per la porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server avviato su porta ${PORT}`);
});
