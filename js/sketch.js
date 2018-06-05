let aButton;
let bButton;
let cButton;
let resetButton;


let debug = true; //used to turn debug statements on and off
let gameState = 0; //start and end screen
let activeQuestion = 0; //used for displaying the questions
let scoreTotal = 0;

let questions = [];
let answers = [];


class Trivia {

  if (debug) {
    console.log('Trivia object created');
  }

  constructor(i, x_, y_) {
    this.info = i;
    this.x = x_;
    this.y = y_;
    this.questions = []; //just declare because it will probably be made in loadData
    this.answers = [];
  }

  display() {
    textAlign(CENTER);
    text(this.info, this.x, this.y);
  }
}

//class for displaying a question
class Question extends Trivia {
  //info is the question text

  constructor(i, x_, y_, s, a) {
    super(i, x_, y_);
    this.score = s;
    this.answer = a;

    if (debug) {
      console.log('question object created');
    }
  }
}

class Answer extends Trivia {

  constructor(i, x_, y_, pA) {
    super(i, x_, y_);
    this.possibleAnswers = pA;
  }

  displayPA() {
    for (let i = 0; i < this.possibleAnswers.length; i++) {
      textAlign(CENTER);
      text(i + ": " + this.possibleAnswers[i], width / 2, height / 2 + 50 * (i + 1));
    }
  }

  updateScore() {
    scoreTotal += questions[activeQuestion].score;
  }

  checkAnswer(a) {
    if (this.possibleAnswers[a] == this.info) {
      console.log('correct');
      this.updateScore();
    } else {
      console.log('incorrect');
    }
  }
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

  function buttonMaker(buttonVariable, color, string, x, id) {
    buttonVariable = createButton(string)
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
  }

  buttonMaker(aButton, '#00cec9', 'Choice A', .25, 'aButton');
  buttonMaker(bButton, '#74b9ff', 'Choice B', .45, 'bButton');
  buttonMaker(cButton, '#a29bfe', 'Choice C', .65, 'cButton');
  buttonMaker(resetButton, 'lightgray', 'Reset', .5, 'resetButton');

  select('#resetButton').position(.8 * windowWidth, .5 * windowHeight);


  loadData();

  if (debug) {
    console.log("end of setup");
  }

}

function draw() {

  background('#dfe6e9');

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
  text('Press any key to start', width / 2, height / 2);
}

function gameEnd() {

}

function playGame() {
  //todo: display the question
  questions[activeQuestion].display();
  //display answers
  answers[activeQuestion].displayPA();
  //display the score
  textAlign(CENTER);
  text(`Score: ${scoreTotal}`, width - 100, 50);

  //maybe have interactivity (how the user gives the answer)
}

function loadData() {
  //to do: load data xml or json

  let q = new Question('Yes, no, or maybe?', width / 2, height / 2, 10, 1);

  questions[0] = q;

  let ans = [
    'Yes',
    'No',
    'Maybe'
  ];
  a = new Answer('No', width / 2, height / 2 + 100, ans)

  answers[0] = a;

  if (debug) {
    console.log('data loaded');
  }

}

function keyTyped() {
  if (gameState == 0) {
    gameState = 1;
    if (debug) {
      console.log('game starting');
    }
  } else {
    answers[activeQuestion].checkAnswer(key);
  }
}
