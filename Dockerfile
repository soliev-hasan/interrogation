FROM node:alpine AS build-stage
WORKDIR /interrogation
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY ./ .

# ARG NODE_ENV
# ENV NODE_ENV="production"

RUN npm run build

FROM nginx AS production-stage
RUN mkdir /interrogation
COPY --from=build-stage /interrogation/dist /interrogation/dist
COPY ngnix/ngnix.conf /etc/nginx/nginx.conf
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]