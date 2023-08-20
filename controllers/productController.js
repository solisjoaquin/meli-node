const axios = require("axios");
const constants = require("../utils/constants");
const numeral = require("numeral");

const apiUrl = process.env.API_URL;
const limitProducts = 4;

exports.getProducts = (searchValue, res) => {
  axios
    .get(
      `${apiUrl}/sites/${constants.MLA_REGION}/search?q=${searchValue}&limit=${limitProducts}`
    )
    .then((response) => {
      res.json(formatProducts(response.data));
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.getProductDetails = (productId, res) => {
  const detailResponse = {};
  axios
    .all([
      axios.get(`${apiUrl}/items/${productId}`),
      axios.get(`${apiUrl}/items/${productId}/description`),
    ])
    .then(
      axios.spread((product, description) => {
        detailResponse.author = getAuthor();
        detailResponse.item = formatItemValues(product.data, description.data);
        axios
          .get(`${apiUrl}/categories/${product.data.category_id}`)
          .then((response) => {
            detailResponse.categories = response.data.path_from_root.map(
              (category) => {
                return category.name;
              }
            );
            res.json(detailResponse);
          });
      })
    );
};

function formatProducts(response) {
  const productsFormat = {};
  productsFormat.author = getAuthor();
  productsFormat.categories = getCategories(response.filters);
  productsFormat.items = getItems(response.results);
  return productsFormat;
}

const getCategories = ([firstFilter]) => {
  let categories = [];
  if (!!firstFilter.id && firstFilter.id == "category") {
    categories = firstFilter.values[0].path_from_root.map((category) => {
      return category.name;
    });
  }
  return categories;
};

const getItems = (items) => {
  return items.map((item) => {
    return {
      id: item.id,
      title: item.title,
      price: {
        currency: item.currency_id,
        amount: formatLocalPrice(item.price),
        decimals: formatPrice(item.price).decimals,
      },
      picture: item.thumbnail,
      condition: item.condition,
      free_shipping: item.shipping.free_shipping,
      address: item.address.state_name,
    };
  });
};

const formatItemValues = (product, description) => {
  const productFormat = {};

  productFormat.id = product.id;
  productFormat.title = product.title;
  productFormat.price = {
    currency: product.currency_id,
    amount: formatLocalPrice(product.price),
    decimals: formatPrice(product.price).decimals,
  };

  if (product.pictures.length) {
    productFormat.picture = product.pictures[0].secure_url;
  }

  productFormat.condition =
    product.condition === "new" ? constants.NEW : constants.USED;
  productFormat.free_shipping = product.shipping.free_shipping;
  productFormat.sold_quantity = product.sold_quantity;
  productFormat.description = description.plain_text;

  return productFormat;
};

/* const formatNumber = (number) => {
  const regex = /(\d)(?=(\d{3})+(?!\d))/g;
  return number.toString().replace(regex, "$1.");
}; */
const formatLocalPrice = (price) => numeral(price).format("$ 0.[00]");

const formatPrice = (price) => {
  const priceString = price.toString();
  //const entirePart = priceString.split(".")[0];
  const decimals = priceString.split(".")[1] ? priceString.split(".")[1] : 0;

  return {
    //entirePart: entirePart,
    decimals: decimals,
  };
};

const getAuthor = () => ({ name: "Joaquin", lastname: "Solis" });
