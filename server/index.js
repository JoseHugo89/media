const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream'); // Usar Readable stream en lugar de PassThrough

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para manejar JSON y datos de formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre del archivo
  }
});

// Middleware para manejar la carga de archivos
const upload = multer({ storage });

// Configura la opción strictQuery
mongoose.set('strictQuery', true); // O false, dependiendo de tu preferencia

// Conectarse a MongoDB
const mongoURI = 'mongodb://127.0.0.1:27017/dbmedia';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Model schema
const modelSchema = new mongoose.Schema({
  participationNumber: { type: String, unique: true },
  fullName: String,
  emailAddress: String,
  phoneNumber: String,
  type: String,
  day: String,
  time: String,
  instagramUsername: String,
  status: { type: String, default: 'pending' },
  registerStatus: { type: String, default: 'No Register' } // Nuevo campo para el estado de registro
});

const Media = mongoose.model('Media', modelSchema);

// Endpoint para registrar un nuevo media
app.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { fullName, emailAddress, phoneNumber, type, instagramUsername, day, time } = req.body;
  console.log('Datos recibidos:', { fullName, emailAddress, phoneNumber, type, instagramUsername, day, time });

  try {
    const participationNumber = await generateParticipationNumber();
    const newMedia = new Media({
      participationNumber,
      fullName,
      emailAddress,
      phoneNumber,
      type,
      instagramUsername,
      day,
      time
    });
    await newMedia.save();
    res.status(201).json({ message: 'Media registered successfully', participationNumber });
  } catch (err) {
    console.error('Error registering media:', err);
    res.status(500).json({ error: 'An error occurred while registering the media' });
  }
});

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../client')));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para obtener todos los media
app.get('/media', async (req, res) => {
  try {
    const media = await Media.find().select('-__v'); // Excluye el campo __v si no lo necesitas
    console.log('Media enviados:', media); // Añade este log
    res.json(media);
  } catch (error) {
    console.error('Error al obtener media:', error);
    res.status(500).json({ success: false, message: 'Error fetching media' });
  }
});

// Ruta para obtener un media por ID
app.get('/media/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login.html'));
});

// Ruta para actualizar el estado de registro de un medio
app.put('/media/:id/register', async (req, res) => {
  try {
    const mediaId = req.params.id;
    console.log(`Received request to update register status for media ID: ${mediaId}`);
    const updatedMedia = await Media.findByIdAndUpdate(
      mediaId,
      { registerStatus: 'REGISTER' },
      { new: true }
    );
    if (!updatedMedia) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.json(updatedMedia);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para enviar un correo con PDF adjunto
app.post('/send-email', async (req, res) => {
  const { email, participationNumber, name, phone, type, instagram, status, day, time } = req.body;

  // Generar PDF
  const doc = new PDFDocument();
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfBuffer = Buffer.concat(buffers);

    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'r7nyfw@gmail.com',
        pass: 'ugxulskgqiuwehcz'
      }
    });

    // Enviar correo
    try {
      await transporter.sendMail({
        from: 'info@runway7fashion.com',
        to: email,
        subject: 'Your Media Details',
        text: 'Please find attached the details of your media.',
        attachments: [{
          filename: 'media-details.pdf',
          content: pdfBuffer
        }]
      });
      res.status(200).send('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Error sending email');
    }
  });

  doc.text(`Participation Number: ${participationNumber}`);
  doc.text(`Name: ${name}`);
  doc.text(`Phone: ${phone}`);
  doc.text(`Type: ${type}`);
  doc.text(`Instagram: ${instagram}`);
  doc.text(`Status: ${status}`);
  doc.text(`Day: ${day}`);
  doc.text(`Time: ${time}`);
  
  doc.end();
});

// Función para generar el número de participación
async function generateParticipationNumber() {
  const lastMedia = await Media.findOne().sort({ participationNumber: -1 });
  if (!lastMedia || !lastMedia.participationNumber) {
    return '0001';
  }
  const lastNumber = parseInt(lastMedia.participationNumber, 10);
  if (lastNumber >= 9000) {
    throw new Error('Se ha alcanzado el número máximo de participaciones');
  }
  return (lastNumber + 1).toString().padStart(4, '0');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
