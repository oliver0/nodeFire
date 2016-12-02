var app = angular.module("sampleApp", ["firebase"]);
app.controller("SampleCtrl", function($firebaseAuth, $http) {
  var auth = $firebaseAuth();
  var self = this;

  self.newUser = {};
  self.currentUser = {};

  // This code runs whenever the user logs in
  self.logIn = function(){
    auth.$signInWithPopup("google").then(function(firebaseUser) {
      console.log("Firebase Authenticated as: ", firebaseUser.user.displayName);
    }).catch(function(error) {
      console.log("Authentication failed: ", error);
    });
  };

  // This code runs whenever the user changes authentication states
  // e.g. whevenever the user logs in or logs out
  // this is where we put most of our logic so that we don't duplicate
  // the same things in the login and the logout code
  auth.$onAuthStateChanged(function(firebaseUser){
    self.currentUser = firebaseUser;
    console.log("firebase user: ", self.currentUser);
    // firebaseUser will be null if not logged in
    if(firebaseUser) {
      // This is where we make our call to our server
      firebaseUser.getToken().then(function(idToken){
        $http({
          method: 'GET',
          url: '/privateData',
          headers: {
            id_token: idToken
          }
        }).then(function(response){
          self.secretData = response.data;
        });
      });
    } else {
      console.log('Not logged in or not authorized.');
      self.secretData = [];
    }

  });

  self.addUser = function() {
    if(self.currentUser) {
      // This is where we make our call to our server
      self.currentUser.getToken().then(function(idToken){
        $http({
          method: 'GET',
          url: '/privateData',
          headers: {
            id_token: idToken
          }
        }).then(function(response){
          self.secretData = response.data;
          console.log(self.secretData)
        });
      });
    } else {
      console.log('Not logged in or not authorized.');
      self.secretData = [];
    }

    console.log('clicked');
    console.log(self.newUser);
    $http.post({
      method: 'POST',
      url: '/privateData',
      data: self.newUser
    })
      .then(function(response) {
        console.log('New User post successful!')
      })
  }

  // This code runs when the user logs out
  self.logOut = function(){
    auth.$signOut().then(function(){
      console.log('Logging the user out!');
    });
  };
});
