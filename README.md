# Algolia Index Transform

A selection of methods to transform an index using `map`, `reduce` or `filter` and push to a brand new index.

### Install

##### Node Using NPM
`npm install algolia-index-transform`

##### Node Using yarn
`yarn add algolia-index-transform`

### Set Up

Once installed, you will need to initalize the Algolia Index Transform as bellow. Each property is required.a

```js
const AlgoliaIndexTransform = require('algolia-index-transform');

const algoliaIndexTransform = new AlgoliaIndexTransform({
  // The Application ID where the current index resides
  sourceApplicationID: 'xxxxxxxxxx',
  // The API Key for the app where the current index resides
  sourceApiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // The index name of the current index
  sourceIndexName: 'an existing index',
  // The Application ID of where you would like to add the index
  destinationApplicationID: 'xxxxxxxxxx',
  // The API Key for the new index
  destinationApiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // The new index name
  destinationIndexName: 'a new index',
});
```

### Usage

#### Map
```js
algoliaIndexTransform.map(item => ({
  id: item.id,
}));
```

#### Filter
```js
algoliaIndexTransform.filter(item => item.popular === true);
```

#### Reduce
```js
algoliaIndexTransform.reduce((acc, crr) => acc + cur);
```
