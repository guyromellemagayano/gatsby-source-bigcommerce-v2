# gatsby-source-bigcommerce-v2

This unofficial source plugin makes BigCommerce API data available in GatsbyJS sites. Currently in active development.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![GitHub](https://img.shields.io/github/license/guyromellemagayano/gatsby-source-bigcommerce)
![npm](https://img.shields.io/npm/dt/gatsby-source-bigcommerce)
![GitHub issues](https://img.shields.io/github/issues/guyromellemagayano/gatsby-source-bigcommerce)
![GitHub closed issues](https://img.shields.io/github/issues-closed/guyromellemagayano/gatsby-source-bigcommerce)
![GitHub pull requests](https://img.shields.io/github/issues-pr/guyromellemagayano/gatsby-source-bigcommerce)
![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/guyromellemagayano/gatsby-source-bigcommerce)
![GitHub contributors](https://img.shields.io/github/contributors/guyromellemagayano/gatsby-source-bigcommerce)
![GitHub package.json version](https://img.shields.io/github/package-json/v/guyromellemagayano/gatsby-source-bigcommerce)
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/guyromellemagayano/gatsby-source-bigcommerce)

## DEPRECATION NOTICE

This plugin [@epicdesignlabs/gatsby-source-bigcommerce](https://www.npmjs.com/package/@epicdesignlabs/gatsby-source-bigcommerce) is no longer maintained and now officially deprecated. Please use this unofficial, but currently maintained [gatsby-source-bigcommerce-v2](https://www.npmjs.com/package/gatsby-source-bigcommerce-v2) plugin instead as Im still currently maintaining this plugin.

## Features

Provide support for the following features:

- Support for both `v2` and `v3` `bigcommerce` API versions
- Multiple `bigcommerce` API versions
- Multiple, additional custom headers
- Custom request timeout in all `bigcommerce` API requests
- Data caching on subsequent `gatsby` source plugin runs
- Request timeouts in all `bigcommerce` API requests
- Throttling, debouncing, and adjusting the number of concurrent `bigcommerce` API requests
- Option for opting out of type inference for `optimizely/episerver` API `gatsby` nodes or add custom `gatsby` node schemas for `optimizely/episerver` API `gatsby` nodes
- Support for various response types: `json`, `xml`

## Installation and Setup

For `npm`:

```console
npm install gatsby-source-bigcommerce-v2
```

For `yarn`:

```console
yarn add gatsby-source-bigcommerce-v2
```

Setup this plugin in `gatsby-config.js` as follows **_(\*required fields)_**:

```javascript
module.exports = {
  // ...

  plugins: [
    // ...

    {
      resolve: "gatsby-source-bigcommerce-v2",
      options: {
        auth: {
          client_id: process.env.BIGCOMMERCE_API_CLIENT_ID // The client ID of your BigCommerce store.,
          secret: process.env.BIGCOMMERCE_API_SECRET_KEY // The secret key of your BigCommerce store.,
          access_token: process.env.BIGCOMMERCE_API_ACCESS_TOKEN // The access token of your BigCommerce store.,
          store_hash: process.env.BIGCOMMERCE_API_STORE_HASH // The store hash of your BigCommerce store.,
        },
        endpoints: [
          {
            nodeName: "BigCommerceProducts",
            endpoint: "/v3/catalog/products?include=variants,images,custom_fields,bulk_pricing_rules,primary_image,videos,options,modifiers",
            schema: null
          },
          {
            nodeName: "BigCommerceCategories",
            endpoint: "/v3/catalog/categories",
            schema: null
          },
          {
            nodeName: "BigCommerceStore",
            endpoint: "/v2/store",
            schema: `
              type BigCommerceStore implements Node {
                account_uuid: String
                domain: String
                secure_url: String
                control_panel_base_url: String
              }
            `
          }
        ]
      }
    }
  ]
};
```

## Configuration Options

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

### Endpoints

Add a single or multiple `endpoints`. Also supports `v2` and `v3` API endpoint versions. You can find a list of endpoints [here](https://developer.bigcommerce.com/api-reference/).

> **Note**: The `endpoints` should start with `/<BIGCOMMERCE_ENDPOINT_VERSION>/**/*` as the base URL will be added automatically to the `bigcommerce` `hostname` value.

```javascript
options: {
  // ...

  endpoints: [
    // Single endpoint
    {
      nodeName: "BigCommerceProducts",
      endpoint: "/v3/catalog/products?include=variants,images,custom_fields,bulk_pricing_rules,primary_image,videos,options,modifiers",
      schema: null
    },

    // Multiple endpoints
    {
      nodeName: "BigCommerceCategories",
      endpoint: "/v3/catalog/categories",
      schema: null
    },
    {
      nodeName: "BigCommerceStore",
      endpoint: "/v2/store",
      schema: `
        type BigCommerceStore implements Node {
          account_uuid: String
          domain: String
          secure_url: String
          control_panel_base_url: String
        }
      `
    }
  ];
}
```

### Global Schema

Add a global schema to all `endpoints`. This will be merged with the `endpoint` schema. This is useful for adding global types that affect multiple `endpoints`.

```javascript
options: {
  // ...

  globals: {
    schema: `
      type BigCommerceId {
        bigcommerce_id: Int
      }
    `
  },
  endpoints: [
    {
      nodeName: "BigCommerceProducts",
      endpoint: "/v3/catalog/products?include=variants,images,custom_fields,bulk_pricing_rules,primary_image,videos,options,modifiers",
      schema: null
    },
    {
      nodeName: "BigCommerceCategories",
      endpoint: "/v3/catalog/categories",
      schema: null
    },
    {
      nodeName: "BigCommerceStore",
      endpoint: "/v2/store",
      schema: `
        type BigCommerceStore implements Node {
          account_uuid: String
          domain: String
          secure_url: String
          control_panel_base_url: String
        }
      `
    }
  ]
}
```

### Response Type

Set the response type for the BigCommerce API requests. Supports `json`, `xml`.

**Default:** `json`.

```javascript
options: {
  // ...

  response_type: "json";
}
```

### Request Timeout

Set a custom request timeout for the Optimizely/Episerver API requests (in milliseconds).

**Default:** `60000` _(60 seconds)_.

```javascript
options: {
  // ...

  request_timeout: 60000;
}
```

### Request Throttling

Set a custom request throttling interval for the Optimizely/Episerver API requests (in milliseconds).

**Default:** `500` _(0.5 seconds)_.

```javascript
options: {
  // ...

  request_throttle_interval: 500;
}
```

### Request Debouncing

Set a custom request debouncing interval for the Optimizely/Episerver API requests (in milliseconds).

**Default:** `500` _(0.5 seconds)_.

```javascript
options: {
  // ...

  request_debounce_interval: 500;
}
```

### Request Concurrency

Set a custom request concurrency for the Optimizely/Episerver API requests.

**Default:** `100`.

```javascript
options: {
  // ...

  request_concurrency: 100;
}
```

## How to Query

Assuming you correctly setup the plugin in `gatsby-config.js` and you have a `BigCommerceProducts` node name and its valid endpoint:

```javascript
options: {
  // ...

  endpoints: {
    BigCommerceProducts: "/v3/catalog/products?include=variants,images,custom_fields,bulk_pricing_rules,primary_image,videos,options,modifiers";
  }
}
```

you can query the data as follows:

```graphql
{
  allBigCommerceProducts {
    edges {
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
    }
  }
}
```

## Contributing

Please feel free to contribute! PRs are always welcome.

## License

This source code is licensed under the **MIT** license found in the [LICENSE](LICENSE) file in the root directory of this source tree.

## Author

[**Guy Romelle Magayano**](https://guyromellemagayano.dev)

## Credits

Thanks to all the contributors of the original plugin [gatsby-source-bigcommerce](https://github.com/thirdandgrove/gatsby-source-bigcommerce) and [node-bigcommerce](https://github.com/getconversio/node-bigcommerce) for the great work. 🎉
