const axios = require("axios");
const constants = require("../utils/constants");
const numeral = require("numeral");

const apiUrl = process.env.API_URL;
const limitProducts = 4;

/**
 * @param {string} searchValue - Search value
 * @param {Object} res - Response
 * @returns {Object} Products
 * @returns {Object} Products.author
 * @returns {Array} Products.categories
 * @returns {Array} Products.items
 *
 */
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

/**
 * @param {string} productId - Product id
 * @param {Object} res - Response
 * @returns {Object} Product
 * @returns {Object} Product.author
 * @returns {Object} Product.item
 * @returns {Array} Product.categories
 *
 */
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

/**
 *
 * @param {*} response - Response from API
 * @returns {Object} Products
 * @returns {Object} Products.author
 * @returns {Array} Products.categories
 * @returns {Array} Products.items
 *
 */
function formatProducts(response) {
  const productsFormat = {};
  productsFormat.author = getAuthor();
  productsFormat.categories = getCategories(response.filters);
  productsFormat.items = getItems(response.results);
  return productsFormat;
}

/**
 * @param {Array} filters - Filters from API
 * @returns {Array} Categories
 *
 */
const getCategories = ([firstFilter]) => {
  let categories = [];
  if (!!firstFilter.id && firstFilter.id == "category") {
    categories = firstFilter.values[0].path_from_root.map((category) => {
      return category.name;
    });
  }
  return categories;
};

/**
 * @param {Array} items - Items from API
 * @returns {Array} Items
 * @returns {string} Items.id
 * @returns {string} Items.title
 * @returns {Object} Items.price
 * @returns {string} Items.price.currency
 * @returns {number} Items.price.amount
 * @returns {number} Items.price.decimals
 * @returns {string} Items.picture
 * @returns {string} Items.condition
 * @returns {boolean} Items.free_shipping
 * @returns {string} Items.address
 * @returns {string} Items.sold_quantity
 * @returns {string} Items.description
 *
 */
const getItems = (items) => {
  return items.map((item) => {
    return {
      id: item.id,
      title: item.title,
      price: {
        currency: item.currency_id,
        amount: item.price,
        decimals: formatPrice(item.price).decimals,
      },
      picture: item.thumbnail,
      condition: item.condition,
      free_shipping: item.shipping.free_shipping,
      address: item.address.state_name,
    };
  });
};

/**
 * @param {Object} product - Product from API
 * @param {Object} description - Description from API
 * @returns {Object} Product
 * @returns {string} Product.id
 * @returns {string} Product.title
 * @returns {Object} Product.price
 * @returns {string} Product.price.currency
 * @returns {number} Product.price.amount
 * @returns {number} Product.price.decimals
 * @returns {string} Product.picture
 * @returns {string} Product.condition
 * @returns {boolean} Product.free_shipping
 * @returns {string} Product.sold_quantity
 * @returns {string} Product.description
 *
 */
const formatItemValues = (product, description) => {
  const productFormat = {};

  productFormat.id = product.id;
  productFormat.title = product.title;
  productFormat.price = {
    currency: product.currency_id,
    amount: product.price,
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

const formatPrice = (price) => {
  const priceString = price.toString();
  const decimals = priceString.split(".")[1] ? priceString.split(".")[1] : 0;

  return {
    decimals: decimals,
  };
};

/**
 *
 * @returns {Object} Author
 * @returns {string} Author.name
 * @returns {string} Author.lastname
 *
 */

const getAuthor = () => ({ name: "Joaquin", lastname: "Solis" });
