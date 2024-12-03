# Node version matching the version declared in the package.json
FROM node:18-alpine

WORKDIR /app

# Copy app dependencies
COPY . .

# Install app dependencies
RUN yarn

# Build the app
RUN yarn run build

# Start the aplication
CMD ["yarn", "run", "start" ]
