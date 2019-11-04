const express = require('express');  // Importing express dependencies

const fetch = require('node-fetch'); // Importing node-fetch dependencies

const redis  = require('redis'); // Importing redis dependencies

const port = process.env.port || 3000; // Intializing port number 3000 for our application.

const redisport = process.env.redisport || 6379; // Intializing the redis port as 6379 for our application.

const client = redis.createClient(redisport); // Configuring client here.

const app = express(); // Creating express function

app.listen(3000,() =>{ // Listening the port
    console.log(`App listening on port ${port}`); // Printing on console that Application is listening on specified port.
})

app.get('/repos/:username', cache, getRepos); // Configuring route here.

// We will create Cache Middleware function below:


async function getRepos(req, res, next) {
  try {
    console.log('We are fetching the data here....'); // We are printing so as to make sure that it is fetching data from API

    const {username} = req.params;  // This will fetch the  username and store in a variable.
    
    const response = await fetch(`https://api.github.com/users/${username}`); // We will be making fetch request here.

    const data = await response.json(); // Store the response received in data variable.

    const public_repos = data.public_repos; // Creating a variable called public repos.


    //  Add this to Cache

    client.setex(username, 3500, public_repos);

    res.send(setResponse(username, public_repos)); // We are sending the data which is coming from API.


  } catch (err) {

    console.log(err); // This will print the error that will occur if any.
    
  }
}

function setResponse(username, public_repos) 
{
	return `<h2>${username} has ${public_repos} Github Repositories</h2>`; // Returing the template as required
}

// Creating a custom function for Cache

function cache(req,res,next)
{
	const {username} = req.params; // Fetching the username here.

    client.get(username,(err,data) =>{

        if(err) throw err; // We will check for error here.

        if(data !== null)
        {
           res.send(setResponse(username,data)); // We are sending the cache here
        }
        else{
            next(); // next middleware function.
        }

    });
}


