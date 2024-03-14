const express = require('express')
const parser = require('body-parser')
const session = require('express-session')
const app = express()
app.use(parser.json())
app.use(session({
  secret: 'someSecretKey',
  resave: false,
  saveUninitialized: false
}));
const port = 3001

const USERS = [];

const QUESTIONS = [{
    title: "Two states",
    description: "Given an array , return the maximum of the array?",
    testCases: [{
        input: "[1,2,3,4,5]",
        output: "5"
    }]
}];
function isAuthenticated(req,res,next){
  if(req.session && req.session.email){
    next();
  }
  else{
    res.status(400).send('Kindly login!');
  }
}
function isAdmin(req,res,next){
  if(req.session && req.session.email=='admin'){
    next();
  }
  else{
    res.status(400).send('Only accessible by admin!');
  }
}

const SUBMISSION = [];

app.post('/signup', function(req, res) {
  try 
  {
    if(req.body.email!==undefined){
      const email = req.body.email;
    const password = req.body.password;
      req.session.email = email;
    if(!(USERS.some(user=>user.email === email))){
    USERS.push({email,password});
    res.status(200).send(`${email} added!`)
  }
  else{
    res.send('User Exists!')
  }
  }
  else{
    res.send('Fill the fields.')
  }
    }
     catch (error) {
    res.status(404).send(`Error: ${error}`)
  }
  
})

app.post('/login', function(req, res) {
  // Add logic to decode body
  // body should have email and password
  try {
    const email = req.body.email
  const password = req.body.password
  if(USERS.some(user=>user.email===email && user.password===password)){
    token = "thisIsAValidToken!!!"
    req.session.email = req.body.email;
    res.status(200).send(`You have successfully logged in! Here is your token: ${token}`)
  }
  else if(USERS.some(user=>user.email===email && user.password!==password)){
    res.status(401).send('Incorrect password! Try again')
  }
  else{
    res.status(401).send("User doesn't exist. Please sign up!")
  }
  } catch (error) {
    res.status(404).send(`Error: ${error}`)
  }
})

app.get('/questions',isAuthenticated, function(req, res) {
  res.status(200).json(QUESTIONS)
})

app.get("/submissions",isAuthenticated, function(req, res) {
   res.status(200).json(SUBMISSION)
});
app.get('/getUsersList',isAdmin,(req,res)=>{
 res.status(200).send(USERS);
});

app.post("/submissions",isAuthenticated, function(req, res) {
   if(req && req.body){
    const submissions = req.body.submissions
    const rand = Math.random()*10
    if(rand>5){
      SUBMISSION.push(submissions)
      res.status(200).send('Your submission got accepted!')
    }
   else{
    res.status(404).send('Your submission got rejected! Try again')
   }
  }
});


app.post('/newquestions',isAdmin,(req,res)=>{
try {
    const [{title,description,testCases:[{input,output}]}] = req.body;
    QUESTIONS.push({title,description,testCases:{input,output}});
    res.status(200).send('Question added successfully!');
  } catch (error) {
  res.status(400).send(`Error: ${error}`);
}

});

app.listen(port, function() {
  console.log(`Example app listening on port ${port}`)
})