require('dotenv').load({silent: true});
var express = require('express'),
    app = express();

var oauth2 = require('simple-oauth2')({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  site: 'https://opendata.socrata.com',
  tokenPath: '/oauth/access_token',
  authorizationPath: '/oauth/authorize'
});

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'https://crforsocrata.herokuapp.com/callback',
  scope: 'notifications',
  state: '3(#0/!~'
});

// Initial page redirecting to Github
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', function (req, res) {
  var code = req.query.code;

  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'https://crforsocrata.herokuapp.com/callback'
  }, saveToken);

  function saveToken(error, result) {
    try {if (error) { console.log('Access Token Error', error.message); }

    result.expires_in = 2592000; // 30 days in seconds

    token = OAuth2.AccessToken.create(result);
        } catch (e) {
          console.log('something is wrong in save token');   
        }
  };
});

app.get('/', function (req, res) {
  res.send('Hello<br><a href="/auth">Log in with Socrata</a>');
});

app.listen(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 5000);

console.log('Express server started on port 5000');