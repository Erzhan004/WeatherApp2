


var map = null
ymaps.ready(function(){
  map = new ymaps.Map('map', {
    center: [37.64, 55.76],
    zoom: 10,
  });   
});

$('#form_map').click(function(){
    var cityName = $('input[name="city"]').val()
    var fullText = $('#username').text();
    var username = fullText.split(':')[1].trim();
    

    console.log(`username: ${username} `)
    if(cityName == ''){
        alert("Введите имя города")
    }
    var myGeocoder = ymaps.geocode(cityName);
   
    myGeocoder.then(function(res){
        var coords = res.geoObjects.get(0).geometry._coordinates;
        map.setCenter(coords)
        
        $.ajax({
            type: 'POST',
            url : '/getWeather',
            data : {city:cityName, username: username},
            success : function(data){
                console.log(data);
                var html = `<div style="background: url(http://openweathermap.org/img/w/${data.weather[0].icon}.png) no-repeat top right;">
                <strong class="city-name">${cityName}</strong>
                <table class="weather-table">
                    <tr><td>Температура</td><td>${data.main.temp} &deg;C</td></tr>
                    <tr><td>Скорость ветра</td><td>${data.wind.speed} м/с</td></tr>
                    <tr><td>Влажность</td><td>${data.main.humidity} %</td></tr>
                </table>
            </div>`;
            
                map.balloon.open(coords,html),{
                    closeButton : false
                }

                $('.weather__img').attr('src', `http://openweathermap.org/img/w/${data.weather[0].icon}.png`);
                $('.weather__temp').text(`${data.main.temp}°C`);
                $('.weather__city').text(cityName);
                $('#humidity').text(`${data.main.humidity} %`);
                $('#speed').text(`${data.wind.speed} м/c`);
                $('.weather__discription').text(data.weather[0].description);
                $('#feels_like').text(data.main.feels_like);
                $('#pressure').text(data.main.pressure);
                $('#index').text(`${data.sys.country}`);
                changeBackground(data.weather[0].description);
            
            
            
            },
            error: function(err){
                console.log(err)
            }
        });
    });


})
    function changeBackground(weatherDescription) {
        $.ajax({
            type: 'GET',
            url: `/background?description=${encodeURIComponent(weatherDescription)}`, 
            success: function (data) {
                $('body').css('background', `url('${data.imageUrl}') no-repeat center center fixed`);
                $('body').css('background-size', 'cover');
            },
            error: function (err) {
                console.log(err);
            }
        });
    }

