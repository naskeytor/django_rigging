# Usa la imagen de Node.js para construir el frontend
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el código del frontend al contenedor
COPY . .

# Instala las dependencias del proyecto
RUN npm install

# Expone el puerto en el que Vite corre por defecto
EXPOSE 5173

# Comando para iniciar el servidor de desarrollo de Vite
CMD ["npm", "run", "dev", "--", "--host"]