const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

// 存储用户数据（临时存储，实际应用应使用数据库）
const users = []; 

// 存储游戏高分
const highScores = [];

// JWT 密钥（用于签名令牌）
const jwt = require("jsonwebtoken");
const SECRET_KEY = "123";

//________API inplementation_________//

//POST /signup

app.post("/signup", (req, res) => {
  const { userHandle, password } = req.body;

  if ( !userHandle || !password) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  
  if ( userHandle.length < 6 || password.length < 6) {
    return res.status(400).json({ message: "Invalid request body" }); 
  }

  // if (users.some(user => user.userHandle === userHandle)) {
  //   return res.status(400).json({ message: "Invalid request body" });
  // }

  users.push({ userHandle, password });

  res.status(201).json({ message: "User registered successfully" });
});

//POST /login

app.post("/login" , (req, res) => {
  const { userHandle, password, ...extra} = req.body;

  if (Object.keys(extra).length > 0) {
    return res.status(400).json({ message: "Bad Request" });
  }

  if (!userHandle || !password) {
    return res.status(400).json({ message: "Bad Request" });
  }

  if (typeof userHandle !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Bad Request" });
  }

  if (userHandle.length < 6 || password.length < 6) {
    return res.status(400).json({ message: "Bad Request" });
  }

  const user = users.find(u => u.userHandle === userHandle && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized, incorrect username or password" });
  }

  const token = jwt.sign({}, SECRET_KEY);

  res.status(200).json({ jsonWebToken: token});
});

//POST /highscores
app.post("/high-scores", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized, JWT token is missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
      jwt.verify(token, SECRET_KEY); 
  } catch (err) {
      return res.status(401).json({ message: "Unauthorized, JWT token is missing or invalid" });
  }

  const { level, userHandle, score, timestamp } = req.body;

  if (!level || !userHandle || !score || !timestamp) {
      return res.status(400).json({ message: "Invalid request body" });
  }

  highScores.push({ level, userHandle, score, timestamp });

  return res.status(201).json({ message: "High score posted successfully" });
});

//GET /highscores
app.get("/high-scores", (req, res) => {
  const { level, page } = req.query;

  if (!level) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  let filteredScores = highScores.filter(score => score.level === level);

  filteredScores.sort((a, b) => b.score - a.score);

  const pageSize = 20;
  const pageNumber = parseInt(page) || 1;
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedScores = filteredScores.slice(startIndex, endIndex);

  res.status(200).json(paginatedScores);
});



//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
