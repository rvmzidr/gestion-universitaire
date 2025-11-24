// controllers/analyticController.js

const db = require('../db');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

// 📌 إرجاع عدد الغيابات حسب المادة
async function getAbsenceStats(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT m.nom AS matiere, COUNT(a.id) AS total_absences
      FROM absence a
      JOIN emploiTemps e ON a.id_emploi = e.id
      JOIN matiere m ON e.id_matiere = m.id
      GROUP BY m.nom
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// 📌 إرجاع عدد الدروس حسب القاعات
async function getRoomUsage(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT s.code AS salle, COUNT(e.id) AS nb_cours
      FROM emploiTemps e
      JOIN salle s ON e.id_salle = s.id
      GROUP BY s.code
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// 📌 تصدير الغيابات بصيغة PDF
async function exportAbsencePDF(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT m.nom AS matiere, COUNT(a.id) AS total_absences
      FROM absence a
      JOIN emploiTemps e ON a.id_emploi = e.id
      JOIN matiere m ON e.id_matiere = m.id
      GROUP BY m.nom
    `);

    const doc = new PDFDocument({ margin: 30 });
    const filename = `rapport_absences_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '..', 'public', filename);

    // stream للملف
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // عنوان
    doc.fontSize(18).text("Rapport d'absentéisme", { align: 'center' });
    doc.moveDown();

    // المحتوى
    rows.forEach(r => {
      doc.fontSize(12).text(`${r.matiere} : ${r.total_absences} absences`);
    });

    // إنهاء المستند
    doc.end();

    // تحميل الملف للعميل
    stream.on('finish', () => {
      res.download(filepath, filename, err => {
        if (!err) fs.unlinkSync(filepath); // نحذف الملف بعد ما يتبعت
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// 📌 تصدير الغيابات بصيغة CSV
async function exportAbsenceCSV(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT m.nom AS matiere, COUNT(a.id) AS total_absences
      FROM absence a
      JOIN emploiTemps e ON a.id_emploi = e.id
      JOIN matiere m ON e.id_matiere = m.id
      GROUP BY m.nom
    `);

    const parser = new Parser();
    const csv = parser.parse(rows);

    const filename = `rapport_absences_${Date.now()}.csv`;
    const filepath = path.join(__dirname, '..', 'public', filename);

    fs.writeFileSync(filepath, csv);

    res.download(filepath, filename, err => {
      if (!err) fs.unlinkSync(filepath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { 
  getAbsenceStats, 
  getRoomUsage, 
  exportAbsencePDF, 
  exportAbsenceCSV 
};
