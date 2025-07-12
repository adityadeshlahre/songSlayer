This is one my old project which needs to be rewamped there is so much shity logic which needs to be fixed currently!

let me explain you about the projects 

this websocket backed in all amount the music player but it should be based on push to qeueu based where use can send string or youtube video link that song will be played and whenever connected user pushes/adds new song to be played then it shoud added in (In-Memoery Queues) and the next song will be played when the added songs numbers comes up then FILO (First In Last Out) strucutre! as you know some codes are written already so make sure you look at that first (inside backend folder only) because will do finish the backed first bruh! also now the main part comes in which is there will be one admin which will connect with with password hence that person will have some additional permissons.

- admin can change the songs priority and can instatnly play the songs in between  stop and resume the songs currently playing up
- this whole application will be based on RoomIS and room creation logic base on that Users and Admins will be manged bro

i hope you got this application stucure and what i want to implement go the point!

Now few thins u need to take care of which are 

- Dont create and extra files 
- keep the types in a single file and export from there
- RooManager will be called admin and the users and admins handaling logic and stuff
- SongsManager will contain the songs handeling logics and stuff
- votingManager will contain songs voting and admina persmison based management logics
- Songs, Users and Admins will be based on in-memoery storage
- Songs will connected to to a ROOM and Users and a SINGLE admin
- song can be pushed by any users but can be managed only by admin on the ROOM
- Room can & will be created by ADMIN connected with password
- we are using raw websocket WS libreary so you need to take care of that

i hope you got the whole application