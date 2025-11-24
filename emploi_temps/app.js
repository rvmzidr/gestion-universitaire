const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const coursRoutes = require("./routes/cours");

const app = express();

// Middleware
// Configure express-handlebars with .hbs extension and default layout
const hbs = exphbs.create({
  extname: ".hbs",
  defaultLayout: "layout",
  layoutsDir: path.join(__dirname, "views")
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/", coursRoutes);

// Serveur
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});

// Global error handlers to aid debugging (will log and keep process from exiting silently)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
