import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { queries } from '../../../../../queries/queries';
import { ProjectService } from '../../../../../services/project-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import * as doAllProjectsHaveAProjectLead from '../../../../user/{userId}/delete';
import * as delete_project_participant from './delete';

chai.use(sinonChai);

describe('Delete a project participant.', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    mockReq.params = { projectId: '', projectParticipationId: '2' };

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no projectParticipationId is provided', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    mockReq.params = { projectId: '1', projectParticipationId: '' };

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectParticipationId`');
    }
  });

  it('should throw a 400 error when deleteProjectParticipationSQL query fails', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(queries.projectParticipation, 'deleteProjectParticipationSQL').returns(null);
    sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves([{ id: 1 }]);
    sinon.stub(doAllProjectsHaveAProjectLead, 'doAllProjectsHaveAProjectLead').returns(true);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should throw a 400 error when connection query fails', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(queries.projectParticipation, 'deleteProjectParticipationSQL').returns(SQL`some query`);
    sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves([{ id: 1 }]);
    sinon.stub(doAllProjectsHaveAProjectLead, 'doAllProjectsHaveAProjectLead').returns(true);

    const mockQuery = sinon.stub();

    mockQuery.resolves(null);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to delete project team member');
    }
  });

  it('should throw a 400 error when user is only project lead', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(queries.projectParticipation, 'deleteProjectParticipationSQL').returns(SQL`some query`);
    const getProjectParticipant = sinon.stub(ProjectService.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(doAllProjectsHaveAProjectLead, 'doAllProjectsHaveAProjectLead');

    getProjectParticipant.onCall(0).resolves([{ id: 1 }]);
    doAllProjectsHaveLead.onCall(0).returns(true);
    getProjectParticipant.onCall(1).resolves([{ id: 2 }]);
    doAllProjectsHaveLead.onCall(1).returns(false);

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [{ system_user_id: 1 }],
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot delete project user. User is the only Project Lead for the project.'
      );
    }
  });

  it('should not throw an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(queries.projectParticipation, 'deleteProjectParticipationSQL').returns(SQL`some query`);
    const getProjectParticipant = sinon.stub(ProjectService.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(doAllProjectsHaveAProjectLead, 'doAllProjectsHaveAProjectLead');

    getProjectParticipant.onCall(0).resolves([{ id: 1 }]);
    doAllProjectsHaveLead.onCall(0).returns(true);
    getProjectParticipant.onCall(1).resolves([{ id: 2 }]);
    doAllProjectsHaveLead.onCall(1).returns(true);

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [{ system_user_id: 1 }],
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    const requestHandler = delete_project_participant.deleteProjectParticipant();

    await requestHandler(mockReq, mockRes, mockNext);
    expect(mockRes.statusValue).to.equal(200);
  });
});
