import SQL, { SQLStatement } from 'sql-template-strings';

/**
 * SQL query to insert a row in the webform_draft table.
 *
 * @param {number} systemUserId the ID of the user in context
 * @param {string} name name of the draft record
 * @param {unknown} data JSON data blob
 * @return {*}  {(SQLStatement | null)}
 */
export const postDraftSQL = (systemUserId: number, name: string, data: unknown): SQLStatement | null => {
  if (!systemUserId || !name || !data) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO webform_draft (
      system_user_id,
      name,
      data
    ) VALUES (
      ${systemUserId},
      ${name},
      ${data}
    )
    RETURNING
      webform_draft_id as id,
      name,
      create_date::timestamptz,
      update_date::timestamptz;
  `;

  return sqlStatement;
};

/**
 * SQL query to update a row in the webform_draft table.
 *
 * @param {number} id row id
 * @param {string} name name of the draft record
 * @param {unknown} data JSON data blob
 * @return {*}  {(SQLStatement | null)}
 */
export const putDraftSQL = (id: number, name: string, data: unknown): SQLStatement | null => {
  if (!id || !name || !data) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      webform_draft
    SET
      name = ${name},
      data = ${data}
    WHERE
      webform_draft_id = ${id}
    RETURNING
      webform_draft_id as id,
      name,
      create_date::timestamptz,
      update_date::timestamptz;
  `;

  return sqlStatement;
};

/**
 * SQL query to get a list of drafts from the webform_draft table.
 *
 * @param {number} systemUserId
 * @return {SQLStatement} {(SQLStatement | null)}
 */
export const getDraftsSQL = (systemUserId: number): SQLStatement | null => {
  if (!systemUserId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      webform_draft_id as id,
      name,
      create_date::timestamptz,
      update_date::timestamptz
    FROM
      webform_draft
    WHERE
      system_user_id = ${systemUserId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get a single draft from the webform_draft table.
 *
 * @param {number} draftId
 * @return {SQLStatement} {(SQLStatement | null)}
 */
export const getDraftSQL = (draftId: number): SQLStatement | null => {
  if (!draftId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      webform_draft_id as id,
      name,
      data
    FROM
      webform_draft
    WHERE
      webform_draft_id = ${draftId};
  `;

  return sqlStatement;
};

/**
 * SQL query to delete a single draft from the webform_draft table.
 *
 * @param {number} draftId
 * @return {SQLStatement} {(SQLStatement) | null}
 */
export const deleteDraftSQL = (draftId: number): SQLStatement | null => {
  if (!draftId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE from webform_draft
    WHERE webform_draft_id = ${draftId};
  `;

  return sqlStatement;
};
