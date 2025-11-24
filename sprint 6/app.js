// app.js
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const cors = require('cors');

// routers
const analyticRoutes = require('./routes/analyticRoutes');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Handlebars setup
// dashboard.hbs already contains a full HTML document, so disable the default layout
// to avoid express-handlebars looking for views/layouts/main.hbs
app.engine('hbs', engine({ extname: '.hbs', defaultLayout: false }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Frontend route (render dashboard)
app.get('/', async (req, res) => {
  try {
    // si besoin de fetch côté serveur :
    // const fetch = require('node-fetch');
    // const data = await fetch('url/api').then(r => r.json());

    res.render('dashboard'); // render la vue dashboard.hbs
  } catch (error) {
    res.status(500).send('Error rendering dashboard');
  }
});

// API routes
app.use('/api/analytics', analyticRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
