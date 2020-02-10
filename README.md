

start:
npm run start

to toggle between server and local:
1>update /src/state/environment to local/server
2>update ts.js :: new WebSocket("ws://" OR new WebSocket("wss://"

localhost:8080