const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const fs = require('fs');

// Connexion MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "classrom"
});

// Flag indiquant si la connexion a réussi
let dbConnected = false;

db.connect(err => {
  if (err) {
    // Ne pas throw pour éviter de faire planter toute l'application.
    console.error("Impossible de se connecter à MySQL :", err.message);
    dbConnected = false;
  } else {
    console.log("Connecté à MySQL !");
    dbConnected = true;
  }
});

// Page d'accueil
router.get("/", (req, res) => {
  if (!dbConnected) {
    // Rendre la page sans planter : afficher message et tableau vide
    return res.render("index", { cours: [], students: [], error: "Base de données indisponible. Les cours ne peuvent pas être chargés pour le moment." });
  }

  // Récupérer les cours puis les étudiants pour le quick selector
  db.query("SELECT * FROM cours", (err, result) => {
    if (err) {
      console.error("Erreur lors de la requête SELECT :", err.message);
      return res.render("index", { cours: [], students: [], error: "Erreur lors du chargement des cours." });
    }

    db.query('SELECT id, nom FROM students', (err2, students) => {
      if (err2) {
        console.error('Erreur lors de la récupération des étudiants pour la page d\'accueil:', err2.message);
        return res.render('index', { cours: result, students: [], error: 'Erreur lors de la récupération des étudiants.' });
      }
      res.render('index', { cours: result, students });
    });
  });
});

// Formulaire d'ajout
router.get("/ajouter", (req, res) => {
  res.render("ajouter_cours");
});

// Ajout de cours
router.post("/ajouter", (req, res) => {
  if (!dbConnected) {
    return res.status(503).send("Service indisponible : base de données non connectée.");
  }

  const { nom_cours, enseignant, salle, jour, heure_debut, heure_fin } = req.body;

  // Vérifier conflit (même enseignant ou salle au même horaire)
  const sqlConflit = `
    SELECT * FROM cours 
    WHERE jour = ? 
    AND (
      (enseignant = ? OR salle = ?)
      AND (
        (? BETWEEN heure_debut AND heure_fin)
        OR (? BETWEEN heure_debut AND heure_fin)
      )
    )
  `;

  db.query(sqlConflit, [jour, enseignant, salle, heure_debut, heure_fin], (err, rows) => {
    if (err) {
      console.error("Erreur lors de la vérification des conflits :", err.message);
      return res.status(500).send("Erreur serveur lors de l'ajout du cours.");
    }

    if (rows.length > 0) {
      res.send("⚠️ Conflit détecté : même enseignant ou salle à cette heure !");
    } else {
      db.query("INSERT INTO cours SET ?", { nom_cours, enseignant, salle, jour, heure_debut, heure_fin }, err2 => {
        if (err2) {
          console.error("Erreur lors de l'insertion :", err2.message);
          return res.status(500).send("Erreur serveur lors de l'insertion du cours.");
        }
        res.redirect("/");
      });
    }
  });
});

// Formulaire de modification d'un cours (prérempli)
router.get('/modifier/:id', (req, res) => {
  if (!dbConnected) return res.render('modifier_cours', { error: 'Base de données indisponible.' });

  const { id } = req.params;
  db.query('SELECT * FROM cours WHERE id = ?', [id], (err, rows) => {
    if (err) {
      console.error('Erreur SELECT pour modification :', err.message);
      return res.render('modifier_cours', { error: 'Erreur lors de la récupération du cours.' });
    }
    if (!rows || rows.length === 0) return res.status(404).send('Cours non trouvé');
    res.render('modifier_cours', { cours: rows[0] });
  });
});

// Traitement de la modification
router.post('/modifier/:id', (req, res) => {
  if (!dbConnected) return res.status(503).send('Service indisponible : base de données non connectée.');

  const { id } = req.params;
  const { nom_cours, enseignant, salle, jour, heure_debut, heure_fin } = req.body;

  db.query('UPDATE cours SET ? WHERE id = ?', [{ nom_cours, enseignant, salle, jour, heure_debut, heure_fin }, id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour :', err.message);
      return res.status(500).send('Erreur serveur lors de la mise à jour du cours.');
    }
    res.redirect('/');
  });
});

// Supprimer un cours
router.post('/supprimer/:id', (req, res) => {
  if (!dbConnected) return res.status(503).send('Service indisponible : base de données non connectée.');

  const { id } = req.params;
  db.query('DELETE FROM cours WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression :', err.message);
      return res.status(500).send('Erreur serveur lors de la suppression du cours.');
    }
    res.redirect('/');
  });
});

// API: renvoyer les cours au format JSON utilisable par FullCalendar
// Optionnel: ?studentId=1 pour filtrer les cours liés à un étudiant
router.get('/api/cours', (req, res) => {
  if (!dbConnected) return res.status(503).json({ error: 'DB unavailable' });

   const { studentId, enseignant, salle, jour } = req.query;

  const fetchAll = () => new Promise((resolve, reject) => {
    db.query('SELECT * FROM cours', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

  const fetchForStudent = (sid) => new Promise((resolve, reject) => {
    const sql = `
      SELECT c.* FROM cours c
      JOIN inscriptions i ON i.cours_id = c.id
      WHERE i.student_id = ?
    `;
    db.query(sql, [sid], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

  const fetchForEnseignant = (name) => new Promise((resolve, reject) => {
    db.query('SELECT * FROM cours WHERE enseignant = ?', [name], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

  const toEvents = (rows) => {
    // Map jours FR -> weekday number (Lundi=1..)
    const dayMap = { 'Lundi':1,'Mardi':2,'Mercredi':3,'Jeudi':4,'Vendredi':5,'Samedi':6,'Dimanche':0 };
    const now = new Date();
    // find Monday of current week
    const day = now.getDay(); // 0 Sun .. 6 Sat
    const monday = new Date(now);
    const diffToMonday = ((day + 6) % 7); // 0 if Monday
    monday.setDate(now.getDate() - diffToMonday);

    return rows.map(r => {
      const weekday = dayMap[r.jour] ?? 1;
      const eventDate = new Date(monday);
      // setDate to Monday + (weekday-1)
      const offset = ((weekday + 6) % 7); // map 1->0, 0->6
      eventDate.setDate(monday.getDate() + offset);

      // combine date with time (heure_debut / heure_fin format HH:MM:SS)
      const startParts = r.heure_debut.split(':');
      const endParts = r.heure_fin.split(':');
      const start = new Date(eventDate);
      start.setHours(parseInt(startParts[0],10), parseInt(startParts[1],10), 0, 0);
      const end = new Date(eventDate);
      end.setHours(parseInt(endParts[0],10), parseInt(endParts[1],10), 0, 0);

      return {
        id: r.id,
        title: r.nom_cours + ' - ' + r.enseignant + ' (' + r.salle + ')',
        start: start.toISOString(),
        end: end.toISOString(),
        extendedProps: { enseignant: r.enseignant, salle: r.salle }
      };
    });
  };

   const p = studentId ? fetchForStudent(studentId) : enseignant ? fetchForEnseignant(enseignant) : fetchAll();

   p.then(rows => {
     // apply simple post-filters for salle and jour if provided
     if (salle) {
       rows = rows.filter(r => String(r.salle).toLowerCase() === String(salle).toLowerCase());
     }
     if (jour) {
       rows = rows.filter(r => String(r.jour).toLowerCase() === String(jour).toLowerCase());
     }
     res.json(toEvents(rows));
   }).catch(err => {
    console.error('API /api/cours error:', err.message);
    res.status(500).json({ error: 'DB error' });
  });
});

// Pages pour calendrier et vue etudiant (démo)
router.get('/calendar', (req, res) => {
  res.render('calendar');
});

router.get('/etudiant', (req, res) => {
  // récupérer la liste des étudiants pour sélection
  console.log('Route GET /etudiant called');
  if (!dbConnected) return res.render('etudiant', { students: [], error: 'DB unavailable' });
  db.query('SELECT id, nom FROM students', (err, rows) => {
    if (err) {
      console.error('Erreur SQL sur SELECT students:', err && err.message ? err.message : err);
      return res.render('etudiant', { students: [], error: 'Erreur lors de la récupération des étudiants.' });
    }
    const selectedId = req.query.studentId ? parseInt(req.query.studentId, 10) : null;
    res.render('etudiant', { students: rows, selectedId });
  });
});

// Admin page to link students to courses
router.get('/admin', (req, res) => {
  if (!dbConnected) return res.render('admin', { students: [], courses: [], error: 'DB unavailable' });
  db.query('SELECT id, nom FROM students', (err, students) => {
    if (err) return res.render('admin', { students: [], courses: [], inscriptions: [], error: 'Erreur récup étudiants' });
    db.query('SELECT id, nom_cours FROM cours', (err2, courses) => {
      if (err2) return res.render('admin', { students, courses: [], inscriptions: [], error: 'Erreur récup cours' });
      // also fetch current inscriptions
      const sqlIns = `SELECT i.id, i.student_id, i.cours_id, s.nom AS student_nom, c.nom_cours AS cours_nom
                      FROM inscriptions i
                      JOIN students s ON s.id = i.student_id
                      JOIN cours c ON c.id = i.cours_id`;
      db.query(sqlIns, (err3, inscriptions) => {
        if (err3) return res.render('admin', { students, courses, inscriptions: [], error: 'Erreur récup inscriptions' });
        const msg = req.query.msg ? req.query.msg : null;
        res.render('admin', { students, courses, inscriptions, msg });
      });
    });
  });
});

// Page enseignant (sélection et calendrier similaire à étudiant)
router.get('/enseignant', (req, res) => {
  if (!dbConnected) return res.render('enseignant', { enseignants: [], selectedName: null, error: 'DB unavailable' });
  // récupérer la liste distincte des enseignants
  db.query('SELECT DISTINCT enseignant FROM cours', (err, rows) => {
    if (err) return res.render('enseignant', { enseignants: [], selectedName: null, error: 'Erreur récupération enseignants' });
    const enseignantList = rows.map(r => r.enseignant);
    const selectedName = req.query.name ? req.query.name : null;
    const selectedSalle = req.query.salle ? req.query.salle : null;
    const selectedJour = req.query.jour ? req.query.jour : null;
    // also fetch distinct salles and jours to populate filters
    db.query('SELECT DISTINCT salle FROM cours', (err2, rows2) => {
      if (err2) return res.render('enseignant', { enseignants: enseignantList, selectedName, selectedSalle, selectedJour, salles: [], jours: [] });
      const salles = rows2.map(r => r.salle).filter(Boolean);
      db.query('SELECT DISTINCT jour FROM cours', (err3, rows3) => {
        const jours = (!err3 && rows3) ? rows3.map(r => r.jour).filter(Boolean) : [];
        res.render('enseignant', { enseignants: enseignantList, selectedName, selectedSalle, selectedJour, salles, jours });
      });
    });
  });
});

router.post('/admin/inscrire', (req, res) => {
  if (!dbConnected) return res.status(503).send('DB unavailable');
  const { studentId, courseId } = req.body;
  if (!studentId || !courseId) return res.redirect('/admin');
  // prevent duplicates
  db.query('SELECT COUNT(*) AS cnt FROM inscriptions WHERE student_id = ? AND cours_id = ?', [studentId, courseId], (errCheck, rows) => {
    if (errCheck) {
      console.error('Erreur vérif duplication:', errCheck.message);
      return res.redirect('/admin');
    }
    if (rows && rows[0] && rows[0].cnt > 0) {
      // already exists
      return res.redirect('/admin?msg=' + encodeURIComponent('L\'étudiant est déjà inscrit à ce cours'));
    }
    db.query('INSERT INTO inscriptions (student_id, cours_id) VALUES (?, ?)', [studentId, courseId], (err) => {
      if (err) {
        console.error('Erreur insertion inscription:', err.message);
        return res.redirect('/admin?msg=' + encodeURIComponent('Erreur lors de l\'inscription'));
      }
      res.redirect('/admin?msg=' + encodeURIComponent('Inscription réussie'));
    });
  });
});

router.post('/admin/supprimer-inscription', (req, res) => {
  if (!dbConnected) return res.status(503).send('DB unavailable');
  const { inscriptionId } = req.body;
  if (!inscriptionId) return res.redirect('/admin');
  db.query('DELETE FROM inscriptions WHERE id = ?', [inscriptionId], (err) => {
    if (err) {
      console.error('Erreur suppression inscription:', err.message);
      return res.redirect('/admin?msg=' + encodeURIComponent('Erreur lors de la suppression'));
    }
    res.redirect('/admin?msg=' + encodeURIComponent('Inscription supprimée'));
  });
});

// Route d'initialisation DB (exécute db_init.sql) - utile si certaines tables manquent
router.get('/init-db', (req, res) => {
  if (!dbConnected) return res.status(503).send('DB non connectée');
  const sqlPath = path = require('path').join(__dirname, '..', 'db_init.sql');
  let content;
  try {
    content = fs.readFileSync(sqlPath, 'utf8');
  } catch (e) {
    console.error('Impossible de lire db_init.sql:', e.message);
    return res.status(500).send('Impossible de lire db_init.sql');
  }
  // Split statements by semicolon. Keep it simple; ignore lines starting with --
  const statements = content
    .split(/;\s*\n/)
    .map(s => s.replace(/--.*$/gm, '').trim())
    .filter(s => s.length > 0);

  const runStmt = (i) => {
    if (i >= statements.length) return res.send('Initialisation terminée');
    const stmt = statements[i];
    db.query(stmt, (err) => {
      if (err) console.error('Erreur executing statement:', err.message, '\n', stmt);
      // continue regardless of error to attempt remaining statements
      runStmt(i+1);
    });
  };
  runStmt(0);
});

module.exports = router;
