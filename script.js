// We know API keys are supposed to be hidden by a server, but we don't have a server, and this is... probably fine? So it's here.
const apiInfo = {
  base: `https://api.openweathermap.org/data/2.5/weather?`
}

const key = config.API_KEY

const city = document.querySelector('#city')
const hiLow = document.querySelector('#hi-low')
const startTemp = document.querySelector('#start-temp')
const humidity = document.querySelector('#humidity')
const feelsLike = document.querySelector('#feels-like')
const weather = document.querySelector('#weather')
const date = document.querySelector('#date')
const time = document.querySelector('#time')
const weatherIcon = document.querySelector('#weather-icon')
const dropDown = document.querySelector('#temp-dropdown')

const makeDate = (timeZone) => {
  let newDate = new Date(Date.now() + timeZone * 1000).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
    });
  return newDate
}

// I had to use jquery to get a cool smooth animation ;-; sorry
let lazyPatch = 0
$("#temp-dropper").click(() => {
  if (lazyPatch == 0) {
    $('#temp-dropper').css("margin-left", '+=220').css('transform', 'rotate(90deg)');
    $('#temp-dropdown').animate({opacity : 1}, 
    {duration : 500, queue : false})
    .animate({'margin-left' : '+=210'},
    {duration : 500, queue : false});
    lazyPatch += 1
  } else {
    $('#temp-dropper').css("margin-left", '-=220').css('transform', 'rotate(270deg)');
    $('#temp-dropdown').animate({opacity: 0, "margin-left": '-=210'}, 500);
    lazyPatch -= 1
  }
});

let lazyPatchTwo = 0
$('#hourly-dropper').click(() => {
  if (lazyPatchTwo == 0) {
    $('#hourly-dropdown-div').animate({"top": '+=405', queue : false})
    $('#hourly-dropdown').animate({opacity : 1}, 
      {duration : 500, queue : false})
    $('#hourly-dropper').css('transform', 'rotate(180deg)')
    lazyPatchTwo += 1
  } else {
    $('#hourly-dropdown-div').animate({"top": '-=405', queue : false})
    $('#hourly-dropdown').animate({opacity : 0}, 
      {duration : 500, queue : false})
    $('#hourly-dropper').css('transform', 'rotate(360deg)')
    lazyPatchTwo -= 1
  }
})

const searchBox = document.querySelector('.search-box')
searchBox.addEventListener('keypress', setQuery)

const searchButton = document.querySelector('#button')
searchButton.addEventListener('click', setQueryOther)

function setQuery(e) {
  if(e.keyCode === 13) {
    if (searchBox.value) {
      getResults(searchBox.value)
     } else {
      alert('Please enter a city, state, or zip code into the search bar!')
    }
  }
}

const loadGraph = (lat, long) => {
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime`)
    .then(resp => resp.json())
    .then(data => graphTemp(data))
}

// Yet another library ;-; all things considered this one isn't that complicated. 
let myChart = 0;
const graphTemp = (loc) => { // ('loc' being passed in from fetch calls where we get the hourly weather data from an api. 'loc'
                             // will be just all the data we pull from that api.)
  // First you grab the element you want to change.
  const ctx = document.querySelector('#hourly-dropdown')
  // (This isn't part of the process of understanding how the graph is made, it just removes the graph when a new one needs 
  // to be rendered.)
  if (myChart !== 0) {
    myChart.destroy()
  } 
  // Next, you make a new chart. The first parameter is just where your canvas is that the chart should be on, and the second
  // is all the info that will be interperted by the library and used to create the chart.
  myChart = new Chart(ctx, {
    type: 'line', // specify what type of graph you want. I used a template, and by default this was set to "bar". 
                  // idk all the types of charts, but I typed in "line" and it gave me a line graph. 
    data: { // 'data' is going to contain all the information that will be displayed on the graph
        labels: genDates(loc.hourly.time), // 'labels' represents all the labeling on the x-axis along the bottom (function explanation: line 149)
        datasets: [{ // 'datasets' is an array that's gonna contain different sets of information we want displayed on the graph.
                     // in this case, it just represents all the temperature information and humidity information we'll be displaying
            label: 'Temperature (°F)', // The 'label' property is exactly what it looks like. It just labels a specific color line
                                       // as representing the specified data.
            data: genTemps(loc.hourly.temperature_2m), // 'data' when inside of a 'dataset' array is an array containing all 
                                                       // the information that willbe displayed on the graph as belonging to 
                                                       // the given 'label'. In this case, that means an array containing all 
                                                       // the temperatures we want to be displayed on the graph. (function explanation: line 180)
            backgroundColor: [ // 'backgroundColor' is an array containing any colors we want our data *points* to be shown as.
                               // This is not the color we want our line to be, just the inside of the data points themselves.
                               // The order in which the colors are listed is the order in which the colors will appear as points.
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [ // 'borderColor' is much the same as 'backgroundColor' in functionality and target. but applies to the
                           // border of a point rather than the whole point. 
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1 // 'borderWidth' actually does *not* represent the width of the point's borders, but rather the width of the 
                           // primary line of the line graph. 
        },
          { // This object is very much the same, containing all the same properties and conventions of the above object.
            label: 'Humidity (%)',
            data: getHumidity(loc.hourly.relativehumidity_2m), // (function explanation: line 194)
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    }
  });
  $('#hourly-dropdown').css('width', 1000)
}

// All things considered, this is a pretty simple funciton. At the end, its gonna return an array containing 
// every date that I consider relevant for generally forecasting the weather.
const genDates = (arr) => { // 'arr' is gonna be the 'time' property of the 'hourly' object within the json data we passed into
                            // the 'grapTemp' function.
  let result = [] // just a holder for any values we want to pass in.
  arr.forEach((elem) => { // The 'time' property holds 168 unix timestamps, one for each hour. Every 24th represents a new day, 
                          // every 6th represents a 1/4th of a day. 
    if ((arr.indexOf(elem)+1)%24 == 0) { // We can't print every hour of every day for 7 days as labels. That's just too many.
                                         // It's unreasonable. We *can* print every 24th houras a new day. So
      const date = new Date(elem*1000) // Frankly, I'm not sure why these two lines together do what they do. I guess those three 0's
                                       // at the end are important to be able to use that 'toLocaleDateString()' function, but I'm
                                       // not 100% how it actually operates. I *do* know however, that it gives us a MM/DD/YYYY format
                                       // date, which is nice.
      result.push(date.toLocaleDateString("en-US"))
    } else if ((arr.indexOf(elem)+1)%6 == 0) {
      result.push("") // just pushing every 6th hour so we can have some more data points on the graph. More data points are 
                      // obviously good when collecting data. This time tho, I pushed empty quotes instead of a date. While I do 
                      // want more data points, frankly I think all the extra writing down there just looks messy.
    }
  })
  return result; // does the thing
}

// An even simpler one! Returns an array to be used as the data to go under 'Temperature'. 
const genTemps = (arr) => {
  let result = []
  arr.forEach((elem) => {
    if ((arr.indexOf(elem)+1)%6 == 0) { // This time we can just push every 6th element. The number of labels and datapoints need to
                                        // be the same or else not all of the datapoints will render. But fortunately 24 is divisible
                                        // by 6, so everything we would have gotten by specifying %24 will be pushed anyways.
      result.push(elem) // 'elem' is stored in the api as a number representing the tempereature at that time in fahrenheit,
                        // so we can just push the element to the array with no changes and use that as data.
    }
  })
  return result // does the thing
}

// Okay, I have no idea what's going on with this function... It's totally the same in function as the other two,
// just loop through the array until you find an index that divided by 6 has a remainder of 0, then push that to the result
// array and return result. But for *some reason* using `forEach()` TOTALLY fucked it, and it would just check seemingly random
// elements, sometimes 3-4 times in a row. Nonsense. Nonsense I say! So I just used a normal for loop. No biggie.
const getHumidity = (arr) => {
  let result = []
  for (let i = 0; i < arr.length; i++) {
    if (i%6 == 0) {
      result.push(arr[i])
    }
  }
  return result // does the thing
} 


function setQueryOther(e) {
  if (searchBox.value) {
    getResults(searchBox.value)
  } else {
    alert('Please enter a city, state, or zip code into the search bar!')
  }
}


const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(loadPos)
  } else {
    alert('Unable to reach user location! (Browser not compatible with geolocation).')
  }
}

const loadPos = (pos) => {
    fetch(`${apiInfo.base}lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${key}&units=imperial`)
      .then(resp => resp.json())
      .then(data => displayResults(data))
  }


function getResults(city) {
  if (!parseInt(city)) {
    fetch(`${apiInfo.base}q=${city}&units=imperial&APPID=${key}`)
    .then(resp => resp.json())
    .then(data => displayResults(data));
  } else {
    fetch(`${apiInfo.base}zip=${city}&units=imperial&APPID=${key}`)
    .then(resp => resp.json())
    .then(data => displayResults(data));
  }
}


function displayResults(results) {
  if (!results.sys) {
    alert(`${results.message}`)
  } else {
    city.innerText = `${results.name}, ${results.sys.country}`
    loadGraph(results.coord.lat, results.coord.lon)
    
    hiLow.innerText = `High/Low: ${Math.floor(results.main.temp_max)}°F/${Math.floor(results.main.temp_min)}°F`
    startTemp.innerText = `${Math.floor(results.main.temp)}°F`
    feelsLike.innerText = `Feels-like: ${Math.floor(results.main.feels_like)}°F`
    humidity.innerText = `Humidity: ${results.main.humidity}%`
    weather.innerText = (results.weather[`0`].description).replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
    date.innerText = makeDate(results.timezone)
    weatherIcon.src = `http://openweathermap.org/img/wn/${results.weather['0'].icon}@2x.png`
   }
}

  getLocation()


  // for each, day of the week