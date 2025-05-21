# Stage 1: Build the application
FROM node:20-buster AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using legacy-peer-deps flag to handle conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build
RUN chmod +x ./node_modules/.bin/next


# Stage 2: Serve the application using a smaller image (production environment)
FROM node:20-buster AS production

# Set the working directory
WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=build /app /app

# Expose the port for the application
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

