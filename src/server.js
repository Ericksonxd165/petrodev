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

// Middleware para verificar si el usuario es estudiante
function isEstudiante(req, res, next) {
  if (req.session.user && req.session.user.rol === 'estudiante') {
    return next();
  } else {
    return res.redirect('/index.html');
  }
}

// Middleware para verificar si el usuario es administrador
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.rol === 'admin') {
    return next();
  } else {
    return res.redirect('/index.html');
  }
}

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    return res.redirect('/index.html');
  }
}

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
        req.session.user.rol = 'admin'; // Marcar la sesión como de administrador
        return res.status(200).json({ message: 'Inicio de sesión exitoso', redirect: '/admindashboard.html' });
      } else {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }
    } else {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
  });
});

// Ruta para manejar el login de estudiantes
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
        req.session.user.rol = 'estudiante'; // Marcar la sesión como de estudiante
        return res.status(200).json({ message: 'Inicio de sesión exitoso', redirect: '/dashboard.html' });
      } else {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }
    } else {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
  });
});

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

// Rutas protegidas para estudiantes
app.get('/dashboard.html', isEstudiante, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

// Middleware para verificar si el usuario es profesor
function isProfesor(req, res, next) {
  if (req.session.user && req.session.user.rol === 'profesor') {
    return next();
  } else {
    return res.redirect('/index.html');
  }
}

// Rutas protegidas para estudiantes
app.get('/dashboard.html', isEstudiante, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

app.get('/library.html', isEstudiante, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'library.html'));
});

app.get('/capacitacion.html', isEstudiante, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'capacitacion.html'));
});

app.get('/editor.html', isEstudiante, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'editor.html'));
});

app.get('/proyectos.html', isEstudiante, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'proyectos.html'));
});

app.get('/modulos.html', isEstudiante, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'modulos.html'));
});

app.get('/tareas.html', isEstudiante, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'tareas.html'));
});

// Rutas protegidas para profesores
app.get('/dashboard.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

app.get('/library.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'library.html'));
});

app.get('/capacitacion.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'capacitacion.html'));
});

app.get('/admineditor.html', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'admineditor.html'));
});

app.get('/editor.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'editor.html'));
});

app.get('/proyectos.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'proyectos.html'));
});

app.get('/modulos.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'modulos.html'));
});

app.get('/tareas.html', isProfesor, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'tareas.html'));
});

// Redirigir a admindashboard si el administrador ya está autenticado
app.get(['/adminLogin'], (req, res) => {
  if (req.session.user && req.session.user.rol === 'admin') {
    res.redirect('/admindashboard.html');
  } else {
    res.sendFile(path.join(__dirname, 'html', req.path));
  }
});

// Redirigir a dashboard si el profesor ya está autenticado
app.get(['/login'], (req, res) => {
  if (req.session.user && req.session.user.rol === 'profesor') {
    res.redirect('/dashboard.html');
  } else {
    res.sendFile(path.join(__dirname, 'html', req.path));
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

// Ruta para verificar la autenticación
app.get('/checkAuth', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ authenticated: true, user: req.session.user });
  } else {
    return res.status(200).json({ authenticated: false });
  }
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

// Ruta para obtener todos los estudiantes
app.get('/students', isAdmin, (req, res) => {
  const sql = 'SELECT id, nombre FROM usuarios WHERE rol = "estudiante"';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener los estudiantes' });
    return res.status(200).json(results);
  });
});

// Ruta para obtener todos los estudiantes que han entregado proyectos
app.get('/studentsWithDeliveries', isAdmin, (req, res) => {
  const sql = `
    SELECT DISTINCT u.id, u.nombre 
    FROM usuarios u
    JOIN entregas e ON u.id = e.user_id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener los estudiantes:', err);
      return res.status(500).json({ message: 'Error al obtener los estudiantes' });
    }

    return res.status(200).json(results);
  });
});
// Middleware para verificar si el usuario es administrador
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.rol === 'admin') {
    return next();
  } else {
    res.redirect('/index.html');
  }
}



// Ruta para obtener los proyectos entregados de un estudiante específico
app.get('/students/:id/deliveredProjects', isAdmin, (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.id, p.title 
    FROM projects p
    JOIN entregas e ON p.id = e.project_id
    WHERE e.user_id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener los proyectos entregados:', err);
      return res.status(500).json({ message: 'Error al obtener los proyectos entregados' });
    }
    return res.status(200).json(results);
  });
});

// Ruta para obtener el contenido de un proyecto específico entregado
app.get('/deliveredProjectContent/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT code FROM projects WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener el proyecto:', err);
      return res.status(500).json({ message: 'Error al obtener el proyecto' });
    }
    if (results.length === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });
    return res.status(200).json(results[0]);
  });
});

// Ruta para obtener las tareas visibles para los estudiantes
app.get('/tasks/visible', isEstudiante, (req, res) => {
  const sql = 'SELECT * FROM tasks WHERE visible = TRUE';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener las tareas' });
    return res.status(200).json(results);
  });
});

// Ruta para entregar una tarea
app.post('/tasks/:id/entregar', isEstudiante, (req, res) => {
  const { id } = req.params;
  const { project_id, archivo } = req.body;
  const user_id = req.session.user.id;

  const sql = 'INSERT INTO entregas (task_id, user_id, project_id, archivo) VALUES (?, ?, ?, ?)';
  db.query(sql, [id, user_id, project_id, archivo], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al entregar la tarea' });
    return res.status(200).json({ message: 'Tarea entregada exitosamente' });
  });
});

// Ruta para obtener las entregas de una tarea específica
app.get('/tasks/:id/entregas', isAdmin, (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT e.*, u.nombre, p.title 
    FROM entregas e
    JOIN usuarios u ON e.user_id = u.id
    LEFT JOIN projects p ON e.project_id = p.id
    WHERE e.task_id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener las entregas' });
    return res.status(200).json(results);
  });
});

// Ruta para calificar una entrega
app.put('/entregas/:id/calificar', isAdmin, (req, res) => {
  const { id } = req.params;
  const { calificacion } = req.body;

  const sql = 'UPDATE entregas SET calificacion = ? WHERE id = ?';
  db.query(sql, [calificacion, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al calificar la entrega' });
    return res.status(200).json({ message: 'Entrega calificada exitosamente' });
  });
});




// Ruta para obtener todas las tareas
app.get('/tasks', isAdmin, (req, res) => {
  const sql = 'SELECT * FROM tasks';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener las tareas' });
    return res.status(200).json(results);
  });
});


// Ruta para obtener una tarea específica
app.get('/tasks/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM tasks WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener la tarea' });
    if (results.length === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
    return res.status(200).json(results[0]);
  });
});
// Ruta para añadir una nueva tarea
app.post('/tasks', isAdmin, (req, res) => {
  const { titulo, enunciado, modulo, fecha_limite } = req.body;

  // Verificar si ya existen 4 tareas para el módulo
  const checkSql = 'SELECT COUNT(*) AS count FROM tasks WHERE modulo = ?';
  db.query(checkSql, [modulo], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al verificar las tareas' });
    if (results[0].count >= 4) {
      return res.status(400).json({ message: 'Solo se pueden crear 4 tareas por módulo' });
    }

    const sql = 'INSERT INTO tasks (titulo, enunciado, modulo, fecha_limite, visible) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [titulo, enunciado, modulo, fecha_limite, true], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error al crear la tarea' });
      return res.status(200).json({ message: 'Tarea creada exitosamente' });
    });
  });
});

// Ruta para actualizar una tarea
app.put('/tasks/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const { titulo, enunciado, modulo, fecha_limite } = req.body;

  const sql = 'UPDATE tasks SET titulo = ?, enunciado = ?, modulo = ?, fecha_limite = ? WHERE id = ?';
  db.query(sql, [titulo, enunciado, modulo, fecha_limite, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar la tarea' });
    return res.status(200).json({ message: 'Tarea actualizada exitosamente' });
  });
});

// Ruta para eliminar una tarea
app.delete('/tasks/:id', isAdmin, (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM tasks WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar la tarea' });
    return res.status(200).json({ message: 'Tarea eliminada exitosamente' });
  });
});

// Ruta para cambiar la visibilidad de una tarea
app.put('/tasks/:id/visibility', isAdmin, (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;

  const sql = 'UPDATE tasks SET visible = ? WHERE id = ?';
  db.query(sql, [visible, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al cambiar la visibilidad de la tarea' });
    return res.status(200).json({ message: 'Visibilidad de la tarea actualizada exitosamente' });
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
    if (req.session.user.rol === 'admin') {
      res.redirect('/admindashboard.html');
    } else if (req.session.user.rol === 'estudiante') {
      res.redirect('/dashboard.html');
    } else if (req.session.user.rol === 'profesor') {
      res.redirect('/dashboard.html');
    }
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