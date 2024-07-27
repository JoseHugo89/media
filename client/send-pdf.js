const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch'); // Asegúrate de tener node-fetch instalado
const printer = require('pdfmake');
const { PassThrough } = require('stream'); // Importar PassThrough stream

const router = express.Router();

// Configuración de transporte de correo
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'r7nyfw@gmail.com',
        pass: 'ugxulskgqiuwehcz'
    }
});

router.post('/send-pdf', async (req, res) => {
    const media = req.body;
    // Lógica para generar PDF y enviar correo
    // ...
});

function getBase64Image(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(res => res.buffer())
            .then(buffer => resolve(buffer.toString('base64')))
            .catch(err => reject(err));
    });
}

module.exports = router;