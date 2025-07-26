# 🛢️ PetroDev: Plataforma Web para la Enseñanza de Python en Ingeniería Petrolera

**PetroDev** es una plataforma educativa desarrollada como parte de una tesis para optar al título de **Ingeniería Informática**. Está diseñada específicamente para apoyar el aprendizaje del lenguaje **Python** en estudiantes de **Ingeniería en Petróleo**, integrando teoría y práctica a través de un entorno web interactivo con clases explicativas y un intérprete Python en línea.

---

## 📌 Características destacadas

- 🐍 Intérprete interactivo de Python desde el navegador.
- 📘 Clases explicativas orientadas a la resolución de problemas relacionados con ingeniería petrolera.
- 🧠 Desarrollo completo con **JavaScript Vanilla**, **Node.js**, **Express**, y **MySQL (MariaDB)**.
- ✉️ Integración con la API de **Resend** para el envío de correos electrónicos.
- 🎓 Proyecto universitario para trabajo de grado.

---

## ⚙️ Requisitos previos

Antes de ejecutar PetroDev, asegúrate de cumplir con los siguientes requisitos:

1. Tener instalado **XAMPP** (para levantar Apache y MySQL).
2. Tener instalado **Node.js** y **npm**.
3. Contar con el archivo de base de datos **`petrodev.db`** (incluido en el repositorio).
4. Tener una **clave de API de Resend** para funciones de correo electrónico.
5. Tener el archivo `.env` correctamente configurado (ver más abajo).

---

## 🛠️ Instrucciones completas de instalación y uso

### 🔽 1. Clonar el repositorio

```bash
git clone https://github.com/Ericksonxd165/petrodev
cd petrodev
```


# 2. Configurar la base de datos en XAMPP
Abre XAMPP.

Asegúrate de iniciar los módulos Apache y MySQL.

Abre tu navegador y accede a: http://localhost/phpmyadmin

Crea una nueva base de datos con el nombre exacto:

```bash
petrodev

```
Con la base de datos seleccionada, ve a la pestaña Importar.

Haz clic en Seleccionar archivo y elige el archivo petrodev.db incluido en este repositorio.

Asegúrate de que el formato seleccionado sea SQL.

Haz clic en Continuar y espera a que aparezca el mensaje de importación exitosa.

# 3. Instalar las dependencias del proyecto
Desde la carpeta raíz del proyecto (donde clonaste el repositorio), ejecuta el siguiente comando:

bash
Copiar
Editar
npm install
Esto instalará todas las dependencias necesarias definidas en el archivo package.json.

# 4. Crear el archivo .env con la API Key de Resend
Accede a la carpeta src/ dentro del proyecto.

Crea un archivo llamado .env si no existe.

Dentro de ese archivo, pega la siguiente línea:

ini
Copiar
Editar
RESEND_API_KEY=tu_api_key_de_resend
Sustituye tu_api_key_de_resend por tu clave real obtenida desde https://resend.com.
Este archivo es obligatorio para que las funciones de correo electrónico funcionen correctamente.

# 5. Iniciar el servidor
Desde la carpeta src/, ejecuta:

```bash
node server.js
```

Esto pondrá en marcha el servidor web de PetroDev en el puerto 3000.
Abre tu navegador y accede a:
```bash
http://localhost:3000/
```
Allí podrás utilizar la plataforma con todas sus funcionalidades: clases, ejecución de código y sistema de correo.



