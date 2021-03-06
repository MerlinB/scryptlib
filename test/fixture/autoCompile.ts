import glob = require('glob');
import { join } from 'path';
import { compileContract } from '../helper';
import { exit } from 'process';

function compileAllContracts() {
  const contracts = glob.sync(join(__dirname, './*.scrypt'));
  contracts.forEach(filePath => {
    console.log(`Compiling contract ${filePath} ...`)

    const result = compileContract(filePath, ".");

    if (result.errors.length > 0) {
      console.log(`Contract ${filePath} compiling failed with errors:`);
      console.log(result.errors);
      exit(1);
    }
  })
}

compileAllContracts();