import { AxiosInstance, CancelTokenSource } from 'axios';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import { IGetSubmissionCSVForViewResponse } from 'interfaces/useObservationApi.interface';
import { IGetReportMetaData, IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import { IGetSummaryResultsResponse, IUploadSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import {
  ICreateSurveyRequest,
  ICreateSurveyResponse,
  IGetSurveyAttachmentsResponse,
  IGetSurveyForViewResponse,
  ISurveyAvailableFundingSources,
  ISurveyPermits,
  SurveyUpdateObject,
  SurveyViewObject
} from 'interfaces/useSurveyApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for working with surveys.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSurveyApi = (axios: AxiosInstance) => {
  /**
   * Create a new project survey
   *
   * @param {ICreateSurveyRequest} survey
   * @return {*}  {Promise<ICreateSurveyResponse>}
   */
  const createSurvey = async (projectId: number, survey: ICreateSurveyRequest): Promise<ICreateSurveyResponse> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/create`, survey);

    return data;
  };

  /**
   * Get project survey details based on its ID for viewing purposes.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*} {Promise<IGetSurveyForViewResponse>}
   */
  const getSurveyForView = async (projectId: number, surveyId: number): Promise<IGetSurveyForViewResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/view`);

    return data;
  };

  /**
   * Get surveys list.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IGetSurveysListResponse[]>}
   */
  const getSurveysList = async (projectId: number): Promise<SurveyViewObject[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/surveys`);

    return data;
  };

  /**
   * Update an existing survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {SurveyUpdateObject} surveyData
   * @return {*}  {Promise<any>}
   */
  const updateSurvey = async (projectId: number, surveyId: number, surveyData: SurveyUpdateObject): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/survey/${surveyId}/update`, surveyData);

    return data;
  };

  /**
   * Upload survey attachments.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {string} attachmentType
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadSurveyAttachments = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/attachments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Upload survey reports.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {string} attachmentType
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadSurveyReports = async (
    projectId: number,
    surveyId: number,
    file: File,

    attachmentMeta?: IReportMetaForm,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    if (attachmentMeta) {
      req_message.append('attachmentMeta[title]', attachmentMeta.title);
      req_message.append('attachmentMeta[year_published]', String(attachmentMeta.year_published));
      req_message.append('attachmentMeta[description]', attachmentMeta.description);
      attachmentMeta.authors.forEach((authorObj, index) => {
        req_message.append(`attachmentMeta[authors][${index}][first_name]`, authorObj.first_name);
        req_message.append(`attachmentMeta[authors][${index}][last_name]`, authorObj.last_name);
      });
    }

    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/attachments/report/upload`,
      req_message,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );

    return data;
  };

  /**
   * Update survey attachment metadata.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {string} attachmentType
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const updateSurveyReportMetadata = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    attachmentType: string,
    attachmentMeta: IEditReportMetaForm,
    revisionCount: number
  ): Promise<number> => {
    const obj = {
      attachment_type: attachmentType,
      attachment_meta: {
        title: attachmentMeta.title,
        year_published: attachmentMeta.year_published,
        authors: attachmentMeta.authors,
        description: attachmentMeta.description
      },
      revision_count: revisionCount
    };

    const { data } = await axios.put(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/metadata/update`,
      obj
    );

    return data;
  };

  /**
   * Get survey attachments based on survey ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {*} {Promise<IGetSurveyAttachmentsResponse>}
   */
  const getSurveyAttachments = async (projectId: number, surveyId: number): Promise<IGetSurveyAttachmentsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/attachments/list`);

    return data;
  };

  /**
   * Make security status of survey attachment secure.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @return {*}  {Promise<any>}
   */
  const makeAttachmentSecure = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    attachmentType: string
  ): Promise<any> => {
    const { data } = await axios.put(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/makeSecure`,
      {
        attachmentType
      }
    );

    return data;
  };

  /**
   * Make security status of survey attachment unsecure.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {any} securityToken
   * @param {string} attachmentType
   * @return {*}  {Promise<any>}
   */
  const makeAttachmentUnsecure = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    securityToken: any,
    attachmentType: string
  ): Promise<any> => {
    const { data } = await axios.put(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/makeUnsecure`,
      {
        securityToken,
        attachmentType
      }
    );

    return data;
  };

  /**
   * Get permits that have not already been assigned to a survey, by project ID
   * Note: This is because a survey can have exactly one permit assigned to it and permits cannot be used more than once
   *
   * @param {number} projectId
   * @returns {*} {Promise<SurveyPermits[]>}
   */
  const getSurveyPermits = async (projectId: number): Promise<ISurveyPermits[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/permits/list`);

    return data;
  };

  /**
   * Get funding sources for a survey by project ID
   *
   * @param {number} projectId
   * @returns {*} {Promise<ISurveyAvailableFundingSources[]>}
   */
  const getAvailableSurveyFundingSources = async (projectId: number): Promise<ISurveyAvailableFundingSources[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/funding-sources/list`);

    return data;
  };

  /**
   * Delete survey attachment based on survey and attachment ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @param {any} securityToken
   * @returns {*} {Promise<number>}
   */
  const deleteSurveyAttachment = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    attachmentType: string,
    securityToken: any
  ): Promise<number> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/delete`,
      {
        attachmentType,
        securityToken
      }
    );

    return data;
  };

  /**
   * Delete survey based on survey ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {*} {Promise<boolean>}
   */
  const deleteSurvey = async (projectId: number, surveyId: number): Promise<boolean> => {
    const { data } = await axios.delete(`/api/project/${projectId}/survey/${surveyId}/delete`);

    return data;
  };

  /**
   * Get survey attachment S3 url based on survey and attachment ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @returns {*} {Promise<string>}
   */
  const getSurveyAttachmentSignedURL = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    attachmentType: string
  ): Promise<string> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/getSignedUrl`,
      {
        params: { attachmentType: attachmentType },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        }
      }
    );

    return data;
  };

  /**
   * Get observation submission S3 url based on survey and submission ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
  const getObservationSubmissionSignedURL = async (
    projectId: number,
    surveyId: number,
    submissionId: number
  ): Promise<string> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/observation/submission/${submissionId}/getSignedUrl`
    );

    return data;
  };

  /**
   * Get summary submission S3 url based on survey and summary ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
  const getSummarySubmissionSignedURL = async (
    projectId: number,
    surveyId: number,
    summaryId: number
  ): Promise<string> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/summary/submission/${summaryId}/getSignedUrl`
    );

    return data;
  };

  /**
   * Delete summary submission based on summary ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} summaryId
   * @returns {*} {Promise<number>}
   */
  const deleteSummarySubmission = async (projectId: number, surveyId: number, summaryId: number): Promise<number> => {
    const { data } = await axios.delete(
      `/api/project/${projectId}/survey/${surveyId}/summary/submission/${summaryId}/delete`
    );

    return data;
  };

  /**
   * Upload survey summary results.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadSurveySummaryResults = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<IUploadSummaryResultsResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/summary/submission/upload`,
      req_message,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );

    return data;
  };

  /**
   * Get observation submission S3 url based on survey and submission ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
  const getSurveySummarySubmission = async (
    projectId: number,
    surveyId: number
  ): Promise<IGetSummaryResultsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/summary/submission/get`);

    return data;
  };

  /**
   * Get observation submission csv data/details by submission id.
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} summaryId
   * @return {*}  {Promise<IGetSubmissionCSVForViewResponse>}
   */
  const getSubmissionCSVForView = async (
    projectId: number,
    surveyId: number,
    summaryId: number
  ): Promise<IGetSubmissionCSVForViewResponse> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/summary/submission/${summaryId}/view`
    );

    return data;
  };

  /**
   * Get survey report metadata based on project ID, surveyID, attachment ID, and attachmentType
   *
   * @param {number} projectId
   * @params {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @returns {*} {Promise<string>}
   */
  const getSurveyReportMetadata = async (
    projectId: number,
    surveyId: number,
    attachmentId: number
  ): Promise<IGetReportMetaData> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/metadata/get`,
      {
        params: {},
        paramsSerializer: (params) => {
          return qs.stringify(params);
        }
      }
    );

    return data;
  };

  /**
   * Upload Survey/Project/Observation data to BioHub
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<boolean>}
   */
  const uploadSurveyDataToBioHub = async (projectId: number, surveyId: number): Promise<boolean> => {
    const response = await axios.post(`/api/project/${projectId}/survey/${surveyId}/upload`);

    return response.data;
  };

  return {
    createSurvey,
    getSurveyForView,
    getSurveysList,
    updateSurvey,
    uploadSurveyAttachments,
    uploadSurveyReports,
    updateSurveyReportMetadata,
    getSurveyReportMetadata,
    uploadSurveySummaryResults,
    getSurveySummarySubmission,
    getSurveyAttachments,
    deleteSurveyAttachment,
    getSurveyAttachmentSignedURL,
    getObservationSubmissionSignedURL,
    deleteSurvey,
    getSurveyPermits,
    getAvailableSurveyFundingSources,
    getSubmissionCSVForView,
    makeAttachmentUnsecure,
    makeAttachmentSecure,
    getSummarySubmissionSignedURL,
    deleteSummarySubmission,
    uploadSurveyDataToBioHub
  };
};

export default useSurveyApi;
