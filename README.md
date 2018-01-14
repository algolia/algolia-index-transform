# Algolia Index Transform

A selection of methods to transform an index using `map`, `reduce` or `filter`.
and push to a brand new index.

### Install

##### Node Using NPM

`npm install algolia-index-transform`

##### Node Using yarn

`yarn add algolia-index-transform`

### Set Up

Once installed, you will need to initalize the Algolia Index Transform as below.
Each property is required.

```js
const AlgoliaIndexTransform = require('algolia-index-transform');

const algoliaIndexTransform = new AlgoliaIndexTransform({
  sourceApplicationID: 'xxxxxxxxxx',
  sourceApiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  sourceIndexName: 'an existing index',
  destinationApplicationID: 'xxxxxxxxxx',
  destinationApiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  destinationIndexName: 'a new index',
  limit: 20000,
  requestOptions: {
    attributesToRetrieve: ['*']
  },
  copySettings: false
});
```

### Setting properties

| Paramater                   | Type      | Description                                                                                                                                                                        |
| :-------------------------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceApplicationID`       | `String`  | The Application ID where the current index resides                                                                                                                                 |
| `sourceApiKey`              | `String`  | The API Key for the app where the current index resides                                                                                                                            |
| `sourceIndexName`           | `String`  | The index name of the current index                                                                                                                                                |
| `destinationApplicationID`  | `String`  | The Application ID of where you would like to add the index                                                                                                                        |
| `destinationApiKey`         | `String`  | The API Key for the new index                                                                                                                                                      |
| `destinationIndexName`      | `String`  | The new index name                                                                                                                                                                 |
| `limit` (Optional)          | `Number`  | Optional: Limit the amount of records to transfer                                                                                                                                  |
| `requestOptions` (Optional) | `Object`  | Optional: Object containing request options for [browseAll](https://www.algolia.com/doc/api-reference/api-methods/browse/?language=javascript#browse-compatible-search-parameters) |
| `copySettings` (Optional)   | `Boolean` | Optional: Copy destination settings with the transformation                                                                                                                        |

### Usage

#### Copy

```js
algoliaIndexTransform.copy();
```

#### Map

```js
algoliaIndexTransform.map(item => ({
  id: item.id
}));
```

#### Filter

```js
algoliaIndexTransform.filter(item => item.popular === true);
```

#### Reduce

```js
algoliaIndexTransform.reduce((acc, cur) => acc + cur);
```
