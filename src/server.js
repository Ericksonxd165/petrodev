const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const validator = require('validator');
const session = require('express-session');

const app = express();
const port = 3000;

// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar la sesión
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Deja la contraseña vacía si no has configurado una
  database: 'petrodev'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos');
});

// Función para validar la contraseña
function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

app.post('/register', async (req, res) => {
  const { nombre, cedula, email, password } = req.body;

  // Validar el correo electrónico
  if (!validator.isEmail(email) || email.endsWith('@noemail.com')) {
    return res.status(400).json({ message: 'Correo electrónico inválido' });
  }

  // Validar el número de cédula
  if (cedula.length > 8) {
    return res.status(400).json({ message: 'Número de Cédula inválido' });
  }

  // Validar la contraseña
  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Contraseña inválida' });
  }

  // Verificar si el correo electrónico o la cédula ya existen
  const checkUserSql = 'SELECT * FROM usuarios WHERE email = ? OR cedula = ?';
  db.query(checkUserSql, [email, cedula], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico o la cédula ya están registrados' });
    }

    // Hashear la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error al hashear la contraseña' });
      }

      const sql = 'INSERT INTO usuarios (nombre, cedula, email, password) VALUES (?, ?, ?, ?)';
      db.query(sql, [nombre, cedula, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error en el registro' });
        } else {
          return res.status(200).json({ message: 'Registro exitoso' });
        }
      });
    });
  });
});

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = user;
        return res.status(200).json({ message: 'Inicio de sesión exitoso', user });
      } else {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }
    } else {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
  });
});

// Ruta para manejar el cierre de sesión
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
  });
});

// Servir archivos estáticos desde la carpeta src/html
app.use(express.static(path.join(__dirname, 'html')));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});