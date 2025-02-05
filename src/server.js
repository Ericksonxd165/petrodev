const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const validator = require('validator');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');



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

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  key: 'session_id',
  secret: 'your_secret_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
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
        req.session.user = {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          telefono: user.telefono,
          cedula: user.cedula,
          rol: 'estudiante' // Marcar la sesión como de estudiante
        };
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

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.clearCookie('session_id');
    res.json({ message: 'Sesión cerrada correctamente' });
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

// Función para validar la contraseña
function validatePassword(password) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return passwordRegex.test(password);
}


// Función para validar el número de teléfono
function validatePhoneNumber(phone) {
  
  const phoneRegex = /^(0412|0424|0414|0416|0426)\d{7}$/;
  return phoneRegex.test(phone);
}

// Ruta para manejar el registro
app.post('/register', async (req, res) => {
  const { nombre, cedula, email, telefono, password } = req.body;




  // Validar el correo electrónico
  if (!validator.isEmail(email) || email.endsWith('@noemail.com')) {
    return res.status(400).json({ message: 'Correo electrónico inválido' });
  }

  // Validar el número de cédula
  if (cedula.length > 8) {
    return res.status(400).json({ message: 'Número de Cédula inválido' });
  }

  // Validar el número de teléfono
  if (!validatePhoneNumber(telefono)) {
    return res.status(400).json({ message: 'Número de teléfono inválido' });
  }


  // Validar la contraseña
  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Contraseña inválida' });
  }

 // Verificar si el correo electrónico, la cédula o el teléfono ya existen
 const checkUserSql = 'SELECT * FROM usuarios WHERE email = ? OR cedula = ? OR telefono = ?';
 db.query(checkUserSql, [email, cedula, telefono], (err, results) => {
   if (err) {
     return res.status(500).json({ message: 'Error en el servidor' });
   }
   if (results.length > 0) {
     return res.status(400).json({ message: 'El correo electrónico, la cédula o el teléfono ya están registrados' });
   }

    // Hashear la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error al hashear la contraseña' });
      }

      const sql = 'INSERT INTO usuarios (nombre, cedula, email, telefono, password) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [nombre, cedula, email, telefono, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error en el registro' });
        } else {
          return res.status(200).json({ message: 'Registro exitoso' });
        }
      });
    });
  });
});


// Ruta para actualizar los datos del usuario
app.post('/user/update', isAuthenticated, (req, res) => {
  const { field, value } = req.body;
  const userId = req.session.user.id;

  // Validaciones
  if (field === 'email' && !validator.isEmail(value)) {
    return res.status(400).json({ message: 'Correo electrónico inválido' });
  }
  if (field === 'cedula' && !/^\d{1,8}$/.test(value)) {
    return res.status(400).json({ message: 'La cédula debe tener un máximo de 8 números.' });
  }
  if (field === 'telefono' && !validatePhoneNumber(value)) {
    return res.status(400).json({ message: 'El teléfono debe obedecer la expresión regular.' });
  }

  const sql = `UPDATE usuarios SET ${field} = ? WHERE id = ?`;
  db.query(sql, [value, userId], (err, result) => {
    if (err) {
      console.error('Error al actualizar la información del usuario:', err);
      return res.status(500).json({ message: 'Error al actualizar la información del usuario' });
    }
    req.session.user[field] = value; // Actualizar la sesión con el nuevo valor
    res.json({ success: true, message: 'Información actualizada correctamente' });
  });
});


// Ruta para obtener la contraseña del usuario
app.get('/user/password', isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  const sql = `SELECT password FROM usuarios WHERE id = ?`;
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error al obtener la contraseña del usuario:', err);
      return res.status(500).json({ message: 'Error al obtener la contraseña del usuario' });
    }
    if (result.length > 0) {
      // Almacenar la contraseña original en la sesión
      req.session.user.originalPassword = result[0].password;
      res.json({ password: result[0].password });
    } else {
      res.status(404).json({ message: 'Contraseña no encontrada' });
    }
  });
});

// Ruta para actualizar la contraseña del usuario
app.post('/user/updatePassword', isAuthenticated, (req, res) => {
  const { password } = req.body;
  const userId = req.session.user.id;

  // Hashear la nueva contraseña
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error al hashear la contraseña:', err);
      return res.status(500).json({ message: 'Error al actualizar la contraseña' });
    }

    const sql = `UPDATE usuarios SET password = ? WHERE id = ?`;
    db.query(sql, [hash, userId], (err, result) => {
      if (err) {
        console.error('Error al actualizar la contraseña del usuario:', err);
        return res.status(500).json({ message: 'Error al actualizar la contraseña' });
      }
      res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    });
  });
});


app.get('/students', isAdmin, (req, res) => {
  const sql = 'SELECT id, nombre, cedula, email, telefono FROM usuarios';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener los estudiantes' });
    return res.status(200).json(results);
  });
});


// Ruta para obtener la información del usuario autenticado
app.get('/user/profile', isAuthenticated, (req, res) => {
  const user = req.session.user;
  res.json(user);
});

// Ruta para obtener el progreso de las tareas del usuario autenticado
app.get('/user/progress', isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const sql = `
    SELECT 
      SUM(CASE WHEN calificacion IS NOT NULL THEN calificacion ELSE 0 END) AS totalCalificaciones,
      COUNT(*) * 5 AS maxCalificaciones
    FROM entregas
    WHERE user_id = ?
  `;
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error al obtener el progreso del usuario:', err);
      return res.status(500).json({ message: 'Error al obtener el progreso del usuario' });
    }
    if (result.length > 0) {
      const totalCalificaciones = result[0].totalCalificaciones;
      const maxCalificaciones = 80;
      const progreso = (totalCalificaciones / maxCalificaciones) * 100;
      res.json({ progreso: progreso.toFixed(2) });
    } else {
      res.status(404).json({ message: 'Progreso no encontrado' });
    }
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
  const { projectId } = req.body;
  const userId = req.session.user.id;

  const sql = 'INSERT INTO entregas (task_id, user_id, project_id) VALUES (?, ?, ?)';
  db.query(sql, [id, userId, projectId], (err, result) => {
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

// Ruta para obtener el ID del usuario actual
app.get('/current-user', (req, res) => {
  if (req.session.user && req.session.user.id) {
    return res.status(200).json({ userId: req.session.user.id });
  } else {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }
});

// Ruta para verificar si una tarea ya ha sido entregada por un estudiante
app.get('/tasks/:taskId/entregas/:userId', (req, res) => {
  const { taskId, userId } = req.params;
  const sql = `
    SELECT * FROM entregas WHERE task_id = ? AND user_id = ?
  `;
  db.query(sql, [taskId, userId], (err, results) => {
    if (err) {
      console.error('Error al verificar la entrega:', err);
      return res.status(500).json({ message: 'Error al verificar la entrega', error: err });
    }
    if (results.length > 0) {
      return res.status(200).json({ entregada: true });
    } else {
      return res.status(200).json({ entregada: false });
    }
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

// Ruta para eliminar una tarea y sus calificaciones asociadas
app.delete('/tasks/:id', isAdmin, (req, res) => {
  const { id } = req.params;

  // Primero, eliminar las calificaciones asociadas a la tarea
  const deleteCalificacionesSql = `
    DELETE FROM entregas WHERE task_id = ?
  `;
  db.query(deleteCalificacionesSql, [id], (err, result) => {
    if (err) {

      return res.status(500).json({ message: 'Error al eliminar las calificaciones', error: err });
    }

    // Luego, eliminar la tarea
    const deleteTaskSql = `
      DELETE FROM tasks WHERE id = ?
    `;
    db.query(deleteTaskSql, [id], (err, result) => {
      if (err) {
        
        return res.status(500).json({ message: 'Error al eliminar la tarea', error: err });
      }

      // Reordenar las tareas
      const initRowNumberSql = `SET @row_number = 0;`;
      const reorderTasksSql = `
        UPDATE tasks SET id = (@row_number:=@row_number + 1) ORDER BY id;
      `;
      db.query(initRowNumberSql, (err, result) => {
        if (err) {
          console.error('Error al inicializar el número de fila:', err);
          return res.status(500).json({ message: 'Error al inicializar el número de fila', error: err });
        }

        db.query(reorderTasksSql, (err, result) => {
          if (err) {
           
            return res.status(500).json({ message: 'Error al reordenar las tareas', error: err });
          }

          // Actualizar las referencias en la tabla entregas
          const updateEntregasSql = `
            UPDATE entregas e
            JOIN tasks t ON e.task_id = t.id
            SET e.task_id = t.id
          `;
          db.query(updateEntregasSql, (err, result) => {
            if (err) {
          
              return res.status(500).json({ message: 'Error al actualizar las referencias en entregas', error: err });
            }

            return res.status(200).json({ message: 'Tarea y calificaciones eliminadas y tareas reordenadas exitosamente' });
          });
        });
      });
    });
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


// Ruta para actualizar el título de un proyecto
app.put('/updateProjectTitle/:id', isAuthenticated, (req, res) => {
  const projectId = req.params.id;
  const { title } = req.body;
  const userId = req.session.user.id;

  const sql = 'UPDATE projects SET title = ? WHERE id = ? AND user_id = ?';
  db.query(sql, [title, projectId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al actualizar el título del proyecto' });
    } else {
      return res.status(200).json({ message: 'Título actualizado exitosamente' });
    }
  });
});

// Ruta para eliminar un proyecto
app.delete('/deleteProject/:id', isAuthenticated, (req, res) => {
  const projectId = req.params.id;
  const userId = req.session.user.id;

  const sql = 'DELETE FROM projects WHERE id = ? AND user_id = ?';
  db.query(sql, [projectId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al eliminar el proyecto' });
    } else {
      return res.status(200).json({ message: 'Proyecto eliminado exitosamente' });
    }
  });
});



// Ruta para obtener las calificaciones de los estudiantes
app.get('/students/grades', isAdmin, (req, res) => {
  const sql = `
    SELECT u.id, u.nombre, u.cedula, u.email, u.telefono, 
           t.modulo, t.id AS task_id, e.calificacion
    FROM usuarios u
    LEFT JOIN entregas e ON u.id = e.user_id
    LEFT JOIN tasks t ON e.task_id = t.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener las calificaciones:', err);
      return res.status(500).json({ message: 'Error al obtener las calificaciones', error: err });
    }
    
    return res.status(200).json(results);
  });
});

// Ruta para actualizar las calificaciones de un estudiante
app.put('/students/:id/grades', isAdmin, (req, res) => {
  const { id } = req.params;
  const { task_id, calificacion } = req.body;

  if (calificacion < 0 || calificacion > 5) {
    return res.status(400).json({ message: 'La calificación debe estar entre 0 y 5' });
  }

  const sql = `
    UPDATE entregas
    SET calificacion = ?
    WHERE user_id = ? AND task_id = ?
  `;
  db.query(sql, [calificacion, id, task_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar las calificaciones' });
    return res.status(200).json({ message: 'Calificaciones actualizadas exitosamente' });
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
  
    process.exit();
  });
});