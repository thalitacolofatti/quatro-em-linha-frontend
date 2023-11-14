
#docker build -t image_name
# FROM nginx:stable-alpine
# COPY build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 3000
# CMD ["nginx","-g","daemon off;"]


# docker com nginx e 2 layers
# --- first layer
# FROM node:21-alpine3.17 as buildingStage

# LABEL stage="buildingStage"

# WORKDIR /app

# COPY . /app

# RUN npm install
# RUN npm run build
# RUN rm -rf node_modules

# --- second layer
# FROM nginx:stable-alpine
# COPY --from=buildingStage build /usr/share/nginx/html
# COPY --from=buildingStage nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 3000
# CMD ["nginx","-g","daemon off;"]

# SEM NGINX
# FROM node:13.12.0-alpine
# WORKDIR /app
# ENV PATH /app/node_modules/.bin:$PATH
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install --silent
# RUN npm install react-scripts@3.4.1 -g --silent
# COPY . ./
# CMD ["npm", "start"]


# bb
FROM node:21-alpine3.17

USER root

RUN \
    mkdir -p /usr/src/app/node_modules \
    mkdir -p /usr/src/app/tmp

WORKDIR /usr/src/app

COPY --chown=node:node package.json ./
COPY --chown=node:node node_modules node_modules
COPY --chown=node:node . .

RUN npm install -g npm@latest \
    npm run build && \
    chown -R node:node ./

USER node

ENTRYPOINT ["/bin/sh", "-c", "npm run server"]



# 1. Buildar imagem docker
# docker build -t quatro-em-linha-frontend-img .

# 2. Rodar container com imagem criada comunicando com porta local
# docker run --name quatro-em-linha-frontend-container -p 3000:3000 quatro-em-linha-frontend-img

# ** Rodar docker com terminal iterativo || apenas se necessário checar alguma coisa..
# docker run --rm --name teste -it testing-node-1 /bin/sh