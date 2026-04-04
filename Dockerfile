# Use the official lightweight Node.js 18 image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Define ARGs and ENVs for DevOps features
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION

ARG DEPLOY_TIME=unknown
ENV DEPLOY_TIME=$DEPLOY_TIME

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]