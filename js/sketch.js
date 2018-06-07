const themeGreen = '#00cec9';
const themeBlue = '#74b9ff';
const themePurple = '#a29bfe';

let aButton;
let bButton;
let cButton;
let resetButton;

let debug = true; //used to turn debug statements on and off
let gameState = 0; //start and end screen
let activeQuestion = 0; //used for displaying the questions
let scoreTotal = 0;

let jsondata;

let questions = [];
let answers = [];

function shuffleCustom(array) { //https://www.frankmitchell.org/2015/01/fisher-yates/
  let i = 0;
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
  jsondata = loadJSON('us_state_capitals.json');
}


class Trivia {

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
    textAlign(CENTER);
    text(this.info, this.x, this.y);
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

  initAns(l) {
    this.possibleAnswers = [answers[l].c, answers[Math.floor(Math.random() * 49)].c, answers[Math.floor(Math.random() * 49)].c];
    //this.possibleAnswers = this.possibleAnswers.sort();
    console.log(this.possibleAnswers);
    shuffleCustom(this.possibleAnswers);

  }

  displayPA() {
    push();
    fill(themeGreen);
    text(`A:  ${this.possibleAnswers[0]}`, width/2, height * .5);
    fill(themeBlue);
    text(`B:  ${this.possibleAnswers[1]}`, width/2, height * .65);
    fill(themePurple);
    text(`C:  ${this.possibleAnswers[2]}`, width/2, height * .8);
    pop();
  }

  // updateScore() {
  //   scoreTotal += questions[activeQuestion].score;
  // }
  //
  // checkAnswer(a) {
  //   if (this.possibleAnswers[a] == this.c) {
  //     console.log('correct');
  //     this.updateScore();
  //   } else {
  //     console.log('incorrect');
  //   }
  //   activeQuestion += 1;
  // }
}

function setup() {

  //loading google font
  textFont("PT Sans");

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

  function buttonClicked() {
    console.log(this.id());

    if (this.id() === 'resetButton') { //this does the reset button
      if (gameState == 0 ) {
        gameState = 1;
      } else if (gameState == 1) {
        gameState = 0;
      }
    } else { //this does all the other buttons
      let currentAnswer = answers[activeQuestion];
      let indexofCorrectAnswer;
      currentAnswer.possibleAnswers.forEach(function(e, index){
        if (e === currentAnswer.c) {
          indexofCorrectAnswer = index;
        }
      });
        if (this.value() == indexofCorrectAnswer) {
          console.log('this is the correct answer');
          scoreTotal++;
        }
        activeQuestion++;
    }
  }

  select('#resetButton').position(.8 * windowWidth, .5 * windowHeight);

  loadData();

  if (debug) {
    console.log("end of setup");
  }

}

function draw() {

  background('#F5F5F5');



  switch (gameState) {
    case 0: //Start Screen
      gameStart();
      break;
    case 1: //Trivia Gameplay
      playGame();
      break;
    case 2: //end Screen
      gameEnd();
      break;
  }
}

function gameStart() {
  textAlign(CENTER);
  textSize(36);
  text('Press the start button to begin', width / 2, height / 2);
}

function gameEnd() {

}

function playGame() {
  //display the question
  questions[activeQuestion].display();
  //display answers
  answers[activeQuestion].displayPA();
  //display the score
  textAlign(CENTER);
  text(`Score: ${scoreTotal}`, width - 100, 50);

}

function loadData() {

  console.log(jsondata);

  for (let item of Object.keys(jsondata)) {
    let q = new Question(`What is the capital of ${jsondata[item].name}?`, width/2, height * .3, `${jsondata[item].capital}`, 1)
    questions.push(q);
  }

  for (let item of Object.keys(jsondata)) {
    let a = new Answer('No', width / 2, height / 2 + 100, `${jsondata[item].capital}`, )
    answers.push(a);
  }

  for(var i = 0; i < answers.length; i++){
    console.log('hello');
    answers[i].initAns(i);
  }

  if (debug) {
    console.log('data loaded');
  }
}
