import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { UserObject } from '../../../../models/user';
import { UserService } from '../../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../../../administrative-activities';
import * as administrative_activity from '../../../administrative-activity';
import * as approve_request from './approve';

chai.use(sinonChai);

describe('approveAccessRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('throws an error if the identity source is not supported', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
      userIdentifier: 1,
      identitySource: 'fake-source',
      roleIds: [1, 3]
    };

    const requestHandler = approve_request.approveAccessRequest();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).status).to.equal(400);
      expect((error as HTTPError).message).to.equal('Invalid user identity source');
    }
  });

  it('re-throws any error that is thrown', async () => {
    const expectedError = new Error('test error');

    const mockDBConnection = getMockDBConnection({
      open: () => {
        throw expectedError;
      }
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
      userIdentifier: 1,
      identitySource: 'idir',
      roleIds: [1, 3]
    };

    const requestHandler = approve_request.approveAccessRequest();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect(error).to.equal(expectedError);
    }
  });

  it('adds new system roles and updates administrative activity as actioned', async () => {
    const mockDBConnection = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      administrativeActivityId: '1'
    };

    mockReq.body = {
      userIdentifier: 'username',
      identitySource: 'bceid',
      roleIds: [1, 3]
    };

    const systemUserId = 4;
    const existingRoleIds = [1, 2];
    const mockSystemUser: UserObject = {
      id: systemUserId,
      user_identifier: '',
      record_end_date: '',
      role_ids: existingRoleIds,
      role_names: []
    };
    const ensureSystemUserStub = sinon.stub(UserService.prototype, 'ensureSystemUser').resolves(mockSystemUser);

    const addSystemRolesStub = sinon.stub(UserService.prototype, 'addUserSystemRoles');

    const updateAdministrativeActivityStub = sinon.stub(administrative_activity, 'updateAdministrativeActivity');

    const requestHandler = approve_request.approveAccessRequest();

    await requestHandler(mockReq, mockRes, mockNext);

    const expectedRoleIdsToAdd = [3];

    expect(ensureSystemUserStub).to.have.been.calledOnce;
    expect(addSystemRolesStub).to.have.been.calledWith(systemUserId, expectedRoleIdsToAdd);
    expect(updateAdministrativeActivityStub).to.have.been.calledWith(
      1,
      ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.ACTIONED,
      mockDBConnection
    );
  });
});
