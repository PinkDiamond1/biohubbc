import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { SurveyService } from '../../../services/survey-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/surveys');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getSurveyList()
];

GET.apiDoc = {
  description: 'Get all Surveys.',
  tags: ['survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey list response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Survey get response object, for view purposes',
              type: 'object',
              required: ['survey_details', 'species', 'permit', 'funding', 'purpose_and_methodology', 'proprietor'],
              properties: {
                survey_details: {
                  description: 'Survey Details',
                  type: 'object',
                  required: [
                    'id',
                    'biologist_first_name',
                    'biologist_last_name',
                    'start_date',
                    'geometry',
                    'survey_area_name',
                    'survey_name',
                    'revision_count'
                  ],
                  properties: {
                    id: {
                      description: 'Survey id',
                      type: 'number'
                    },
                    biologist_first_name: {
                      type: 'string'
                    },
                    biologist_last_name: {
                      type: 'string'
                    },
                    start_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      description: 'ISO 8601 date string for the funding end_date'
                    },
                    end_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      nullable: true,
                      description: 'ISO 8601 date string for the funding end_date'
                    },
                    geometry: {
                      type: 'array',
                      items: {
                        ...(geoJsonFeature as object)
                      }
                    },
                    survey_area_name: {
                      type: 'string'
                    },
                    survey_name: {
                      type: 'string'
                    },
                    revision_count: {
                      type: 'number'
                    }
                  }
                },
                species: {
                  description: 'Survey Species',
                  type: 'object',
                  required: ['focal_species', 'focal_species_names', 'ancillary_species', 'ancillary_species_names'],
                  properties: {
                    ancillary_species: {
                      nullable: true,
                      type: 'array',
                      items: {
                        type: 'number'
                      }
                    },
                    ancillary_species_names: {
                      nullable: true,
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    },
                    focal_species: {
                      type: 'array',
                      items: {
                        type: 'number'
                      }
                    },
                    focal_species_names: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    }
                  }
                },
                permit: {
                  description: 'Survey Permit',
                  type: 'object',
                  required: ['permit_number', 'permit_type'],
                  properties: {
                    permit_number: {
                      type: 'string',
                      nullable: true
                    },
                    permit_type: {
                      type: 'string',
                      nullable: true
                    }
                  }
                },
                funding: {
                  description: 'Survey Funding Sources',
                  type: 'object',
                  properties: {
                    funding_sources: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['pfs_id', 'agency_name', 'funding_amount', 'funding_start_date', 'funding_end_date'],
                        properties: {
                          pfs_id: {
                            type: 'number',
                            nullable: true
                          },
                          agency_name: {
                            type: 'string',
                            nullable: true
                          },
                          funding_amount: {
                            type: 'number',
                            nullable: true
                          },
                          funding_start_date: {
                            type: 'string',
                            nullable: true,
                            description: 'ISO 8601 date string'
                          },
                          funding_end_date: {
                            type: 'string',
                            nullable: true,
                            description: 'ISO 8601 date string'
                          }
                        }
                      }
                    }
                  }
                },
                purpose_and_methodology: {
                  description: 'Survey Details',
                  type: 'object',
                  required: [
                    'field_method_id',
                    'additional_details',
                    'intended_outcome_id',
                    'ecological_season_id',
                    'vantage_code_ids',
                    'surveyed_all_areas'
                  ],
                  properties: {
                    field_method_id: {
                      type: 'number'
                    },
                    additional_details: {
                      type: 'string',
                      nullable: true
                    },
                    intended_outcome_id: {
                      type: 'number',
                      nullable: true
                    },
                    ecological_season_id: {
                      type: 'number',
                      nullable: true
                    },
                    vantage_code_ids: {
                      type: 'array',
                      items: {
                        type: 'number'
                      }
                    },
                    surveyed_all_areas: {
                      type: 'string',
                      enum: ['true', 'false']
                    }
                  }
                },
                proprietor: {
                  description: 'Survey Proprietor Details',
                  type: 'object',
                  nullable: true,
                  required: [
                    'category_rationale',
                    'disa_required',
                    'first_nations_id',
                    'first_nations_name',
                    'proprietor_name',
                    'proprietor_type_id',
                    'proprietor_type_name'
                  ],
                  properties: {
                    category_rationale: {
                      type: 'string'
                    },
                    disa_required: {
                      type: 'boolean'
                    },
                    first_nations_id: {
                      type: 'number',
                      nullable: true
                    },
                    first_nations_name: {
                      type: 'string',
                      nullable: true
                    },
                    proprietor_name: {
                      type: 'string'
                    },
                    proprietor_type_id: {
                      type: 'number'
                    },
                    proprietor_type_name: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get all surveys.
 *
 * @returns {RequestHandler}
 */
export function getSurveyList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveyIdsResponse = await surveyService.getSurveyIdsByProjectId(Number(req.params.projectId));

      const surveyIds = surveyIdsResponse.map((item: { id: any }) => item.id);

      const surveys = await surveyService.getSurveysByIds(surveyIds);

      await connection.commit();

      return res.status(200).json(surveys);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
