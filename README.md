# Music Api
This repo contains our project files for an API that will retain information about music and playlists.
Our API will be a music search and playlist repository. We will have a database of the music
artists, songs and genres that are featured on the various music streaming services across the
web. Users will be able to use our API to search and find which artists/songs are featured on
which music streaming service. Users will be able to create playlists of these artists and songs
on our site that potentially could be linked to the respective music service. Artists and songs will
be linked to a number of defined genres, and users will be able to browse these resources by
genre. Artists will possess description information as well as links to their individual songs.

# Endpoints

### users
- [ ] /users -- GET, POST -- List all users, add a new user
- [ ] /users/{id} -- GET, PUT, DELETE -- Show a user's info and playlists, modify, or remove that user

### playlists
- [ ] /playlists -- GET, POST -- Show all playlists, add a playlist linked to a user
- [ ] /playlists/{id} -- GET, PUT, DELETE -- Show, update, or remove a playlist

### genres
- [ ] /genres -- GET, POST -- List all genres, add a genre
- [ ] /genres/{id} -- PUT, DELETE -- Update or remove a genre
- [ ] /genres/{id}/artists -- GET -- List all artists in this genre
- [ ] /genres/{id}/albums -- GET -- List all albums in this genre

### artists
- [ ] /artists -- GET, POST -- List all artists, add an artist
- [ ] /artists/{id} -- GET, PUT, DELETE -- Show, update, or remove an artist

### songs
- [ ] /songs -- GET, POST -- List all songs, add a song
- [ ] /songs/{id} -- GET, PUT, DELETE -- Show, update, or remove a song

### albums
- [ ] /albums -- GET, POST -- List all albums, add an album
- [ ] /albums/{id} -- GET, PUT, DELETE -- Show, update, or remove an album
