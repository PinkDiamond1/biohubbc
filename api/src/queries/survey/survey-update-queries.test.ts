import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PutSurveyDetailsData,
  PutSurveyFundingData,
  PutSurveyLocationData,
  PutSurveyObject,
  PutSurveyPermitData,
  PutSurveyProprietorData,
  PutSurveyPurposeAndMethodologyData,
  PutSurveySpeciesData
} from '../../models/survey-update';
import {
  associateSurveyToPermitSQL,
  insertSurveyPermitSQL,
  putSurveyDetailsSQL,
  unassociatePermitFromSurveySQL
} from './survey-update-queries';

describe('putSurveyDetailsSQL', () => {
  it('returns non null response when valid params provided with geometry', () => {
    const response = putSurveyDetailsSQL(2, ({
      survey_details: new PutSurveyDetailsData(null),
      species: new PutSurveySpeciesData(null),
      permit: new PutSurveyPermitData(null),
      funding: new PutSurveyFundingData(null),
      proprietor: new PutSurveyProprietorData(null),
      purpose_and_methodology: new PutSurveyPurposeAndMethodologyData(null),
      location: new PutSurveyLocationData(null)
    } as unknown) as PutSurveyObject);

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid params provided without geometry', () => {
    const response = putSurveyDetailsSQL(2, ({
      survey_details: new PutSurveyDetailsData(null),
      species: new PutSurveySpeciesData(null),
      permit: new PutSurveyPermitData(null),
      funding: new PutSurveyFundingData(null),
      proprietor: new PutSurveyProprietorData(null),
      purpose_and_methodology: new PutSurveyPurposeAndMethodologyData(null),
      location: new PutSurveyLocationData({
        survey_area_name: 'name',
        geometry: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: []
            },
            properties: {}
          }
        ],
        revision_count: 0
      })
    } as unknown) as PutSurveyObject);

    expect(response).to.not.be.null;
  });
});

describe('unassociatePermitFromSurveySQL', () => {
  it('returns a sql statement', () => {
    const response = unassociatePermitFromSurveySQL(1);

    expect(response).to.not.be.null;
  });
});

describe('insertSurveyPermitSQL', () => {
  it('returns a sql statement', () => {
    const response = insertSurveyPermitSQL(1, 2, 3, '4', 'type');

    expect(response).not.to.be.null;
  });
});

describe('associateSurveyToPermitSQL', () => {
  it('returns a sql statement', () => {
    const response = associateSurveyToPermitSQL(1, 2, '4');

    expect(response).not.to.be.null;
  });
});
