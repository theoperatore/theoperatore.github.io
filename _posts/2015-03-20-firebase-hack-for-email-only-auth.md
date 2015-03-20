---
layout: post
title: Email-only Auth with Firebase?!
comments: false
---

Sometimes you want email-only authentication because it's simple. Maybe you're using Firebase and have a set up where you don't have a proper backend to facilitate creating your own secure tokens via [Firebase Custom Authentication](https://www.firebase.com/docs/web/guide/login/custom.html).

Are you out of luck? Are your hopes and dreams smashed?

**NAY!** There's a hack for that. Just repurpose Firebase's Email & Password system and you're good to go. 

### Trickery!

There are 4 parts to this hack:

1. For new users, generate a random password and create an account
2. Send an auth token in an email to the user
3. Authenticate a user with email address and auth token
4. Set the expiration of an authenticated user to be ridiculous

Time to get started!

It's no surprise that Firebase requires a password to go along with an email address...Since I'm not going to care about passwords ever, I'll generate a random one only for account creation:

{% highlight javascript %}
// temporary password times!
function generatePass() {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var pass = "";

  for (let i = 0; i < 32; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }

  return pass;
}

...

// `pass` stores "vc3-BNAbYfnA9xkreHQ4f3o94GCCUc5v";
let pass = generatePass();
{% endhighlight %}

I'll use this function to grab a random password and use the user's inputted email address to create a new account in Firebase.

*Hack req #1: done*.

Regardless of if a new user is signing up or an existing user is logging in, an email must be sent that contains an auth token.

Firebase has such a function for email sending&mdash;[Sending a Password Reset Email](https://www.firebase.com/docs/web/guide/login/password.html#section-reset-email).

Invoking the `resetPassword()` function on a Firebase reference will generate a *token* and send it via *email*.

Furthermore, Firebase allows a developer to specify what this "Reset your Password" email says (check the Login & Auth tab of your Fireabse), so changing the subject to "Complete your Log In" and appending the auth token to a url that points to your app in the body of the email works rather nicely.

Instead of using the `resetPassword()` function for its intended purpose, I'll use it to complete the log in flow and forget about passwords (good riddance). *Repurposing*!

Now any time a user needs to log in or sign up, I'll have that user enter their email address and send them an auth token via `resetPassword()`. All they have to do is click the link in the email, and the landing page the url points to will handle taking the token and resolving the authentication.

*Hack req #2: done*.

Now here is a tricky part. Unless you append the user's email address to the url as with the token (something that probably shouldn't be done), the landing page won't have any knowledge of the email address.

To alleviate this problem, I'll store the user's email address in `localStorage` temporarily when a user enters their email address into a sign-up or login form. When a user clicks on the link in their email and navigates back to my app, I'll grab the auth token from the url and the email address from `localStorage`. 

Once the user is successfully authenticated, I delete the `localStorage` item, just because it feels like the right thing to do. Don't leave that stuff hanging around!

*Hack req #3: done*.

The last part is to make Firebase trust the user's device for a ridiculously long period of time. Now I don't mean like years...but a reasonably long amount of time like 2 months. This is handled in the "Login & Auth" section of your Firebase console. The default is 24 hours, but change that to any length of time.

Once a user is successfully authenticated, they're good to go for the duration that you set.

*Hack req #4: done*.

Whoop! Firebase email-only client-side authentication! 

Mission Accomplished.

### Additions to Tom-hack-ery

There are a couple of notes and considerations to go along with this approach. 

**Can't I use the generated password to log in a new user?**

Sure you can! You could even store that password client-side if you wanted to and use it a bunch, but if the user switches devices or if the auth time is up, then a user is going to need to sign in again and you may or may not have that generated password.

Furthermore, it makes sense to me to teach your users how your log in system works. When they sign up, if they are expecting to only have to enter their email address, then that's what they're going to expect each time they log in. By making them click a link in their email you're teaching them the flow of logging into your app; even if they only have to re-log in every 2 months.

If I've learned anything from video game design (read: playing a bunch of video games), it's that you need to teach your players what to expect in unobtrusive ways. Teach your users that when they enter an email address into a form field expecting to log in and be authorized, that they should also be expecting an email to complete that authorization.

**But this makes a user automatically un-authenticated after like 2 months?**

Yep; regardless of how active the user is on your site too. I designed this hack with that goal in mind because I don't want to store anything related to authentication client-side if I don't have to&mdash;even storing the email address to finish authenticating a user is borderline bad to me.

By all means, save a user's email address and password client-side via `localStorage` and each time you detect that a user isn't authenticated (or even each time they use your app), use the saved credentials to log them in automatically. Near infinite authenticated sessions! Whoa!

I'm just of the mindset that we shouldn't be storing anything like that client-side, even if it's in a "safer" `localStorage`.

**Man, chaining these Firebase functions together gets a litle 'callback hell-esque'**

It sure does...All Firebase built-in functions are async. However, if you wrap each Firebase function in a function that returns a [Promise](http://www.html5rocks.com/en/tutorials/es6/promises/) you'll have better control over their order of execution, especially for creating a new user and sending an email since those should happen sequentially.

Creating a user with something like:

{% highlight javascript %}
// create a user
function createUser(email) {
  return new Promise((resolve, reject) => {
    let user = {};
    let pass = generatePass();

    user.email = email;
    user.password = pass;

    FirebaseRef.createUser(user, (err, payload) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(payload);
      }
    })
  })
}
{% endhighlight %}

And sending an email with:

{% highlight javascript %}
// send auth token
function sendEmail(email) {
  return new Promise((resolve, reject) => {
    let user = {};

    user.email = email;
    
    FirebaseRef.resetPassword(user, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve("Email sent successfully");
      }
    })
  })
}
{% endhighlight %}

You only want to send a `resetPassword()` email on log in or **IFF** a new user account has been successfully created. If there is an error during user account creation, bail out! and don't send the email:

{% highlight javascript %}
// now use these promises
createUser(email).then((payload) => {

  // user created! send email
  return sendEmail(email);

}).then((result) => {

  // "Email sent successfully"
  console.log(result);

}).catch((err) => {
  
  console.log("Terrible things happened!");

})
{% endhighlight %}

If something happens during account creation, the email won't be sent and execution will instead move to the `catch()` handler.

Much more manageable. Yeah Promies!

### Whew!

That's it! There's my hack to give client-side email-only authentication using Firebase.

The goal of which is to:

- prevent users from having to remember **yet another password**
- keep users distinct while maintaining an "acceptable" level of security
- provide a solution to email-only authentication without a proper back-end

Although, if you have access to any sort of server and you want email-only authentication, then you should really be using [custom authentication](https://www.firebase.com/docs/web/guide/login/custom.html) and use the built-in authentication the way it was intended to be used.

The end. Hopefully this was insightful.

Thanks for reading!