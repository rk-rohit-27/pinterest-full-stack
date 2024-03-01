var express = require('express');
var router = express.Router();
const userModel = require('./users'); // Importing user model
const postModel = require('./post'); // Importing post model
const passport = require('passport'); // Importing passport module
const localStrategy = require('passport-local'); // Importing local strategy for passport authentication
const upload = require('./multer'); // Importing multer for file uploads

// Setting up local strategy for passport authentication
passport.use(new localStrategy(userModel.authenticate()));

// Route for homepage
router.get('/', function (req, res, next) {
  res.render('index', { error: req.flash('error'), nav: false }); // Rendering index page with navigation set to false
});


// Route for registration page
router.get('/register', function (req, res, next) {
  // Rendering registration page with navigation set to false and passing error message if any
  res.render('register', { nav: false, error: req.flash('error') });
});


// Route for user profile page
router.get('/profile', isLoggedIn, async function (req, res, next) {
  // Finding user by username and populating their posts
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
  res.render('profile', { user, nav: true }); // Rendering profile page with user data and navigation set to true
});

// Route for showing posts
router.get('/show/posts', isLoggedIn, async function (req, res, next) {
  // Finding user by username and populating their posts
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
  res.render('show', { user, nav: true }); // Rendering show page with user data and navigation set to true
});

router.get("/show/posts/:post_id", isLoggedIn, async function (req, res) {
  const postId = req.params.post_id; // Extract post ID from the URL parameter
  try {
    const post = await postModel.findById(postId); // Find the post by its ID
    console.log(post.user)
    if (!post) {
      // Handle case where post is not found
      return res.status(404).send("Post not found");
    }
    res.render('pic', { post, nav: true }); // Render the 'pic' template with the found post
  } catch (error) {
    // Handle any errors that occur during the database query
    res.status(500).send("Internal Server Error");
  }
});


// Route For Edit Page
router.get('/edit', function (req, res, next) {
  res.render('edit')
})

// Route for feed page
router.get('/feed', isLoggedIn, async function (req, res, next) {
  // Finding user by username
  const user = await userModel.findOne({ username: req.session.passport.user });
  // Finding all posts and populating user data
  const posts = await postModel.find().populate("user");
  res.render("feed", { user, posts, nav: true }); // Rendering feed page with user and posts data and navigation set to true
});

// Route for adding content
router.get('/add', isLoggedIn, async function (req, res, next) {
  // Finding user by username
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render('add', { user, nav: true }); // Rendering add page with user data and navigation set to true
});

// Route for login page
router.get('/login', function (req, res, next) {
  res.render('index',); // Rendering index page
});

// Route for uploading profile picture
router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user }); // Finding user by username
  user.profileImage = req.file.filename; // Setting profile image filename
  await user.save(); // Saving user
  res.redirect('/profile'); // Redirecting to profile page
});

// Route for creating a post
router.post('/createpost', isLoggedIn, upload.single("postimage"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user }); // Finding user by username
  // Creating a new post
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  });
  user.posts.push(post._id); // Pushing post id to user's posts array
  await user.save(); // Saving user
  res.redirect('/profile'); // Redirecting to profile page
});

router.post('/register', async function (req, res, next) {
  try {
    const { fullname, username, email, password } = req.body;

    // Check if the username or email already exists in the database
    const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      req.flash('error', 'Username or email already exists. Please choose different credentials.');
      return res.redirect('/register');
    }

    // Create a new user instance
    const newUser = new userModel({ name: fullname, username, email });

    // Register the new user with passport-local strategy
    userModel.register(newUser, password, function (err, user) {
      if (err) {
        req.flash('error', 'Failed to register user.');
        return res.redirect('/register'); // Corrected redirection without passing an empty object
      }
      // Authenticate the user and redirect to the profile page
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile');
      });
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    req.flash('error', 'An error occurred during user registration.');
    res.redirect('/register');
  }
});



// Route for user login
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/', // Redirecting to homepage if login fails
  successRedirect: '/profile', // Redirecting to profile page if login is successful
  failureFlash: true
}), function (req, res, next) {
});

// Route for user logout
router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/'); // Redirecting to homepage after logout
  });
});

// Middleware function to check if user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) { // Checking if user is authenticated
    return next(); // Proceeding to next middleware if authenticated
  }
  res.redirect('/'); // Redirecting to homepage if not authenticated
}

module.exports = router;
