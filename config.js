const mongoose = require("mongoose")
const connect = mongoose.connect("mongodb+srv://erzhankabdolla04:161291_Era@cluster0.k3qmkpt.mongodb.net/?retryWrites=true&w=majority")



connect.then(()=>{
    console.log("Db is Ok")
})
.catch(()=>{
    console.log("Db is not ok")
})
const weatherDataSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    cityName: {
        type: String,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    windSpeed: {
        type: Number,
        required: true
    },
    weatherDescription: {
        type: String,
        required: true
    },
    icon:{
         type: String,
        required: true
    },
    feels_like:{
        type: Number,
        required: true
    },
    pressure:{
        type: Number,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    time:{
        type: String,
        required: true
    }


       

});


const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, 
    deletionDate:{
        type: String,
        default: null,
    },
    updateDate:{
        type: String,
        default: null,
    },
    creationDate:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }, 
    isAdmin:{
        type: Boolean,
        default: false,
        required: true
    }
})


const WeatherData = new mongoose.model('WeatherData', weatherDataSchema);
const collection = new mongoose.model("users",LoginSchema);



module.exports = { collection, WeatherData};