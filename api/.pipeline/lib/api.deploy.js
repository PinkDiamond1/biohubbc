'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Run a pod to deploy the api image (must be already built, see api.build.js).
 *
 * @param {*} settings
 * @returns
 */
module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

  const changeId = phases[phase].changeId;

  let objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/api.dc.yaml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        HOST: phases[phase].host,
        CHANGE_ID: phases.build.changeId || changeId,
        APP_HOST: phases[phase].appHost,
        BACKBONE_API_HOST: phases[phase].backboneApiHost,
        BACKBONE_INTAKE_PATH: phases[phase].backboneIntakePath,
        BACKBONE_INTAKE_ENABLED: phases[phase].backboneIntakeEnabled,
        NODE_ENV: phases[phase].env || 'dev',
        ELASTICSEARCH_URL: phases[phase].elasticsearchURL,
        TZ: phases[phase].tz,
        KEYCLOAK_ADMIN_USERNAME: 'sims-svc',
        KEYCLOAK_SECRET: 'keycloak-admin-password',
        KEYCLOAK_SECRET_ADMIN_PASSWORD: 'keycloak_admin_password',
        DB_SERVICE_NAME: `${phases[phase].dbName}-postgresql${phases[phase].suffix}`,
        CERTIFICATE_URL: phases[phase].certificateURL,
        REPLICAS: phases[phase].replicas || 1,
        REPLICA_MAX: phases[phase].maxReplicas || 1,
        LOG_LEVEL: phases[phase].logLevel || 'info'
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, phases[phase].instance);
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);

  oc.applyAndDeploy(objects, phases[phase].instance);
};
