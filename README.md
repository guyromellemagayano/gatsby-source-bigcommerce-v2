# @epicdesignlabs/gatsby-source-bigcommerce

This unofficial source plugin makes BigCommerce API data available in GatsbyJS sites. Currently in active development.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![GitHub](https://img.shields.io/github/license/Epic-Design-Labs/gatsby-source-bigcommerce)
![npm](https://img.shields.io/npm/dt/@epicdesignlabs/gatsby-source-bigcommerce)
![GitHub issues](https://img.shields.io/github/issues/Epic-Design-Labs/gatsby-source-bigcommerce)
![GitHub closed issues](https://img.shields.io/github/issues-closed/Epic-Design-Labs/gatsby-source-bigcommerce)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Epic-Design-Labs/gatsby-source-bigcommerce)
![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/Epic-Design-Labs/gatsby-source-bigcommerce)
![GitHub contributors](https://img.shields.io/github/contributors/Epic-Design-Labs/gatsby-source-bigcommerce)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Epic-Design-Labs/gatsby-source-bigcommerce)
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/Epic-Design-Labs/gatsby-source-bigcommerce)
![npms.io (final)](https://img.shields.io/npms-io/maintenance-score/@epicdesignlabs/gatsby-source-bigcommerce)
![npms.io (final)](https://img.shields.io/npms-io/quality-score/@epicdesignlabs/gatsby-source-bigcommerce)

## Features

- Support for both `v2` and `v3` BigCommerce API versions
- Enhanced `preview` mode for testing BigCommerce webhooks. Currently supports [**Gatsby Cloud**](https://www.gatsbyjs.com/products/cloud/)
- Support for additional headers
- Log level options for BigCommerce endpoint requests: `info`, `debug`, `warn`, `error`
- Support for various response types: `json`, `xml`

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

```javascript
module.exports = {
	// ...

	plugins: [
		// ...

		{
			resolve: "@epicdesignlabs/gatsby-source-bigcommerce",
			options: {
				auth: {
					client_id: process.env.BIGCOMMERCE_API_CLIENT_ID // The client ID of your BigCommerce store.,
					secret: process.env.BIGCOMMERCE_API_SECRET_KEY // The secret key of your BigCommerce store.,
					access_token: process.env.BIGCOMMERCE_API_ACCESS_TOKEN // The access token of your BigCommerce store.,
					store_hash: process.env.BIGCOMMERCE_API_STORE_HASH // The store hash of your BigCommerce store.,
				},
				endpoints: {
					BigCommerceProducts: "/v3/catalog/products?include=variants,images,custom_fields,bulk_pricing_rules,primary_image,videos,options,modifiers"
				}
			}
		}
	]
};
```

## Configuration Options

### Endpoints

Add a single or multiple `endpoints`. Also supports `v2` and `v3` API endpoint versions. You can find a list of endpoints [here](https://developer.bigcommerce.com/api-reference/).

```javascript
options: {
	// ...

	endpoints: {
		// Single endpoint
		BigCommerceProducts: "/v3/catalog/products?include=images,variants,custom_fields,options,modifiers,videos",

		// Multiple endpoints
		BigCommerceStore: "/v2/store",
		BigCommercePageContent: "/v2/pages?limit=250",
		BigCommerceCategories: "/v3/catalog/categories?limit=250",
		BigCommerceBrands: "/v3/catalog/brands?limit=250",
		BigCommercePages: "/v3/content/pages?limit=250",
		BigCommerceCategories: "/v3/catalog/categories",
		BigCommerceCategoriesTree: "/v3/catalog/categories/tree",
		BigCommerceBrands: "/v3/catalog/brands"
	}
}
```

### Preview

To properly enable preview mode, deploy a site instance in the server (currently supports **Gatsby Cloud**), get your preview URL and add it under the key `siteUrl` and set the `preview` mode to `true` to options as shown. Default is `false`.

```javascript
options: {
	// ...

	options: {
		preview: {
			enabled: true
			siteUrl: "https://example.com"
		};
	}
}
```

### Additional Headers

Add additional headers to the request as follows:

```javascript
options: {
	// ...

	auth: {
		headers: {
			// Single header
			"X-Custom-Header": "Custom Value",

			// Mutiple headers
			"Access-Control-Allow-Headers": "Custom Value",
			"Access-Control-Allow-Credentials": "Custom Value",
			"Access-Control-Allow-Origin": "Custom Value",
			"Access-Control-Allow-Methods": "Custom Value"
		}
	}
}
```

### Log Level

Set the log level for the BigCommerce API requests. Default: `debug`.

```javascript
options: {
	// ...

	logLevel: "debug";
}
```

### Response Type

Set the response type for the BigCommerce API requests. Default: `json`.

```javascript
options: {
	// ...

	responseType: "json";
}
```

## How to Query

Assuming you correctly setup the plugin in `gatsby-config.js` and you have a `BigCommerceProducts` node name and its valid endpoint:

```javascript
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
