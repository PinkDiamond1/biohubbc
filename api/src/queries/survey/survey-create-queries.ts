import { SQL, SQLStatement } from 'sql-template-strings';
import { PostProprietorData, PostSurveyObject } from '../../models/survey-create';
import { queries } from '../queries';

/**
 * SQL query to insert a survey row.
 *
 * @param {number} projectId
 * @param {PostSurveyObject} survey
 * @returns {SQLStatement} sql query object
 */
export const postSurveySQL = (projectId: number, survey: PostSurveyObject): SQLStatement | null => {
  if (!projectId || !survey) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey (
      project_id,
      name,
      start_date,
      end_date,
      lead_first_name,
      lead_last_name,
      field_method_id,
      additional_details,
      ecological_season_id,
      intended_outcome_id,
      surveyed_all_areas,
      location_name,
      geojson,
      geography
    ) VALUES (
      ${projectId},
      ${survey.survey_details.survey_name},
      ${survey.survey_details.start_date},
      ${survey.survey_details.end_date},
      ${survey.survey_details.biologist_first_name},
      ${survey.survey_details.biologist_last_name},
      ${survey.purpose_and_methodology.field_method_id},
      ${survey.purpose_and_methodology.additional_details},
      ${survey.purpose_and_methodology.ecological_season_id},
      ${survey.purpose_and_methodology.intended_outcome_id},
      ${survey.purpose_and_methodology.surveyed_all_areas},
      ${survey.location.survey_area_name},
      ${JSON.stringify(survey.location.geometry)}
  `;

  if (survey.location.geometry && survey.location.geometry.length) {
    const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(survey.location.geometry);

    sqlStatement.append(SQL`
      ,public.geography(
        public.ST_Force2D(
          public.ST_SetSRID(
    `);

    sqlStatement.append(geometryCollectionSQL);

    sqlStatement.append(SQL`
      , 4326)))
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  sqlStatement.append(SQL`
    )
    RETURNING
      survey_id as id;
  `);

  return sqlStatement;
};

/**
 * SQL query to insert a survey_proprietor row.
 *
 * @param {number} surveyId
 * @param {PostProprietorData} surveyProprietor
 * @returns {SQLStatement} sql query object
 */
export const postSurveyProprietorSQL = (surveyId: number, survey_proprietor: PostProprietorData): SQLStatement => {
  return SQL`
    INSERT INTO survey_proprietor (
      survey_id,
      proprietor_type_id,
      first_nations_id,
      rationale,
      proprietor_name,
      disa_required
    ) VALUES (
      ${surveyId},
      ${survey_proprietor.prt_id},
      ${survey_proprietor.fn_id},
      ${survey_proprietor.rationale},
      ${survey_proprietor.proprietor_name},
      ${survey_proprietor.disa_required}
    )
    RETURNING
      survey_proprietor_id as id;
  `;
};

/**
 * SQL query to insert a survey funding source row into the survey_funding_source table.
 *
 * @param {number} surveyId
 * @param {number} fundingSourceId
 * @returns {SQLStatement} sql query object
 */
export const insertSurveyFundingSourceSQL = (surveyId: number, fundingSourceId: number): SQLStatement | null => {
  if (!surveyId || !fundingSourceId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_funding_source (
      survey_id,
      project_funding_source_id
    ) VALUES (
      ${surveyId},
      ${fundingSourceId}
    );
  `;

  return sqlStatement;
};

/**
 * SQL query to insert a survey permit row into the permit table.
 *
 * @param {number | null} systemUserId
 * @param {number} projectId
 * @param {number} surveyId
 * @param {string} permitNumber
 * @param {string} permitType
 * @returns {SQLStatement} sql query object
 */
export const postNewSurveyPermitSQL = (
  systemUserId: number | null,
  projectId: number,
  surveyId: number,
  permitNumber: string,
  permitType: string
): SQLStatement | null => {
  if (!systemUserId || !projectId || !surveyId || !permitNumber || !permitType) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO permit (
      system_user_id,
      project_id,
      survey_id,
      number,
      type
    ) VALUES (
      ${systemUserId},
      ${projectId},
      ${surveyId},
      ${permitNumber},
      ${permitType}
    );
  `;

  return sqlStatement;
};

/**
 * SQL query to insert a focal species row into the study_species table.
 *
 * @param {number} speciesId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const postFocalSpeciesSQL = (speciesId: number, surveyId: number): SQLStatement | null => {
  if (!speciesId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO study_species (
      wldtaxonomic_units_id,
      is_focal,
      survey_id
    ) VALUES (
      ${speciesId},
      TRUE,
      ${surveyId}
    ) RETURNING study_species_id as id;
  `;

  return sqlStatement;
};

/**
 * SQL query to insert a ancillary species row into the study_species table.
 *
 * @param {number} speciesId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const postAncillarySpeciesSQL = (speciesId: number, surveyId: number): SQLStatement | null => {
  if (!speciesId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO study_species (
      wldtaxonomic_units_id,
      is_focal,
      survey_id
    ) VALUES (
      ${speciesId},
      FALSE,
      ${surveyId}
    ) RETURNING study_species_id as id;
  `;

  return sqlStatement;
};

/**
 * SQL query to insert a ancillary species row into the study_species table.
 *
 * @param {number} speciesId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const postVantageCodesSQL = (vantageCodeId: number, surveyId: number): SQLStatement | null => {
  if (!vantageCodeId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_vantage (
      vantage_id,
      survey_id
    ) VALUES (
      ${vantageCodeId},
      ${surveyId}
    ) RETURNING survey_vantage_id as id;
  `;

  return sqlStatement;
};
