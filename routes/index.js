var express = require('express');
const path = require('path')
const bodyParser = require('body-parser')
const https = require('https')
const axios = require('axios');
const { collection, WeatherData } = require('../config');
const { use } = require('../app');


var router = express.Router();
router.use(express.json());
router.use(bodyParser.urlencoded({extended:true}))


router.get('/', function(req,res){
    res.render("signin",{ message: '' })

});

router.get('/Weather', function(req,res){
    const username = req.query.username;
    console.log(username)
    res.render(path.join(__dirname, '..','/views/index'),{username: username});
});

router.post('/getWeather', function(req,res){
    const time = new Date()
    console.log(req.body)
    const username = req.body.username;
    console.log(`Userrrrrrr: ${username}`)
    const cityName = req.body.city
    console.log(cityName)
    const APIkey = `cdb4141c7cea443511b6eb1479612603`
    const APIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIkey}&units=metric`;
    https.get(APIUrl,function(response){
    response.on("data", async function(data){
        const weatherdata = JSON.parse(data)
        const newWeatherData = new WeatherData({
            username: username,
            cityName: cityName,
            temperature: weatherdata.main.temp,
            humidity: weatherdata.main.humidity,
            windSpeed: weatherdata.wind.speed,
            weatherDescription: weatherdata.weather[0].description,
            icon: weatherdata.weather[0].icon,
            feels_like: weatherdata.main.feels_like,
            pressure: weatherdata.main.pressure,
            country: weatherdata.sys.country,
            time: formattedDateTime(time)
        });
        await newWeatherData.save();
        return res.status(200).send(weatherdata)
      }, error =>{
        return res.status(500).send(weatherdata)
      }
      )
});
});



router.get('/background', async (req, res) => {
  try {
      const weatherDescription = req.query.description || 'default'; 
      const response = await axios.get('https://api.unsplash.com/photos/random', {
          params: {
              client_id: 'JgBCMwQwwWnuVoP1c2qpWA28F9kLzovaO6kR9LsTwkQ',
              query: weatherDescription,
          },
      });

      const imageUrl = response.data.urls.regular;
      res.json({ imageUrl });
  } catch (error) {
      console.error('Ошибка при получении изображения:', error.message);
      res.status(500).json({ error: 'Ошибка при получении изображения' });
  }
});


router.get("/signup",(req,res)=>{
    res.render("signUp",{ message: '' })
})


router.get("/signin",(req,res)=>{
    res.render("signin",{ message: '' })
})


router.post("/signup",async(req,res) =>{
    const username = req.body.username;
    const password2 = req.body.password2
    const time = new Date()
    const data = new collection({
        name : req.body.username,
        password : req.body.password,
        creationDate: formattedDateTime(time)
    }) 
    const existingUser = await collection.findOne({name: data.name})
    if(existingUser){
        return res.render('signUp', { message: 'User already exists' });
    }
    if(data.password != password2){
        return res.render('signUp', { message: 'Passwords do not match' });
    }
    else{
    const userdata = await data.save()
    console.log(userdata)
    res.redirect(`/Weather?username=${username}`);
}
})


router.post("/signin", async(req,res)=>{
    console.log(req.body);
    const username = req.body.username;
    console.log(username);
    if(req.body.password == "admin001" && username =="Erzhan"){
        res.redirect("/admin")
    }
    const check  = await collection.findOne({name: username});
    if(!check){
        res.render("signin",{ message: "User name cannot found" })
    }
    else if(req.body.password != check.password){
            res.render("signin",{ message: 'Wrong Password' })
    }
    else if(check.deletionDate != null){
        res.render("signin",{ message: 'Your account was deleted ' })
    }
    else{
        if(check.isAdmin == true){
            res.redirect("/admin")
        }
        else{
        res.redirect(`/Weather?username=${username}`)}
    }

})

router.get('/admin', async (req, res) => {
    try {
        const users = await collection.find({});
        res.render('admin', { users: users });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/admin/edit/:id', async (req, res) => {
    try {
        const user = await collection.findById(req.params.id);
        res.render('editUser', { user: user });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/admin/edit/:id', async (req, res) => {
    try {
        const check  = await collection.findOne({name: req.body.username});
        if(!check){
            res.redirect('/admin');
        }
        
        const currentDate = new Date();
        await collection.findByIdAndUpdate(req.params.id, { 
            isAdmin: req.body.isAdmin,
            name: req.body.username, 
            password: req.body.password,
            updateDate: formattedDateTime(currentDate)
        });
        res.redirect('/admin');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/admin/delete/:id', async (req, res) => {
    try {
        console.log(req.params.id)
        const currentDate = new Date();
        await collection.findByIdAndUpdate(req.params.id, { 
            deletionDate: formattedDateTime(currentDate)
        });
        res.redirect('/admin');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/admin/add', async (req, res) => {
    try {
    let isAdmin = false
    if(req.body.isAdmin == "on"){
        isAdmin = true
    }
    console.log(isAdmin)
    const time = new Date()
        const newUser = new collection({
            isAdmin: isAdmin,
            name: req.body.username,
            password: req.body.password,
            creationDate: formattedDateTime(time)
        });
        await newUser.save();
        res.redirect('/admin',);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

function formattedDateTime(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

router.get('/weatherHistory', async (req, res) => {
    try {
        const username = req.query.username 
        const weatherHistory = await WeatherData.find({ username: username });
        console.log(weatherHistory)
        res.render('history', { weatherHistory: weatherHistory });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});





module.exports = router;