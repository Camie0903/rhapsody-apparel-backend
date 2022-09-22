const express = require("express");
const router = express.Router();
const con = require("../lib/db_connection");
const jwt = require ("jsonwebtoken")
const middleware = require("../middleware/auth")

router.get("/", (req, res) => {
    try {
        con.query("SELECT * FROM products", (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    } catch (error) {
        console.log(error);
      
    }
});

router.get("/:id", (req, res) => {
  try {
    con.query(
      `SELECT * FROM products WHERE id = "${req.params.id}"`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.post("/", middleware, (req, res) => {
  // if (req.user.user_type === "admin") {
    const user = {
      image: req.body.image,
      product_name: req.body.product_name,
      price: req.body.price,
    };
    try {
      let sql = `insert into products SET ?`;
      con.query(sql, user, (err, result) => {
        if (err) throw err.message;
        res.send(result);
      });
    } catch (error) {
      console.log(error.message);
    }
 
});

router.put("/:id", (req, res) => {
  const { image, product_name, price} = req.body;
  try {
    con.query(
      `UPDATE Product SET image ='${image}', product_name='${product_name}', price='${price}',
       WHERE id ='${req.params.id}'`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.patch("/:id", (req, res) => {
    const {
        image,
        product_name,
        price,
        } = req.body;
    try {
      con.query(
        `update product set image = "${image}", product_name = "${product_name}", price = "${price}", where id ="${req.params.id}"`,
        (err, result) => {
          if (err) throw err;
          res.send(result);
        }
      );
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  });

router.delete("/:id", (req, res) => {
    try {
      con.query(
        `delete from product where id ="${req.params.id}"`,
        (err, result) => {
          if (err) throw err;
          res.send(result);
        }
      );
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  });


module.exports = router;