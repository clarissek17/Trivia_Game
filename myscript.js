/*
PROGRAM: "Santa Degyatt Simulator: Mormon Uprising"
AUTHOR: Clarisse
Date: Last updated January 23rd, 2025

Secret Bonus features to code later:
- Alert to tell user their relationship status changed
- Achievement for unlocking married rank
- Study edition (where you can your add own study questions)
- Add a catch for the ugly looking quotation mark thing
- feature to give each character several category options
*/


/* GLOBAL VARIABLES*/
// Elements
let characterDiv;
let nameDiv;
let questionDiv;
let optionsDiv; 
let auraDiv;
let statusDiv;
let picDiv;
let hintDiv;
let lightboxDiv;

// API
let data;
let apiURL = "https://opentdb.com/api.php?amount=20";
let pexelsURL = "https://api.pexels.com/v1/search?query=";
let apiKey = "1cYKSXsNvhqi7Jj7dPdTuvZjjRO1r06OUW9qEByS6axGiixAyFRObC2m"; 

// Variables
let responded; // makes clicking the next box work
let aura = []; // each index is user score with a different persona
let level = []; // each index is user status with a different persona
let q; // question number
let persona; // person ur talking to (0 is cam, 1 is neo, 2 is nathan, 3 is clarisse, 4 is anya, 5 to be eli, 6 to be lane, 7 to be gabby)
let f = []; // number that increases aura threshold to unlock flirt
let hintShowing; // if lightbox is on or off
let doing; // if the user is doing trivia, custom q, or flirting, so program can display correct image in lightbox
let introduced = []; // shows character's intro dialogue if false
let isPos = []; // if the character and user have a postive relationship showing
let upStats = [[],[],[],[],[]]; // list of positive relationship statuses
let downStats = [[],[],[],[],[]]; // list of negative relationship statuses


/* PWA STUFF - Ms. Wear's code, NOT mine*/

// load the service worker - Ms. Wear's code
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      }, function(error) {
        console.log('Service Worker registration failed:', error);
      });
    });
}  

// handle install prompt - Ms. Wear's code
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


/* FUNCTION RUNS WHEN WINDOW LOADS */
window.onload = function() {

    // initialize variables
    characterDiv = document.getElementById("character");
    nameDiv = document.getElementById("name");
    questionDiv = document.getElementById("questions");
    optionsDiv = document.getElementById("options");
    auraDiv = document.getElementById("aura");
    statusDiv = document.getElementById("status");
    picDiv = document.getElementById("pic");
    hintDiv = document.getElementById("hint");
    lightboxDiv = document.getElementById("lightbox");
    responded = false;
    q = 0;
    persona = 0; // default
    hintShowing = false;

    // set all aurascores and status levels to zero (change i < number depending on number of personas)
    for(let i = 0; i < 5; i++){
        aura[i] = 0;
        level[i] = 0;
        introduced[i] = false;
        isPos[i] = true;
        f[i] = 0;
    } // for

    // relationship statuses
    upStats = [["Strangers", "Friends", "Situationship", "Dating", "Married"],["Strangers", "y'all are chill", "Friends", "Lab Partners", "Married"],["Strangers", "Fellow nerds", "Friends", "Dating", "Married"],["Strangers", "Aquaintances", "Friends", "Dating but without the dating part", "Married"],["Strangers", "\"no way i know that person!\"", "Friends", "Besties", "Married"]];
    downStats = [["Major Beef", "... not really friends anymore", "Ex-situationship???", "Exes", "Divorced"],["no lore", "y'all are not chill", "Just people", "Friends (ex-lab partners)", "Divorced"],["Irrelvant to each other", "Friends of friends", "Classmates", "Exes", "Divorced"],["Y'all have negative chemistry", "Mildy Aquainted", "Classmates", "JUST friends", "Divorced"],["NPCs", "Aquaintances", "Classmates", "Friends but there's drama?", "Divorced"]];

    // make it so lightbox is closed when clicked
    lightboxDiv.onclick = function () {
        lightboxDiv.style.display = "none";
        hintShowing = false;
    };

    // open menu when game starts
    showMenu();
  
    // run fetch content to fill questions array
    fetchContent("10", "easy"); // runs cam's questions first

} // window.onload


/* FETCHES DATA FROM THE TRIVIA API */
async function fetchContent(category) {
    let response = null;
    let diff = "easy";

    // determine question difficulty
    if(aura[persona] > 40){
        diff = "hard";
    } else if(aura[persona] > 15){
        diff = "medium";
    } else{
        diff = "easy";
    }

    // fetch the data
    try {
        response = await fetch(apiURL + "&category=" + category + "&difficulty=" + diff);

        // Convert the response to JSON format
        data = await response.json();

        // run the game
        changeContent();

    } catch (error) {
        // catch data detch errors
        console.error('Error fetching question:', error);
        alert("haha fetch error ¯\\_(ツ)_/¯");
    }
} // fetchContent


/* FETCHES DATA FROM THE PEXELS API */
async function fetchImages(query) {
    
    // fetch the data
    try {

        let response = null;

        // get better image for false in t/f questions
        if(query == "False"){
            query = "bad";
        } // if

        response = await fetch(pexelsURL + query + "&per_page=1", {headers: {Authorization: apiKey}});
        let data = await response.json();

        // update the picture div
        picDiv.innerHTML = "<img src='" + data.photos[0].src.tiny + "' alt='image'>";

  } catch (error) {

    // show a default image
    picDiv.innerHTML = "<img src='images/nopic.webp' alt='image'>";
  }
    
} // fetchImages


/* RUN THE GAME */
function changeContent() {

    // variables
    let threshold = [5, 18, 32, 45, 60];        // [5, 18, 32, 45, 60] is for gameplay; [3, 14, 25, 36, 47] is for playtesting

    // get new data if there are no more questions in data array
    if(q > data.results.length - 1){
        q = 0;

        // get correct genre of question depending on person
        switch(persona){
            case 0:
                fetchContent("10");
                break;
            case 1:
                fetchContent("17");
                break;
            case 2:
                fetchContent("17");
                break;
            case 3:
                fetchContent("20");
                break;
            case 4:
                fetchContent("17");
                break;
        }
    }

    // Determine which function to run
    if(aura[persona] > 71 && level[persona] == 4){              // 71 for gameplay, 60 for playtesting, and 2 for testing winscreen
        // player wins
        doing = "win";
        seduce();
    }else if(introduced[persona] == false){
        // player meets new persona
        introduce(0);
    }else if(aura[persona] > threshold[f[persona]]){
        // persona flirts with player
        doing = "flirt";
        flirt();
        f[persona]++;
    } else if(q % 5 == 0 && q != 0){
        // persona asks custom question
        doing = "custom"
        specialQ(q);
    } else{
        // persona asks trivia question
        doing = "trivia";
        askTrivia();
    }

} // changeContent


/* PERSONA ASKS TRIVIA QUESTIONS */
function askTrivia(){
    let options;

    // Update the questiondiv
    questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ data.results[q].question;

    // Update the character
    characterDiv.innerHTML = "<img src='images/" + persona + "resting.webp' alt='resting' id='img'>";

    
    // Error check: delete answers from last question if they appear
    options = getAnswers();

    if(options.length > 4){

        if(options[0] == "true" || options[0] == "false"){
            options.shift();
            options.shift();
        } else{
            options.shift();
            options.shift();
            options.shift();
            options.shift();
        }

    } // error check if

    // Update the optionsdiv
    optionsDiv.innerHTML = "";
    for(let option of options){

        if(option == data.results[q].correct_answer){
            optionsDiv.innerHTML += "<div onclick='optionClicked(\"" + option + "\", true)' id='choice' class='cursor'>" + option + "</div>";
        }else{
            optionsDiv.innerHTML += "<div onclick='optionClicked(\"" + option + "\", false)' id='choice' class='cursor'>" + option + "</div>";
        }
    }

    // program continues when user clicks div with optionsClicked()

} // askTrivia


/* MAKE RANDOMIZED ARRAY OF OPTIONS */
function getAnswers(){

    // adds correct answer to array
    let options = [data.results[q].correct_answer];

    // adds incorrect answers to array
    for(let option of data.results[q].incorrect_answers){
        options.push(option);
    } // for

    // sorts them alphabetically to randomize
    options.sort();

    // return array
    return options;

} // getAnswers


/* CHECK IF USER GOT ANSWER RIGHT */
function optionClicked(option, isAnswer){

    // variables
    let customRight = [["wow pooki i love that u know that", "omg i've never met someone who knows that", "ur amazing"],["wow pooki i love that u know that", "omg i've never met someone who knows that", "ur amazing"],["wow pooki i love that u know that", "omg i've never met someone who knows that", "ur amazing"],["I vibe with that so hard.","Yass, Oh my gawd! It's seems you're a random knowledge enjoyer as well.",":D"],["I vibe with that so hard.","Yass",":D"]];
    let customWrong = [["um... well not exactly :(", "No actually, it's...", "what."],["um... well not exactly :(", "No actually, it's...", "what."],["um... well not exactly :(", "No actually, it's...", "what."],["bro wut??","Is it? Cause's I thought it was something else... hmmm","Oh really? I didn't know that-- where did you learn that :|"],["no","bad","ugh"]];
    let rando =  Math.floor(Math.random() * (2 - 0 + 1)) + 0; // change depending on number of custom answers

    // remove the options on screen
    optionsDiv.innerHTML = "";

    // change character
    if(option == "intro"){
        // first introduction
        introduce(1);
    } else if(option == "transition"){
        // reaction to introduction
        introduce(2);
    }else if(isAnswer){
        // user is correct
        aura[persona]++;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ customRight[persona][rando];
        characterDiv.innerHTML = "<img src='images/" + persona + "impressed.webp' alt='impressed' id='img'>";
    }else{
        // user is incorrect
        aura[persona]--;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ customWrong[persona][rando];
        characterDiv.innerHTML = "<img src='images/" + persona + "disappointed.webp' alt='disappointed' id='img'>";
    }

    // Update the score (auraDiv)
    auraDiv.innerHTML = "<i class='fa fa-heart'></i>   Aura level " + aura[persona];

    // allow user to move onto next question
    if(option != "intro" && option != "transition"){
        responded = true;
        questionDiv.className="cursor";
    }

    // program continues when user clicks div with moveOn()

} // optionClicked


/* CHECK IF USER GOT ANSWER RIGHT */
function moveOn(){

    // check if player has rizzmaxxed this character
    if(doing == "win"){
        alert("oh... it seems you've rizzed " + nameDiv.innerHTML + " to the max. The real question is, can you pull them in real life, you CHRONICALLY ONLINE virgin");
        doing = "unknown";
        optionsDiv.innerHTML += "<div onclick='next(1)' id='choice' class='cursor'> Okay um bye " + nameDiv.innerHTML + "! I'm gonna go real quick...</div>";
    } else if(responded){// only run function if user has actually answered questions

        // set responded to false
        responded = false;
        questionDiv.classList.remove("cursor");

        // move on to next question
        q++;

        // call change content to give next question
        changeContent();

    } // if
    
    
} // moveOn


/* PERSONA FLIRTS WITH USER */
function flirt(){

    // variables
    let flirts = [[],[],[],[],[]];
    let permut = [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]];
    let rando = Math.floor(Math.random() * (6 - 1) ) + 1;

    // custom flirst for each persona
    let camFlirts = [["Do you like poetry, martial arts, drama, linguistics, visual art, MCYT, music, or English?", "Yeah OMG I loved your poem! Wanna see some of my art; it's of my silly lil OCs", "poetry? nah it's bad. Except Andrew Tate's stuff", "I don't really know anything about those"],["Um so... like... I like you. Wanna go out with me?", "Yes, I would love to.", "No, I don't like you", "So I like you, but I'm not really looking for that right now."],["[TIME SKIP-- Two dates later] So is this official?", "Wanna be my girlfriend?", "Is what official?", "Not sure if I'm ready for labels yet. Sorry."],["I love you so much I literally wanna marry you","Love you too you're literally my wifey","I don't really love you. I'm breaking up with you.","Girl? We're in high school."],["By the way, who was in the right? C!Tommy or C!Dream?","C!Tommy","C!Dream","I haven't seen the Dream SMP"]];
    let neoFlirts = [["Wow! We have a a lot in common you know", "Yeah we should hang out sometime", "not really", "yeah we show lowkey be friends"],["hey shawty, want my number?", "yes", "no", "um why"],["literally marry me. please. please?", "of course wifey", "no ew what", "i'm down but i've already got a wife if ur cool with that"],["placeholder flirt","best","worst","mid"],["placeholder flirt","best","worst","mid"]];
    let natFlirts = [["Wow! We have a a lot in common you know", "Yeah we should hang out sometime", "not really", "yeah we show lowkey be friends"],["hey shawty, want my number?", "yes", "no", "um why"],["literally marry me. please. please?", "of course wifey", "no ew what", "i'm down but i've already got a wife if ur cool with that"],["placeholder flirt","best","worst","mid"],["placeholder flirt","best","worst","mid"]];
    let claFlirts = [["That's so cool. We're literally on the same wavelength right now!", "In sync girlie! We make a great duo", "*ignore her*", "ha yeah"],["We should hangout lowkey...", "Hell yeah! What's your discord?", "I'm too busy with my other friends", "Yeah sure"],["[TIMESKIP-- ANOTHER PARTY] You were up late on Discord last night Lol. What's poppin'? Wanna head to UVic after this?", "I've been chilling all day so I'm totally down for UVic. What do ya wanna do?", "No, I'm getting a ride home with my friend.","I'm so busy this week-- maybe another time"],["Screw romance, at this point we should just get married.","Yes, you're literally my wife. We have WAYYY more chemistry than ANY high school couple","Bro what? Who said we should get married?","Aren't you already married though?"],["Wow, it's getting late. Wanna stay over tonight?","Of course.","No, I'm going home","Sorry, I need to be home by 9:30-- I'll stay a little extra longer, though"]];
    let anyFlirts = [["That's so cool. We're literally on the same wavelength right now", "In sync girlie! We make a great duo", "uh huh", "yeah for real"],["We should hangout again lowkey...", "Hell yeah! What's your discord?", "Bro I'm so busy these days", "Yeah for real"],["literally marry me. please. please?", "of course wifey", "no ew what", "i'm down but i've already got a wife if ur cool with that"],["placeholder flirt","best","worst","mid"],["placeholder flirt","best","worst","mid"]];

    // fill flirts array with flirts
    switch(persona){
        case 0:
            convertArray(flirts, camFlirts);
            break;
        case 1:
            convertArray(flirts, neoFlirts);
            break;
        case 2:
            convertArray(flirts, natFlirts);
            break;
        case 3:
            convertArray(flirts, claFlirts);
            break;
        case 4:
            convertArray(flirts, anyFlirts);
            break;
    } // switch

    // update the questiondiv and character
    questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ flirts[level[persona]][0];

    // update the character
    characterDiv.innerHTML = "<img src='images/" + persona + "flirtatious.webp' alt='flirtatious' id='img'>";

    // Update the optionsdiv (options are randomized with a permuation)
    optionsDiv.innerHTML += "<div onclick='rizzBack(" + permut[rando][0] +")' id='choice' class='cursor'>" + flirts[level[persona]][(permut[rando][0])] + "</div>";
    optionsDiv.innerHTML += "<div onclick='rizzBack(" + permut[rando][1] +")' id='choice' class='cursor'>" + flirts[level[persona]][(permut[rando][1])] + "</div>";
    optionsDiv.innerHTML += "<div onclick='rizzBack(" + permut[rando][2] +")' id='choice' class='cursor'>" + flirts[level[persona]][(permut[rando][2])] + "</div>";

    // program continues when user clicks div with rizzBack() function

} // flirt


/* PERSONA RESPONDES TO USER FLIRTING BACK */
function rizzBack(num){

    // variables
    let responses = [[],[],[],[],[]];

    // 5 response arrays for each persona (cuz theres 5 flirts)
    let camRes = [["Thank you so much! I loved your poem too! Wait let me follow you on insta.", "Okay, what?", "Oh okay. I just thought you might like this one song."],["Are you free next Sunday? There's this cute cafe downtown.", "oh, um that's okay", "that's okay."],["Yes of course", "uh-- nevermind", "that's okay. yeah, I was just wondering"],["<3", "</3", "<3???"],["You're the best", "What the fuck. We're over.", "Oh yeah you should watch it. Actually-- maybe not. Maybe that needs to stay in 2020."]];
    let neoRes = [["Yes! I'll grab your number when my phone's handy.", "damn. screw you", "yeah."],["it's 123-456-7890", "oh... I'm sorry ok", "uhhh so we... how bout I just give it to you."],["i love you wifey", "i- it was a joke. i guess :(", "shiiii ok girl, um yeah that's fine"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"]];
    let natRes = [["Yes! I'll grab your number when my phone's handy.", "damn. screw you", "yeah."],["it's 123-456-7890", "oh... I'm sorry ok", "uhhh so we... how bout I just give it to you."],["i love you wifey", "i- it was a joke. i guess :(", "shiiii ok girl, um yeah that's fine"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"]];
    let claRes = [["Yes literally! We're actually locked in right now", ". . .", "let's go dude"],["I'm clarclar17... I can type it in for you", "yeah that's fair. All of my friends have a different free day and none of our schedules align :(", "You're really cool bro! Anyway--"],["you... um-- uh yeah okay lemme grab my bike outside", "oh womp womp. Ok, I guess...", "Yeah that's chill bro. Another time."],["Actually so real tho! Tax benefits, passports, citizenship; we're set. I'm your wife now.", "oh um I don't know. Allegations... I hear?", "Bro, every Challenge kid is married to the grind! That doesn't count. and Clam? haha no you don't need to worry about that--"],[";)", "Oh okay... byeeee!", "Awww c'mon... ok hop on Dress to Impress with me when you're home though"]];
    let anyRes = [["Yes literally! We're actually locked in right now", ". . .", "let's go dude"],["I can type it in for you", "yeah that's fair. All of my friends have a different free day... none of them sync up :(", "You're really cool bro! Anyway--"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"]];

    // fill responses array with responses
    switch(persona){
        case 0:
            convertArray(responses, camRes);
            break;
        case 1:
            convertArray(responses, neoRes);
            break;
        case 2:
            convertArray(responses, natRes);
            break;
        case 3:
            convertArray(responses, claRes);
            break;
        case 4:
            convertArray(responses, anyRes);
            break;
    }

    // clear options onscreen
    optionsDiv.innerHTML = "";

    // Change persona based on user response:

    // below: correct choice and currently positive -- relationship upgrades
    if(num == 1 && isPos[persona]){
        aura[persona] += 10;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][0];
        characterDiv.innerHTML = "<img src='images/" + persona + "flustered.webp' alt='flustered' id='img'>";
        if(level[persona] < 4){
            level[persona]++;
        }
    }// below: correct choice and currently negative -- relationship goes positive
    else if(num == 1 && isPos[persona] == false){
        aura[persona] += 10;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][0];
        characterDiv.innerHTML = "<img src='images/" + persona + "flustered.webp' alt='flustered' id='img'>";
        isPos[persona] = true;
    }// below: worst choice and currently positive -- relationship goes negative
    else if(num == 2 && isPos[persona]){
        aura[persona] -= 10;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][1];
        characterDiv.innerHTML = "<img src='images/" + persona + "rejected.webp' alt='rejected' id='img'>";
        isPos[persona] = false;
    }// below: worst choice and currently negative -- relationship level downgrades
    else if(num == 2 && isPos[persona] == false){
        aura[persona] -= 10;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][1];
        characterDiv.innerHTML = "<img src='images/" + persona + "rejected.webp' alt='rejected' id='img'>";
        if(level[persona] != 0){
            level[persona]--;
        }
    }// below: mid choice -- no changes
    else{
        aura[persona]++;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][2];
        characterDiv.innerHTML = "<img src='images/" + persona + "awkward.webp' alt='awkward' id='img'>";
    }

    // Update the score (auraDiv)
    auraDiv.innerHTML = "<i class='fa fa-heart'></i>   Aura level " + aura[persona];

    // Update the relationship status
    if(isPos[persona]){
        statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + upStats[persona][level[persona]];
    } else{
        statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + downStats[persona][level[persona]];
    }

    // allow user to move onto next question (done by clicking the question box)
    responded = true;
    questionDiv.className="cursor";

    // program continues when user clicks div with moveOn() function

} // rizzBack


/* PERSONA ASKS CUSTOM QUESTION */
function specialQ(q){

    // variables
    let customqs = [[],[],[],[],[],[],[],[],[],[]];
    let rando = Math.floor(Math.random() * (4 - 2) ) + 2;
    let words;
    let query;

    // 10 custom questions in array
    let camArray = [["Which of these is not true?", "Trick question; all are true", "My name is Lightning Anderson", "I am 25 years old", "I know martial arts"], ["Which of these people do I look like?", "All of them", "Griffin Foster", "Napoleon Bonaparte", "Lightning Anderson"], ["In Beyblades, a Beyblade is used for what", "Parting the Red Sea", "Taking down the Twin Towers", "The murder of Abraham Lincoln", "The construction of the pyramids"], ["Who is Finch's mother?", "Kaolyn", "Mars", "Rosco", "Josephine"], ["In what town was Maximilien de Robespierre born in?", "Arras", "Paris", "Versailles", "Caen"], ["Which is a canonical ship?", "Eli x Finch", "Mars x Finch", "Mars x Kaolyn", "Kaolyn x Eli"], ["What year did the Dream SMP begin?", "2020", "2021", "2019", "2022"], ["Of the following, who is the bad guy?", "C!Dream", "C!Tommy", "C!Tubbo", "C!Ranboo"], ["What is C!Cameron's favourite color?", "Dusty Green", "Tyrian Purple", "Blood Red", "Periwinkle Blue"], ["What profession did Lightning fear he'd end up in?", "Businessman", "Lawyer", "Freelance Writer", "Engineer"]];
    let neoArray =[["Which of the following is the chemical group name used for organic molecules designed to look like animals:", "Enynenynols", "Animols", "Therides", "Zoanes"], ["How do purple gluesticks turn clear?", "Acid base neutralization", "Redox", "Haber-Bosch Process", "Hydrolysis"], ["Which of these is not a household ingredient used in methamphetamine production?", "Shampoo", "Gasoline", "Cough medicine", "Acetone"], ["How many mg of caffiene are in my favourite energy drink?", "180", "200", "460", "130"], ["Which of these passports is the weakest?", "Iran", "Canada", "Taiwan", "United States"], ["What percent traditionalist am I according to IDR labs?", "3%", "47%", "48%", "23%"], ["The Haber process is the industrial process for making what?", "Ammonia", "Nitrogen", "Polyethlene", "Cocaine"], ["How do you solve a math equation?", "With ratio rules", "Quadratic Equation", "Listening during class", "Without consulation of the voices"], ["What does facetious mean?", "Flippant or superficial", "A voyeur", "That's not a word", "not autistic"], ["Which of these constitutes as a meal?", "Pistachios", "Half a croissant", "Energy drink", "All of them"]];
    let natArray = [["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],]
    let claArray = [["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],]
    let anyArray = [["What do I consider a pass?", "105%", "100%", "96%", "87%"], ["What do I consider a pass?", "105%", "100%", "96%", "87%"],["What do I consider a pass?", "105%", "100%", "96%", "87%"],["What do I consider a pass?", "105%", "100%", "96%", "87%"],["What do I consider a pass?", "105%", "100%", "96%", "87%"],["What do I consider a pass?", "105%", "100%", "96%", "87%"],["What do I consider a pass?", "105%", "100%", "96%", "87%"],["What do I consider a pass?", "105%", "100%", "96%", "87%"],["What do I consider a pass?", "105%", "100%", "96%", "87%"],["What do I consider a pass?", "105%", "100%", "96%", "87%"],]

    
    // fill customqs will questions specific to the persona
    switch(persona){
        case 0:
            convertArray(customqs, camArray);
            break;
        case 1:
            convertArray(customqs, neoArray);
            break;
        case 2:
            convertArray(customqs, natArray);
            break;
        case 3:
            convertArray(customqs, claArray);
            break;
        case 4:
            convertArray(customqs, anyArray);
            break;
    } // switch

    // Update the questiondiv
    questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ customqs[(q / 5) - 1][0]; // number of questions in array

    // Update the character
    characterDiv.innerHTML = "<img src='images/" + persona + "resting.webp' alt='resting' id='img'>";

    // Update the optionsdiv
    for(let i = 2; i < 5; i++){
        if(i == rando){
        optionsDiv.innerHTML += "<div onclick='optionClicked(\"" + customqs[(q / 5) - 1][1] + "\", true)' id='choice' class='cursor'>" + customqs[(q / 5) - 1][1] + "</div>";
        }
        optionsDiv.innerHTML += "<div onclick='optionClicked(\"" + customqs[(q / 5) - 1][i] + "\", false)' id='choice' class='cursor'>" + customqs[(q / 5) - 1][i] + "</div>";
    } // for

    // (potential edit to above-- add an if = 5 to solve, and increase rando max by 1 to enable last option)

    // find key hint in answer
    words = customqs[(q / 5) - 1][1].split(" ");
    query = words[words.length - 1];

    // change the hint image in the lightbox
    fetchImages(query);

} // specialQ


/* LOAD PERSONA-SPECIFIC CONTENT INTO ARRAY */
function convertArray(customqs, array){

    for(let i = 0; i < array.length; i++){
        for(let j = 0; j < array[i].length; j++){
            customqs[i][j] = array[i][j];
        }
    }

} // convertArray


/* MAKE ARROW KEYS SWITCH PERSONAS */
function next(change){
    let max = 4; // total number of personas -1

    if(doing != "flirt" && doing != "win"){


        // change persona
        if(persona == 0 && change == -1){
            persona = max;
        } else if(persona == max && change == 1){
            persona = 0
        } else{
            persona += change;
        }

        // make sure aura level updates
        auraDiv.innerHTML = "<i class='fa fa-heart'></i>   Aura level " + aura[persona];

        // make sure status div updates
        if(isPos[persona]){
            statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + upStats[persona][level[persona]];
        } else{
            statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + downStats[persona][level[persona]];
        }

        // load questions of the persona's category
        switch(persona){
            case 0:
                nameDiv.innerHTML = "Cameron";
                fetchContent("10"); // books for cam
                break;
            case 1:
                nameDiv.innerHTML = "Neo";
                fetchContent("17"); // sci for neo
                break;
            case 2:
                nameDiv.innerHTML = "Nathan";
                fetchContent("17"); // sci for nat
                break;
            case 3:
                nameDiv.innerHTML = "Clarisse";
                fetchContent("20"); // book for clar
                break;
            case 4:
                nameDiv.innerHTML = "Anya";
                fetchContent("17"); // sci for anya
                break;
        }

    } // if not doing flirt

} // next


/* SHOWS HINT IN LIGHTBOX FOR TRIVIA QUESTIONS */
function showHint(){

    if(doing == "trivia"){

        // find key hint in answer
        let words = data.results[q].correct_answer.split(" ");
        let query = words[words.length - 1];

        // get image to match key hint
        fetchImages(query);
    } else if(doing == "flirt"){

        // show rizzy image if flirting
        picDiv.innerHTML = "<img src='images/getrizzy.webp' alt='image'>";
    }
    // if program is running a custom question, the hint will already be in the lightbox

    // open lightbox
    if(!hintShowing){
        lightboxDiv.style.display = "block";
        hintShowing = true;
    }

} // showHint


/* OPEN GAME MENU IN LIGHTBOX */
function showMenu(){

    // add menu text
    picDiv.innerHTML =  `<strong>There's a reason your name is Santa DeGyatt:</strong> You're a big, burly man, who can do anything a certain Pan can.<br><br> Yet despite being so locked into that grind, your allegiance seems to be faulty-- and damn, in the most dank of places, high school, a special someone catches your eye. Scratch that, a special some two. Or, maybe three.<br><br>Actually, <em> you want them ALL.</em>` +
    `<br><br>There's only one way to rizz your classmates: Prove you understand their hyperfixations, flirt till your aura maxxes, and embody Joseph Smith.`+
    `<br><br>As you correctly answer trivia questions, watch your aura grow. These students may just start flirting with you, so you better get rizzy. Can you become the ultimate Mormon, and marry them all?`+
    `<br><br>CONTROLS:<br>- click the dialogue box to move on<br>- click the options when they appear<br>- click the hint button for a visual clue<br>- click the arrows to meet new people`;

    // open lightbox
    if(!hintShowing){
        lightboxDiv.style.display = "block";
        hintShowing = true;
    }

} // showMenu


/* RUN INTRODUCTION DIALOGUE IF PLAYER AND PERSONA HAVE NOT "MET" */
function introduce(met){

    // variables
    introArray = [["hey im cam", "oh haha... um do you know lightning anderson", "um"], ["hey im neo", "do you like chem", "um"], ["hey im Nathan", "Wanna talk about musicals?", "um"],["What's up?", "Nice to meet you. I'm Clarisse","Eh, just chillin'"],["hey, I'm Anya", "Oh nice", "yuh"]];
    userIntros = [["hello Cameron, I'm Santa", "huh what?"],["hello Neo, I'm Santa", "huh what?"],["hello Nathan, I'm Santa", "huh what?"],["Oh Hii Clarisse", "huh what?"],["hello Anya, I'm Santa", "huh what?"]]

    // change character pose
    characterDiv.innerHTML = "<img src='images/" + persona + "shy.webp' alt='shy' id='img'>";

    // change background
    document.body.style.backgroundImage = "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('images/" + persona + "background.webp')";

    // show question
    questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ introArray[persona][met];    

    // introduce character
    if(met == 0){
        optionsDiv.innerHTML = "<div onclick='optionClicked(\"" + "intro" + "\", true)' id='choice' class='cursor'>" + "hi, I'm Sana" + "</div>"; // potentially change this feature later
    } else if(met == 1){
        optionsDiv.innerHTML = "<div onclick='optionClicked(\"" + "transition" + "\", true)' id='choice' class='cursor'>" + "huh? what's up" + "</div>"; // potentially change this feature later
    } else{
        responded = true;
        questionDiv.className="cursor";
        introduced[persona] = true;
    }

} // introduce


/* SHOW WIN SCREEN IF PLAYER HAS RIZZMAXXED A PERSONA  */
function seduce(){

    // variables
    let wins = [["WIFEYYYYY", ";)"],["WIFEYYYYY", ";)"],["WIFEYYYYY", ";)"],["WIFEYYYYY", ";)"],["WIFEYYYYY", ";)"]];

    // change aura div
    auraDiv.innerHTML = "<i class='fa fa-heart'></i>   Aura level 69,000,000";

    // change status div
    statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + wins[persona][0];

    // change question div
    questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ wins[persona][1];

    // change image
    characterDiv.innerHTML = "<img src='images/" + persona + "seduced.webp' alt='seduced' id='img'>";

} // seduce

