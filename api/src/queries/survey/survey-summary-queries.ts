import { SQL, SQLStatement } from 'sql-template-strings';
import { PostSummaryDetails } from '../../models/summaryresults-create';

/**
 * SQL query to insert a survey summary submission row.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} file_name
 * @return {*}  {(SQLStatement | null)}
 */
export const insertSurveySummarySubmissionSQL = (
  surveyId: number,
  source: string,
  file_name: string
): SQLStatement | null => {
  if (!surveyId || !source || !file_name) {
    return null;
  }

  return SQL`
    INSERT INTO survey_summary_submission (
      survey_id,
      source,
      file_name,
      event_timestamp
    ) VALUES (
      ${surveyId},
      ${source},
      ${file_name},
      now()
    )
    RETURNING survey_summary_submission_id as id;
  `;
};

/**
 * SQL query to get latest summary submission for a survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getLatestSurveySummarySubmissionSQL = (surveyId: number): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  return SQL`
    SELECT
      sss.survey_summary_submission_id as id,
      sss.key,
      sss.file_name,
      sss.delete_timestamp,
      sssm.submission_message_type_id,
      sssm.message,
      ssmt.name as submission_message_type_name,
      ssmt.summary_submission_message_class_id,
      ssmc.name as submission_message_class_name
    FROM
      survey_summary_submission as sss
    LEFT OUTER JOIN
      survey_summary_submission_message as sssm
    ON
      sss.survey_summary_submission_id = sssm.survey_summary_submission_id
    LEFT OUTER JOIN
      summary_submission_message_type as ssmt
    ON
      sssm.submission_message_type_id = ssmt.submission_message_type_id
    LEFT OUTER JOIN
      summary_submission_message_class as ssmc
    ON
      ssmt.summary_submission_message_class_id = ssmc.summary_submission_message_class_id
    WHERE
      sss.survey_id = ${surveyId}
    ORDER BY
      sss.event_timestamp DESC
    LIMIT 1;
    `;
};

/**
 * SQL query to soft delete the summary submission entry by ID
 *
 * @param {number} summarySubmissionId
 * @returns {SQLStatement} sql query object
 */
export const deleteSummarySubmissionSQL = (summarySubmissionId: number): SQLStatement | null => {
  if (!summarySubmissionId) {
    return null;
  }

  return SQL`
    UPDATE survey_summary_submission
    SET delete_timestamp = now()
    WHERE survey_summary_submission_id = ${summarySubmissionId};
  `;
};

/**
 * SQL query to insert a survey summary submission row.
 *
 * @param {number} summarySubmissionId
 * @param {string} key
 * @return {*}  {(SQLStatement | null)}
 */
export const updateSurveySummarySubmissionWithKeySQL = (
  summarySubmissionId: number,
  key: string
): SQLStatement | null => {
  if (!summarySubmissionId || !key) {
    return null;
  }

  return SQL`
    UPDATE survey_summary_submission
    SET
      key=  ${key}
    WHERE
      survey_summary_submission_id = ${summarySubmissionId}
    RETURNING survey_summary_submission_id as id;
  `;
};

/**
 * SQL query to get the record for a single summary submission.
 *
 * @param {number} submissionId
 * @returns {SQLStatement} sql query object
 */
export const getSurveySummarySubmissionSQL = (summarySubmissionId: number): SQLStatement | null => {
  if (!summarySubmissionId) {
    return null;
  }

  return SQL`
    SELECT
      *
    FROM
      survey_summary_submission
    WHERE
      survey_summary_submission_id = ${summarySubmissionId};
  `;
};

/**
 * SQL query to insert a survey summary submission row.
 *
 * @param {number} summarySubmissionId
 * @param {string} summaryDetails
 * @return {*}  {(SQLStatement | null)}
 */
export const insertSurveySummaryDetailsSQL = (
  summarySubmissionId: number,
  summaryDetails: PostSummaryDetails
): SQLStatement | null => {
  if (!summarySubmissionId || !summaryDetails) {
    return null;
  }

  return SQL`
    INSERT INTO survey_summary_detail (
      survey_summary_submission_id,
      study_area_id,
      parameter,
      stratum,
      parameter_value,
      parameter_estimate,
      confidence_limit_lower,
      confidence_limit_upper,
      confidence_level_percent,
      sightability_model,
      standard_error,
      coefficient_variation,
      kilometres_surveyed,
      total_area_surveyed_sqm,
      outlier_blocks_removed,
      analysis_method
    ) VALUES (
      ${summarySubmissionId},
      ${summaryDetails.study_area_id},
      ${summaryDetails.parameter},
      ${summaryDetails.stratum},
      ${summaryDetails.parameter_value},
      ${summaryDetails.parameter_estimate},
      ${summaryDetails.confidence_limit_lower},
      ${summaryDetails.confidence_limit_upper},
      ${summaryDetails.confidence_level_percent},
      ${summaryDetails.sightability_model},
      ${summaryDetails.standard_error},
      ${summaryDetails.coefficient_variation},
      ${summaryDetails.kilometres_surveyed},
      ${summaryDetails.total_area_survey_sqm},
      ${summaryDetails.outlier_blocks_removed},
      ${summaryDetails.analysis_method}
    )
    RETURNING survey_summary_detail_id as id;
  `;
};

/**
 * SQL query to insert the occurrence submission message.
 *
 * @param {number} summarySubmissionId
 * @param {string} summarySubmissionMessageType
 * @param {string} summarySubmissionMessage
 * @param {string} errorCode
 * @returns {SQLStatement} sql query object
 */
export const insertSurveySummarySubmissionMessageSQL = (
  summarySubmissionId: number,
  summarySubmissionMessageType: string,
  summarySubmissionMessage: string,
  errorCode: string
): SQLStatement | null => {
  if (!summarySubmissionId || !summarySubmissionMessageType || !summarySubmissionMessage || !errorCode) {
    return null;
  }

  return SQL`
    INSERT INTO survey_summary_submission_message (
      survey_summary_submission_id,
      submission_message_type_id,
      event_timestamp,
      message
    ) VALUES (
      ${summarySubmissionId},
      (
        SELECT
          submission_message_type_id
        FROM
          summary_submission_message_type
        WHERE
          name = ${errorCode}
      ),
      now(),
      ${summarySubmissionMessage}
    )
    RETURNING
      submission_message_id;
  `;
};

/**
 * SQL query to get the list of messages for an summary submission.
 *
 * @param {number} summarySubmissionId
 * @returns {SQLStatement} sql query object
 */
export const getSummarySubmissionMessagesSQL = (summarySubmissionId: number): SQLStatement | null => {
  if (!summarySubmissionId) {
    return null;
  }

  return SQL`
    SELECT
      sssm.submission_message_id as id,
      sssm.message,
      ssmt.name as type,
      ssmc.name as class
    FROM
      survey_summary_submission as sss
    LEFT OUTER JOIN
      survey_summary_submission_message as sssm
    ON
      sssm.survey_summary_submission_id = sss.survey_summary_submission_id
    LEFT OUTER JOIN
      summary_submission_message_type as ssmt
    ON
      ssmt.submission_message_type_id = sssm.submission_message_type_id
    LEFT OUTER JOIN
      summary_submission_message_class as ssmc
    ON
      ssmc.summary_submission_message_class_id = ssmt.summary_submission_message_class_id
    WHERE
      sss.survey_summary_submission_id = ${summarySubmissionId}
    ORDER BY
      sssm.submission_message_id;
    `;
};
