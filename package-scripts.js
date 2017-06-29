const npsUtils = require('nps-utils');

const series = npsUtils.series;
const concurrent = npsUtils.concurrent;
const rimraf = npsUtils.rimraf;

module.exports = {
  scripts: {
    commit: {
      description: 'This uses commitizen to help us generate well formatted commit messages',
      script: 'git-cz'
    },
    test: {
      default: 'jest',
      watch: 'jest --watch'
    },
    build: {
      description: 'delete the dist directory and run babel to build the files',
      script: series(
        rimraf('dist'),
        'babel --copy-files --out-dir dist --ignore *.test.js,__mocks__ src'
      )
    },
    lint: {
      description: 'lint the entire project',
      script: 'eslint .'
    },
    reportCoverage: {
      description: 'Report coverage stats to codecov. This should be run after the `test` script',
      script: 'codecov'
    },
    release: {
      description: 'We automate releases with semantic-release. This should only be run on travis',
      script: series('semantic-release pre', 'npm publish', 'semantic-release post')
    },
    validate: {
      description:
        'This runs several scripts to make sure things look good before committing or on clean install',
      script: concurrent.nps('lint', 'build', 'test')
    },
    format: {
      description: 'Formats everything with prettier-eslint',
      script: 'prettier-eslint "src/**/*.js" --write'
    },
    docs: {
      description: 'Generate documentation',
      script: 'esdoc'
    },
    todo: {
      description: 'Generate TODO.md from in source TODO and FIXME tags',
      script: 'leasot src/**/*.js'
    }
  },
  options: {
    silent: false
  }
};