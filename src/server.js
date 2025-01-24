const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const validator = require('validator');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const app = express();
const port = 3000;

// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// Configurar la sesión
const sessionStore = new MySQLStore({}, db);

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));



// Ruta para manejar el login de administrador
app.post('/adminLogin', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM admin WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = user;
        req.session.isAdmin = true; // Marcar la sesión como de administrador
        return res.status(200).json({ message: 'Inicio de sesión exitoso', redirect: '/admindashboard.html' });
      } else {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }
    } else {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
  });
});

// Middleware para verificar si el usuario es estudiante
function isEstudiante(req, res, next) {
  if (req.session.user && !req.session.isAdmin && req.session.user.rol === 'estudiante') {
    return next();
  } else {
    return res.redirect('/index.html');
  }
}


// Middleware para verificar si el usuario es administrador
function isAdmin(req, res, next) {
  if (req.session.user && req.session.isAdmin) {
    return next();
  } else {
    return res.redirect('/index.html');
  }
}
// Rutas protegidas para administradores
app.get('/admindashboard.html', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'admindashboard.html'));
});

app.get('/adminstudents.html', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'adminstudents.html'));
});

app.get('/admintasks.html', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'admintasks.html'));
});

// Rutas protegidas para profesores
app.get('/dashboard.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

app.get('/library.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

app.get('/capacitacion.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

app.get('/editor.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

app.get('/proyectos.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

app.get('/modulos.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

app.get('/tareas.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

// Rutas protegidas para estudiantes
app.get('/studentdashboard.html', isEstudiante, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'studentdashboard.html'));
});

// Middleware para verificar si el usuario es profesor
function isProfesor(req, res, next) {
  if (req.session.user && !req.session.isAdmin && req.session.user.rol === 'profesor') {
    return next();
  } else {
    return res.redirect('/index.html');
  }
}

// Redirigir a admindashboard si el administrador ya está autenticado
app.get(['/adminLogin'], (req, res) => {
  if (req.session.user && req.session.isAdmin) {
    res.redirect('/admindashboard.html');
  } else {
    res.sendFile(path.join(__dirname, 'html', req.path));
  }
});

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }
}

// Redirigir a dashboard si el profesor ya está autenticado
app.get(['/login'], (req, res) => {
  if (req.session.user && req.session.user.rol === 'profesor') {
    res.redirect('/admindashboard.html');
  } else {
    res.sendFile(path.join(__dirname, 'html', req.path));
  }
});


// Ruta para manejar la redirección a index.html y cerrar sesión de administrador
app.get('/index.html', (req, res) => {
  if (req.session.isAdmin) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error al cerrar sesión');
      }
      res.clearCookie('connect.sid');
      res.sendFile(path.join(__dirname, 'html', 'index.html'));
    });
  } else {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
  }
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

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
  });
});

// Ruta para verificar la autenticación
app.get('/checkAuth', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ authenticated: true, user: req.session.user });
  } else {
    return res.status(200).json({ authenticated: false });
  }
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

// Ruta para manejar el registro
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

// Ruta para obtener los proyectos del usuario autenticado
app.get('/getProjects', isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  const sql = 'SELECT id, title, created_at FROM projects WHERE user_id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener los proyectos' });
    } else {
      return res.status(200).json(results);
    }
  });
});

// Ruta para obtener el contenido de un proyecto
app.get('/getProjectContent/:id', isAuthenticated, (req, res) => {
  const projectId = req.params.id;
  const userId = req.session.user.id;

  const sql = 'SELECT code FROM projects WHERE id = ? AND user_id = ?';
  db.query(sql, [projectId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener el contenido del proyecto' });
    } else if (results.length === 0) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    } else {
      return res.status(200).json(results[0]);
    }
  });
});

// Ruta para manejar el guardado de proyectos
app.post('/saveProject', isAuthenticated, (req, res) => {
  const { title, code } = req.body;
  const userId = req.session.user.id;

  const sql = 'INSERT INTO projects (title, code, user_id) VALUES (?, ?, ?)';
  db.query(sql, [title, code, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al guardar el proyecto' });
    } else {
      return res.status(200).json({ message: 'Proyecto guardado exitosamente' });
    }
  });
});

// Ruta para actualizar un proyecto existente
app.put('/updateProject/:id', isAuthenticated, (req, res) => {
  const projectId = req.params.id;
  const { title, code } = req.body;
  const userId = req.session.user.id;

  const sql = 'UPDATE projects SET title = ?, code = ? WHERE id = ? AND user_id = ?';
  db.query(sql, [title, code, projectId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al actualizar el proyecto' });
    } else {
      return res.status(200).json({ message: 'Proyecto actualizado exitosamente' });
    }
  });
});

// Redirigir a dashboard si el usuario ya está autenticado
app.get(['/index.html', '/register.html'], (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard.html');
  } else {
    res.sendFile(path.join(__dirname, 'html', req.path));
  }
});

// Servir archivos estáticos desde la carpeta src/html
app.use(express.static(path.join(__dirname, 'html')));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

process.on('SIGINT', () => {
  db.query('DELETE FROM sessions', (err, result) => {
    if (err) throw err;
    console.log('Tabla de sesiones limpiada');
    process.exit();
  });
});