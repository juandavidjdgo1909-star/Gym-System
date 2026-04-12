# 💪 Gym System

Sistema completo de gestión para gimnasios con backend Node.js/Express y frontend HTML5.

## 📋 Características

- ✅ Autenticación de usuarios
- ✅ Gestión de membresías
- ✅ Manejo de pagos
- ✅ Suscripciones
- ✅ Sesiones de entrenamiento
- ✅ Perfiles de entrenadores
- ✅ Base de datos MongoDB
- ✅ CORS habilitado
- ✅ Frontend servido desde Express

## 🚀 Instalación y ejecución

### 1. Clonar repositorio

```bash
git clone <tu-repo>
cd gym-system
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura:

```env
MONGO_URI=mongodb://localhost:27017/gym-system
PORT=5000
JWT_SECRET=tu_secreto_jwt
```

### 4. Iniciar servidor

**Modo desarrollo (con nodemon):**

```bash
npm run dev
```

**Modo producción:**

```bash
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## 📁 Estructura del proyecto

```
gym-system/
├── client/                 # Frontend (HTML, CSS)
│   ├── index.html         # Login
│   └── css/               # Estilos Tailwind
├── src/
│   ├── config/
│   │   └── db.js          # Conexión MongoDB
│   ├── controllers/       # Controladores de rutas
│   ├── models/            # Modelos Mongoose
│   ├── routes/            # Rutas API
│   ├── services/          # Lógica de negocio
│   └── middlewares/       # Middlewares personalizados
├── index.js               # Punto de entrada (servidor)
├── package.json
└── .env                   # Variables de entorno
```

## 🔌 Rutas API

Todas las rutas están bajo el prefijo `/api`:

- **Usuarios**: `GET/POST /api/users`
- **Membresías**: `GET/POST /api/memberships`
- **Pagos**: `GET/POST /api/payments`
- **Suscripciones**: `GET/POST /api/subscriptions`
- **Sesiones de entrenamiento**: `GET/POST /api/training-sessions`
- **Perfiles de entrenadores**: `GET/POST /api/trainer-profiles`

**Verificar health check:**

```bash
curl http://localhost:5000/api/health
```

## 💡 Frontend

El frontend se sirve automáticamente en:

- **Login**: `http://localhost:5000`
- **Dashboard**: `http://localhost:5000/dashboard.html`
- **Registro**: `http://localhost:5000/register.html`

## 🔧 Configuración adicional

### CORS

Por defecto, CORS está configurado para `http://localhost:5000`.
Cambia `FRONTEND_URL` en `.env` para permitir otros orígenes.

### Base de datos

**MongoDB Local:**

```env
MONGO_URI=mongodb://localhost:27017/gym-system
```

**MongoDB Atlas (Cloud):**

```env
MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/gym-system?retryWrites=true&w=majority
```

## 📦 Dependencias principales

- **express**: Framework web
- **mongoose**: ODM para MongoDB
- **cors**: Manejo de CORS
- **bcrypt**: Hash de contraseñas
- **dotenv**: Variables de entorno

## 🐛 Solución de problemas

### "Cannot find module"

```bash
npm install
```

### Puerto 5000 en uso

Cambia el puerto en `.env`:

```env
PORT=3000
```

### MongoDB no conecta

Verifica que MongoDB esté corriendo:

```bash
mongod  # En otra terminal
```

O usa MongoDB Atlas en la nube.

## 📝 Notas de desarrollo

- Los scripts de Tailwind están configurados en `tailwind.config.js`
- El entry point es `index.js`
- Usa `npm run dev` durante desarrollo para auto-reload
- Todos los errores se registran en la consola

## 👨‍💻 Contribuciones

Para contribuir, crea un branch, haz tus cambios y crea un pull request.

## 📄 Licencia

ISC

---

**Desarrollado con ❤️ para fitness enthusiasts**
