import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { PlatformService } from '../../../../../services/platform-service';
import { SurveyService } from '../../../../../services/survey-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import { updateSurvey } from './update';

chai.use(sinonChai);

describe('updateSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('updates a survey', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(SurveyService.prototype, 'updateSurvey').resolves();

    sinon.stub(PlatformService.prototype, 'submitDwCAMetadataPackage').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {};

    try {
      const requestHandler = updateSurvey();

      await requestHandler(mockReq, mockRes, mockNext);
    } catch (actualError) {
      expect.fail();
    }

    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql({ id: 2 });
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(SurveyService.prototype, 'updateSurvey').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = updateSurvey();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.release).to.have.been.called;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
