document.querySelector('#login_button').addEventListener('click', login);
document.querySelector('#pwn').addEventListener('click', submitFlag);

var hints = {};
var socket = io.connect('127.0.0.1:8080');

socket.on('ready', displayLogin);
socket.on('logged_in', completeLogin);
socket.on('scoreboard', drawScoreboard);
socket.on('challenges', populateChallenges);
socket.on('score', updateScore);
socket.on('flag_accepted', flagAccepted);
socket.on('invalid_flag', invalidFlag);
socket.on('update_scoreboard', updateScoreboard);
//socket.on('msg', displayMsg);
//socket.on('error', displayError);
socket.on('play_sound', playSound);

function login() {
  var username = document.querySelector('#username').value;
  var password = document.querySelector('#password').value;

  socket.emit('login', {'username': username, 'password': password});
}

function displayLogin() {
  var loginObj = document.querySelector('#login');
  var classes = loginObj.getAttribute('class');
  loginObj.setAttribute('class', classes.replace(/hidden\s*/, ''));
}

function completeLogin(data) {
  socket.emit('send_scoreboard');
  socket.emit('send_challenges');

  var usernameObj = document.querySelector('#username');
  var usename = usernameObj.value;
  var passwordObj = document.querySelector('#password');
  var teamObj = document.querySelector('#team');
  var scoreObj = document.querySelector('#score');
  var loginObj = document.querySelector('#login');
  var containerObj = document.querySelector('#container');

  usernameObj.value = '';
  passwordObj.value = '';

  teamObj.textContent = 'Team: '+data.username;
  scoreObj.textContent = 'Score: '+data.score;
  scoreObj.setAttribute('data-user-id', data.userId);

  var classes = loginObj.getAttribute('class');
  loginObj.setAttribute('class', classes+' hidden');

  var classes = containerObj.getAttribute('class');
  containerObj.setAttribute('class', classes.replace(/hidden\s*/, ''));

  playSound({'name': 'prepare'});
}

function drawScoreboard(data) {
  var scoreboard = document.querySelector('#scoreboard');

  for (var i = 0; i < data.length; i++) {
    var li = document.createElement('li');
    li.textContent = data[i].username+': '+data[i].score;
    li.setAttribute('data-user-id', data[i].id);
    scoreboard.appendChild(li);
  }
}

function swapChallenge(id) {
  var hintObj = document.querySelector('#hint');
  var flagObj = document.querySelector('#flag');

  hintObj.innerHTML = hints[id];
  flagObj.setAttribute('data-challenge-id', 15 - id);
}

function populateChallenges(data) {
  var pyramid = document.querySelector('#pyramid');
  var rows = data.length;

  var k = 0;
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < (i + 1); j++) {
      var classes = 'building_block';
      var div = document.createElement('div');

      if (k + rows >= 15) {
        var challenge = data[k-(15-rows)];
        hints[k] = challenge.description;
        if (challenge.solved === true)
          classes += ' solved';
        div.addEventListener('click', function(evt) {
          swapChallenge(evt.toElement.getAttribute('id').replace(/challenge_/, ''));
        });
      } else {
        classes += ' unopened';
      }

      div.setAttribute('id', 'challenge_'+k);
      div.setAttribute('class', classes);
      div.textContent = (5 - i) * 100;
      pyramid.appendChild(div);
      k++;
    }

    var div = document.createElement('div');
    pyramid.appendChild(div);
  }
}

function submitFlag() {
  var flagObj = document.querySelector('#flag');

  socket.emit('submit_flag', {'challengeId': flagObj.getAttribute('data-challenge-id'), 'flag': flagObj.value});
  flagObj.value = '';
}

function flagAccepted(data) {
  var challengeObj = document.querySelector('#challenge_'+(15-parseInt(data.challengeId)));
  var classes = challengeObj.getAttribute('class');
  challengeObj.setAttribute('class', classes+' solved');
}

function invalidFlag() {
  alert('Invalid flag.');
}

function updateScore(data) {
  if ((data.score === undefined) || (data.score === null))
    return;

  var scoreObj = document.querySelector('#score');
  scoreObj.textContent = 'Score: '+data.score;
}

function updateScoreboard(data) {
}

function playSound(data) {
  if ((data.name === undefined) || (data.name === ''))
    return;

  var audio = document.querySelector('#sound_'+data.name);

  if (audio === null)
    return;

  audio.play();
}
