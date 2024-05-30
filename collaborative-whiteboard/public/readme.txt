Brief description:
The collaborative whiteboard website enables multiple users to draw together in real-time on a shared canvas,
while also allowing them to communicate via chat. It provides features for managing users, drawing operations,
chat messaging, and canvas state manipulation in a collaborative environment facilitated by WebSocket communication.

Libraries Used:
Express.js API: Sets up the web server and handles HTTP requests.
Socket.IO API: Facilitates real-time bidirectional communication between clients and server.
HTML5 Canvas API: Enables drawing graphics and animations on the web page.

How the Website Works:
1. To activate the server, you need to make sure that you are in the correct folder.
2. Start by typing in your terminal: "cd collaborative-whiteboard" --> This command will open the file of the project.
3. Type in your terminal: "node server.js" --> This command will activate the server.
4. Go to your browser and type:"http://localserver:3000"
5. The local host will ask you if you want to start your session. If you press cancel, you will be redirected to the main browser. 
6. When you press "Ok", you will need to type in your desired username. If another user has the same username,
   an alert message will pop up saying that the username is already taken... make sure you have a unique username.
   N.B: Make sure that you don't have an empty username. Because in that case the local host will ask you to rewrite one.
7. After a successful login you can enjoy drawing on the white canvas and chosing your own brush color and size.

Tools:
1. Brush size,color: You can chose what's the color and size of your brush.
2. Erasor: You can erase at any moment and turn back to brush when you select.
3. Undo/Redo: In case of error, you can undo your work.The update will be shown on all screens. N.B: another user cannot undo your drawings
4. Save/Load: When you finish your work, you can save your canvas and give it a name and load it back whenever you want.
5. Clear: You can clear your whiteboard and start drawing again. N.B: when you clear your whiteboard, every user's whiteboard will be cleared too.
6. Disconnect: When you want to leave the session, press on disconnect and you will be disconnected from the session.
7. Chat: there is a chat section where you can have a live chat with all the online users.

Visibilities:
1. When a user connects/disconnects his name will appear/disappear on the top of the screen.
2. When a user is drawing his name is shown under the load button. When he stops drawing his name will disappear.