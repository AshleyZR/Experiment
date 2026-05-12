/* ************************************ */
/* Helper Functions                     */
/* ************************************ */
var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

function assessPerformance() {
	var experiment_data = jsPsych.data.getTrialsOfType('single-stim-button')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	for (var i = 0; i < experiment_data.length; i++) {
		rt = experiment_data[i].rt
		trial_count += 1
		if (rt == -1) {
			missed_count += 1
		} else {
			rt_array.push(rt)
		}
	}
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	var missed_percent = missed_count/experiment_data.length
  	credit_var = (missed_percent < 0.4 && avg_rt > 200)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var,
									"performance_var": performance_var})
}

function deleteText(input, search_term) {
	index = input.indexOf(search_term)
	indexAfter = input.indexOf(search_term) + search_term.length
	return input.slice(0, index) + input.slice(indexAfter)
}


function appendTextAfter(input, search_term, new_text) {
	var index = input.indexOf(search_term) + search_term.length
	return input.slice(0, index) + new_text + input.slice(index)
}

function appendTextAfter2(input, search_term, new_text, deleted_text) {
	var index = input.indexOf(search_term) + search_term.length
	var indexAfter = index + deleted_text.length
	return input.slice(0, index) + new_text + input.slice(indexAfter)
}

var getBoard = function(board_type) {
	var board = ''
	if (board_type == 2) {
		board = "<div class = cardbox>"
		for (i = 1; i < 33; i++) {
			board += "<div class = square><input type='image' id = " + i +
				" class = 'card_image' src='images/beforeChosen.png' onclick = instructCard(this.id)></div>"
		}

	} else {
		board = "<div class = cardbox>"
		for (i = 1; i < 33; i++) {
			board += "<div class = square><input type='image' id = " + i +
				" class = 'card_image select-button' src='images/beforeChosen.png' onclick = chooseCard(this.id)></div>"
		}
	}
	board += "</div>"
	return board
}


var getText = function() {
	return '<div class = centerbox><p class = block-text>Overall, you earned ' + totalPoints + ' points. These are the points used for your bonus from three randomly picked trials:  ' +
		'<ul list-text><li>' + prize1 + '</li><li>' + prize2 + '</li><li>' + prize3 + '</li></ul>' +
		'</p><p class = block-text>Press <strong>enter</strong> to continue.</p></div>'
}

var appendPayoutData = function(){
	jsPsych.data.addDataToLastTrial({reward: [prize1, prize2, prize3]})
}

var appendTestData = function() {
	jsPsych.data.addDataToLastTrial({
		which_round: whichRound,
		num_click_in_round: whichClickInRound,
		num_loss_cards: numLossCards,
		gain_amount: gainAmt,
		loss_amount: lossAmt,
		round_points: roundPoints,
		clicked_on_loss_card: lossClicked,
		round_type: round_type
	})
}

// Functions for "top" buttons during test (no card, end round, collect)
var collect = function() {
	for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	currID = 'collectButton'
	whichClickInRound = whichClickInRound + 1
}

var noCard = function() {
	currID = 'noCardButton'
	roundOver=2
	whichClickInRound = whichClickInRound + 1
}

var endRound = function() {
	currID = 'endRoundButton'
	roundOver=2
	whichClickInRound = whichClickInRound + 1
}

// Clickable card function during test
var chooseCard = function(clicked_id) {
  currID = parseInt(clicked_id)
  whichClickInRound = whichClickInRound + 1

  // canonical: loss if and only if clicked card is in whichLossCards
  if (whichLossCards.indexOf(currID) != -1) {
    clickedLossCards.push(currID)
    index = unclickedCards.indexOf(currID, 0)
    unclickedCards.splice(index, 1)
    roundPoints = roundPoints - lossAmt
    lossClicked = true
    roundOver = 2
  } else { // gain card
    clickedGainCards.push(currID)
    index = unclickedCards.indexOf(currID, 0)
    unclickedCards.splice(index, 1)
    roundPoints = roundPoints + gainAmt
  }
}

var getRound = function() {

  function renderCard(i, state) {
    var src = 'images/beforeChosen.png';
    var cls = 'card_image';
    var click = '';

    if (state === 0) {
      cls += ' select-button';
      click = " onclick = chooseCard(this.id)";
    } else if (state === 1) {
      if (clickedGainCards.indexOf(i) !== -1) {
        src = 'images/chosen.png';
      } else {
        cls += ' select-button';
        click = " onclick = chooseCard(this.id)";
      }
    } else if (state === 2) {
      if (clickedGainCards.indexOf(i) !== -1) {
        src = 'images/chosen.png';
      } else if (clickedLossCards.indexOf(i) !== -1) {
        src = 'images/loss.png';
      }
    }

    return "<div class = square><input type='image' id = '" + i + "' class = '" + cls + "' src='" + src + "'" + click + "></div>";
  }

  function buildBoard(state) {
    var html = "<div class = cardbox>";
    for (var i = 1; i <= 32; i++) {
      html += renderCard(i, state);
    }
    html += "</div>";
    return html;
  }

  function buildScreen(state) {
    var noCardDisabled = '';
    var stopDisabled = '';
    var collectClass = 'CCT-btn';
    var collectDisabled = ' disabled';
    var collectClick = '';
    var noCardClick = " onclick = noCard()";
    var stopClick = " onclick = endRound()";

    if (state === 0) {
      stopDisabled = ' disabled';
    } else if (state === 1) {
      noCardDisabled = ' disabled';
      noCardClick = '';
    } else if (state === 2) {
      noCardDisabled = ' disabled';
      stopDisabled = ' disabled';
      noCardClick = '';
      stopClick = '';
      collectClass = 'CCT-btn select-button';
      collectClick = " onclick = collect()";
    }

    return (
      "<div class = cct-box>" +
        "<div class = titleBigBox>" +
          "<div class = titleboxLeft><div class = center-text id = game_round>Game Round: " + whichRound + "</div></div>" +
          "<div class = titleboxLeft1><div class = center-text id = loss_amount>Loss Amount: <strong style=\"color:red\">" + lossAmt + "</strong></div></div>" +
          "<div class = titleboxMiddle1><div class = center-text id = gain_amount>Gain Amount: <strong style=\"color:red\">" + gainAmt + "</strong></div></div>" +
          "<div class = titlebox><div class = center-text>How many cards do you want to take? </div></div>" +
          "<div class = titleboxRight1><div class = center-text id = num_loss_cards>Number of Loss Cards: <strong style=\"color:red\">" + numLossCards + "</strong></div></div>" +
          "<div class = titleboxRight><div class = center-text id = current_round>Current Round Points: " + roundPoints + "</div></div>" +
          "<div class = buttonbox>" +
            "<button type='button' id='NoCardButton' class='CCT-btn" + (state === 0 ? " select-button" : "") + "'" + noCardClick + noCardDisabled + ">No Card</button>" +
            "<button type='button' id='turnButton' class='CCT-btn" + (state === 1 ? " select-button" : "") + "'" + stopClick + stopDisabled + ">STOP/Turn Over</button>" +
            "<button type='button' id='collectButton' class='" + collectClass + "'" + collectClick + collectDisabled + ">Next Round</button>" +
          "</div>" +
        "</div>" +
        buildBoard(state) +
      "</div>"
    );
  }

  if (roundOver === 0) {
    whichClickInRound = 0;
    cardArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
    unclickedCards = cardArray.slice();
    clickedGainCards = [];
    clickedLossCards = [];

    roundParams = shuffledParamsArray.shift();
    numLossCards = roundParams[0];
    gainAmt = roundParams[1];
    lossAmt = roundParams[2];

    shuffledCardArray = jsPsych.randomization.shuffle(cardArray.slice());
    whichLossCards = [];
    for (var i = 0; i < numLossCards; i++) {
      whichLossCards.push(shuffledCardArray.pop());
    }

    roundOver = 1;
    return buildScreen(0);
  }

  if (roundOver === 1) {
    return buildScreen(1);
  }

  if (roundOver === 2) {
    

    clickedCards = clickedGainCards.concat(clickedLossCards);

    var notClicked = cardArray.filter(function(x) {
      return jQuery.inArray(x, clickedCards) === -1;
    });

    lossCardsToTurn = whichLossCards.filter(function(x) {
      return jQuery.inArray(x, clickedLossCards) === -1 && jQuery.inArray(x, notClicked) !== -1;
    });

    gainCardsToTurn = notClicked.filter(function(x) {
      return jQuery.inArray(x, lossCardsToTurn) === -1;
    });

    CCT_timeouts.push(setTimeout(function() {
      for (var k = 0; k < lossCardsToTurn.length; k++) {
        var lossEl = document.getElementById(String(lossCardsToTurn[k]));
        if (lossEl) lossEl.src = 'images/loss.png';
      }

      for (var j = 0; j < gainCardsToTurn.length; j++) {
        var gainEl = document.getElementById(String(gainCardsToTurn[j]));
        if (gainEl) gainEl.src = 'images/chosen.png';
      }

      $('#collectButton').prop('disabled', false);
    }, 1500));

    return buildScreen(2);
  }
return buildScreen(2);
}

/*Functions below are for practice
*/
var turnCards = function(cards) {

  $('#collectButton').prop('disabled', false)
  $('#NoCardButton').prop('disabled', true)

  for (var i = 1; i <= 32; i++) {
    var el = document.getElementById(String(i));
    if (!el) continue;

    if (whichGainCards.indexOf(i) != -1) {
      el.src = 'images/chosen.png';
    } else if (whichLossCards.indexOf(i) != -1) {
      el.src = 'images/loss.png';
    }
  }
}

var turnOneCard = function(whichCard, win) {
	if (win === 'loss') {
		document.getElementById("" + whichCard + "").src =
			'images/loss.png';
	} else {
		document.getElementById("" + whichCard + "").src =
			'images/chosen.png';
	}
}

function doSetTimeout(card_i, delay, points, win) {
	CCT_timeouts.push(setTimeout(function() {
		turnOneCard(card_i, win);
		document.getElementById("current_round").innerHTML = 'Current Round Points: ' + points
	}, delay));
}

var getPractice1 = function() {
	unclickedCards = cardArray.slice()
	cardArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
		24, 25, 26, 27, 28, 29, 30, 31, 32
	]
	clickedGainCards = [] 
	clickedLossCards = [] 
	numLossCards = 1
	gainAmt = 30
	lossAmt = 250

	shuffledCardArray = jsPsych.randomization.shuffle(cardArray.slice())
	whichLossCards = [] //this determines which are loss cards at the beginning of each round
	for (i = 0; i < numLossCards; i++) {
		whichLossCards.push(shuffledCardArray.pop())
	}
	whichGainCards = shuffledCardArray
	gameState = practiceSetup
	return gameState
}

var getPractice2 = function() {
	unclickedCards = cardArray.slice()
	cardArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
		24, 25, 26, 27, 28, 29, 30, 31, 32
	]
	clickedGainCards = [] //num
	clickedLossCards = [] //num
	numLossCards = 3
	gainAmt = 10
	lossAmt = 750

	shuffledCardArray = jsPsych.randomization.shuffle(cardArray.slice())
	whichLossCards = [] //this determines which are loss cards at the beginning of each round
	for (i = 0; i < numLossCards; i++) {
		whichLossCards.push(shuffledCardArray.pop())
	}
	whichGainCards = shuffledCardArray
	gameState = practiceSetup2
	return gameState
}

/*Functions below are for instruction
*/
var instructCard = function(clicked_id) {
	currID = parseInt(clicked_id)
	document.getElementById("NoCardButton").disabled = true;
	document.getElementById("turnButton").disabled = false;
	appendTextAfter(gameState, 'turnButton', ' onclick = turnCards()')
	if (whichLossCards.indexOf(currID) == -1) {
		instructPoints = instructPoints + gainAmt
		document.getElementById('current_round').innerHTML = 'Current Round Points: ' + instructPoints;
		document.getElementById(clicked_id).disabled = true;

		document.getElementById(clicked_id).src =
			'images/chosen.png';
	} else if (whichLossCards.indexOf(currID) != -1) {
		instructPoints = instructPoints - lossAmt
		document.getElementById(clicked_id).disabled = true;
		document.getElementById('current_round').innerHTML = 'Current Round Points: ' + instructPoints;
		document.getElementById(clicked_id).src =
			'images/loss.png';
		 $("input.card_image").attr("disabled", true);
		CCT_timeouts.push(setTimeout(function() {turnCards()}, 2000))
	}
}

var instructFunction = function() {
	$('#instructButton').prop('disabled', true)
	$('#jspsych-instructions-next').click(function() {
		for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	})

	$('#jspsych-instructions-back').click(function() {
		for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	})

	var cards_to_turn = [1, 17, 18, 15, 27, 31, 8]
	var total_points = 0
	var points_per_card = 10
	var delay = 0
	for (var i = 0; i < cards_to_turn.length; i++) {
		var card_i = cards_to_turn[i]
		delay += 250
		total_points += points_per_card
		doSetTimeout(card_i, delay, total_points, 'win')
	}
	CCT_timeouts.push(setTimeout(function() {
		document.getElementById("instruct1").innerHTML =
		'<strong>Example 1: </strong>In the example below, you see 32 unknown cards. The display shows you that 1 of these cards is a loss card. It also tells you that turning over each gain card is worth 10 points to you, and that turning over the loss card will cost you 750 points. Let us suppose you decided to turn over 7 cards and then decided to stop. Please click the "See Result" button to see what happens: <font color = "red">Luckily, none of the seven cards you turned over happened to be the loss card, so your score for this round was 70. Please click the next button.</font>'
		}, delay))
}

var instructFunction2 = function() {
	$('#instructButton').prop('disabled', true)
	var tempArray = [3, 5, 6, 7, 9, 10, 11, 12, 19, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26,
		27, 28, 29, 31, 32
	]
	var instructTurnCards = function() {
		document.getElementById("8").src = 'images/loss.png';
		document.getElementById("2").src = 'images/loss.png';

		for (i = 0; i < tempArray.length; i++) {
			document.getElementById("" + tempArray[i] + "").src =
				'images/chosen.png';
		}
	}

	$('#jspsych-instructions-next').click(function() {
		for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	})

	$('#jspsych-instructions-back').click(function() {
		for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	})
	var cards_to_turn = [1, 4, 30]
	var total_points = 0
	var points_per_card = 30
	var delay = 0
	for (var i = 0; i < cards_to_turn.length; i++) {
		var card_i = cards_to_turn[i]
		delay += 250
		total_points += points_per_card
		doSetTimeout(card_i, delay, total_points, 'win')
	}
	delay += 250
	total_points -= 250
	doSetTimeout(13, delay, total_points, 'loss')
	CCT_timeouts.push(setTimeout(function() {
		document.getElementById("instruct2").innerHTML =
			'<strong>Example 2: </strong>In the example below, you see 32 unknown cards. The display shows you that 3 of these cards are loss cards. It also tells you that turning over each gain card is worth 30 points to you, and that turning over the loss card will cost you 250 points. Let us suppose you decided to turn over 10 cards and then decided to stop. Please click the "See Result" button to see what happens: <font color = "red">This time, the fourth card you turned over was a loss card. The round ended immediately. You had earned 90 points for the 3 gain cards, then 250 points were subtracted, so your score for this round was -160. The cards you had not yet turned over are then revealed for transparency. Please click the next button.</font>'
	}, delay))
	CCT_timeouts.push(setTimeout(instructTurnCards, delay + 1000))
}

var instructButton = function(clicked_id) {
	currID = parseInt(clicked_id)
	document.getElementById(clicked_id).src =
		'images/chosen.png';
}

/* ************************************ */
/* Experimental Variables               */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true
var performance_var = 0

// task specific variables
var currID = ""
var numLossCards = ""
var gainAmt = ""
var lossAmt = ""
var CCT_timeouts = []
// var numWinRounds =  24
// var numLossRounds = 4
var numRounds = 24
// var lossRounds = jsPsych.randomization.shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,25,26,27,28]).slice(0,numLossRounds)
var lossRounds = []
// var riggedLossCards = []
var lossClicked = false
var whichClickInRound = 0
var whichRound = 1
// var round_type = lossRounds.indexOf(whichRound)==-1 ? 'rigged_win' : 'rigged_loss'
var round_type = 'canonical'
var roundPoints = 0
var totalPoints = 0
var roundOver = 0 //0 at beginning of round, 1 during round, 2 at end of round
var instructPoints = 0
var clickedGainCards = []
var clickedLossCards = []
var roundPointsArray = [] 
var whichGainCards = []
var whichLossCards = []
var prize1 = 0
var prize2 = 0
var prize3 = 0

// this params array is organized such that the 0 index = the number of loss cards in round, the 1 index = the gain amount of each happy card, and the 2nd index = the loss amount when you turn over a sad face
var paramsArray = [
	[1, 10, 250],
	[1, 10, 750],
	[1, 30, 250],
	[1, 30, 750],
	[3, 10, 250],
	[3, 10, 750],
	[3, 30, 250],
	[3, 30, 750]
]

var cardArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
	24, 25, 26, 27, 28, 29, 30, 31, 32]
var shuffledCardArray = jsPsych.randomization.shuffle(cardArray.slice())
var shuffledParamsArray = jsPsych.randomization.shuffle(
  jsPsych.randomization.repeat(paramsArray, Math.ceil(numRounds / paramsArray.length))
).slice(0, numRounds)
// var shuffledParamsArray = jsPsych.randomization.repeat(paramsArray, numWinRounds/8)
// for (var i = 0; i < numLossRounds; i++) {
// 	riggedLossCards.push(Math.floor(Math.random()*10)+2)
// 	var before = shuffledParamsArray.slice(0,lossRounds[i])
// 	var after = shuffledParamsArray.slice(lossRounds[i])
// 	var insert = [paramsArray[Math.floor(Math.random()*8)]]
// 	shuffledParamsArray = before.concat(insert,after)
// }

var gameSetup =
	"<div class = cct-box>"+
	"<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text id = game_round>Game Round: </div></div>   <div class = titleboxLeft1><div class = center-text id = loss_amount>Loss Amount: </div></div>    <div class = titleboxMiddle1><div class = center-text id = gain_amount>Gain Amount: </div></div>    <div class = titlebox><div class = center-text>How many cards do you want to take? </div></div>     <div class = titleboxRight1><div class = center-text id = num_loss_cards>Number of Loss Cards: </div></div>   <div class = titleboxRight><div class = center-text id = current_round>Current Round Points: 0</div></div>"+
	"<div class = buttonbox><button type='button' id = NoCardButton class = 'CCT-btn select-button' onclick = noCard()>No Card</button><button type='button' id = turnButton class = 'CCT-btn select-button' onclick = endRound()>STOP/Turn Over</button><button type='button' id = collectButton class = 'CCT-btn' disabled>Next Round</button></div></div>"+
	getBoard()

var practiceSetup =
	"<div class = practiceText><div class = block-text2 id = instruct1><strong>Practice 1: </strong> As you click on cards, you can see your Round Total change in the box in the upper right.  If you turn over a few cards and then want to stop and go to the next round, click the <strong>Stop/Turn Over</strong> button and then <strong>Next Round</strong>.  If turning over cards seems too risky, you can click the <strong>No Card</strong> button, in which case your score for the round will automatically be zero.  This is a practice round, that looks just like the game you will play.  Please select the number of cards you would turn over, given the number of loss cards and the amounts of the gain and loss cards shown below.</div></div>"+
	"<div class = cct-box2>"+
	"<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text id = game_round>Game Round: 1</div></div>   <div class = titleboxLeft1><div class = center-text id = loss_amount>Loss Amount: <strong style=\"color:red\">250</strong></div></div>    <div class = titleboxMiddle1><div class = center-text id = gain_amount>Gain Amount: <strong style=\"color:red\">30</strong></div></div>    <div class = titlebox><div class = center-text>How many cards do you want to take? </div></div>     <div class = titleboxRight1><div class = center-text id = num_loss_cards>Number of Loss Cards: <strong style=\"color:red\">1</strong></div></div>   <div class = titleboxRight><div class = center-text id = current_round>Current Round Points: 0</div></div>"+
	"<div class = buttonbox><button type='button' class = CCT-btn id = NoCardButton onclick = turnCards()>No Card</button><button type='button' class = CCT-btn id = turnButton onclick = turnCards() disabled>STOP/Turn Over</button><button type='button' class = 'CCT-btn select-button' id = collectButton  onclick = collect() disabled>Next Round</button></div></div>"+
	getBoard(2)

var practiceSetup2 =
	"<div class = practiceText><div class = block-text2 id = instruct2><strong>Practice 2: </strong> The computer will record your points for each round and will show you the total after you finish all " + numRounds + " rounds of the game.  This is the second practice round. Please again turn over as many cards as you would like to, given the number of loss cards and the amounts that you can win or lose if you turn over a gain or loss card, as shown below.</div></div>"+
	"<div class = cct-box2>"+
	"<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text id = game_round>Game Round: 2</div></div>   <div class = titleboxLeft1><div class = center-text id = loss_amount>Loss Amount: <strong style=\"color:red\">750</strong></div></div>    <div class = titleboxMiddle1><div class = center-text id = gain_amount>Gain Amount: <strong style=\"color:red\">10</strong></div></div>    <div class = titlebox><div class = center-text>How many cards do you want to take? </div></div>     <div class = titleboxRight1><div class = center-text id = num_loss_cards>Number of Loss Cards: <strong style=\"color:red\">3</strong></div></div>   <div class = titleboxRight><div class = center-text id = current_round>Current Round Points: 0</div></div>"+
	"<div class = buttonbox><button type='button' class = CCT-btn id = NoCardButton onclick = turnCards()>No Card</button><button type='button' class = CCT-btn id = turnButton onclick = turnCards() disabled>STOP/Turn Over</button><button type='button' class = 'CCT-btn select-button' id = collectButton  onclick = collect() disabled>Next Round</button></div></div>"+
	getBoard(2)


/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};


var round_delay = {
  type: 'single-stim-button',
  stimulus: `
  <div style="
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 500px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="font-size: 48px; color: black;">+</div>
  </div>
`,
  is_html: true,
  choices: [''],
  button_html: '<button style="display:none;"></button>',
  response_ends_trial: false,
  timing_response: 6000
};

// var round_delay = {
//   type: 'html-keyboard-response',
//   stimulus: '<div style="font-size:60px;">+</div>',
//   choices: jsPsych.NO_KEYS,
//   timing_response: 5000
// }

/* define static blocks */

var feedback_instruct_text =
	"Welcome to the experiment. Press <strong>enter</strong> to begin."
var feedback_instruct_block = {
	type: 'poldrack-text',
	cont_key: [13],
	data: {
		trial_id: 'instruction'
	},
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {trial_id: 'instruction'},
  pages: [
	'<div class = centerbox style="font-size: 26.1px; line-height: 130%;"><p class = block-text><strong>Introduction and Explanation</strong>'+
	'<p>-You are now going to participate in a card game.  In this game, you will turn over cards to win or lose points which are worth money.</p>'+
	'<p>-In each game round, you will see 32 cards on the computer screen, face down. You will decide how many of these cards to turn over. Each card is either a gain card or a loss card (there are no neutral cards). You will know how many gain cards and loss cards are in the deck of 32, and how many points you will gain or lose if you turn over a gain or loss card. What you do not know is which of the 32 cards that you see face-down are gain cards and which are loss cards. </p>'+
	'<p>-You indicate which cards you want to flip over by clicking on them. For each gain card turned over, points are added to your round total. You continue turning over cards until a loss card is uncovered or you decide to stop. The first time a loss card is turned over, the loss points will be subtracted from your current point total and the round is over. The accumulated total will be your number of points for that round, and you go on to the next round. Each new round starts with a score of 0 points; that means you play each round independently of the other rounds.</p>'+
	'<p>-You will play a total of ' + numRounds + ' rounds, three of which will be randomly selected at the end of the session, and you will get a bonus payment proportional to those rounds.</p>',
	
    '<div class = centerbox style="text-align:center;"><p class = block-text style="text-align:center;"><strong>Unknown Cards:</strong></p>'+
    '<p style="text-align:center;"> This is what unknown cards looks like.  Turn it over by clicking on it.</p>'+
    "<p style=\"text-align:center;\"><input type='image' id = '133' src='images/beforeChosen.png' onclick = instructButton(this.id)>"+
	'</p></div>',
	
	'<div class = centerbox style="text-align:center;"><p class = block-text style="text-align:center;">'+
	'<p style="text-align:center;"><strong>The Gain Card:</strong></p>'+
	'<p style="text-align:center;">For every gain card you turn over, your score increases by either 10 or 30 points in different rounds.</p>'+
	"<p style=\"text-align:center;\"><input type='image' src='images/chosen.png'>"+
	'<p style="text-align:center;"><strong>The Loss Card:</strong></p>'+
	"<p style=\"text-align:center;\"><input type='image' src='images/loss.png'></p>"+
	'<p style="text-align:center;">For every loss card you turn over, your score decreases by either 250 or 750 points in different rounds. Furthermore, the round immediately ends (you cannot turn over any more cards). There will be either 1 or 3 loss cards in any given round.</p>'+
	'<p style="text-align:center;">The number of loss cards and the value of points that can be won or lost by turning over a gain or loss card are fixed in each round. This information will always be on display so you know what kind of round you are in.</p>'+
	'</p></div>',
	
	"<div class = practiceText><div class = block-text2 id = instruct1><strong>Example 1: In the example below, you see 32 unknown cards. The display shows you that 1 of these cards is a loss card. It also tells you that turning over each gain card is worth 10 points to you, and that turning over the loss card will cost you 750 points. Let us suppose you decided to turn over 7 cards and then decided to stop. Please click the \"See Result\" button to see what happens: </strong></div></div>"+
	"<div class = cct-box2>"+
	"<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text>Game Round: 1</div></div>   <div class = titleboxLeft1><div class = center-text>Loss Amount: <strong style=\"color:red\">750</strong></div></div>    <div class = titleboxMiddle1><div class = center-text>Gain Amount: <strong style=\"color:red\">10</strong></div></div>    <div class = titlebox><div class = center-text>How many cards do you want to take? </div></div>     <div class = titleboxRight1><div class = center-text>Number of Loss Cards: <strong style=\"color:red\">1</strong></div></div>   <div class = titleboxRight><div class = center-text id = current_round>Current Round Points: 0</div></div>"+
	"<div class = buttonbox><button type='button' class = 'CCT-btn select-button' id = NoCardButton disabled>No Card</button><button type='button' class = 'CCT-btn select-button' class = 'CCT-btn select-button' id = turnButton disabled>STOP/Turn Over</button><button type='button' class = 'CCT-btn select-button' id = collectButton  disabled>Next Round</button></div>"+
	"<div class = buttonbox2><button type='button' class = CCT-btn id = instructButton onclick= instructFunction()>See Result</button></div></div>"+
	getBoard(2),
	
	"<div class = practiceText><div class = block-text2 id = instruct2><strong>Example 2: In the example below, you see 32 unknown cards. The display shows you that 3 of these cards are loss cards. It also tells you that turning over each gain card is worth 30 points to you, and that turning over the loss card will cost you 250 points. Let us suppose you decided to turn over 10 cards and then decided to stop. Please click the \"See Result\" button to see what happens:</strong></div></div>"+
	"<div class = cct-box2>"+
	"<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text>Game Round: 1</div></div>   <div class = titleboxLeft1><div class = center-text>Loss Amount: <strong style=\"color:red\">250</strong></div></div>    <div class = titleboxMiddle1><div class = center-text>Gain Amount: <strong style=\"color:red\">30</strong></div></div>    <div class = titlebox><div class = center-text>How many cards do you want to take? </div></div>     <div class = titleboxRight1><div class = center-text>Number of Loss Cards: <strong style=\"color:red\">3</strong></div></div>   <div class = titleboxRight><div class = center-text id = current_round>Current Round Points: 0</div></div>"+
	"<div class = buttonbox><button type='button' class = 'CCT-btn select-button' id = NoCardButton disabled>No Card</button><button type='button' class = 'CCT-btn select-button' class = 'CCT-btn select-button' id = turnButton disabled>STOP/Turn Over</button><button type='button' class = 'CCT-btn select-button' id = collectButton  disabled>Next Round</button></div>"+
	"<div class = buttonbox2><button type='button' class = CCT-btn id = instructButton onclick= instructFunction2()>See Result</button></div></div>"+
	getBoard(2),
	"<div class = centerbox><p class = block-text>After you end the instructions you will complete two practice rounds before proceeding. Please make sure you understand the examples on the last two pages before ending the instructions.</p></div>"
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}





var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: 'end',
		exp_id: 'columbia_card_task_hot'
	},
	text: '<div class = centerbox><p class = center-block-text>Finished with this task.</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
  	on_finish: assessPerformance
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: 'test_intro'
	},
	text: '<div class = centerbox><p class = center-block-text>We will now start the test. Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000,
on_finish: function(){
  whichClickInRound = 0
}
};


var practice_block1 = {
	type: 'single-stim-button',
	button_class: 'select-button',
	stimulus: getPractice1,
	is_html: true,
	data: {
		trial_id: 'stim',
		exp_stage: 'practice'
	},
	timing_post_trial: 0,
	response_ends_trial: true,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({
			num_loss_cards: numLossCards,
			gain_amount: gainAmt,
			loss_amount: lossAmt,
			instruct_points: instructPoints,
		})
		instructPoints = 0
	}
};

var practice_block2 = {
	type: 'single-stim-button',
	button_class: 'select-button',
	stimulus: getPractice2,
	is_html: true,
	data: {
		trial_id: 'stim',
		exp_stage: 'practice'
	},
	timing_post_trial: 0,
	response_ends_trial: true,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({
			num_loss_cards: numLossCards,
			gain_amount: gainAmt,
			loss_amount: lossAmt,
			instruct_points: instructPoints,
		})
		instructPoints = 0
	}
};

var test_block = {
	type: 'single-stim-button',
	button_class: 'select-button',
	stimulus: getRound,
	is_html: true,
	data: {
		trial_id: 'stim',
		exp_stage: 'test'
	},
	timing_post_trial: 0,
	on_finish: appendTestData,
	response_ends_trial: true,
};

var test_node = {
	timeline: [test_block],
	loop_function: function(data) {
		if (currID == 'collectButton') {
			roundPointsArray.push(roundPoints)
			roundOver = 0
			roundPoints = 0
			whichClickInRound = 0
			whichRound = whichRound + 1
			round_type = 'canonical'
			lossClicked = false
			currID = ""
			return false
		} else {
			return true
		}
	}
}


var payout_text = {
	type: 'poldrack-text',
	text: getText,
	data: {
		trial_id: 'reward'
	},
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: appendPayoutData,
};

var payoutTrial = {
	type: 'call-function',
	data: {
		trial_id: 'calculate reward'
	},
	func: function() {
		totalPoints = math.sum(roundPointsArray)
		randomRoundPointsArray = jsPsych.randomization.shuffle(roundPointsArray.slice())
		prize1 = randomRoundPointsArray.pop()
		prize2 = randomRoundPointsArray.pop()
		prize3 = randomRoundPointsArray.pop()
		performance_var = prize1 + prize2 + prize3
	}
};

/* create experiment definition array */
var columbia_card_task_hot_experiment = [];

columbia_card_task_hot_experiment.push(instruction_node);
columbia_card_task_hot_experiment.push(practice_block1);
columbia_card_task_hot_experiment.push(practice_block2);

// columbia_card_task_hot_experiment.push(start_test_block);
// for (i = 0; i < numRounds; i++) {
//   columbia_card_task_hot_experiment.push(test_node);}

columbia_card_task_hot_experiment.push(start_test_block);
for (i = 0; i < numRounds; i++) {
  columbia_card_task_hot_experiment.push(test_node);

  // 6s fixation only between rounds, not after the last round
  if (i < numRounds - 1) {
    columbia_card_task_hot_experiment.push(round_delay);
  }
}

columbia_card_task_hot_experiment.push(payoutTrial);
columbia_card_task_hot_experiment.push(end_block);
