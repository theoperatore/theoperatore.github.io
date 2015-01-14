---
layout: post
title: Client-side authentication?! Totally
comments: false
---

Recently I've had to think about how to do a little user authenticaiton while using Firebase and Github Pages. I thought it might get kinda complicated because Github Pages only really hosts static files (hence the use of Firebase to handle persistence) and isn't too much of a "server" in the traditional sense.

It basically means that I have to handle authentication in the client.

## Firebase is awesome

If you haven't used [Firebase](https://www.firebase.com/) yet, consider checking it out. It's awesome for many reasons, but probably the coolest feature is real-time data syncing.

I'm on Device A and my friend is on Device B. My friend adds in some data to the app we are both using and I get the added data on my app as well, automatically. Slick.

It's other not-as-cool-but-still-amazing feature is client-side authentication. Need to keep track of a user and that user's permissions to operate on the database? Need to keep track of sessions across browser restart and offline status? Do you not want to handle all of this yourself?

Firebase is awesome. Let Firebase do it all for you.

## Authenticating a user

## Storing a new user

