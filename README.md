KanbanPro
Aplicacion de tablero Kanban con autenticacion de usuarios, construida con Node.js, Express y PostgreSQL.
Tecnologias

Node.js
Express 5
Handlebars (HBS)
PostgreSQL
Sequelize ORM
express-session

Requisitos previos

Node.js 18 o superior
PostgreSQL instalado y corriendo
Una base de datos creada en PostgreSQL

Instalacion

Clona el repositorio

bashgit clone <url-del-repositorio>
cd kanbanpro

Instala las dependencias

bashnpm install

Crea el archivo .env en la raiz del proyecto con tus credenciales

DB_NAME=tienda_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

Pobla la base de datos con datos de prueba

bashnpm run seed

Inicia el servidor

bashnpm start

Abre el navegador en http://localhost:3000

Scripts disponibles
ComandoDescripcionnpm startInicia el servidor webnpm run seedCrea las tablas y puebla la base de datosnpm run test:crudVerifica las operaciones CRUD
Estructura del proyecto
kanbanpro/
├── models/
│   ├── index.js        # Conexion y relaciones de Sequelize
│   ├── Usuario.js
│   ├── Tablero.js
│   ├── Lista.js
│   └── Tarjeta.js
├── public/
│   └── css/
│       └── style.css
├── views/
│   ├── layouts/
│   │   └── layout.hbs
│   ├── dashboard.hbs
│   ├── editar-tarjeta.hbs
│   ├── home.hbs
│   ├── login.hbs
│   └── register.hbs
├── app.js
├── seed.js
├── test-crud.js
├── data.json
├── users.json
└── .env              # No se sube a GitHub
Modelo de datos
Usuario
  id, nombre, email, password

  tiene muchos -> Tablero

Tablero
  id, nombre, descripcion, usuarioId

  tiene muchas -> Lista

Lista
  id, nombre, estado, tableroId
  estado: Backlog | Doing | Review | Done

  tiene muchas -> Tarjeta

Tarjeta
  id, titulo, descripcion, prioridad, tag, estado
  fecha_inicio, fecha_fin, autor, responsable, listaId
Credenciales de prueba
Email:    cristian@kanbanpro.com
Password: 123456