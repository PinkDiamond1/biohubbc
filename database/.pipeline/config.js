'use strict';
let options = require('pipeline-cli').Util.parseArguments();

// The root config for common values
const config = require('../../.config/config.json');

const name = (config.module && config.module['db']) || 'biohubbc-db';

const changeId = options.pr || `${Math.floor(Date.now() * 1000) / 60.0}`; // aka pull-request or branch
const version = config.version || '1.0.0';

// A static deployment is when the deployment is updating dev, test, or prod (rather than a temporary PR)
const isStaticDeployment = options.type === 'static';

const deployChangeId = (isStaticDeployment && 'deploy') || changeId;
const branch = (isStaticDeployment && options.branch) || null;
const tag = (branch && `build-${version}-${changeId}-${branch}`) || `build-${version}-${changeId}`;

// Default: run both seeding and migrations
let dbSetupDockerfilePath = './.docker/db/Dockerfile.setup';
if (isStaticDeployment && options.branch === 'prod') {
  // If this is static build to prod, then only run the migrations
  dbSetupDockerfilePath = './.docker/db/Dockerfile.migrate';
}

const processOptions = (options) => {
  const result = { ...options };

  // Check git
  if (!result.git.url.includes('.git')) {
    result.git.url = `${result.git.url}.git`;
  }

  if (!result.git.http_url.includes('.git')) {
    result.git.http_url = `${result.git.http_url}.git`;
  }

  // Fixing repo
  if (result.git.repository.includes('/')) {
    const last = result.git.repository.split('/').pop();
    const final = last.split('.')[0];
    result.git.repository = final;
  }

  return result;
};

options = processOptions(options);

const phases = {
  build: {
    namespace: 'af2668-tools',
    name: `${name}`,
    phase: 'build',
    changeId: changeId,
    suffix: `-build-${changeId}`,
    instance: `${name}-build-${changeId}`,
    version: `${version}-${changeId}`,
    tag: tag,
    env: 'build',
    tz: config.timezone.db,
    branch: branch,
    dbSetupDockerfilePath: dbSetupDockerfilePath
  },
  dev: {
    namespace: 'af2668-dev',
    name: `${name}`,
    phase: 'dev',
    changeId: deployChangeId,
    suffix: `-dev-${deployChangeId}`,
    instance: `${name}-dev-${deployChangeId}`,
    version: `${deployChangeId}-${changeId}`,
    tag: `dev-${version}-${deployChangeId}`,
    env: 'dev',
    tz: config.timezone.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath
  },
  test: {
    namespace: 'af2668-test',
    name: `${name}`,
    phase: 'test',
    changeId: deployChangeId,
    suffix: `-test`,
    instance: `${name}-test`,
    version: `${version}`,
    tag: `test-${version}`,
    env: 'test',
    tz: config.timezone.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath
  },
  prod: {
    namespace: 'af2668-prod',
    name: `${name}`,
    phase: 'prod',
    changeId: deployChangeId,
    suffix: `-prod`,
    instance: `${name}-prod`,
    version: `${version}`,
    tag: `prod-${version}`,
    env: 'prod',
    tz: config.timezone.db,
    dbSetupDockerfilePath: dbSetupDockerfilePath
  }
};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = { phases, options };
