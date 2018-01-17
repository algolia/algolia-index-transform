const algoliasearch = require('algoliasearch');
const fs = require('fs-extra');
const colors = require('colors');

class IndexManipulation {
  constructor(settings) {
    this.sourceApplicationID = settings.sourceApplicationID;
    this.sourceApiKey = settings.sourceApiKey;
    this.sourceIndexName = settings.sourceIndexName;
    this.destinationApplicationID = settings.destinationApplicationID;
    this.destinationApiKey = settings.destinationApiKey;
    this.destinationIndexName = settings.destinationIndexName;
    this.limit = settings.limit;
    this.requestOptions = settings.requestOptions || {};
    this.copySettings = settings.copySettings || false;
    this.headers = settings.headers || {};

    this._setupTempDirectories();
  }

  _setupTempDirectories() {
    if (fs.existsSync('records-temp')) {
      fs.removeSync('records-temp');
    }
    fs.mkdirSync('records-temp');

    if (fs.existsSync('parsed-records-temp')) {
      fs.removeSync('parsed-records-temp');
    }
    fs.mkdirSync('parsed-records-temp');
  }

  _initClients() {
    const sourceClient = algoliasearch(
      this.sourceApplicationID,
      this.sourceApiKey
    );
    Object.keys(this.headers).forEach(key => {
      sourceClient.setExtraHeader(key, this.headers[key]);
    });
    this.sourceIndex = sourceClient.initIndex(this.sourceIndexName);

    const destinationClient = algoliasearch(
      this.destinationApplicationID,
      this.destinationApiKey
    );
    Object.keys(this.headers).forEach(key => {
      destinationClient.setExtraHeader(key, this.headers[key]);
    });
    this.destinationIndex = destinationClient.initIndex(
      this.destinationIndexName
    );
  }

  _writeSourceChunks() {
    return new Promise((resolve, reject) => {
      const browser = this.sourceIndex.browseAll(
        Object.assign(
          {
            attributesToRetrieve: '*'
          },
          this.requestOptions
        )
      );
      let pageCount = 0;
      let chunkCount = 0;
      let records = [];
      let totalRecords = 0;

      console.log('Fetching records'.bgWhite.black);

      browser.on('result', response => {
        if (pageCount < 19) {
          records = [].concat(records, response.hits);
          pageCount++;
        } else if (this.limit && totalRecords > this.limit) {
          browser.stop();
          fs.writeFileSync(
            `records-temp/chunk-${chunkCount}.json`,
            JSON.stringify(records)
          );
          totalRecords = totalRecords + records.length;
          console.log(`Finished pulling ${totalRecords} records`.green);
          resolve();
        } else {
          records = [].concat(records, response.hits);
          fs.writeFileSync(
            `records-temp/chunk-${chunkCount}.json`,
            JSON.stringify(records)
          );
          totalRecords = totalRecords + records.length;
          console.log(`Pulled ${totalRecords} records...`.yellow);
          records.length = 0;
          pageCount = 0;
          chunkCount++;
        }
      });

      browser.on('end', () => {
        fs.writeFileSync(
          `records-temp/chunk-${chunkCount}.json`,
          JSON.stringify(records)
        );
        totalRecords = totalRecords + records.length;
        console.log(`Finished pulling ${totalRecords} records`.green);
        resolve();
      });

      browser.on('error', err => {
        reject(err);
      });
    });
  }

  _parseSourceChunks(mappingFunction, type) {
    const files = fs
      .readdirSync('records-temp')
      .filter(name => name.includes('json'));
    let totalParsedRecords = 0;

    console.log(
      `${type === 'reduce' ? 'reduc' : type}ing records`.bgWhite.black
    );

    files.forEach(filename => {
      const chunk = fs.readFileSync(`records-temp/${filename}`);
      const records = JSON.parse(chunk);
      const parsedRecords = records[type](mappingFunction);

      if (parsedRecords.length) {
        fs.writeFileSync(
          `parsed-records-temp/${filename}`,
          JSON.stringify(parsedRecords)
        );

        totalParsedRecords = totalParsedRecords + parsedRecords.length;

        console.log(
          `${
            type === 'reduce' ? 'reduc' : type
          }ed ${totalParsedRecords} records...`.yellow
        );
      }
    });
  }

  _uploadIndex() {
    this.filesToUpload = fs.readdirSync('parsed-records-temp');
    this.chunkCount = 0;
    this.totalRecords = 0;

    console.log(`Uploading records to new index`.bgWhite.black);

    this._addChunkToIndex();
  }

  _addChunkToIndex() {
    const filename = this.filesToUpload[this.chunkCount];

    if (filename) {
      const chunk = fs.readFileSync(`parsed-records-temp/${filename}`);
      const records = JSON.parse(chunk);

      this.destinationIndex.addObjects(records, error => {
        if (error) {
          return;
        }

        this.totalRecords = this.totalRecords + records.length;
        this.chunkCount++;

        console.log(`Pushed ${this.totalRecords} records...`.yellow);
        this._addChunkToIndex();
      });
    } else {
      this._cleanupTempDirectories();
      console.log('All done! 🎉 🎉 🎉'.green);
    }
  }

  _cleanupTempDirectories() {
    fs.removeSync('records-temp');
    fs.removeSync('parsed-records-temp');
  }

  _copySettings() {
    this.sourceIndex
      .getSettings()
      .then(settings => {
        this.destinationIndex
          .setSettings(settings)
          .then(() => console.log('Settings copied'.green))
          .catch(error => console.error('Copy settings failed', error));
      })
      .catch(error => console.log('error'));
  }

  map(mappingFunction) {
    this._initClients();
    this._writeSourceChunks().then(() => {
      this._parseSourceChunks(mappingFunction, 'map');
      this._uploadIndex();

      if (this.copySettings) {
        this._copySettings();
      }
    });
  }

  reduce(reducingFunction) {
    this._initClients();
    this._writeSourceChunks().then(() => {
      this._parseSourceChunks(reducingFunction, 'reduce');
      this._uploadIndex();
    });

    if (this.copySettings) {
      this._copySettings();
    }
  }

  filter(reducingFunction) {
    this._initClients();
    this._writeSourceChunks().then(() => {
      this._parseSourceChunks(reducingFunction, 'filter');
      this._uploadIndex();
    });

    if (this.copySettings) {
      this._copySettings();
    }
  }

  copy() {
    const copyFunction = item => item;

    this._initClients();
    this._writeSourceChunks().then(() => {
      this._parseSourceChunks('', 'slice');
      this._uploadIndex();
    });

    if (this.copySettings) {
      this._copySettings();
    }
  }
}

module.exports = IndexManipulation;
