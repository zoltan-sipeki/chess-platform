
# Chess Platform  

This is the first "real" web application that I've ever built. I wrote it as part of my thesis. You can check out the full application [here](https://chessplatform.net).

In the next sections I'll be giving you an overview of
- what my goals were in making the app and what its main features are,  
- what technology stack I used,  
- how the whole system was built,
- how scalable the system is and what possible solutions there may be to make it more so,  
- what further improvements could be made to make the application better.  

## Table of contents  
1. [Introduction](#user-content-introduction)
2. [Features](#user-content-features)
3. [Technology stack](#user-content-technology-stack)
4. [Client/server architecture](#user-content-clientserver-architecture)
    - [The rationale behind the design](#user-content-the-rationale-behind-the-architecture)  
5. [Scalability](#user-content-scalability)  
6. [Further improvements](#user-content-further-improvements)

## Introduction  
My goal in developing the application was to create a "gaming platform" with the following features:  
- It must support a multiplayer game where players can play against each other in a competitive and non-competitive way.   
- To further the competitive aspect:  
    - it must have a system that can evaluate the skill level of players.  
    - it must have an automated system that enables players to play against people of a similar skill level in a fair way.  
- Players must be able to play with their friends.  
- To facilitate learning, players must be able to rewatch and analyze their previous games.  
- It must have a leaderboard to allow players to compare themselves to the other players.  

A lot of e-sport games have very similar features ([DotA 2](https://www.dota2.com/home), [League of Legends](https://www.leagueoflegends.com) etc.). The project was heavily inspired by them.  
Since it would have been completely unreasonable for me to develop another e-sport game alongside the aforementioned features, I decided to implement chess as the basis for the platform: it is relatively easy to implement and because chess is just as competitive, the above features can be very easily applied to it.  

The platform is not meant to be a competitor to sites such as chess.com (it is far from it). Making it was a very good learning experience for me, though.  

## Features  
- User authentication. The site is usable by registered users only.  
- Password reset.  
- The game of chess with all the rules implemented. Draws are simplified compared to the standard rules.  
- Automated matchmaking queues for both competitive (ranked) and non-competitive (unranked) games.  
- The above queues use the [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system) to match players and evaluate their skill levels.  
- Leaderboard. It's based on the ranked, public MMR/Elo rating of the players (MMR - matchmaking rating). (The unranked MMR is hidden from the players, only the system uses it to find players in the non-competitive queue.)  
- Match replays.  
- If a player has been disconnected or closed the app, they can reconnect to their ongoing game.  
- Friend system: users can send, accept and reject friend requests or can remove (but not block) friends.  
- Notifications.
- Friends can invite each other to play together.  
- Real-time chat:  
    - Friends can chat with each other.  
    - It supports emojis and user statuses (online, offline, away, in-game, looking for match).  
    - It notifies you if your partner is currently typing.  
    - Chat history.  
    - Unread messages are highlighted.  
- User profiles:  
    - The time you registered, what was the last time you were online, ranked MMR etc.  
    - Game statistics: how many games you have played of each type in total (ranked, unranked, both added together), how many of them have been wins, losses or draws. Win ratio.  
    - Filterable friend list and match history.  
    - Profiles can be looked up by usernames.
- User settings:  
    - You can change your username, avatar, password and e-mail address.  
    - You can also change who can see your profile: everybody, only you or only your friends.  
    - Accounts can be deleted permanently.

## Technology stack  
The technologies I used:  

**Client-side:**  
- [React.js](https://reactjs.org)
- [Bootstrap](https://getbootstrap.com)  
  
**Server-side:**  
- [Node.js](https://nodejs.org/en) / [Express](https://expressjs.com)  
- [MariaDB](https://mariadb.org)  
- [Redis](https://redis.io)  

## Client/server architecture  
The architecture is illustrated by the following figure:  
![server_architecture766111 drawio](https://user-images.githubusercontent.com/74462634/183291608-4cd20ee9-cb1d-4ca3-81e0-f0176e7fcd3b.png)

The platform is split up into the following 3 application and 2 auxiliary servers:  
- Application servers:  
    - the API server (HTTP server)  
    - the chat server (websocket server)
    - the chess/game server (websocket server)  
- Auxiliary servers:  
    - the frontend server (HTTP server)  
    - the file server (HTTP server)  

The application servers connect to a single MariaDB and a single Redis instance. MariaDB is the main database, while Redis is used for sessions, caching and as a message broker between the application servers. (Caching at this point in development could be considered premature optimization (I haven't had the opportunity to do performance tests). Even so, now I have an idea as to how I would do it in the future should the need arise, which means it wasn't a complete waist of time.)  

A reverse proxy / load balancer sits between the browser and the servers. The browser only communicates with the load balancer. Since the client is an [SPA](https://en.wikipedia.org/wiki/Single-page_application) (single page application), it uses AJAX to make HTTP requests. The data format used is JSON. The load balancer forwards incoming request to the corresponding application server based on the route prefix of the request:  
- if the route starts with /api, the request goes to the API server,
- if the route starts with /chat, the request goes to the chat server, 
- if the route starts with /chess, the request goes to the chess server.  
- and finally, if the route doesn't match any of the above, the request is forwarded to the frontend server.  

**Tasks of the API server:**  
- user authentication, registration, password reset  
- sends e-mail verifications  
- handles user settings  
- account deletion  
- handles friend requests  
- sends data for dynamic content (e.g.: leaderboard, profile pages etc.)  
- push notifications ([SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) - server-sent events) to friends (e.g.: a friend of yours has changed his name, avatar, whatever. The server sends you a notification of it to update your UI in real-time without having to reload the page to reflect the changes. The server also uses SSE to notify you of incoming friend requests.)  
 
**Tasks of the chat server:**  
- handles chat rooms, forwards messages to room members  
- saves chat history,  
- handles user statuses (online, offline, away, looking for match, in-game), sends notifications to friends when changes in them occur.

**Tasks of the chess server:**  
- automated Elo rating based matchmaking queues (both ranked and unranked)  
- invitation-based, private matchmaking  
- conducts multiple matches in parallel  
- saves replays  

**Tasks of the frontend server:**  
- serves static content (html, css, js, images etc.)  

**Tasks of the file server:**  
- provides file storage for the backend  
- it's not publicly available, it only exists for scalability reasons: there are files that need to be accessible to not just one but more servers. Say we'd like to host each server on separate computers. The chess server saves the replay of a match in its own file system. The API server now can't serve the replay to the client because it doesn't have a copy of the file. Having a single server handle file operations via requests for all servers solves this problem.   

Also, a communication channel had to be set up for the servers, because due to the above design, there are servers that doesn't know about events that they are supposed to know about because these events happen directly on a different server. For example, to correctly handle user statuses, the chat server is supposed to know when users enter or leave matchmaking queues, or when matches start or end. It is information only the chess server possesses. In order to let the chat server do its job, the chess server notifies the chat server of these events via the PUB/SUB system of Redis. Another example is when a user deletes their account: the API server notifies the other two servers via Redis to close all connections to the deleted user.  

   1. ### The rationale behind the architecture  
The backend of the entire application could have been written as a big monolithic server that does everything instead of splitting it up into multiple servers. The problem with this is approach is  
- **maintainability:** it would be much harder to maintain because I would have one big code base doing everything instead of having smaller ones that do only their own.
- **scalability:** if the server goes down, everything goes with it. In contrast, if each application is given its own server and if one of them, for example, crashes, it won't affect the others. E.g.: if the chat server becomes unavailable for some reason, the users can still play games or mess around on the site. Furthermore, each server can be hosted on their own computer and should the application outgrow itself in the future, one could spawn multiple instances of them on multi-core machines to further increase performance. (In its current form, I wouldn't be able to do the latter. [This is what I'll be discussing in the section Scalability.](#user-content-scalability) But this way, it would be much easier to do than with a monolithic code base.) Even if we didn't want to do this and we just wanted to host the whole app on a single multi-core system, the CPU would be utilized much better because each server would most likely be scheduled to run on a different core, unlike the monolithic version, which would always run on a single core: Node.js is single-threaded (it now supports worker threads, though, but multi-threading is not worth the effort when there are way better solutions).
- and finally, the application is basically 3 different applications integrated into one. From a logical point of view, it makes sense to give them their own servers. 

Because the backend is split up into more servers, it's a good idea to put a reverse proxy between them and the client because it hides the complexity of the backend: the client only knows about one server, which makes it easier to integrate it with the backend. Plus, if the backend at one point becomes scalable, the reverse proxy could be replaced with an actual load balancer to balance the load between multiple instances. 

## Scalability  
As I mentioned in the previous section, the application is not very scalable in its current form. I can host each server on their own computer, but I still can't run multiple instances of them without problems. The issue is that all three applications servers store some internal state in memory: the API server SSE connections, the chat server connected clients, and the chess server match states and the matchmaking queues. The problem: say we have two chat servers (A and B) and two clients (C1 and C2). Both clients connect to a different server (C1 to A, C2 to B). C1 sends a message to C2. C2 will never get the message because A can't forward it to C2 because C2 is connected to B not A.  

This is actually very easy to solve (it can be done in a few lines of code). The algorithm goes like this: if the recipient of the message is connected to me, then I forward the message. If not, I notify the other servers of the incoming message via Redis. Then, the server with the connection will send the message to the recipient. (The very same algorithm can be applied to the API server as well.)  

The chess server is a lot more complicated, though. If we have more than one server in its current form, we'll have more than one matchmaking queues of each type, which will mess up the matchmaking process in a way very similar to the chat server example above. The only difference is it can't be solved with Redis because every player needs to be in a single queue per match type for the system to be able to find matches correctly. The solution is to decouple the queuing system from the game servers and make it a separate server and have it act as a "load balancer" between the game servers. Every player queues on the same server and once a match has been found, the queue server will choose a game server to which both clients will connect directly. Only one queue server is needed because the queues are implemented as [red-black trees](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree), which scale to the moon with their logarithmic time complexities.

After all of the above have been done, we could introduce Docker and Kubernetes, which I have only a basic understanding of.

## Further improvements  
It's not going to be a complete list, these are improvements that occurred to me as I was writing this:  
- Proper error handling. This has been kind of neglected.  
- The site has compatibility issues with Safari. The site uses [shared workers](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) for handling websocket connections, which, at the time of writing this, Safari doesn't support.  
- The web design should be made more responsive. The site is pretty much unusable on phones or tablets.  
- An AI could be implemented for players to play against if they are not in the mood to play with other people.  
- A queue penalty system should also be implemented where if a player rejects a game twice in a row, they won't be able to queue for like 10 minutes. Right now, they can reject games with impunity ad infinitum, which can get very toxic very quickly.  
- It would be a good idea to add tutorials on how to use the site, on how to play chess etc. so that users wouldn't have to consult external resources: everything would be in one place within reach.  
