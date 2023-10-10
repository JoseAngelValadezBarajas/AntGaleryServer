const express = require('express');
const router = express.Router();
const db = require('./bd');
const { generateToken, verifyToken, hashPassword } = require('./auth');
const multer = require('multer'); 

// Configura la ubicación donde se guardarán las imágenes subidas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Aquí puedes especificar la carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = file.originalname.split('.').pop();
    cb(null, `${timestamp}.${extension}`); // Renombra la imagen con un nombre único
  },
});

// Crea una instancia de multer con la configuración de almacenamiento
const upload = multer({ storage: storage });

router.post('/api/login', (req, res) => {
  const { nombre_usuario, contrasena } = req.body;
  const usernameRegex = /^[a-zA-Z0-9_-]+$/; 
  const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\-]+$/;
  if (!usernameRegex.test(nombre_usuario) || !passwordRegex.test(contrasena)) {
    return res.status(400).json({ message: 'Nombre de usuario y/o contraseña inválidos' });
  }

  if (!nombre_usuario || !contrasena) {
    return res.status(400).json({ message: 'Nombre de usuario y contraseña son requeridos' });
  }

  const hashedPassword = hashPassword(contrasena);

  const sql = 'SELECT * FROM usuarios WHERE nombre_usuario = ? AND contrasena = ?';
  db.query(sql, [nombre_usuario, contrasena], async (err, results) => {
    if (err) {
      console.error('Error al realizar la consulta:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }


    if (results.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = results[0];

    const token = generateToken(user);

    res.json({ token });
  });
});

router.post('/api/elementos', verifyToken, (req, res) => {
  // Obtener los datos del elemento desde el cuerpo de la solicitud
  const { nombre, tipo, locacion, genero, especie, categoria } = req.body;

  // Verificar que todos los campos necesarios estén presentes
  if (!nombre || !tipo || !locacion || !genero || !especie || !categoria) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  // Crear la consulta SQL para insertar un nuevo elemento en la tabla 'elementos'
  const sql = 'INSERT INTO elementos (nombre, tipo, locacion, genero, especie, categoria) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nombre, tipo, locacion, genero, especie, categoria], (err, results) => {
    if (err) {
      console.error('Error al insertar elemento:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    res.json({ message: 'Elemento insertado correctamente' });
  });
});

router.put('/api/elementos/:id', verifyToken, (req, res) => {
  const elementoId = req.params.id;
  const { nombre, tipo, locacion, genero, especie, categoria } = req.body;

  // Verifica que todos los campos necesarios estén presentes
  if (!nombre || !tipo || !locacion || !genero || !especie || !categoria) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  // Consulta SQL para actualizar un elemento en la tabla 'elementos'
  const sql = `
    UPDATE elementos
    SET nombre = ?, tipo = ?, locacion = ?, genero = ?, especie = ?, categoria = ?
    WHERE id = ?`;

  db.query(sql, [nombre, tipo, locacion, genero, especie, categoria, elementoId], (err, result) => {
    if (err) {
      console.error('Error al actualizar el elemento:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    // Verifica si se actualizó un elemento
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Elemento no encontrado' });
    }

    // Elemento actualizado exitosamente
    res.json({ message: 'Elemento actualizado correctamente' });
  });
});

router.delete('/api/elementos/:id', verifyToken, (req, res) => {
  const elementoId = req.params.id;

  // Consulta SQL para eliminar un elemento de la tabla 'elementos'
  const sql = 'DELETE FROM elementos WHERE id = ?';

  db.query(sql, [elementoId], (err, result) => {
    if (err) {
      console.error('Error al eliminar el elemento:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    // Verifica si se eliminó un elemento
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Elemento no encontrado' });
    }

    // Elemento eliminado exitosamente
    res.json({ message: 'Elemento eliminado correctamente' });
  });
});


router.get('/api/elementos', (req, res) => {
  // Consulta SQL para seleccionar todos los elementos de la tabla 'elementos'
  const sql = 'SELECT * FROM elementos';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al recuperar elementos:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    // Devolver los resultados como respuesta
    res.json({ elementos: results });
  });
});



router.post('/api/servicioimagen', verifyToken, upload.single('imagen'), (req, res) => {
  // Obtener los datos del elemento desde el cuerpo de la solicitud
  const { nombre, tipo, locacion, genero, especie, categoria } = req.body;



  // Verificar que se ha proporcionado una imagen
  if (!req.file) {
    return res.status(400).json({ message: 'Se requiere una imagen' });
  }

  const imagen = req.file.path;

  const sql = 'INSERT INTO elementosimagen (nombre, tipo, locacion, genero, especie, categoria, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [nombre, tipo, locacion, genero, especie, categoria, imagen], (err, results) => {
    if (err) {
      console.error('Error al insertar elemento:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    res.json({ message: 'Elemento con imagen insertado correctamente' });
  });
});

router.get('/api/obtenerserviciosimagen', (req, res) => {

  const sql = 'SELECT id, nombre, tipo, locacion, genero, especie, categoria, imagen FROM elementosimagen';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al recuperar elementos:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    const elementosConImagenes = results.map((elemento) => {
      return {
        id: elemento.id,
        nombre: elemento.nombre,
        tipo: elemento.tipo,
        locacion: elemento.locacion,
        genero: elemento.genero,
        especie: elemento.especie,
        categoria: elemento.categoria,
        imagenUrl: `http://localhost:4000/${elemento.imagen}`, // Reemplaza con la ruta base de tus imágenes
      };
    });

    res.json({ elementos: elementosConImagenes });
  });
});


module.exports = router;

