const themeGreen = '#00cec9';
const themeBlue = '#74b9ff';
const themePurple = '#a29bfe';
const smileyGreen = [0, 184, 148];
const smileyRed = [184, 0, 36];

let aButton; //these are the multiple choice buttons
let bButton;
let cButton;
let resetButton; //this is the start/reset button

let debug = true; //used to turn debug statements on and off
let gameState = 0; //start and end screen
let activeQuestion = 0; //used for displaying the questions
let scoreTotal = 0; //calculating the cumulative score

let jsondata; //variable that will hold the json

let questions = []; //array of questions
let answers = []; //array of questions

let correctSound; //sounds made when question is answered right or wrong
let incorrectSound;

let smile = null; //this determines if smiley will be displayed or not

function shuffleCustom(array) { //https://www.frankmitchell.org/2015/01/fisher-yates/
  let i = 0; //this shuffles the array
  let j = 0;
  let temp = null;

  console.log('shuffle started');

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    console.log(array);
  }
}

function preload() {
  jsondata = loadJSON('us_state_capitals.json'); //this preloads the json so I don't run into synchronicity issues
  correctSound = loadSound('correct.mp3');
  incorrectSound = loadSound('incorrect.mp3');
}


class Trivia { //base class for displaying question and answer

  if (debug) {
    console.log('Trivia object created');
  }

  constructor(i, x_, y_, c) {
    this.info = i; //question text
    this.x = x_; //x position
    this.y = y_; //y position
    this.c = c; //capital (answer)
  }

  display() {
    push(); //this makes text size responsive based on canvas width
    textSize(width / 30);
    textAlign(CENTER);
    text(this.info, this.x, this.y);
    pop();
  }
}

//class for displaying a question
class Question extends Trivia {
  //info is the question text

  constructor(i, x_, y_, c, s) {
    super(i, x_, y_, c);
    this.score = s;

    if (debug) {
      console.log('question object created');
    }
  }
}

//For the answers, I want to create an array of three possible answers. One will be the
// correct answer, and two will be two random incorrect answers. Then, I want to randomize the
// order of them, and lastly, display them on the canvas.

class Answer extends Trivia {

  constructor(i, x_, y_, c) {
    super(i, x_, y_, c);
  }

  returnAnswerTwo(l) {
    let ans = Math.floor(Math.random() * 49);
    if (ans == l) {
      return this.returnAnswerTwo(l);
    } else {
      console.log(ans);
      return ans;
    }
  }

  returnAnswerThree(l, ans2) {
    let ans = Math.floor(Math.random() * 49);
    if (ans == l || ans == ans2) {
      return this.returnAnswerThree(l, ans2);
    } else {
      console.log(ans);
      return ans;
    }
  }

  initAns(l) { //possible answers consist of the correct answer from current answer and two incorrect answers
    let ans2 = this.returnAnswerTwo(l);
    console.log(ans2);
    let ans3 = this.returnAnswerThree(l, ans2);
    this.possibleAnswers = [answers[l].c, answers[ans2].c, answers[ans3].c];
    console.log(this.possibleAnswers);
    shuffleCustom(this.possibleAnswers); //shuffles
    //There is still a 1/50 chance for each incorrect answer that a duplicate of the correct answer will be displayed.
    //I have to figure out how to fix this.
  }


  displayPA() { //displaying the answers
    push();
    textSize(width / 20) //this makes text size responsive based on canvas width
    fill(themeGreen);
    text(`A:  ${this.possibleAnswers[0]}`, width / 2, height * .5);
    fill(themeBlue);
    text(`B:  ${this.possibleAnswers[1]}`, width / 2, height * .65);
    fill(themePurple);
    text(`C:  ${this.possibleAnswers[2]}`, width / 2, height * .8);
    pop();
  }

}

function setup() {

  //loading google font
  textFont("PT Sans");

  //setting volume of sound
  correctSound.setVolume(0.1);
  incorrectSound.setVolume(0.1);

  //designing background div
  const backgroundDiv = createDiv();
  backgroundDiv.style('width', windowWidth + 'px')
    .style('height', windowHeight + 'px')
    .style('background', 'linear-gradient(90deg, rgba(178, 190, 195,1.0) 0%, #00b894 75%)');

  //designing canvas
  const cnv = createCanvas(windowWidth / 2, windowHeight / 1.5); //set canvas to window width and window height
  cnv.center()
    .style('box-shadow', '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)') //box shadow from https://codepen.io/sdthornton/pen/wBZdXq
    .style('margin-top', '2.5%')
    .background('grey');

  //designing buttons

  function buttonMaker(buttonVariable, color, string, x, id, value) {
    buttonVariable = createButton(string, value)
      .position(windowWidth * x, windowHeight * .1)
      .style('background-color', color)
      .style('box-shadow', '0 5px 10px rgba(0,0,0,0.19), 0 2px 2px rgba(0,0,0,0.23)')
      .style('border-radius', '3px')
      // .style('border', '1px solid black')
      .style('color', 'black')
      .style('padding', '1% 1%')
      .style('text-align', 'center')
      .style('text-decoration', 'none')
      .style('display', 'inline-block')
      .style('font-size', '16px')
      .id(id);

    buttonVariable.mouseClicked(buttonClicked);
  }

  buttonMaker(aButton, themeGreen, 'Choice A', .25, 'aButton', 0);
  buttonMaker(bButton, themeBlue, 'Choice B', .45, 'bButton', 1);
  buttonMaker(cButton, themePurple, 'Choice C', .65, 'cButton', 2);
  buttonMaker(resetButton, 'lightgray', 'Start/Reset', .5, 'resetButton', null);

  //Thus starts the ugliest if/else statement in all the land.
  function buttonClicked() {
    console.log(gameState);
    if (activeQuestion > 48) { //if activeQuestion is above 48, change the gameState to gameEnd()
      gameState = 2;
      if (this.id() === 'resetButton') { //if activeQuestion is above 48 AND resetButton is pressed, restart the game and set everything to 0
        gameState = 0;
        scoreTotal = 0;
        activeQuestion = 0;
      }
    } else { //if activeQuestion is below 48, do this
      if (this.id() === 'resetButton') { //if reset button is pressed
        if (gameState == 0) { //if gamestate is 0, change it to 1 (start the game)
          gameState = 1;
        } else { //if gamestate is 1, change everything to 0 and go back to start screen
          gameState = 0;
          scoreTotal = 0;
          activeQuestion = 0;
        } //end reset button directions
      } else { //if any other button is pressed (top buttons)
        if (gameState == 0) { // if the game state is 0 (start screen), hitting the top buttons does nothing
          return false;
          //gameState 0 end
        } else if (gameState == 1) { //if the game state is 1 (play game), the buttons work
          let currentAnswer = answers[activeQuestion];
          let indexofCorrectAnswer;
          currentAnswer.possibleAnswers.forEach(function(e, index) {
            if (e === currentAnswer.c) { //set the index of the correct answer into the array to a variable named index
              indexofCorrectAnswer = index;
            }
          });
          if (this.value() == indexofCorrectAnswer) { //when the button whose value is equal to the index value is pressed, increase the score
            console.log('this is the correct answer');
            scoreTotal++;
            correctSound.play(); //play correct sound
            smile = true;
          } else if (this.value() !== indexofCorrectAnswer) {
            incorrectSound.play(); //play incorrect sound
            smile = false;
          }
          activeQuestion++; //increase the question no matter if the user gets it right or wrong
          //game state 1 end
        } else if (gameState == 2) { //if the game state is 2 (end screen), hitting the top buttons does nothing
          return false;
        } //game state 2 end
      } //all other buttons directions end
    } //activequestion below 48 end
  } //buttonClicked() end

  //Believe me, I tried to simplify this logic, but this was the only way I could get it to work.

  select('#resetButton').position(.8 * windowWidth, .5 * windowHeight);

  loadData(); //running loadData

  if (debug) {
    console.log("end of setup");
  }

}

function draw() {

  background('#F5F5F5');

  if (smile === true) {
    smiley(smileyGreen, 0, 180);
  } else if (smile === false) {
    smiley(smileyRed, 180, 0);
  }




  switch (gameState) {
    case 0: //Start Screen
      gameStart();
      smile = null; //don't display smile on start screen
      break;
    case 1: //Trivia Gameplay
      playGame();
      break;
    case 2: //end Screen
      gameEnd();
      smile = null; //don't display smile on end screen
      break;
  }
}

function gameStart() {
  textAlign(CENTER);
  textSize(width / 15); //this makes text size responsive based on canvas width
  text('State Capitals', width / 2, height / 2);
  textSize(width / 30);
  text('Press start to begin. This also has sound.', width / 2, height / 1.5);
}

function gameEnd() {
  textAlign(CENTER);
  textSize(width / 15)
  text('Thanks for playing!', width / 2, height / 2);
  textSize(width / 30);
  text(`You scored: ${scoreTotal + 1} / ${activeQuestion + 1}`, width / 2, height / 1.5)
}

function playGame() {
  //display the question
  questions[activeQuestion].display(); //display the current question
  //display answers                    //index values of questions and answers are the same (U.S. states are in alphabetical order)
  answers[activeQuestion].displayPA(); //display the current possible answers
  //display the score
  push();
  textSize(width / 40); //this makes text size responsive based on canvas width
  text(`Questions Correct: ${scoreTotal} / ${activeQuestion}`, width - 110, 50); //displays the total amoutn correct (score) over total questions
  pop();
}

function loadData() {

  console.log(jsondata);

  for (let item of Object.keys(jsondata)) { //this forms 50 questions out of each state in the json object and pushes those questions to an array
    let q = new Question(`What is the capital of ${jsondata[item].name}?`, width / 2, height * .3, `${jsondata[item].capital}`, 1)
    questions.push(q);
  }

  for (let item of Object.keys(jsondata)) { //forms 50 answers and pushes them to an array
    let a = new Answer('No', width / 2, height / 2 + 100, `${jsondata[item].capital}`, )
    answers.push(a);
  }

  for (var i = 0; i < answers.length; i++) { //for all 50 answers, initialize the possible answers
    console.log('hello');
    answers[i].initAns(i);
  }

  if (debug) {
    console.log('data loaded');
  }
}

function smiley(color, radianX, radianY) { //this smiley shape is from http://alpha.editor.p5js.org/daniwhkim/sketches/HyJ2wNOp
  push();
  translate(10, 10);
  scale(width / 720); //scales based on width
  noStroke();
  // smiley face
  fill(color);
  ellipse(50, 50, 100, 100);
  //smiley eyes & mouth
  fill(0);
  ellipse(30, 40, 10, 10);
  ellipse(70, 40, 10, 10);
  arc(50, 60, 40, 30, radians(radianX), radians(radianY)); //changes happy or sad face
  pop();
}
