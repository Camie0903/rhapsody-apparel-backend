const express = require("express");
const router = express.Router();
const con = require("../lib/db_connection");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const middleware = require("../middleware/auth");

router.get("/", (req, res) => {
    try {
        con.query("SELECT * FROM users", (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    } catch (error) {
        console.log(error);
        res.status(400).send(error)
    }
});

// Register Route
// The Route where Encryption starts
router.post("/register", (req, res) => {
  try {
    let sql = "INSERT INTO users SET ?";
    const {
      email,
      password,
      full_name, 
      phone,
      user_type
    } = req.body;

    // The start of hashing / encryption
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    
    let user = {
      email,
      password: hash,
      full_name,
      // We sending the hash value to be stored witin the table
      phone,
      user_type,
      
    };
    con.query(sql, user, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.send(`User ${(user.full_name, user.email)} created successfully`);
    });
  } catch (error) {
    console.log(error);
  }
});

// Login
router.post("/login", (req, res) => {
    try {
      let sql = "SELECT * FROM users WHERE ?";
      let user = {
        email: req.body.email,
      };
      con.query(sql, user, async (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
          res.send("Email not found please register");
        } else {
          const isMatch = await bcrypt.compare(
            req.body.password,
            result[0].password
          );
          if (!isMatch) {
            res.send("Password incorrect");
          } else {
            // The information the should be stored inside token
            const payload = {
              user: {
                user_id: result[0].user_id,
                email: result[0].email,
                password: result[0].password,
                full_name: result[0].full_name,
                phone: result[0].phone,
                user_type: result[0].user_type,
                },
            };
            // Creating a token and setting expiry date
            jwt.sign(
              payload,
              process.env.jwtSecret,
              {
                expiresIn: "365d",
              },
              (err, token) => {
                if (err) throw err;
                res.json({ token });
              }
            );
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  // Verify
router.get("/verify", (req, res) => {
    const token = req.header("x-auth-token");
    jwt.verify(token, process.env.jwtSecret, (error, decodedToken) => {
      if (error) {
        res.status(401).json({
          msg: "Unauthorized Access!",
        });
      } else {
        res.status(200);
        res.send(decodedToken);
      }
    });
  });

// middleware to out get all user routes
  router.get("/", middleware, (req, res) => {
    try {
      let sql = "SELECT * FROM users";
      con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
      });
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router;