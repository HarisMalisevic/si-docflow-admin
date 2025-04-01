# docflow-core

## Prerequisite - [**Node.js + npm**](https://nodejs.org/en)

## How to build?

1. Clone this repo: ```git clone https://github.com/HarisMalisevic/si-docflow-core.git```

2. After cloning is done, go into the project directory with ```cd si-dockflow-core```

3. Install npm dependencies with ```npm run dependencies```

4. Build project ```npm run build```

The previous two commands are shortcuts for longer commands. For the build command, it runs ```cd backend && npm run build && cd ../frontend && npm run build```. Other shortcuts like this one are defined in ```package.json``` files under ```"scripts"```.

## How to start?

1. After building the app, navigate to the project root folder ```/si-docflow-core```.
2. Start the web app and server with: ```npm run start```

This will make a local server on http://localhost:5000/.