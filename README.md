# KanbanPro

Aplicacion de tablero Kanban con autenticacion de usuarios y persistencia en base de datos, construida con Node.js, Express y PostgreSQL.

## Tecnologias utilizadas

- Node.js con Express 5
- Handlebars como motor de vistas
- PostgreSQL como base de datos
- Sequelize como ORM
- express-session para manejo de sesiones

## Estructura del proyecto

    kanbanpro/
    ├── models/
    │   ├── index.js
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
    ├── .env
    ├── .gitignore
    ├── package.json
    └── README.md

## Modelo de datos

Un usuario puede tener muchos tableros.
Un tablero puede tener muchas listas.
Una lista puede tener muchas tarjetas.

## Instalacion

1. Instalar dependencias

    npm install

2. Configurar variables de entorno

    Crea un archivo .env en la raiz del proyecto con tus credenciales

    DB_NAME=tienda_db
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_HOST=localhost
    DB_PORT=5432

3. Poblar la base de datos

    npm run seed

4. Iniciar el servidor

    npm start

    Abre el navegador en http://localhost:3000

## Scripts disponibles

- npm start: inicia el servidor web
- npm run seed: crea las tablas y puebla la base de datos con datos de prueba
- npm run test:crud: verifica las operaciones CRUD de forma aislada

## Conceptos aplicados

- hasMany y belongsTo: relaciones uno a muchos entre los modelos
- foreignKey: clave foranea explicita en cada relacion
- as: alias necesario para el Eager Loading
- Eager Loading: consultas con include para obtener datos relacionados en una sola query
- bulkCreate: insercion de multiples registros en una sola operacion
- sync force true: elimina y recrea las tablas, solo para desarrollo

## Credenciales de prueba

    Email:    cristian@kanbanpro.com
    Password: 123456
