# Viang Solution Website

## Overview
Viang Solution es un sitio web corporativo para una empresa de servicios profesionales de limpieza y mantenimiento en Panamá. El proyecto utiliza HTML, CSS y JavaScript para la interfaz de usuario, y Node.js para el backend que maneja el formulario de contacto.

## Características
- **Diseño Responsivo:** Compatible con todos los dispositivos, desde móviles hasta pantallas de escritorio.
- **Formulario de Contacto:** Sistema de contacto seguro con validación de datos y protección anti-spam mediante Cloudflare Turnstile.
- **Animaciones y Efectos:** Transiciones suaves y efectos visuales para mejorar la experiencia del usuario.
- **Sistema de Email:** Integración con Nodemailer para enviar automáticamente los mensajes de contacto.
- **Cliente Carousel:** Presentación dinámica de los logos de clientes.

## Tecnologías Utilizadas
- HTML5
- CSS3 con Tailwind CSS
- JavaScript (ES6+)
- Node.js y Express
- Nodemailer para el envío de emails
- Cloudflare Turnstile para protección anti-spam

## Instalación

### Requisitos previos
- Node.js (v14.0.0 o superior)
- npm (v6.0.0 o superior)

### Pasos para la instalación
1. Clona el repositorio:
   ```sh
   git clone https://github.com/sharkstar03/Viang-Solution.git
   ```

2. Navega al directorio del proyecto:
   ```sh
   cd Viang-Solution
   ```

3. Instala las dependencias:
   ```sh
   npm install
   ```

4. Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:
   ```
   # Email Configuration
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_contraseña_o_app_password
   PORT=3000

   # Cloudflare Turnstile Keys
   TURNSTILE_SECRET_KEY=tu_clave_secreta
   TURNSTILE_SITE_KEY=tu_clave_de_sitio
   ```

5. Inicia el servidor:
   ```sh
   npm start
   ```

6. Abre tu navegador y visita `http://localhost:3000`

## Estructura del Proyecto
```
viang-solution/
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── img/
│   │   ├── breadcrumb.png
│   │   ├── logo.png
│   │   └── ...
│   └── js/
│       ├── contact.js
│       └── script.js
├── .env
├── contact.html
├── index.html
├── package.json
├── README.md
└── server.js
```

## Configuración para Producción

### Opción 1: Servidor Node.js Completo
1. Sube todos los archivos a tu servidor
2. Instala las dependencias: `npm install`
3. Asegúrate de configurar correctamente el archivo `.env`
4. Inicia el servidor: `npm start` o usa PM2: `pm2 start server.js`
5. Configura un proxy inverso (como Nginx) para redirigir el tráfico al puerto de tu aplicación

### Opción 2: Frontend Estático + API Separada
1. Sube los archivos HTML, CSS, JS e imágenes a la raíz del sitio web
2. Configura el backend (server.js) para manejar solo las rutas de la API
3. Actualiza las rutas en tus archivos JS para apuntar al endpoint correcto de la API

## Características del formulario de contacto
- Validación de campos en tiempo real
- Protección anti-spam con Cloudflare Turnstile
- Notificaciones por email configurables
- Mensajes de error y éxito personalizados

## Mantenimiento
- Actualiza regularmente las dependencias con `npm update`
- Revisa periódicamente que las credenciales de email sigan siendo válidas
- Monitorea los logs del servidor para detectar posibles problemas

## Licencia
Este proyecto está licenciado bajo la Licencia MIT.

## Contacto
Para más información o consultas, por favor contacta a [vionel@viangsolution.com](mailto:vionel@viangsolution.com).