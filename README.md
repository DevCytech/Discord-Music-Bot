# Discord Music Bot (In Development!!)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/38993b63ff194025953082e584613cf9)](https://app.codacy.com/gh/DevCytech/Discord-Music-Bot?utm_source=github.com&utm_medium=referral&utm_content=DevCytech/Discord-Music-Bot&utm_campaign=Badge_Grade_Settings)

I have seen many Discord Music Bots on GitHub but most use a fancy package like discord-player, andesite, or erela.js and a few others. For this project I wanted to make a Discord Music bot based around the built in Dispatcher in discord.js. This project uses FFMPEG and opusscript with the discord.js dispatcher. This bot currently only plays from YouTube. Future Versions may include more audio sources.

## How to use this project

1. Fork or Download the project and integrate it to your code.
2. Get YouTube Data v3 Credentials to continue
    - OPTIONAL: Get soundcloud client ID and continue
3. Create a `.env` file and copy `.env.template` and fill out the required tokens
4. Install dependencies by running `npm install`
5. To start the bot run `node index.js` in a command handler

## Supported Sources

-   Spotify + Spotify Playlists
-   YouTube + YouTube Playlists
-   Soundcloud Tracks
-   mp3 - Restricted to discord

## Potential Support

-   Spotify Albums  
-   Deezer
-   Twitch
-   Vimeo
-   Apple Music
-   Bandcamp

## In Development Features

-   Filters
-   Shuffle
-   Volume Control
-   Lyrics
-   Now Playing
-   Skip to
-   Queue Looping _(Allow the queue to repeat not just the track)_
-   Previous Track _(Add the previous track to play next)_
-   Shuffle
-   Search _(Search and allow the user to pick from the songs found)_

## Author

**Discord Music Bot** DevCytech
