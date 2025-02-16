const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const gameOverDisplay = document.getElementById("game-over");
const restartBtn = document.getElementById("restart-btn");

const box = 20; // Rozmiar jednego segmentu węża i jedzenia
let snake = [{ x: 200, y: 200 }]; // Początkowa pozycja węża
let direction = "RIGHT"; // Początkowy kierunek ruchu
let food = { x: getRandomPosition(), y: getRandomPosition() }; // Początkowe jedzenie
let blueFood = null;  // Niebieskie jedzenie
let blueFoodTime = null;  // Czas, kiedy pojawiło się niebieskie jedzenie
let score = 0; // Wynik

let redWall = null;  // Czerwona ściana (przechowuje informacje o jej pozycji)
let redWallTime = null;  // Czas, kiedy pojawiła się czerwona ściana
let gameOver = false;  // Flaga informująca o końcu gry

function getRandomPosition() {
  return Math.floor(Math.random() * (canvas.width / box)) * box;
}

function draw() {
  if (gameOver) return;  // Zatrzymaj rysowanie, gdy gra się skończyła

  ctx.fillStyle = "white";  // Ustawiamy tło gry na biały kolor
  ctx.fillRect(0, 0, canvas.width, canvas.height);  // Wypełniamy całe tło gry na biało
  
  // Rysowanie zielonego jedzenia
  ctx.fillStyle = "green";  // Zmieniliśmy kolor na zielony
  ctx.fillRect(food.x, food.y, box, box);

  // Rysowanie niebieskiego jedzenia
  if (blueFood) {
    ctx.fillStyle = "blue";
    ctx.fillRect(blueFood.x, blueFood.y, box, box);
  }
  
  // Rysowanie węża
  snake.forEach((segment, index) => {
    // Jeśli to głowa węża, rysujemy ją na liliowo fioletowo
    if (index === 0) {
      ctx.fillStyle = "violet"; // Liliowy kolor dla głowy
    } else {
      ctx.fillStyle = "pink"; // Różowy kolor dla reszty ciała
    }
    ctx.fillRect(segment.x, segment.y, box, box);
  });

  // Rysowanie czerwonej ściany, jeśli jest aktywna
  if (redWall) {
    ctx.fillStyle = "red";
    if (redWall === "top") {
      ctx.fillRect(0, 0, canvas.width, box);  // Górna ściana
    } else if (redWall === "bottom") {
      ctx.fillRect(0, canvas.height - box, canvas.width, box);  // Dolna ściana
    } else if (redWall === "left") {
      ctx.fillRect(0, 0, box, canvas.height);  // Lewa ściana
    } else if (redWall === "right") {
      ctx.fillRect(canvas.width - box, 0, box, canvas.height);  // Prawa ściana
    }
  }

  // Aktualizacja pozycji węża
  let head = { x: snake[0].x, y: snake[0].y };
  
  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;
  
  // Sprawdzanie kolizji ze ścianą i odbicie węża o 180°
  if (head.x < 0 || head.x >= canvas.width) {
    // Odbicie od lewej lub prawej ściany
    if (direction === "LEFT") direction = "RIGHT";
    if (direction === "RIGHT") direction = "LEFT";
  }
  
  if (head.y < 0 || head.y >= canvas.height) {
    // Odbicie od górnej lub dolnej ściany
    if (direction === "UP") direction = "DOWN";
    if (direction === "DOWN") direction = "UP";
  }

  // Sprawdzanie kolizji z czerwoną ścianą
  if (
    (redWall === "top" && head.y === 0) ||
    (redWall === "bottom" && head.y === canvas.height - box) ||
    (redWall === "left" && head.x === 0) ||
    (redWall === "right" && head.x === canvas.width - box)
  ) {
    // Jeśli wąż zderzy się z czerwoną ścianą, kończymy grę
    gameOver = true;
    gameOverDisplay.style.display = "block";  // Wyświetlamy napis "Game Over"
    restartBtn.style.display = "block";  // Wyświetlamy przycisk restartu
    return;
  }

  // Sprawdzanie, czy wąż zjadł jedzenie
  if (head.x === food.x && head.y === food.y) {
    food = { x: getRandomPosition(), y: getRandomPosition() }; // Losowanie nowego jedzenia
    score += 1; // Zwiększenie punktów za zjedzenie zielonego jedzenia
  } else {
    snake.pop(); // Usunięcie ogona, jeśli wąż nie zjadł jedzenia
  }

  // Sprawdzanie, czy wąż zjadł niebieskie jedzenie
  if (blueFood && head.x === blueFood.x && head.y === blueFood.y) {
    blueFood = null;  // Usunięcie niebieskiego jedzenia
    blueFoodTime = null;
    score = Math.max(score - 1, 0);  // Zmniejszenie punktów o 1 (minimalna wartość 0)

    // Skrócenie węża o 1 segment (usunięcie ogona)
    snake.pop();
  }
  
  // Dodanie nowej głowy węża
  snake.unshift(head); 
  
  // Sprawdzanie, czy niebieskie jedzenie powinno zniknąć
  if (blueFoodTime && Date.now() - blueFoodTime > 10000) {  // Po 10 sekundach
    blueFood = null;
    blueFoodTime = null;
  }
  
  // Losowanie niebieskiego jedzenia co około 10 sekund
  if (!blueFood && Math.random() < 0.1) {
    blueFood = { x: getRandomPosition(), y: getRandomPosition() };
    blueFoodTime = Date.now();
  }
  
  // Losowanie czerwonej ściany co 1-13 sekund
  if (!redWall && Math.random() < 0.1) {
    const walls = ["top", "bottom", "left", "right"];
    redWall = walls[Math.floor(Math.random() * walls.length)];  // Losowanie ściany
    redWallTime = Date.now();
  }

  // Czerwona ściana znika po 10 sekundach
  if (redWallTime && Date.now() - redWallTime > 10000) {
    redWall = null;
    redWallTime = null;
  }

  // Aktualizacja wyniku w elemencie HTML
  scoreDisplay.textContent = "Wynik: " + score;
}

function changeDirection(event) {
  const key = event.keyCode;
  if (key === 37 && direction !== "RIGHT") direction = "LEFT";
  if (key === 38 && direction !== "DOWN") direction = "UP";
  if (key === 39 && direction !== "LEFT") direction = "RIGHT";
  if (key === 40 && direction !== "UP") direction = "DOWN";
}

function restartGame() {
  // Resetowanie stanu gry
  gameOver = false;
  snake = [{ x: 200, y: 200 }];
  direction = "RIGHT";
  food = { x: getRandomPosition(), y: getRandomPosition() };
  blueFood = null;
  blueFoodTime = null;
  score = 0;
  redWall = null;
  redWallTime = null;

  // Ukrywanie napisu i przycisku restartu
  gameOverDisplay.style.display = "none";
  restartBtn.style.display = "none";

  // Restart gry
  setInterval(draw, 200);
}

document.addEventListener("keydown", changeDirection);
setInterval(draw, 200);  // Gra odświeża się co 200 ms
