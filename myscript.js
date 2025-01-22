/* TO DO

- FETCH ERROR CONTINUE BUTTTON
- achievement for unlocking married rank

- make study edition (add own study questions)
- fix the hitchhiker's guide to the galaxy error (quotation marks >:/ )

*/

/* * * * * * * * * * * * * * * * * * 
WHEN ADDING ANOTHER PERSONA:
- add array of 10 questions (with answer and options) to specialQ()
- add case to specialQ()
- 8 new images to images folder
- flirt responses to flirt()
- custom responses to rights and wrongs
- change max number in next()
- add three dialogue part "shy" intro
- change number in onload for loops
* * * * * * * * * * * * * * * * * * */

// global variables
let characterDiv;
let nameDiv;
let questionDiv;
let optionsDiv; 
let auraDiv;
let statusDiv;
let picDiv;
let hintDiv;
let lightboxDiv;
let data;
let responded; // makes clicking the next box work
let aura = []; // each index is user score with a different persona
let level = []; // each index is user status with a different persona
let q; // question number
let persona; // person ur talking to (0 is cam, 1 is neo, 2 is nathan, 3 is clarisse, 4 is anya, 5 to be eli, 6 to be lane, 7 to be gabby)
let f; // number that increases aura threshold to unlock flirt
let hintShowing; // if lightbox is on or off
let doing; // if the user is doing trivia, custom q, or flirting, so program can display correct image in lightbox
let introduced = []; // shows character's intro dialogue if false
let isPos = []; // if the character and user have a postive relationship showing
let upStats = [[],[],[],[],[]];
let downStats = [[],[],[],[],[]];

// trivia api
let apiURL = "https://opentdb.com/api.php?amount=20";
// pexels api
let pexelsURL = "https://api.pexels.com/v1/search?query=";
let apiKey = "1cYKSXsNvhqi7Jj7dPdTuvZjjRO1r06OUW9qEByS6axGiixAyFRObC2m";


// Run this function when the page finishes loading
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
    f = 0;
    hintShowing = false;

    // set all aurascores and status levels to zero (change i < number depending on number of personas)
    for(let i = 0; i < 5; i++){
        aura[i] = 0;
        level[i] = 0;
        introduced[i] = false;
        isPos[i] = true;
    } // for

    // statuses
    upStats = [["Strangers", "Friends", "Situationship", "Dating", "Married"],["Strangers", "y'all are chill", "Friends", "Lab Partners", "Married"],["Strangers", "Fellow nerds", "Friends", "Dating", "Married"],["Strangers", "Aquaintances", "Friends", "Dating but without the dating part", "Married"],["Strangers", "\"no way i know that person!\"", "Friends", "Besties", "Married"]];
    downStats = [["Major Beef", "... not really friends anymore", "Ex-situationship???", "Exes", "Divorced"],["no lore", "y'all are not chill", "Just people", "Friends (ex-lab partners)", "Divorced"],["Irrelvant to each other", "Friends of friends", "Classmates", "Exes", "Divorced"],["Y'all have negative chemistry", "Mildy Aquainted", "Classmates", "JUST friends", "Divorced"],["NPCs", "Aquaintances", "Classmates", "Friends but there's drama?", "Divorced"]];

    // make it so lightbox is closed when clicked
    //lightboxDiv.style.display = "none";
    lightboxDiv.onclick = function () {
        lightboxDiv.style.display = "none";
        hintShowing = false;
    };

    // open menu to start
    showMenu();

    console.log("PERSONA = " + persona)
  
    // run fetch content to fill questions array
    fetchContent("10", "easy"); // runs cam's questions first

    

    // run fetch images to fill images array
    //fetchImages("bird");
} // window.onload


// Function to fetch data from the API
// Uses async/await for modern asynchronous code handling
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

    try {
        response = await fetch(apiURL + "&category=" + category + "&difficulty=" + diff);

        // Convert the response to JSON format
        data = await response.json();
    
        console.log(data);
        console.log(data.results[q].question);

        changeContent();

    } catch (error) {
        // Handle errors that may occur while fetching data
        console.error('Error fetching question:', error);
        alert("haha fetch error ¯\\_(ツ)_/¯");
    }
} // fetchContent




// fetches images
async function fetchImages(query) {
    
    try {

        let response = null;

        console.log(query);

        // get better image for false in t/f questions
        if(query == "False"){
            query = "bad";
        } // if

        console.log("new" + query);

        //if(!query) return alert("please enter a keyword");
        response = await fetch(pexelsURL + query + "&per_page=1", {headers: {Authorization: apiKey}});
        let data = await response.json();
        //const photo = data.photos[0];

        console.log(data);
        //console.log(photo);
        picDiv.innerHTML = "<img src='" + data.photos[0].src.tiny + "' alt='image'>";
        

        /*
        response = await fetch(pexelsURL);

        // Convert the response to JSON format
        let picData = await response.json();

        console.log(picData);
        //console.log(data.results[q].question);

        //changeContent(data);
        */
  } catch (error) {
    // show a default image
    picDiv.innerHTML = "<img src='images/nopic.webp' alt='image'>";
    // Handle errors that may occur while fetching data
    //console.error('Error fetching image:', error);
  }
    
} // fetchImages


// Function to update the content displayed on the page
function changeContent() {

    // variables
    let threshold = [3, 14, 25, 36, 47];        // is 60 needed?   [5, 18, 32, 45, 60]; // currently set to playtest mode

    console.log("lock in?")

    // get new data is theres no more questions in array
    if(q > data.results.length - 1){
        q = 0;

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

    // aura[persona] > 71 && level[persona] == 4
    // PLAYTESTING SECDUCE -- aura[persona]  == 2

    if(aura[persona] > 60 && level[persona] == 4){              // set to 60 for playtest mode, and 71 for real play
        doing = "win";
        seduce();
    }else if(introduced[persona] == false){
        introduce(0);
    }else if(aura[persona] > threshold[f]){
        doing = "flirt";
        flirt();
        f++;
        // thing
        // if aura[persona] > array[thing]
        // call flirt()
        // thing++

    } else if(q % 5 == 0 && q != 0){
        doing = "custom"
        specialQ(q);
    } else{
        doing = "trivia";
        askTrivia();
    }

    // if q is a special number
    // detour --> custom question
    // remember to q++
    // else if aura is a special number
    // detour --> flirt
    // aura gets major bonus from points
    // if u get the flirt correct, major upgrade (wifey, etc.)
    // remember to q++

} // changeContent

function askTrivia(){

    let options;

    console.log("q is " + q);

    // Update the questiondiv
    questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ data.results[q].question;

    // Update the character
    characterDiv.innerHTML = "<img src='images/" + persona + "resting.webp' alt='placeholder' id='img'>";

    
    console.log(data.results[q].correct_answer)

    // error check: answers from last question still appear
    options = getAnswers();

    console.log("options array: " + getAnswers() + options);

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
            optionsDiv.innerHTML += "<div onclick='optionClicked(\"" + option + "\", true)' id='choice'>" + option + "</div>";
        }else{
            optionsDiv.innerHTML += "<div onclick='optionClicked(\"" + option + "\", false)' id='choice'>" + option + "</div>";
        }
    }

    //Update the pexelsdiv
    //fetchImages("cat");

} // askTrivia


// function to make an array of answers
function getAnswers(){

    // adds correct answer
    let options = [data.results[q].correct_answer];

    // adds incorrect answers
    for(let option of data.results[q].incorrect_answers){
        options.push(option);
    } // for

    /*// removes illegal characters (like quotation marks)
    for(let elem of options){
        if(elem.includes("&quot")){
            elem.replace("&quot", "'");
            console.log(elem)
        } // if
    } // for*/

    // sorts them alphabetically to randomize
    options.sort();

    return options;
} // getAnswers


// check if answer is right and tell user
function optionClicked(option, isAnswer){

    // variables
    let customRight = [["wow pooki i love that u know that", "omg i've never met someone who knows that", "ur amazing"],["wow pooki i love that u know that", "omg i've never met someone who knows that", "ur amazing"],["wow pooki i love that u know that", "omg i've never met someone who knows that", "ur amazing"],["I vibe with that so hard.","Yass, Oh my gawd! It's seems you're a random knowledge enjoyer as well.",":D"],["I vibe with that so hard.","Yass",":D"]];
    let customWrong = [["um... well not exactly :(", "No actually, it's...", "what."],["um... well not exactly :(", "No actually, it's...", "what."],["um... well not exactly :(", "No actually, it's...", "what."],["bro wut??","Is it? Cause's I thought it was something else... hmmm","Oh really? I didn't know that-- where did you learn that :|"],["no","bad","ugh"]];
    let rando =  Math.floor(Math.random() * (2 - 0 + 1)) + 0; // change depending on number of custom answers

    // clear options
    optionsDiv.innerHTML = "";


    if(option == "intro"){
        introduce(1);
    } else if(option == "transition"){
        introduce(2);
    }else if(isAnswer){
        aura[persona]++;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ customRight[persona][rando];
        characterDiv.innerHTML = "<img src='images/" + persona + "impressed.webp' alt='placeholder' id='img'>";
        console.log("correct");
    }else{
        aura[persona]--;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ customWrong[persona][rando];
        characterDiv.innerHTML = "<img src='images/" + persona + "disappointed.webp' alt='placeholder' id='img'>";
        console.log("incorrect");
    }

    // Update the score (auraDiv)
    auraDiv.innerHTML = "<i class='fa fa-heart'></i>   Aura level " + aura[persona];
    console.log("score: " + aura[persona]);

    // allow user to move onto next question (done by clicking the question box)
    responded = true;

    // to move onto next question, user clicks box (the code below will be moved there)

    // perhaps add a div tag that tells them this
    

} // optionClicked


function moveOn(){

    console.log("clicked");
    console.log(responded);


    if(doing == "win"){
        alert("oh... it seems you've rizzed " + nameDiv.innerHTML + " to the max. The real question is, can you pull them in real life, you CHRONICALLY ONLINE virgin");
        doing = "unknown";
        optionsDiv.innerHTML += "<div onclick='next(1)' id='choice'> Okay um bye " + nameDiv.innerHTML + "! I'm gonna go real quick...</div>";
    } else if(responded){// only run function if user has actually answered questions

        // set responded to false
        responded = false;

        console.log(responded);

        // add move on parts
        q++;

        // call change content to give next question
        changeContent();

    } // if
    
    
} // moveOn


// gives the user a dating question
function flirt(){

    // variables
    let flirts = [[],[],[],[],[]];
    let permut = [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]];
    let rando = Math.floor(Math.random() * (6 - 1) ) + 1;

    // 3 flirts per array -- INCREASE THIS NUMBER
    let camFlirts = [["Wow! We have a a lot in common you know", "Yeah we should hang out sometime", "not really", "yeah we show lowkey be friends"],["hey shawty, want my number?", "yes", "no", "um why"],["literally marry me. please. please?", "of course wifey", "no ew what", "i'm down but i've already got a wife if ur cool with that"],["placeholder flirt","best","worst","mid"],["placeholder flirt","best","worst","mid"]];
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



    // THERE IS AN ERROR BELOW IF ARRAY RUNS OUT OF FLIRTS

    // update the questiondiv
    questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ flirts[level[persona]][0];
    characterDiv.innerHTML = "<img src='images/" + persona + "flirtatious.webp' alt='placeholder' id='img'>";

    
    // Update the optionsdiv (can be randomized later with a permutation array)
    console.log(permut[rando][0]);


    optionsDiv.innerHTML += "<div onclick='rizzBack(" + permut[rando][0] +")' id='choice'>" + flirts[level[persona]][(permut[rando][0])] + "</div>";
    optionsDiv.innerHTML += "<div onclick='rizzBack(" + permut[rando][1] +")' id='choice'>" + flirts[level[persona]][(permut[rando][1])] + "</div>";
    optionsDiv.innerHTML += "<div onclick='rizzBack(" + permut[rando][2] +")' id='choice'>" + flirts[level[persona]][(permut[rando][2])] + "</div>";
   
    /*
    optionsDiv.innerHTML += "<div onclick='rizzBack(1)' id='choice'>" + flirts[level][1] + "</div>";
    optionsDiv.innerHTML += "<div onclick='rizzBack(2)' id='choice'>" + flirts[level][2] + "</div>";
    optionsDiv.innerHTML += "<div onclick='rizzBack(3)' id='choice'>" + flirts[level][3] + "</div>";
    */

} // flirt


// processes user response to flirt
function rizzBack(num){

    // five upStats: strangers, aquainted, friends, friends ;), married
    // cam          strangers, friends, situationship, dating, married
    // neo          strangers, y'all are chill, friends, lab partner, married
    // nat          strangers, fellow nerd, friends, dating, married

    // five downStats:
    // clar         she dgaf, mildy aquainted, classmates, just friends, divorced
    // cam          opps, aquainted /neg, ex-situationship???, exes, divorced
    // neo          dislikes each other, y'all are not chill, random people, ex-lab partner, divorced
    // nat          he's lowkey annoyed, friends of friends, classmates, exes, divorced

    // level

    // if choice is correct, and upStat is showing, then upStat ++
    // if choice is correct, and downStat is showing, show upStat
    // if choice is bad, and upStat is showing, show downStat
    // if choice is bad, and downStat is showing, downStat--
    // if cant go further down, stays the same
    // if choice is mid, stays the same


    // variables
    let responses = [[],[],[],[],[]];
    //let statuses = ["Opps", "Strangers", "Acquaintances", "Friends", "Situationship", "Exes", "Dating", "Divorced", "Married"];

    // 5 responses (cuz theres 5 flirts)
    let camRes = [["Yes! I'll grab your number when my phone's handy.", "damn. screw you", "yeah."],["it's 123-456-7890", "oh... I'm sorry ok", "uhhh so we... how bout I just give it to you."],["i love you wifey", "i- it was a joke. i guess :(", "shiiii ok girl, um yeah that's fine"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"]];
    let neoRes = [["Yes! I'll grab your number when my phone's handy.", "damn. screw you", "yeah."],["it's 123-456-7890", "oh... I'm sorry ok", "uhhh so we... how bout I just give it to you."],["i love you wifey", "i- it was a joke. i guess :(", "shiiii ok girl, um yeah that's fine"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"]];
    let natRes = [["Yes! I'll grab your number when my phone's handy.", "damn. screw you", "yeah."],["it's 123-456-7890", "oh... I'm sorry ok", "uhhh so we... how bout I just give it to you."],["i love you wifey", "i- it was a joke. i guess :(", "shiiii ok girl, um yeah that's fine"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"]];
    let claRes = [["Yes literally! We're actually locked in right now", ". . .", "let's go dude"],["I'm clarclar17... I can type it in for you", "yeah that's fair. All of my friends have a different free day and none of our schedules align :(", "You're really cool bro! Anyway--"],["you... um-- uh yeah okay lemme grab my bike outside", "oh womp womp. Ok, I guess...", "Yeah that's chill bro. Another time."],["Actually so real tho! Tax benefits, passports, citizenship; we're set. I'm your wife now.", "oh um I don't know. Allegations... I hear?", "Bro, every Challenge kid is married to the grind! That doesn't count. and Clam? haha no you don't need to worry about that--"],[";)", "Oh okay... byeeee!", "Awww c'mon... ok hop on Dress to Impress with me when you're home though"]];
    let anyRes = [["Yes literally! We're actually locked in right now", ". . .", "let's go dude"],["I can type it in for you", "yeah that's fair. All of my friends have a different free day... none of them sync up :(", "You're really cool bro! Anyway--"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"],["Thanks girlie! Ur my wife now", "bruh", "uh sure. whatever"]];


    /*
    // statuses
    let upStats = [["strangers", "friends", "situationship", "dating", "married"],["strangers", "y'all are chill", "friends", "lab partners", "married"],["strangers", "fellow nerd", "friends", "dating", "married"],["strangers", "aquainted", "friends", "friends ;)", "married"],["strangers", "aquainted", "friends", "best friends", "married"]];
    let downStats = [["opps", "aquainted /neg", "ex-situationship???", "exes", "divorced"],["dislikes each other", "y'all are not chill", "random people", "ex-lab partner", "divorced"],["he's lowkey annoyed", "friends of friends", "classmates", "exes", "divorced"],["she dgaf", "mildy aquainted", "classmates", "just friends", "divorced"],["she dgaf", "mildy aquainted", "classmates", "just friends", "divorced"]];
    */

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


    // change above to a multidimensional array
    // level ups jump by 2
    // level downs go down by 1
    // in an example array, start at strangers
    // opps, strangers, acquaintances, friends, situationship, exes, dating, divorced, married
    // for neo, could be like like partners or something 

    // clear options
    optionsDiv.innerHTML = "";

    // give user points and change level
    /*
    if(num == 1){
        aura[persona] += 10;
        console.log("best");
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][0];
        characterDiv.innerHTML = "<img src='images/" + persona + "flustered.webp' alt='placeholder' id='img'>";
        level[persona]++;
    }else if(num == 2){
        aura[persona] -= 10;
        console.log("worst");
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][1];
        characterDiv.innerHTML = "<img src='images/" + persona + "rejected.webp' alt='placeholder' id='img'>";
        if(level[persona] != 0){
            level[persona]--;
        }
    }
    else{
        aura[persona]++;
        console.log("no change");
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][2];
        characterDiv.innerHTML = "<img src='images/" + persona + "awkward.webp' alt='placeholder' id='img'>";
    }*/

    // give user points and change level

    // below: correct choice and currently positive -- relationship upgrades
    if(num == 1 && isPos[persona]){
        aura[persona] += 10;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][0];
        characterDiv.innerHTML = "<img src='images/" + persona + "flustered.webp' alt='placeholder' id='img'>";
        if(level[persona] < 4){
            level[persona]++;
        }
    }// below: correct choice and currently negative -- relationship goes positive
    else if(num == 1 && isPos[persona] == false){
        aura[persona] += 10;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][0];
        characterDiv.innerHTML = "<img src='images/" + persona + "flustered.webp' alt='placeholder' id='img'>";
        isPos[persona] = true;
    }// below: worst choice and currently positive -- relationship goes negative
    else if(num == 2 && isPos[persona]){
        aura[persona] -= 10;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][1];
        characterDiv.innerHTML = "<img src='images/" + persona + "rejected.webp' alt='placeholder' id='img'>";
        console.log("huhhh")
        isPos[persona] = false;
    }// below: worst choice and currently negative -- relationship level downgrades
    else if(num == 2 && isPos[persona] == false){
        aura[persona] -= 10;
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][1];
        characterDiv.innerHTML = "<img src='images/" + persona + "rejected.webp' alt='placeholder' id='img'>";
        if(level[persona] != 0){
            level[persona]--;
        }
    }// below: mid choice -- no changes
    else{
        aura[persona]++;
        console.log("no change");
        questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ responses[level[persona]][2];
        characterDiv.innerHTML = "<img src='images/" + persona + "awkward.webp' alt='placeholder' id='img'>";
    }


    // Update the score (auraDiv)
    auraDiv.innerHTML = "<i class='fa fa-heart'></i>   Aura level " + aura[persona];
    console.log("score: " + aura[persona]);

    /*// Update the level (status)
    statusDiv.innerHTML = "Status: " + statuses[level[persona]] + ""; // ADD ICON HERE??? UWU
    console.log(isPos)*/

    if(isPos[persona]){
        statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + upStats[persona][level[persona]];
        console.log("code is very broken")
    } else{
        statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + downStats[persona][level[persona]];
        console.log("gurl u tripping")
    }


    // perhaps add alert to tell user about the status change

    // allow user to move onto next question (done by clicking the question box)
    responded = true;

    // to move onto next question, user clicks box

} // rizzBack

function specialQ(q){

    // variables
    let customqs = [[],[],[],[],[],[],[],[],[],[]];

    // 10 questions in array
    let camArray = [["Which of these is not true?", "Trick question; all are true", "My name is Lightning Anderson", "I am 25 years old", "I know martial arts"], ["Which of these people do I look like?", "All of them", "Griffin Foster", "Napoleon Bonaparte", "Lightning Anderson"], ["In Beyblades, a Beyblade is used for what", "Parting the Red Sea", "Taking down the Twin Towers", "The murder of Abraham Lincoln", "The construction of the pyramids"], ["Who is Finch's mother?", "Kaolyn", "Mars", "Rosco", "Josephine"], ["In what town was Maximilien de Robespierre born in?", "Arras", "Paris", "Versailles", "Caen"], ["Which is a canonical ship?", "Eli x Finch", "Mars x Finch", "Mars x Kaolyn", "Kaolyn x Eli"], ["What year did the Dream SMP begin?", "2020", "2021", "2019", "2022"], ["Of the following, who is the bad guy?", "C!Dream", "C!Tommy", "C!Tubbo", "C!Ranboo"], ["What is C!Cameron's favourite color?", "Dusty Green", "Tyrian Purple", "Blood Red", "Periwinkle Blue"], ["What profession did Lightning fear he'd end up in?", "Businessman", "Lawyer", "Freelance Writer", "Engineer"]];
    let neoArray =[["Which of the following is the chemical group name used for organic molecules designed to look like animals:", "Enynenynols", "Animols", "Therides", "Zoanes"], ["How do purple gluesticks turn clear?", "Acid base neutralization", "Redox", "Haber-Bosch Process", "Hydrolysis"], ["Which of these is not a household ingredient used in methamphetamine production?", "Shampoo", "Gasoline", "Cough medicine", "Acetone"], ["How many mg of caffiene are in my favourite energy drink?", "180", "200", "460", "130"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"]];
    let natArray = [["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],]
    let claArray = [["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],]
    let anyArray = [["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"], ["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],["placeholder question?", "answer", "wrong option", "wrong option", "wrong option"],]

    //let camArray = [["which of these is not a household ingredient used in methamphetamine production?", "shampoo", "gasoline", "cough medicine", "acetone"],["which of these is not true?", "trick question all are true", "my namne is lightning", "i am 25 years old", "i know martial arts"],["ton-618 is what?", "blackhole", "exoplanet", "ur mom", "mathematical constant"],["which of these is not true?", "trick question all are true", "my namne is lightning", "i am 25 years old", "i know martial arts"],["which of these is not true?", "trick question all are true", "my namne is lightning", "i am 25 years old", "i know martial arts"]];
    //let neoArray = [["which of these is not a household ingredient used in methamphetamine production?", "shampoo", "gasoline", "cough medicine", "acetone"],["which of these is not true?", "trick question all are true", "my namne is lightning", "i am 25 years old", "i know martial arts"],["ton-618 is what?", "blackhole", "exoplanet", "ur mom", "mathematical constant"],["which of these is not true?", "trick question all are true", "my namne is lightning", "i am 25 years old", "i know martial arts"],["which of these is not true?", "trick question all are true", "my namne is lightning", "i am 25 years old", "i know martial arts"]];
    //let natArray = [["which of these is not a household ingredient used in methamphetamine production?", "shampoo", "gasoline", "cough medicine", "acetone"],["which of these is not true?", "trick question all are true", "my namne is lightning", "i am 25 years old", "i know martial arts"],["ton-618 is what?", "blackhole", "exoplanet", "ur mom", "mathematical constant"],["which of these is not true?", "trick question all are true", "my namne is lightning", "i am 25 years old", "i know martial arts"],["which of these is not true?", "trick question all are true", "my namne is lightning", "i am 25 years old", "i know martial arts"]];
    let rando = Math.floor(Math.random() * (4 - 2) ) + 2;
    let words;
    let query;

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
    characterDiv.innerHTML = "<img src='images/" + persona + "resting.webp' alt='placeholder' id='img'>";

    console.log("random number is" + rando)
    // Update the optionsdiv
    for(let i = 2; i < 5; i++){
        if(i == rando){
        optionsDiv.innerHTML += "<div onclick='optionClicked(\"" + customqs[(q / 5) - 1][1] + "\", true)' id='choice'>" + customqs[(q / 5) - 1][1] + "</div>";
        }
        optionsDiv.innerHTML += "<div onclick='optionClicked(\"" + customqs[(q / 5) - 1][i] + "\", false)' id='choice'>" + customqs[(q / 5) - 1][i] + "</div>";
    } // for

    // know that this is flawed, as it cannot be the last option
    // (add an if = 5 to solve, and increase rando max by 1)

    // find key hint in answer
    words = customqs[(q / 5) - 1][1].split(" ");
    query = words[words.length - 1];

    console.log("custom" + query);

    // change the image in the lightbox
    console.log(query);
    fetchImages(query);


} // specialQ

// loads current character's questions into customqs array
function convertArray(customqs, array){

    for(let i = 0; i < array.length; i++){
        for(let j = 0; j < array[i].length; j++){
            customqs[i][j] = array[i][j];
        }
    }

} // convertArray


function next(change){
    let max = 4; // total number of personas -1

    if(doing != "flirt" && doing != "win"){

        console.log(persona + " is the person")
        console.log(change + "is the change")

        if(persona == 0 && change == -1){
            persona = max;
            console.log("max "+ persona)
        } else if(persona == max && change == 1){
            persona = 0
        } else{
            persona += change;
        }

        console.log(persona);

        // make sure aura level updates
        auraDiv.innerHTML = "<i class='fa fa-heart'></i>   Aura level " + aura[persona];

        // make sure status div updates
        if(isPos[persona]){
            statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + upStats[persona][level[persona]];
            console.log("code is very broken")
        } else{
            statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + downStats[persona][level[persona]];
            console.log("gurl u tripping")
        }

        // add function call here (and maybe recheck status) to ensure smooth transition
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
        
        // later add feature to make it fetch from a variety of categories (aka pick a random category each time)
    } // if not doing flirt

} // next


function showHint(){

    console.log(doing)

    if(doing == "trivia"){
        // find key hint in answer
        let words = data.results[q].correct_answer.split(" ");
        let query = words[words.length - 1];

        // get image to match key hint
        console.log(query);
        fetchImages(query);
    } else if(doing == "flirt"){
        picDiv.innerHTML = "<img src='images/getrizzy.webp' alt='image'>";
        
    }


    // open lightbox
    if(!hintShowing){
        lightboxDiv.style.display = "block";
        hintShowing = true;
    }

} // showHint

function showMenu(){

    // add menu text
    picDiv.innerHTML =  `<strong>There's a reason your name is Santa DeGyatt:</strong> You're a big, burly man, who can do anything a certain Pan can.<br><br> Yet despite being so locked into that grind, your allegiance seems to be faulty-- and damn, in the most dank of places, high school, a special someone catches your eye. Scratch that, a special some two. Or, maybe three.<br><br>Actually, <em> you want them ALL.</em>` +
    `<br><br>There's only one way to rizz your classmates: Prove you understand their hyperfixations, flirt till your aura maxxes, and embody Joseph Smith.`+
    `<br><br>As you correctly answer trivia questions, watch your aura grow. These students may just start flirting with you, so you better get rizzy. Can you become the ultimate Mormon, and marry them all?`+
    `<br><br>CONTROLS:<br>- click the dialogue box to move on<br>- click the options when they appear<br>- click the hint button for a visual clue<br>- click the arrows to meet new people`;

/*
    "<pre>\nwelcome \n- terrible catch phrase\n- blurb of the scene\n" + 
    "\nexplanation\n- there's only one way to rizz them: prove you understand their hyperfixations fully.\n" + 
    "- as you correctly answer trivia questions, watch your aura grow\n" + 
    "- they may just start flirting with you... so be ready to get rizzy\n" + 
    "- can you become the ultimate mormon, and marry them all?\n" + 
    "\nCONTROLS\n- click the dialogue box to move on\n- click the options when they appear\n- click the hint button for a visual clue for the trivia questions\n\n[PLAY BUTTON]</pre>";
*/
    // open lightbox
    if(!hintShowing){
        lightboxDiv.style.display = "block";
        hintShowing = true;
    }

} // showMenu

function introduce(met){

    // variables
    introArray = [["hey im cam", "oh haha... um do you know lightning anderson", "um"], ["hey im neo", "do you like chem", "um"], ["hey im Nathan", "Wanna talk about musicals?", "um"],["What's up?", "Nice to meet you. I'm Clarisse","Eh, just chillin'"],["hey, I'm Anya", "Oh nice", "yuh"]];
    userIntros = [["hello Cameron, I'm Santa", "huh what?"],["hello Neo, I'm Santa", "huh what?"],["hello Nathan, I'm Santa", "huh what?"],["Oh Hii Clarisse", "huh what?"],["hello Anya, I'm Santa", "huh what?"]]

    // change character pose
    characterDiv.innerHTML = "<img src='images/" + persona + "shy.webp' alt='placeholder' id='img'>";

    // change background
    document.body.style.backgroundImage = "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('images/" + persona + "background.jpg')";

    // show question
    questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ introArray[persona][met];    

    // introduce character
    if(met == 0){
        optionsDiv.innerHTML = "<div onclick='optionClicked(\"" + "intro" + "\", true)' id='choice'>" + "hi, I'm Sana" + "</div>"; // potentially change this feature later
    } else if(met == 1){
        optionsDiv.innerHTML = "<div onclick='optionClicked(\"" + "transition" + "\", true)' id='choice'>" + "huh? what's up" + "</div>"; // potentially change this feature later
    } else{
        responded = true;
        introduced[persona] = true;
    }

} // introduce


function seduce(){

    // aura = 69,000,000
    // status = ["WIFEYYYYY", "POOKIE"]
    // question = ["oh..ok then ;)", ";)"]
    // image = seduced
    // alert -- it seems you've rizzed [name] to the max... why don't you try in person now?

    // variables
    let wins = [["WIFEYYYYY", ";)"],["WIFEYYYYY", ";)"],["WIFEYYYYY", ";)"],["WIFEYYYYY", ";)"],["WIFEYYYYY", ";)"]];


    // change aura div
    auraDiv.innerHTML = "<i class='fa fa-heart'></i>   Aura level 69,000,000";

    // change status div
    statusDiv.innerHTML = "<i class='fa fa-comments'></i>   Status: " + wins[persona][0];

    // change question div
    questionDiv.innerHTML = " <div id='name'>" + nameDiv.innerHTML + "</div>"+ wins[persona][1];

    // change image
    characterDiv.innerHTML = "<img src='images/" + persona + "seduced.webp' alt='placeholder' id='img'>";



} // seduce

