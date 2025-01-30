// index.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Per poter usare __dirname in moduli ES, abbiamo bisogno di questa piccola procedura:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Diciamo ad Express di interpretare il body come testo se Content-Type = "application/xml"
app.use(express.text({ type: 'application/xml' }));

// Endpoint di test: GET /
// Per controllare che il server risponde
app.get('/', (req, res) => {
  res.send('Ciao, il mio server è su Render! Endpoint /upload-xml disponibile per POST.');
});

// Endpoint dedicato a ricevere l'XML e salvarlo su file
app.post('/upload-xml', (req, res) => {
  try {
    const xmlContent = req.body; // Qui abbiamo l'XML inviato dal client

    console.log('Ricevuto XML:', xmlContent);

    // Salvataggio su file "dati.xml" nella cartella corrente
    // NB: su Render free, il filesystem è effimero: se l'app si riavvia, si perde.
    fs.writeFileSync(path.join(__dirname, 'dati.xml'), xmlContent);

    res.status(200).send('XML salvato con successo!');
  } catch (error) {
    console.error('Errore nel salvataggio:', error);
    res.status(500).send('Errore nel salvataggio del file XML.');
  }
});

// Render (e in generale i PaaS) richiedono di ascoltare su process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
