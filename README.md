## Setup

Install dependencies:

```
$ nvm use
$ yarn install
```

## Development

Start the development server (tweak the environment variables to your needs):

```
$ export PORT=8081
$ export D2_DOCKER_API_URL=http://localhost:5000
$ export REGISTRY_HOST=docker.eyeseetea.com
$ export DHIS2_HOST=localhost
$ yarn start
```

Or use any .env file, for example:

```
$ npx env-cmd -f .env.efh yarn start
```

Now in your browser, go to `http://localhost:8081`.

## Build app ZIP

All environment variables for `yarn start` (except for PORT) can be use on build (you can also use env-cmd wrapper):

```
$ export VAR=VALUE # Customize the build
$ yarn build
```

Folder `build/` is now ready to be deployed.
