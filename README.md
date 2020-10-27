

start:
npm run start

npm run build
npm run serverstart

to toggle between server and local:
1>update /src/state/environment to local/server
2>update ts.js :: new WebSocket("ws://" OR new WebSocket("wss://"

localhost:8080
http://localhost:8080/?id=10210327194683735
http://localhost:8080/?id=681734469306879




dev blog:
17 sept:
##for message exchange search for 'invite' or 'challenge'
22 sept:
##mmr: matchmakingroom

##---------- matchmakingroom
allocate(player with no game room sends invite or challenge),
admit(player accepted invite/challenge),
remove(player got disconnected, player clicked leave),
deallocate(all players have left, mmr has progressed, timeout has expired),
evolve(all players are ready)

##---------- UI(from server):
mmr update(player changes troop configuration),
removal from mmr (player clicks leave button or gets disconnected),
admit to mmr: (if got admitted to a mmr)
nack : (challenge acceptance and invite acceptance, message: no room)

##---------- Backend(from UI):
invite/challenge: check and allocate if needed.
invite ack / challenge ack: check sender team and check availability accordingly and admit if possible. send appropriate response.

##---------------------big lake

ready: update mmr state. if everyone is ready then progress.
leave: remove player. update stats. if no playres, then deallocate.

##---------- Server Timer:
set timer and at tick, send update(#) for each mmr, to its players.

##---------- constraints:
match making room will progress if all players are ready.
Once the mmr is in progress the playrs can not leave.
Once the mmr is allocated, there is a countdown of 2 mins to progress. After that all players will be removed and mmr deallocated.

3 October
##add required fields in DB
##rest api to calculate new leaderboard
##logic to calculate leaderboard and reset data
##update db at the end of each match
##send leaderboard data to user on page load
##ui changes to display leaderboard

persistant chat list
onuser page load, send latest chat list.
send total online user count to user on login.

24 october 2020
##update result page to display result for 10 players.
##always some bot or other is selected.
##timer reset selection to hero
bots carry player name
##towers remove name
marker for player bots and selected bot
##update default bot selection to 2 archer and 2 swordsman.
onselection, remove time out. Incase no bot is selected, select hero.
Update logic for audio
reduce tower size and tower life bar size.
balance gameplay




