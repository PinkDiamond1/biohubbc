import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import survey_queries from '../../../../../queries/survey';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as list from './list';

chai.use(sinonChai);

describe('getSurveyPermits', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw a 400 error when no project id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = list.getSurveyPermits();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no sql statement returned for assignable survey permits', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_queries, 'getAllAssignablePermitsForASurveySQL').returns(null);

    try {
      const result = list.getSurveyPermits();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return the survey permits on success', async () => {
    const surveyPermits = [
      {
        number: '123',
        type: 'scientific'
      },
      {
        number: '12345',
        type: 'wildlife'
      }
    ];

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: surveyPermits });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getAllAssignablePermitsForASurveySQL').returns(SQL`some query`);

    const result = list.getSurveyPermits();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql([
      {
        permit_number: '123',
        permit_type: 'scientific'
      },
      {
        permit_number: '12345',
        permit_type: 'wildlife'
      }
    ]);
  });

  it('should return an empty array when survey permits response has no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getAllAssignablePermitsForASurveySQL').returns(SQL`some query`);

    const result = list.getSurveyPermits();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql([]);
  });
});
