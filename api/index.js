const express = require("express");
const morgan = require('morgan')
const app = express();
const cors = require('cors');
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verfiyToken =require('./utils/verifytoken')
const port = 5000;
const { Deta } = require("deta")
require('dotenv').config()
var nodemailer = require('nodemailer');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const bodyParser = require("body-parser");

const JWT_KEY =process.env.JWT

const deta = Deta(process.env.deta)
const db = deta.Base("humans")
const ep = deta.Base("episodes")
const pr = deta.Base("project")
const mo = deta.Base("moisture")
const hu = deta.Base("humidity")
const cfl = deta.Base("light")
const wa = deta.Base("water")


app.use(cors());
// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
// Morgan
app.use(morgan('tiny'))
// app.use(bodyParser)
var html = "<!DOCTYPE html>\n<html>\n    <head>\n    </head>\n <body>\n      <h1>TKMSHOW EXPRESS REST API</h1>\n  \n <h3>API ENDPOINTS</h3> <script src='https://gist.github.com/bmnidhin/2b6b06974246a2a8254061383b0ba726.js'></script></body>\n</html>";
// Home route
app.get("/", (req, res) => {
    res.send(html);
    
  });
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*'); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

    // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
  auth: {
    user: 'nidhinbm5@gmail.com',
    pass: process.env.GMAILPASS // naturally, replace both with your real credentials or an application-specific password
  }
});
const mailID = "nidhinbm.bm@gmail.com, High Techth7sub@gmail.com, krishnadasmuraleedharan007das@gmail.com, bbkaniyath@gmail.com "


app.post('/signup', function(req, res){
  const password = req.body.password
  let  hashedPassword  =  bcrypt.hashSync(password, 8);
  const username = req.body.username
  
  const key = req.body.id
  // const newUser = { key:key, username:username, password:hashedPassword}
  db.put({
     key:username, password:hashedPassword
  })
  var  token  =  jwt.sign({ id:  key }, JWT_KEY, {expiresIn:  86400});
  res.send({
    auth:  true, token:  token
});
})

app.get('/user', verfiyToken, async (req, res) => {
  const id = req.body.username;
  const user = await db.get(id);
  if (user) {
      res.json(user);
  } else {
      res.status(404).json({"message": "user not found"});
  }
});
app.get('/sendmail',async (req, res) => {




  let info = await transporter.sendMail({
    from: '"Smart Farm Alert 🚜" <nidhinbm@example.com>', // sender address
    to: "nidhinbm.bm@gmail.com, High Techth7sub@gmail.com, krishnadasmuraleedharan007das@gmail.com,bbkaniyath@gmail.com ", // list of receivers
    subject: "Critical Alert in High Tech Farm", // Subject line
    text: "Hello world?", // plain text body
    html: '<body style="font-family: sans-serif;">'+
    '	<h1>Temperature is 30C 🌡️ ❄️ 💡</h1>'+
    '	<p>Temperature is Rising, Fan is automatically turned on 🚰</p>'+
    '</body>', // html body
  });
 
  await client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     from: '+19198876246',
     to: '+918289840365'
   })
  .then(message => console.log(message.sid));
  res.status(200).send({
    id:info.messageId
})
  });

  //post routes
  app.get('/temperature/:value', async (req, res) => {
    const temp = req.params.value
    await pr.put({
      key:new Date(),
      status:true,
      temp:temp
    })
 
   if(temp >30){ //30
    let info = await transporter.sendMail({
      from: '"Smart Farm Alert 🚜" <nidhinbm@example.com>', // sender address
      to: mailID, // list of receivers
      subject: "Temperature | Critical Alert in High Tech Farm", // Subject line
      text: " 🌡️ ❄️ 💡", // plain text body
      html: '<body style="font-family: sans-serif;">'+
      '	<h1>Temperature is '+ 
       temp + 
      ' 🌡️</h1>'+
      '	<p>Temperature is Rising, Fan is automatically turned on 🚰</p>'+
      '</body>', // html body
    });
    client.messages 
      .create({ 
         body: '*Critical Alert in Temperature 🌡️*  Temperature is rising. Currently ' + temp +'. We turned fan automatically ', 
         from: 'whatsapp:+14155238886',       
         to: 'whatsapp:+918289840365' 
       }) 
      .then(message => console.log("Whatsapp "+message.sid)) 
    let ssid = Math.floor(Math.random() * 3);
      await client.messages
    .create({
       body: 'Temperature is Rising, Fan is automatically turned on 🚰',
       from: '+19198876246',
       to: '+918289840365'
     })
     .then(message => console.log("temperature SMS " + message.sid));
    
    
  console.log("Temperature Mail "+ info.messageId)
   }
    res.send(
    temp
  );
  })
  app.get('/moisture/:value', async (req, res) => {
    const temp = req.params.value
    await mo.put({
      key:new Date(),
      status:true,
      temp:temp
    })
    
    if(temp !==0){
      let info = await transporter.sendMail({
        from: '"Smart Farm Alert 🚜" <nidhinbm@example.com>', // sender address
        to: mailID, // list of receivers
        subject: "Moisture | Critical Alert in High Tech Farm", // Subject line
        text: " 🌡️ ❄️ 💡", // plain text body
        html: '<body style="font-family: sans-serif;">'+
        '	<h1>Moisture is '+ 
         temp + 
        ' 🌡️</h1>'+
        '	<p>Moisture is Rising, Pump is automatically turned on 🚰</p>'+
        '</body>', // html body
      });
 
    console.log("Moisture Mail "+ info.messageId)
    await client.messages
    .create({
       body: 'Moisture is Rising, Pump is automatically turned on 🚰',
       from: '+19198876246',
       to: '+918289840365'
     })
     .then(message => console.log("Moisture SMS " + message.sid));
    
    

     }
   
    res.send(
    temp
  );
  })
  app.get('/humidity/:value', async (req, res) => {
    const temp = req.params.value
    await hu.put({
      key:new Date(),
      status:true,
      temp:temp
    })
    if(temp >45){
      let info = await transporter.sendMail({
        from: '"Smart Farm Alert 🚜" <nidhinbm@example.com>', // sender address
        to: mailID, // list of receivers
        subject: "Humidity | Critical Alert in High Tech Farm", // Subject line
        text: " 🌡️ ❄️ 💡", // plain text body
        html: '<body style="font-family: sans-serif;">'+
        '	<h1>Humidity is '+ 
         temp + 
        ' 🌡️</h1>'+
        '	<p>Humidity is Rising, Fan is automatically turned on 🚰</p>'+
        '</body>', // html body
      });
      await client.messages
      .create({
         body: 'Humidity is Rising, Fan is automatically turned on 🚰',
         from: '+19198876246',
         to: '+918289840365'
       })
       .then(message => console.log("Humidity SMS " + message.sid));
      
      
    
    console.log("Humidity Mail "+ info.messageId)
     }
    res.send(
    temp
  );
  })
  app.get('/light/:value', async (req, res) => {
    const temp = req.params.value
    await cfl.put({
      key:new Date(),
      status:true,
      temp:temp
    })
   
    if(temp <50){
      let info = await transporter.sendMail({
        from: '"Smart Farm Alert 🚜" <nidhinbm@example.com>', // sender address
        to: mailID, // list of receivers
        subject: "Light | Critical Alert in High Tech Farm", // Subject line
        text: " 🌡️ ❄️ 💡", // plain text body
        html: '<body style="font-family: sans-serif;">'+
        '	<h1>Light is '+ 
         temp + 
        ' 🌡️</h1>'+
        '	<p>Darkness, Light is automatically turned on 🚰</p>'+
        '</body>', // html body
      });
      await client.messages
      .create({
         body: 'Darkness, Light is automatically turned on 🚰',
         from: '+19198876246',
         to: '+918289840365'
       })
       .then(message => console.log("Light SMS " + message.sid));
    console.log("Light Mail "+ info.messageId)
     }
    res.send(
    temp
  );
  })
  app.get('/water/:value', async (req, res) => {
    const temp = req.params.value
    await wa.put({
      key:new Date(),
      status:true,
      temp:temp
    })
    if(temp >40){
      let info = await transporter.sendMail({
        from: '"Smart Farm Alert 🚜" <nidhinbm@example.com>', // sender address
        to: mailID, // list of receivers
        subject: "Water | Critical Alert in High Tech Farm", // Subject line
        text: " 🌡️ ❄️ 💡", // plain text body
        html: '<body style="font-family: sans-serif;">'+
        '	<h1>Water Content is '+ 
         temp + 
        ' 🌡️</h1>'+
        '	<p>Low Water, Pump is automatically turned on 🚰</p>'+
        '</body>', // html body
      });
      let ssid = Math.floor(Math.random() * 3);
     
        await client.messages
      .create({
         body: 'Low Water, Pump is automatically turned on 🚰',
         from: '+19198876246',
         to: '+918289840365'
       })
       .then(message => console.log("temperature SMS " + message.sid));
  
    console.log("Moisture Mail "+ info.messageId)
     }
    res.send(
    temp
  );
  })
  
//get routes
  app.get('/temperature', async (req, res, next) => {
 
    const temperature = await pr.fetch({"status":true}).next()
    
    if (temperature) {
        res.json(
          temperature
          );
    } else {
        res.status(404).json({"message": "user not found"});
    }
  });
  
  app.get('/humidity', async (req, res, next) => {
 
    const humidity = await hu.fetch({"status":true}).next();
    
    if (humidity) {
        res.json(
          
          humidity
          
        
        );
    } else {
        res.status(404).json({"message": "user not found"});
    }
  });
  app.get('/moisture', async (req, res, next) => {
 
    const moisture = await mo.fetch({"status":true}).next();
    
    if (moisture) {
        res.json(
         
         moisture
          
        
        );
    } else {
        res.status(404).json({"message": "user not found"});
    }
  });
  app.get('/light', async (req, res, next) => {
 
    const light = await cfl.fetch({"status":true}).next();
    
    if (light) {
        res.json(
          
         light
          
        
        );
    } else {
        res.status(404).json({"message": "user not found"});
    }
  });
  app.get('/water', async (req, res, next) => {
 
    const water = await wa.fetch({"status":true}).next();
    
    if (water) {
        res.json(
        
         water
          
        
        );
    } else {
        res.status(404).json({"message": "user not found"});
    }
  });
app.post('/login', async (req, res) => {
  const id = req.body.username;
  const user = await db.get(id);
  if (!user) {
   res.status(404).send('User not found');
  } 
  else {
    var  passwordisValid  =  bcrypt.compareSync(req.body.password, user.password);
    if (!passwordisValid) {
      return  res.status(401).send({
          auth:  false,
          token:  null
      })
  }

  var  token  =  jwt.sign({ id:  user.id }, JWT_KEY, {
      expiresIn:  86400
  });
  res.status(200).send({
      auth:  true,
      user: req.body.username,
      token:  token
  })
  }
  
});


// Listen on port 5000
app.listen(port, () => {
  console.log(`Server is booming on port 5000
Visit http://localhost:5000`);
});

function slugify(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

