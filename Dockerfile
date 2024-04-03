# Usamos una imagen base de Node.js
FROM node:14-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el archivo package.json e instalamos las dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto de los archivos de la aplicación
COPY . .

# Exponemos el puerto en el que la aplicación estará escuchando
EXPOSE 5000

# Comando para ejecutar la aplicación cuando el contenedor se inicia
CMD ["npm", "start"]
