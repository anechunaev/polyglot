FROM node:20-alpine as builder

ARG PORT=8080
ARG HOST='0.0.0.0'

ENV HOST=$HOST \
	PORT=$PORT \
	TERM=xterm \
	LANG=en_US.UTF-8 \
	TZ=UTC \
	NO_UPDATE_NOTIFIER=true \
	NPM_CONFIG_USERCONFIG=/tmp/.npmrc \
	NPM_CONFIG_CACHE=/tmp/npm-cache \
	NPM_CONFIG_PREFIX=/tmp/npm-global

RUN mkdir -p /usr/share/app \
	&& chown 1001:0 /usr/share/app \
	&& mkdir -p /tmp/npm-cache \
	&& mkdir -p /tmp/npm-global

WORKDIR /usr/share/app

COPY package-lock.json .
COPY package.json .
RUN npm ci --no-audit --no-fund
COPY bin ./bin
COPY config ./config
COPY static ./static
COPY src ./src

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN sh ./bin/build.sh


FROM node:20-alpine as runner

ARG PORT=8080
ARG HOST='0.0.0.0'
ARG NODE_ENV=production

ENV HOST=$HOST \
	PORT=$PORT \
	NODE_ENV=$NODE_ENV

WORKDIR /usr/share/app
RUN chown -R 1001:0 .

COPY --from=builder --chown=1001:0 /usr/share/app/bin ./bin
COPY --from=builder --chown=1001:0 /usr/share/app/dist ./dist
COPY --from=builder --chown=1001:0 /usr/share/app/static ./static

EXPOSE $PORT
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "./bin/healthcheck.sh" ]

USER 1001
ENTRYPOINT [ "sh", "./bin/start.sh" ]
