# @epicdesignlabs/gatsby-source-bigcommerce

This official source plugin makes BigCommerce API data available in GatsbyJS sites. Currently in active development.

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![CodeQL][codeql-img]][codeql-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

[build-img]: https://github.com/Epic-Design-Labs/gatsby-source-bigcommerce/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/Epic-Design-Labs/gatsby-source-bigcommerce/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/typescript-npm-package-template
[downloads-url]: https://www.npmtrends.com/typescript-npm-package-template
[npm-img]: https://img.shields.io/npm/v/@epicdesignlabs/gatsby-source-bigcommerce
[npm-url]: https://www.npmjs.com/package/@epicdesignlabs/gatsby-source-bigcommerce
[issues-img]: https://img.shields.io/github/issues/Epic-Design-Labs/gatsby-source-bigcommerce
[issues-url]: https://github.com/Epic-Design-Labs/gatsby-source-bigcommerce/issues
[codecov-img]: https://codecov.io/gh/Epic-Design-Labs/gatsby-source-bigcommerce/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/Epic-Design-Labs/gatsby-source-bigcommerce
[codeql-img]: https://github.com/Epic-Design-Labs/gatsby-source-bigcommerce/actions/workflows/codeql-analysis.yml/badge.svg
[codeql-url]: https://github.com/Epic-Design-Labs/gatsby-source-bigcommerce/actions/workflows/codeql-analysis.yml/badge.svg
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/

## Features

- Support for both `v2` and `v3` BigCommerce API versions
- Enhanced `preview` mode for testing BigCommerce webhooks. Currently supports [**Netlify**](https://www.netlify.com/), [**Vercel**](https://vercel.com/), and [**Gatsby Cloud**](https://www.gatsbyjs.com/products/cloud/)
- Support for additional headers

## Installation and Setup

For `npm`:

```console
npm install @epicdesignlabs/gatsby-source-bigcommerce
```

For `yarn`:

```console
yarn add @epicdesignlabs/gatsby-source-bigcommerce
```

Setup this plugin in `gatsby-config.js` as follows:

```ts
module.exports = {
	// ...

	plugins: [
		// ...

		{
			resolve: "@epicdesignlabs/gatsby-source-bigcommerce",
			options: {
				clientId: process.env.BIGCOMMERCE_API_CLIENT_ID,
				secret: process.env.BIGCOMMERCE_API_SECRET,
				accessToken: process.env.BIGCOMMERCE_API_ACCESS_TOKEN,
				storeHash: process.env.BIGCOMMERCE_API_STORE_HASH,
				endpoints: {
					BigCommerceProducts: "/v3/catalog/products?include=images,variants,custom_fields,options,modifiers,videos",
					BigCommerceCategories: "/v3/catalog/categories",
					BigCommerceCategoriesTree: "/v3/catalog/categories/tree",
					BigCommerceBrands: "/v3/catalog/brands"
				},
				preview: true,
				siteUrl: "https://example.com",
				headers: {
					"Access-Control-Allow-Origin": process.env.BIGCOMMERCE_CORS_ORIGIN,
					"Access-Control-Allow-Methods": process.env.BIGCOMMERCE_API_ALLOWED_METHODS
				}
			}
		}
	]
};
```

## Configuration Options

### Endpoints

Add a single or multiple `endpoints`. You can find a list of endpoints [here](https://developer.bigcommerce.com/api-reference/).

```ts
options: {
	// ...

	endpoints: {
		// Single endpoint
		BigCommerceProducts: "/v3/catalog/products?include=images,variants,custom_fields,options,modifiers,videos",

		// Multiple endpoints
		BigCommerceCategories: "/v3/catalog/categories",
		BigCommerceCategoriesTree: "/v3/catalog/categories/tree",
		BigCommerceBrands: "/v3/catalog/brands"
	}
}
```

### Preview

To properly enable preview mode, deploy a site instance in the server (\*currently supports **Netlify**, **Vercel**, and **Gatsby Cloud\***), get your preview URL and add it under the key `siteUrl` and set the `preview` mode to `true` to options as shown

```ts
options: {
	// ...

	preview: true;
	siteUrl: "https://example.com";
}
```

### Additional Headers

Add additional headers to the request as follows:

```ts
options: {
	// ...

	headers: {
		// Single	header
		"X-Custom-Header": "Custom Value",

		// Mutiple headers
		"Access-Control-Allow-Headers": "Custom Value",
		"Access-Control-Allow-Credentials": "Custom Value",
		"Access-Control-Allow-Origin": "Custom Value",
		"Access-Control-Allow-Methods": "Custom Value"
	}
}
```

## How to Query

Assuming you correctly setup the plugin in `gatsby-config.js` and you have a `BigCommerceProducts` node name and its valid endpoint:

```ts
endpoints: {
	BigCommerceProducts: "/v3/catalog/products?include=images,variants,custom_fields,options,modifiers,videos";
}
```

you can query the data as follows:

```graphql
{
	allBigCommerceProducts {
		nodes {
			name
			price
			id
			sku
			variants {
				id
				product_id
				price
				cost_price
				image_url
				sku
			}
			reviews_count
			reviews_rating_sum
			page_title
			images {
				id
				description
				product_id
				date_modified
			}
			bigcommerce_id
			brand_id
			custom_url {
				url
			}
			categories
			availability
		}
		totalCount
	}
}
```

## Contributing

Please feel free to contribute! PRs are always welcome.

## License

This source code is licensed under the **MIT** license found in the [LICENSE](LICENSE) file in the root directory of this source tree.

## Author

[**Epic Design Labs**](https://epicdesignlabs.com)

## License

Released under the [MIT license](LICENSE).

## Credits

Thanks to all the contributors of the original plugin [gatsby-source-bigcommerce](https://github.com/thirdandgrove/gatsby-source-bigcommerce) and [node-bigcommerce](https://github.com/getconversio/node-bigcommerce) for the great work. 🎉
