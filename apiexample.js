let apiURL = 'https://api.tvmaze.com/';
let message;

// load the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }, function(error) {
      console.log('Service Worker registration failed:', error);
    });
  });
}   


// handle install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installButton = document.getElementById('installButton');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    installButton.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});                    


// initialize page after HTML loads
window.onload = function() {

  message = document.getElementById("message");

   closeLightBox();  // close the lightbox because it's initially open in the CSS
   document.getElementById("button").onclick = function () {
     searchTvShows();
   };
   document.getElementById("lightbox").onclick = function () {
     closeLightBox();
   };
} // window.onload


// get data from TV Maze
async function searchTvShows() {
  document.getElementById("main").innerHTML = "";
  
  let search = document.getElementById("search").value;  
   
  try {   
      const response = await fetch(apiURL + 'search/shows?q=' + search);
      const data = await response.json();
      console.log(data);
      showSearchResults(data);
  } catch(error) {
    console.error('Error fetching tv show:', error);
  } // catch
} // searchTvShows 
 

// change the activity displayed 
function showSearchResults(data) {
  
  // show each tv show from search results in webpage
  for (let tvshow in data) {
    createTVShow(data[tvshow]);
  } // for

} // updatePage

// in the json, genres is an array of genres associated with the tv show 
// this function returns a string of genres formatted as a bulleted list
function showGenres(genres) {
   let output = "<ul>";
   for (g in genres) {
      output += "<li>" + genres[g] + "</li>"; 
   } // for       
   output += "</ul>";
   return output; 
} // showGenres

// constructs one TV show entry on webpage
function createTVShow (tvshowJSON) {
  
    // get the main div tag
    var elemMain = document.getElementById("main");
    
    // create a number of new html elements to display tv show data
    var elemDiv = document.createElement("article");
    var biggerElemDiv = document.createElement("section");
    var elemImage = document.createElement("img");
    
    var elemShowTitle = document.createElement("h2");
    elemShowTitle.classList.add("showtitle"); // add a class to apply css
    
    var elemGenre = document.createElement("div");
    var elemGenre2 = document.createElement("div");
    var elemRating = document.createElement("div");
    var elemSummary = document.createElement("div");
    
    // add JSON data to elements
    
    elemShowTitle.innerHTML = tvshowJSON.show.name;
    elemGenre.innerHTML = "Genres: ";
    elemGenre2.innerHTML = showGenres(tvshowJSON.show.genres);
    elemRating.innerHTML = "Rating: " + tvshowJSON.show.rating.average;
    elemSummary.innerHTML = tvshowJSON.show.summary;
    
       
    // add 5 elements to the div tag elemDiv
    elemDiv.appendChild(elemShowTitle);  
    elemDiv.appendChild(elemGenre);
    elemDiv.appendChild(elemGenre2);
    elemDiv.appendChild(elemRating);
    elemDiv.appendChild(elemSummary);
    

    // deal with image
    if(tvshowJSON.show.image != null){
      elemImage.src = tvshowJSON.show.image.medium;
      biggerElemDiv.appendChild(elemImage);
    }

    biggerElemDiv.appendChild(elemDiv);

    
    // get id of show and add episode list
    let showId = tvshowJSON.show.id;
    fetchEpisodes(showId, elemDiv);
    
    // add this tv show to main
    elemMain.appendChild(biggerElemDiv);
    
} // createTVShow

// fetch episodes for a given tv show id
async function fetchEpisodes(showId, elemDiv) {
     
  console.log("fetching episodes for showId: " + showId);
  
  try {
     const response = await fetch(apiURL + 'shows/' + showId + '/episodes');  
     const data = await response.json();
     console.log("episodes");
     console.log(data);
     showEpisodes(data, elemDiv);
  } catch(error) {
    console.error('Error fetching episodes:', error);
  } // catch
    
} // fetch episodes


// list all episodes for a given showId in an ordered list 
// as a link that will open a light box with more info about
// each episode
function showEpisodes (data, elemDiv) {
     
    let elemEpisodes = document.createElement("div");  // creates a new div tag
    elemEpisodes.classList.add("temp"); // add a class to apply css
    let output = "<ol id='tempo'>";
    for (episode in data) {
        output += "<li><a href='javascript:showLightBox(" + data[episode].id + ")'>" + data[episode].name + "</a></li>";
    }
    output += "</ol>";
    elemEpisodes.innerHTML = output;
    elemDiv.appendChild(elemEpisodes);  // add div tag to page
        
} // showEpisodes

// open lightbox and display episode info
function showLightBox(episodeId){
     document.getElementById("lightbox").style.display = "block";
     
     // show episode info in lightbox
     //document.getElementById("message").innerHTML = "<h3>The episode unique id is " + episodeId + "</h3>";
     //document.getElementById("message").innerHTML += "<p>Your job is to make a fetch for all info on this"  
                        + " episode and then to also show the episode image, name, season, number, and description.</p>";

    fetchEpisodeInfo(episodeId);

     
} // showLightBox

// close the lightbox
function closeLightBox(){
   document.getElementById("lightbox").style.display = "none";
} // closeLightBox 


 
async function fetchEpisodeInfo(episodeId){

  let episodeLink = apiURL + "episodes/" + episodeId;
  console.log(episodeLink);

  try {
    const response = await fetch(episodeLink);
    const data = await response.json(); 
    console.log(data);
    showTvShow(data); 


  } catch(error) {
    console.error('Error fetching tv show:', error);
  } // catch


} // fetchEpisodeInfo

// tv maze only returns 10 results for a tv show search
// this function displays the results for the last show returned (index 9)
function showTvShow(data) {

  // clear previous contents
  message.innerHTML = '';
  
  // show all data returned from tv maze
  console.log(data); 

  // loop through 10 tv shows and add content to main
  //for(index in data){
    //console.log(data[index]); // outputs each show data to console
    let newDiv = document.createElement('div');
    let newImage = document.createElement("img");
    let newTitle = document.createElement("h2");
    let newSeason = document.createElement('div');
    let newNumber = document.createElement('div');
    let newSummary = document.createElement('div');


    // deal with images
    if(data.image != null){
      newImage.src = data.image.medium;
      newImage.alt = data.name;
      newDiv.appendChild(newImage);

      let lightbox = document.getElementById("lightbox");
      lightbox.style.backgroundImage = data.image.medium;
    }
    
    
    newTitle.innerHTML = data.name;
    newSeason.innerHTML = "Season: " + data.season;
    newNumber.innerHTML = "Episode: " + data.number;
    newSummary.innerHTML = data.summary;

    // add info to div
    newDiv.appendChild(newTitle);
    newDiv.appendChild(newSeason);
    newDiv.appendChild(newNumber);
    newDiv.appendChild(newSummary);

    

    


    
    
    

    // add div to body
    message.appendChild(newDiv);


  //} // for
  
  // show data for last show in results
  /*elemImage.src = data[9].show.image.medium;
  elemShowTitle.innerHTML = data[9].show.name;
  elemGenre.innerHTML = showGenres(data[9].show.genres);
  elemRating.innerHTML = data[9].show.rating.average;
  elemSummary.innerHTML = data[9].show.summary;*/

  
} // showTvShow






