//
// Index initializers and boot-strapper of NodeJs application which only serve static app
//
// Copyright © 2019 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
/**
 * Imports
 */
const express = require('express');
const path = require('path');
const request = require('request');

/**
 * @description Bootstrap script to start app web server
 */
(() => {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  // Express APP
  const app = express();
  // Getting Port
  const port = process.env.APP_PORT || 7100;
  // Resource path
  const resourcePath = path.resolve(__dirname, '../build');
  // Setting express static
  app.use(express.static(resourcePath));

  // App config
  app.use('/config', (_, resp) => {
    const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL || 'nrs.objectstore.gov.bc.ca';
    const OBJECT_STORE_BUCKET_NAME = process.env.OBJECT_STORE_BUCKET_NAME || 'gblhvt';

    const config = {
      API_HOST: process.env.REACT_APP_API_HOST || 'localhost',
      N8N_HOST: process.env.REACT_APP_N8N_HOST,
      CHANGE_VERSION: process.env.CHANGE_VERSION || 'NA',
      NODE_ENV: process.env.NODE_ENV || 'development',
      REACT_APP_NODE_ENV: process.env.REACT_APP_NODE_ENV || 'dev',
      VERSION: `${process.env.VERSION || 'NA'}(build #${process.env.CHANGE_VERSION || 'NA'})`,
      KEYCLOAK_CONFIG: {
        url: process.env.SSO_URL || 'https://dev.oidc.gov.bc.ca/auth',
        realm: process.env.SSO_REALM || '35r1iman',
        clientId: process.env.SSO_CLIENT_ID || 'biohubbc'
      },
      SITEMINDER_LOGOUT_URL:
        process.env.REACT_APP_SITEMINDER_LOGOUT_URL || 'https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi',
      MAX_UPLOAD_NUM_FILES: Number(process.env.REACT_APP_MAX_UPLOAD_NUM_FILES) || 10,
      MAX_UPLOAD_FILE_SIZE: Number(process.env.REACT_APP_MAX_UPLOAD_FILE_SIZE) || 52428800,
      S3_PUBLIC_HOST_URL: `https://${OBJECT_STORE_URL}/${OBJECT_STORE_BUCKET_NAME}`
    };
    resp.status(200).json(config);
  });

  // Health check
  app.use('/healthcheck', (_, resp) => {
    // Request server api
    const host = process.env.REACT_APP_API_HOST || process.env.LOCAL_API_HOST || 'localhost';
    request(`https://${host}/`, (err, res) => {
      if (err) {
        console.log(`Error: ${err}, host: ${host}`);
        resp.status(404).json({ error: `${err}`, host: host });
      } else {
        if (res.statusCode === 200) {
          resp.status(200).json({ success: true });
        } else {
          resp.status(404).json({ error: 'API not responding' });
        }
      }
    });
  });

  // All routes
  const route = express.Router();
  route.all('*', express.static(resourcePath));
  app.use('*', route);

  // Logging
  console.log(`Starting express web server on port with resource path => ${port}: ${resourcePath}`);
  // Listing to port
  app.listen(port, () => {
    console.log(`Application started on port => ${port}`);
  });
})();
