// const User = require('./server_modules/mongo')

const port = 8000;
const express = require('express');
const app = express();
const util = require('util');
const bodyParser = require('body-parser'); // <----- Required for Passport (but not mentioned in the docs)
const session = require('express-session'); // <----- Required to keep the session info in a cookie

const passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

var users = [
	{ id: "1",
		username: "jer",
		password: "toto"
	},
	{ id: "2",
		username: "joe",
		password: "moon"
	},
	{ id: "3",
		username: "mike",
		googleId: "123456789"
	}
]

User = {
	find: (username, password) => {
		return users.find((user) => {
			return user.username === username && user.password === password
		})
	},

	findById: (id) => {
		return users.find((user) => {
			return user.id === id
		})
	},

	findOrCreate: (googleId) => {
		let user = users.find((user) => {
			return user.googleId === googleId
		})

		if (user) {
			return user;
		} else {
			user = {
				id: "4568979",
				googleId: googleId
			}
			users.push(user);
			return user;
		}
	}
}


// Required with sessions

passport.serializeUser(function (user, done) {
	console.log("serializeUser")
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {

	/* MONGO
	User.findById(id, function (err, user) {
		console.log("deserialized user", user)
		done(err, user);
	});
	*/

	let user = User.findById(id)
	console.log("deserialized user", user)
	done(false, user || false)

});

passport.authenticationMiddleware = () => {
	return (req, res, next) => {
		if (req.isAuthenticated()) {
			console.info("Auth middleware : authorised :)  ~~~~~~~~")
			return next()
		}
		console.error("Auth middleware : not auth! ~~~~~~~~~~")
		res.redirect('/login')
	}
}

app
	.use(express.static(__dirname))
	.use(bodyParser.urlencoded({ extended: false })) // <----- Required for Passport (but not mentioned in the docs)
	.use(session({  // Enabling Express sessions via browser cookie
		secret: '1234567890QWERTY'
	}))
	.use(passport.initialize()) // <---------------- Don't forget this!!
	.use(passport.session()) // Place this AFTER express session()


app
	.get('/login', (req, res) => {
		console.log((new Date()).toString().substr(16, 8) + " - Hit GET login route ")
		res.sendFile(__dirname + '/login.html')
	})
	.get('/logout', (req, res) => {
		req.logout();
		res.redirect('/loggedOut');
	})
	.get('/badLogin', (req, res) => res.send('<h1>Wrong credentials!</h1>'))
	.get('/loggedOut', (req, res) => {
		res.sendFile(__dirname + '/loggedOut.html')
	})
	.get('/secret',
		passport.authenticationMiddleware(),
		(req, res) => {
			console.log("Should not see me unless logged in")
			res.sendFile(__dirname + '/secret.html')
		})

app.listen(port, () => {
	console.log("App listening on port " + port)
})



// ------------------- LOGIN WITH PASSWORD ------------------------

passport.use(new LocalStrategy( // Reminder : LocalStrategy = require('passport-local').Strategy
	(username, password, done) => {

		console.log("Username and password : ", username, password)

		let user = User.find(username, password)
		done(false, user || false)

		/* MONGO

		User.findOne({ username: username, password: password }, (err, user) => {
			if (err) { return done(err); }

			if (!user) {
				console.log("LocalStrategy : Incorrect username or password.")
				return done(null, false, { message: 'Incorrect username or password.' });
			}
			console.log('Correct login :)')
			return done(null, user);
		});

		*/
	}
));


app.post('/login', passport.authenticate('local', {
		successRedirect: '/secret',
		failureRedirect: '/badLogin'
	}));

/* Alternatively
	app.post('/login',
		passport.authenticate('local'),
		(req, res) => {
			// If this function gets called, authentication was successful.
			// `req.user` contains the authenticated user.

			console.log("Login successful!", req.user)
			res.redirect('/secret');
		});


*/
