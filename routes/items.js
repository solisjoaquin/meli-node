const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/productController");

router.get("/items", (req, res) => {
  const search = req.query.search;
  if (!!search) {
    ProductController.getProducts(search, res);
  } else {
    res.status(400).send({
      error: "Ingrese un criterio de busqueda : 'search' ",
    });
  }
});

router.get("/items/:id", (req, res) => {
  const productId = req.params.id;
  if (!!productId) {
    ProductController.getProductDetails(productId, res);
  } else {
    res.status(400).send({ error: "Ingrese un ID" });
  }
});

module.exports = router;
