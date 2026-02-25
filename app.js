// importaciones
const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// motor de vistas
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/layouts'));

// le decimos cual es el layout principal
const hbsEngine = require('hbs');
hbsEngine.__express = hbsEngine.__express;
app.set('view options', { layout: 'layouts/layout' });

// helper para comparar dos valores en las vistas
hbs.registerHelper('eq', (a, b) => a === b);

// middlewares
app.use(express.static(path.join(__dirname, 'public'))); // sirve el css, imagenes, etc
app.use(express.urlencoded({ extended: false })); // para leer los datos del formulario

// configuracion de sesiones
app.use(session({
  secret: 'kanbanpro-secret', // palabra secreta para firmar la cookie
  resave: false,              // no guardar la sesion si no cambio nada
  saveUninitialized: false    // no crear sesion hasta que haya algo que guardar
}));

// ruta del archivo de datos
const DATA_PATH = path.join(__dirname, 'data.json');
const USERS_PATH = path.join(__dirname, 'users.json');

// funcion para leer y parsear el json de datos
function leerDatos() {
  const contenidoString = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(contenidoString);
}

// funcion para leer y parsear el json de usuarios
function leerUsuarios() {
  const contenidoString = fs.readFileSync(USERS_PATH, 'utf-8');
  return JSON.parse(contenidoString);
}

// middleware que verifica si hay sesion activa
// si no hay sesion, manda al login
function verificarSesion(req, res, next) {
  if (req.session.usuario) {
    next(); // hay sesion, puede continuar
  } else {
    res.redirect('/login'); // no hay sesion, al login
  }
}

// pagina de inicio
app.get('/', (req, res) => {
  res.render('home');
});

// pagina de registro
app.get('/register', (req, res) => {
  res.render('register');
});

// pagina de login
app.get('/login', (req, res) => {
  res.render('login');
});

// dashboard - protegido, solo entra si hay sesion activa
app.get('/dashboard', verificarSesion, (req, res) => {
  const datos = leerDatos();
  // pasamos tambien el usuario de la sesion para mostrarlo en la vista
  res.render('dashboard', { ...datos, usuario: req.session.usuario });
});

// recibe el formulario de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // buscamos el usuario en users.json
  const { usuarios } = leerUsuarios();
  const usuarioEncontrado = usuarios.find(u => u.email === email);

  // si no existe el email
  if (!usuarioEncontrado) {
    return res.render('login', { error: 'El email no está registrado' });
  }

  // si la contraseña no coincide
  if (usuarioEncontrado.password !== password) {
    return res.render('login', { error: 'Contraseña incorrecta' });
  }

  // todo bien, guardamos el usuario en la sesion y vamos al dashboard
  req.session.usuario = {
    id: usuarioEncontrado.id,
    nombre: usuarioEncontrado.nombre,
    email: usuarioEncontrado.email
  };

  res.redirect('/dashboard');
});

// recibe el formulario de registro
app.post('/register', (req, res) => {
  const { nombre, email, password } = req.body;

  // leer usuarios actuales
  const datos = leerUsuarios();

  // verificar que el email no exista ya
  const emailExiste = datos.usuarios.find(u => u.email === email);

  if (emailExiste) {
    return res.render('register', { error: 'Ese email ya está registrado' });
  }

  // crear el nuevo usuario
  const nuevoUsuario = {
    id: 'u-' + Date.now(),
    nombre: nombre,
    email: email,
    password: password
  };

  // agregar al array y guardar
  datos.usuarios.push(nuevoUsuario);
  fs.writeFileSync(USERS_PATH, JSON.stringify(datos, null, 2), 'utf-8');

  // iniciar sesion automaticamente con el nuevo usuario
  req.session.usuario = {
    id: nuevoUsuario.id,
    nombre: nuevoUsuario.nombre,
    email: nuevoUsuario.email
  };

  // ir al dashboard
  res.redirect('/dashboard');
});

// cerrar sesion
app.get('/logout', (req, res) => {
  req.session.destroy(); // borramos la sesion
  res.redirect('/login');
});

// muestra el formulario de edicion pre-llenado
app.get('/editar-tarjeta/:id', verificarSesion, (req, res) => {
  const { id } = req.params; // el id viene en la URL: /editar-tarjeta/t-123
  const datos = leerDatos();

  // buscar la tarjeta en todas las listas
  let tarjetaEncontrada = null;
  for (const lista of datos.listas) {
    const tarjeta = lista.tarjetas.find(t => t.id === id);
    if (tarjeta) {
      tarjetaEncontrada = tarjeta;
      break;
    }
  }

  // si no existe redirigir al dashboard
  if (!tarjetaEncontrada) {
    return res.redirect('/dashboard');
  }

  res.render('editar-tarjeta', { tarjeta: tarjetaEncontrada });
});

// recibe el formulario de edicion y actualiza la tarjeta
app.post('/editar-tarjeta', verificarSesion, (req, res) => {
  const { id, titulo, descripcion, prioridad, tag, estado, fecha_inicio, fecha_fin, autor, responsable } = req.body;

  const datos = leerDatos();

  // buscar en que lista esta la tarjeta y reemplazarla
  for (const lista of datos.listas) {
    const index = lista.tarjetas.findIndex(t => t.id === id);

    if (index !== -1) {
      // guardar la fecha de creacion original
      const fechaCreacion = lista.tarjetas[index].fecha_creacion;

      // si cambio de estado, moverla a la lista correcta
      if (lista.estado !== estado) {
        // sacar la tarjeta de la lista actual
        lista.tarjetas.splice(index, 1);

        // meterla en la lista nueva
        const listaDestino = datos.listas.find(l => l.estado === estado);
        if (listaDestino) {
          listaDestino.tarjetas.push({
            id, titulo, descripcion, prioridad, tag, estado,
            fecha_creacion: fechaCreacion,
            fecha_inicio: fecha_inicio || '',
            fecha_fin: fecha_fin || '',
            autor, responsable
          });
        }
      } else {
        // mismo estado, solo actualizamos los datos
        lista.tarjetas[index] = {
          id, titulo, descripcion, prioridad, tag, estado,
          fecha_creacion: fechaCreacion,
          fecha_inicio: fecha_inicio || '',
          fecha_fin: fecha_fin || '',
          autor, responsable
        };
      }
      break;
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(datos, null, 2), 'utf-8');
  res.redirect('/dashboard');
});

// recibe el formulario de nueva tarjeta
app.post('/nueva-tarjeta', (req, res) => {

  const {
    titulo,
    descripcion,
    prioridad,
    tag,
    estado,
    fecha_inicio,
    fecha_fin,
    autor,
    responsable
  } = req.body;

  // leer estado actual
  const datos = leerDatos();

  // armar la tarjeta nueva
  const nuevaTarjeta = {
    id: 't-' + Date.now(), // id unico con timestamp
    titulo: titulo,
    descripcion: descripcion || '',
    prioridad: prioridad || 'Task',
    tag: tag || 'FEATURE',
    estado: estado || 'Backlog',
    fecha_creacion: new Date().toISOString().split('T')[0], // solo la fecha, sin la hora
    fecha_inicio: fecha_inicio || '', // puede quedar vacio si recien se crea
    fecha_fin: fecha_fin || '',
    autor: autor || 'Anonimo',
    responsable: responsable || ''
  };

  // buscar la lista que corresponde segun el estado elegido
  const listaDestino = datos.listas.find(lista => lista.estado === nuevaTarjeta.estado);

  if (listaDestino) {
    listaDestino.tarjetas.push(nuevaTarjeta);
  } else {
    // si no encuentra la lista, va al backlog por defecto
    datos.listas[0].tarjetas.push(nuevaTarjeta);
  }

  // guardar el json actualizado
  fs.writeFileSync(DATA_PATH, JSON.stringify(datos, null, 2), 'utf-8');

  // volver al dashboard
  res.redirect('/dashboard');
});

// iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});