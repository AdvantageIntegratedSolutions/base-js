var config = {
	username: "kith",
	password: "angular2.0",
	token: "dw9ziewyeardxswcy7driw4ci",
	realm: "ais",
	databaseId: "bkqdhycdy",
  async: "promise",
	tables: {
		customers: {
			dbid: "bkqdhyceg",
			rid: 3,
			name: 6,
      quickstart: {
        username: 21,
        password: 38,
        key: 39,
        name: 6,
        lastLoggedIn: 40,
        restricted: 46
      }
		}
	}
};

// var quickstartBase = new Base(config)

// quickstartBase.quickstart.register({
//   username: 'cjett@advantagequickbase.com',
//   password: 'password'
// }).then(res => {
//   console.log("Register res:", res)
// })

// quickstartBase.quickstart.forgotPassword({
//   to: 'cjett@advantagequickbase.com',
//   subject: 'QuickStart Password Reset Test',
//   callbackUrl: "https://www.google.com",
//   html: "<h1>Quickstart PW Reset Test</h1><a href='https://www.google.com'>Click here to reset your password</a>"
// }).then(res => {
//   console.log("ForgotPassword res:", res)
// })

// quickstartBase.quickstart.resetPassword({
//   sessionID: '44616e2e31783ae6d236f0eab1458f27f7876188bd2a53fb82dc3898ee3533e7',
//   newPassword: 'Aw350m3Pa55w0rd'
// }).then(res => {
//   console.log("ResetPassword res:", res)
// })