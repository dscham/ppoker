# PPoker
PPoker is a virtual planning poker implementation on NodeJS with WebSockets and vanilla JS

Current Client features are
 - Set a name
 - Join or Host
   - Host can edit Topic, Show Votes, Clear Votes
 - An editable Header for Topic
 - Card like buttons for common planning poker cards
 - Card like Votes display

 - Easy setup (clone, npm install and npm start from root [Tested with nvm LTS version 12.16.3 and Heroku])

Current Server features are
 - Hosts the frontend and runs the backend
 - Controls the App state (Users, Votes, Connections, Topic)
 - User/Connection mapping kept in memory
 - Reject join if User.name is already connected (Usernames are unique)
 - set PORT in ENV to set the App Port
 

Demo: https://dscham-ppoker.herokuapp.com/ (free Dyno, so it's not always available maybe)
 
Planned features can be found in https://github.com/dscham/ppoker/projects/1.

Feel free to contact me if you want to contribute. ☺

## Disclaimer
I don't guarantee security of the app at this point. It's meant to be used internally anyway.
