const products = require("./products.json");
const orders = [];
const ordersByCategory = {};

products.forEach((product) => {
	product.Orders = 0;
	product.LastOrderedAt = new Date();
});

function getRandomInt(max) {
	return Math.floor(Math.random() * max) + 1;
}

// Asynchronously order a product to ensure that 'new Date()' is different for each product
async function orderRandomProduct() {
	const index = getRandomInt(products.length) - 1; // choose random product to be ordered
	const product = products[index];
	product.Orders++;
	product.LastOrderedAt = new Date();
	orders.push(product);

	const category = product.Category;
	if (!ordersByCategory[category]) {
		ordersByCategory[category] = 0;
	}

	ordersByCategory[category] += 1;
}

function getLatestOrders() {
	orders.sort((a, b) => b.LastOrderedAt - a.LastOrderedAt);
	return {
		items: orders,
		count: orders.length
	};
}

function getLatestOrderByCategory() {
	orders.sort((a, b) => b.LastOrderedAt - a.LastOrderedAt);

	const salesPerCategory = [];
	for (let [key, value] of Object.entries(ordersByCategory)) {
		salesPerCategory.push({
			Category: key,
			Orders: value
		});
	}

	const sortedSalesPerCategory = salesPerCategory
		.sort(({ Category: category1 }, { Category: category2 }) => category1.localeCompare(category2));

	return {
		updateTime: new Date(),
		categoriesCount: salesPerCategory.length,
		salesPerCategory: sortedSalesPerCategory
	};
}

// Order some products at the beginning
(async function initialOrder() {
	if (Object.keys(ordersByCategory).length > 10) {
		return;
	}

	await orderRandomProduct();
	initialOrder();
})();

module.exports = {
	orderRandomProduct,
	getLatestOrders,
	getLatestOrderByCategory
}
