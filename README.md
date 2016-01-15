# user-profiles

Today we will be creating a user profiles page that tracks the current user on the back-end and displays information specific to that user. This app will serve all of our front end files, preventing the need for `live-server` or `http-server`. By the end of the project you will be comfortable using express sessions, hiding application secrets, and how to server static files from the back-end.

### Step 1: Basic setup
The basics of our `server.js` setup should be familiar to you by now, but we will be installing some new dependencies. Run an `npm init` then `npm install --save` express, express-session, body-parser, and cors. Don't forget to create a `.gitignore` file ignoring your `node_modules` folder.

* Express-session is what will allow us to track users as they navigate about the site
* CORS lets us avoid having to write custom middleware for headers

Require your dependencies and initialize express. Run the `app.use` method on `bodyParser.json()` and set the app to listen on a port of your choice. Run `nodemon server.js` and ensure everything is working so far.

___

Once everything is working we can set up the our the first of our new dependencies, CORS. The most simple usage of CORS is to simply `app.use(cors())`, this will allow cross-origin requests from any domain, across all of your endpoints. This would accomplish roughly the same thing as our custom `addHeaders` middleware from yesterday. The primary drawback to this method is the insecurity, any domain can freely make requests to our server. So we will be configuring CORS to whitelist only a specific origin.

To do this we need to create a new object in our `server.js` containing some simple configuration information. Note that you will need to replace the port number with your selected port number.
```javascript
var corsOptions = {
	origin: 'http://localhost:8999'
};
```

Now we can call `app.use(cors(corsOptions));` and we will only be accepting requests from our selected origin. It is also worth mentioning that cors doesn't have to be used globally, it can be passed to individual routes as middleware.
```javascript
app.get('/example', cors(), function( req, res ) {
	//This route is CORS enabled across all origins
});

app.get('/example-two', function( req, res ) {
	//This route is not CORS enabled
});
```
For our purposes we will be using CORS across all of our routes, so we will use the `app.use` method.
___

Next we can setup express-session. Express-session lets us create persistent sessions inside of our app so we can send our users information that is specific to them individually. Before we start using express-session we need to create a `config.js` file and require it in our server. This file should export an object containing a `sessionSecret` property with a value of a random string. This session secret is what our app uses to sign the sessions ID cookie. For security reasons **it is important to ensure that this file is added to your `.gitignore`.**

`config.js`:
```javascript
module.exports = {
	sessionSecret: 'keyboard cat'
};
```
Once your `config.js` is created and required in your `server.js` file we can now run
```javascript
app.use(session({ secret: config.sessionSecret }));
```
This will allow express-session to run on all endpoints with our chosen secret being used to track cookies.

### Step 2: Controllers, endpoints, and data
To keep our app's structure clean, let's create a new folder named `controllers` and add two files: `profileCtrl.js` and `userCtrl.js`. Require these controllers in your `server.js`, don't forget that you have to provide a file path when requiring your own files!

We'll need some data inside our controllers to check against and send to our users:
```javascript

var users = [
	{
		name: 'Preston McNeil',
		password: 'password1',
		friends: ['Lindsey Mayer', 'Terri Ruff']
	},
	{
		name: 'Ryan Rasmussen',
		password: '$akgfl#',
		friends: ['Lindsey Mayer']
	},
	{
		name: 'Terri Ruff',
		password: 'hunter2',
		friends: ['Lindsey Mayer', 'Preston McNeil']
	},
	{
		name: 'Lindsey Mayer',
		password: '777mittens777',
		friends: ['Preston McNeil', 'Ryan Rasmussen', 'Terri Ruff']
	}
];
```
```javascript

var profiles = [
	{
		name: 'Preston McNeil',
		pic: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash2/1117694_1614542_108355616_q.jpg',
		status: 'Everything is bigger in Texas'
	},
	{
		name: 'Ryan Rasmussen',
		pic: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash4/211536_7938705_80713399_q.jpg',
		status: 'RR Rules'
	},
	{
		name: 'Terri Ruff',
		pic: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash3/41368_8222994_4799_q.jpg',
		status: 'Wow, I typed out hunter2 and all you saw was ******?!?!??'
	},
	{
		name: 'Lindsey Mayer',
		pic: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash3/173210_10024969_2137324550_q.jpg',
		status: 'OMG MITTENS DID THE CUTEST THING TODAY'
	}
];
```
We'll start in `userCtrl.js`.

- Create a method on our exports object named `login`, this method should loop through the users array, find the user that matches `req.body.name` and confirm that the `req.body.password` matches the user's password.
- If we find a match we need to set `req.session.currentUser` equal to to the correct user object and `res.send({ userFound: true });`.
- If we don't find the user, we will need to `res.send({ userFound: false });`.
- This function will need an endpoint, let's create a 'POST' endpoint on the path `'/api/login'` and have it call our newly created login method.

Things to note:

- Because of our `app.use(cors(corsOptions));` we don't need to set headers inside of our login function. The CORS library is handling that for us on every request.
- We have set a property on the `req.session` equal to our user. This lets us continue to track which user is currently active.

___
On to `profileCtrl.js`

Here we will need a simple method on our exports object that pushes every profile that is in the `req.session.currentUser`'s `friends` array. Then `res.send`'s an object back containing our new array and the current user. The response object should be structured something like this:
```javascript
{
	currentUser: req.session.currentUser,
	friends: yourArrayOfFriendObjects
}
```

This function will need an accompanying endpoint in your `server.js`, so add an `app.get` endpoint with a path of `'/api/profiles'.

### Step 3: Serving static files
Now you may have noticed that there was some front-end code included with the project, but at the beginning of the project it was mentioned that we would no longer need to use `http-server` or `live-server`. We are going to send all of our static front-end files from our server.

This functionality is built into express with the `express.static()` method. All we need to do to begin sending our static files is add this line to our `server.js`.
```javascript
app.use(express.static(__dirname + '/public'));
```
What we are doing here is utilizing express' built in `static` method to server static files from the directory we pass in. `__dirname` Is built in to node, and is simply the name of the directory our server is being run from. (Try to `console.log(__dirname)` to see exactly what this is).

### Step 4: Hooking up to the front end.
Take a few minutes to browse through the current `.js` files in your public folder, you'll notice there are several areas containing `FIX ME`'s. Let's move through and set up our front end so it is actually functional!

To start, you'll notice that our `mainCtrl.js` is calling a function inside of our `friendService.js` that contains a `FIX ME`. This function should post to your `login` endpoint, sending the `user` object we recieved from our controller.

Next we will need to fix the resolve inside of our `app.js`. This resolve should return the result of our `friendService.getFriends` method sending a 'GET' request to our `/api/profiles` endpoint.

Lastly you will need to inject that resolve into your `profileCtrl.js` and assign the correct values to `$scope.currentUser` and `$scope.friends`.

___
Well done! Try logging in as several different users and seeing the different friend lists, all with very minimal front-end code. This was all done simply by tracking our user's session on the back-end.

### Step 5(Black Diamond): Make it a bit more interactive
- Allow users to add or remove friends.
- Add a settings view specific to the current user, where they can change their name or password.
=======
<img src="https://devmounta.in/img/logowhiteblue.png" width="250" align="right">

Personal API
============

##Objective
Utilize Node.js, Express to create a simple REST API

You're going to build a personal API for your own data. Although the idea might seem silly, the point of the project is to get you used to using Express to return data in an API.

#### Step 1: Build your server's core.
* Start as usual with an `npm init` command to create our `package.json`.
* Now install your dependencies. We will be using Express and body-parser. Note that you can install multiple dependencies at once with npm: `npm install express body-parser --save`.
* Require Express and body-parser and initialize your express app.
* Use body-parser's json method in an `app.use()` method.

#### Step 2: Creating controllers
In yesterday's projects you might have noticed that our `server.js` file was rapidly becoming very cluttered with our function logic. To get around this and keep a clean `server.js` we're going to create some controllers and move a significant amount of logic into those. Start by creating a `controllers` directory, inside which you will create a `middleware.js` and a `mainCtrl.js`. These are the files in which we write the bulk of our code today. We'll start in `middleware.js`.

Yesterday we had to write out headers in every single request made and sent; now we get to simplify things! Before we actually start writing our middleware we need a way to get the code from this directory to be accessible to our `server.js`. The way we do this is with `module.exports`. There are two common ways of using `module.exports`, either way will work fine, and which you choose is a matter of preference. Here is an example of each:

```javascript
var exports = module.exports = {}

exports.myFunction = function(req, res) {
  /*...*/
}

exports.anotherFunction = function(req, res) {
  /*...*/
}
```
--------

```javascript
module.exports = {
  myFunction: function(req, res) {
    /*...*/
  },

  anotherFunction: function(req, res) {
    /*...*/
  }
}
```

As you can see we are just creating an object which we will then pull into our `server.js` to have access to the methods we create inside that object. This is similar to dependency injection in Angular, just a different syntax. I'll be using the second style in this project, but as I mentioned, it is just preference and both will function the same.

Inside of our `middleware.js` controller, let's create a new function that simply adds the headers we used yesterday to a response and then moves on to the next function. This looks a lot like our requests from yesterday, but without a `res.send()`:

```javascript
module.exports = {

  addHeaders: function(req, res, next) {
    res.status(200).set({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "default-src 'self' devmountain.github.io"
    });

    next();
  }
}
```

You should also notice that we passed in a new parameter: `next`. What `next` does when invoked is simply pass the request along to the next function in line. Without `next()` or a `res.send()` our request will simply sit on our server and eventually time out. Let's head back to our `server.js` file and set up our controllers.

To have access to the code inside these controllers we will need to `require` much like we do with node modules. For these requires we need to provide a file path, which will look like this:

```javascript
var middleware = require('./controllers/middleware.js');
var mainCtrl = require('./controllers/mainCtrl.js');
```

Now we can access any methods that we put inside of our `mainCtrl` or `middleware` objects with dot notation. We'll demonstrate by setting our middleware function to be used on every request. Remember your code from setting up body-parser, we will be doing the same thing with our own custom middleware.

```javascript
app.use(middleware.addHeaders);
```

As simple as that, we no longer have to individually apply headers to every single endpoint! Remember that the `app.use()` method just applies a function to every request made before passing it on to the next function or eventually sending a response.

#### Step 3: Build read-only endpoints
* These endpoints will return data (see below)
* These endpoints should only be accessible with a GET request (read-only)
* These endpoints will call functions from your controller rather than having them declared inside of the endpoint. i.e `app.get('/name', mainCtrl.getName)` rather than `app.get('/name', function(req, res) { /*...*/});`

###### `GET /name`
- returns: Your name (e.g. Joe Sandwiches) in a JSON object:
`{ "name": "Donald Duck" }`

###### `GET /location`
- returns: Your location (e.g. Seattle, WA) in a JSON object:
`{ "location": "Timbuktu" }`

###### `GET /occupations`
- returns: Your past occupations as an array in a JSON object:
`{ "occupations": ["Thwarting Buggs Bunny", "Tomfoolery"] }`

###### `GET /occupations/latest`
- returns: The last/current job you have/had. The occupations will be stored in an array, but this method returns the last item of the array in a JSON reponse:
`{ "latestOccupation": "Tomfoolery" }`

###### `GET /hobbies`
- returns: Your hobbies (e.g. Fishing, Swimming, etc.) as an array of objects in a JSON object:
```javascript
{ hobbies: [{
    "name": "Watching cartoons",
    "type": "current"
    },
    {
    "name": "Quacking",
    "type": "past"
    }
    ]
}
```

###### `GET /hobbies/:type`
- returns: Any hobbies that match the type property specified in the request parameter

#### Step 4: Add ordering to your API
For the occupations endpoint, let's have a way for the client to get a specific ordering, alphabetized or reverse alphabetized.
* Make it so when the client requests occupations with a order query parameter, return an alphabetized list for `order=desc` and a reverse alphabetized list for `order=asc` (if your occupations endpoints are arrays of strings, you can simply use the Javascript `.sort()` and `.reverse()` methods of an array to do your sorting).

#### Step 5: Make writable endpoints
Now you're going to make some endpoints that can be added to or modified by `POST` or `PUT` requests.

###### `PUT /name`
- Changes your name

###### `PUT /location`
- Updates your current location.

###### `POST /hobbies`
- Adds to your list of hobbies.

###### `POST /occupations`
- Adds to your list of occupations.

#### Step 6: Create skills endpoint
This endpoint is going to be a bit more complicated than those you've made previously. For skills, we need to store a more complicated data structure. Here's how your skill could be structured:

```javascript
{
  "id": 1,
  "name": "Javascript",
  "experience": "Intermediate"
}
```

* In your server code, make an array that holds all of your skills. Be sure to define the array outside of the `app.get` or `app.post` methods, as it needs to persist (scope) outside of those methods and maintain its data. The array will hold 'skill' objects like the example above.
* Create the endpoint

###### `GET /skillz`
- Retrieve the list of skills

- Also, allow an 'experience' query parameter so that someone can retrieve a list of skills that match a certain level of experience, like so:

`GET /skillz?experience=Intermediate`

###### `POST /skillz`
- Add a skill to the collection of skills. For this endpoint let's create some middleware that will dynamically create IDs for us based on array length. This function will go inside of our `middleware.js` file. Because we only want to use this middleware on our skillz 'POST' endpoint we don't want to use the `app.use()` method; instead we want to pass it into our endpoint's arguments, like so:

```javascript
app.post('/skillz', middleware.generateId, mainCtrl.postSkillz);
```

If this request is timing out, make sure you didn't forget to include the `next()` call inside your middleware!

#### Step 7: Secrets
Let's create one more endpoint, somewhere we want to hide our deep dark secrets. We don't want just anyone accessing our secrets, so lets have a username and PIN parameter to make sure that *you* are _**you!**_

```javascript
app.get('/secrets/:username/:pin', /*...*/);`
```

(Note that you probably shouldn't use your actual PIN here when testing). We'll need another set of middleware to handle this function, so create a new method in your `middleware.js` named `verifyUser`. This method should check that the parameters match a username and PIN you set. If they do, pass the request on to the `next` function; otherwise, send an error message back to the user without moving to the next function.

#### Step 8 (Black Diamond): Allow for more queries/params
* Let users search your hobbies, occupations, and skills endpoints by name.
* Try to use `req.params` and `req.query` at least once each.

#### Step 9 (Black Diamond): Create a simple Angular app for your API
* In a separate directory, create an Angular application
* Using ui.router, create three routes: `/`, `/me`, and `/skills`
  * `/`: a homepage containing basic information about you (name and location)
  * `/me`: detailed information about you: hobbies and occupations
  * `/skillz`: a page to display your skills
* Create a service that handles the network requests (hint: you could create a method for each endpoint, or you could consolidate some into the same method)
* If you arrive this far, go ahead and make some text inputs and add the logic necessary to edit or add to any of the "writeable" endpoints.

## Contributions
If you see a problem or a typo, please fork, make the necessary changes, and create a pull request so we can review your changes and merge them into the master repo and branch.

## Copyright

© DevMountain LLC, 2015. Unauthorized use and/or duplication of this material without express and written permission from DevMountain, LLC is strictly prohibited. Excerpts and links may be used, provided that full and clear credit is given to DevMountain with appropriate and specific direction to the original content.

<img src="https://devmounta.in/img/logowhiteblue.png" width="250">
