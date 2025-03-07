import { SQL, SQLStatement } from 'sql-template-strings';
import { PostOccurrence } from '../../models/occurrence-create';
import { parseLatLongString, parseUTMString } from '../../utils/spatial-utils';

export const postOccurrenceSQL = (occurrenceSubmissionId: number, occurrence: PostOccurrence): SQLStatement | null => {
  if (!occurrenceSubmissionId || !occurrence) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO occurrence (
      occurrence_submission_id,
      taxonid,
      lifestage,
      sex,
      data,
      vernacularname,
      eventdate,
      individualcount,
      organismquantity,
      organismquantitytype,
      geography
    ) VALUES (
      ${occurrenceSubmissionId},
      ${occurrence.associatedTaxa},
      ${occurrence.lifeStage},
      ${occurrence.sex},
      ${occurrence.data},
      ${occurrence.vernacularName},
      ${occurrence.eventDate},
      ${occurrence.individualCount},
      ${occurrence.organismQuantity},
      ${occurrence.organismQuantityType}
  `;

  const utm = parseUTMString(occurrence.verbatimCoordinates);
  const latLong = parseLatLongString(occurrence.verbatimCoordinates);

  if (utm) {
    // transform utm string into point, if it is not null
    sqlStatement.append(SQL`
      ,public.ST_Transform(
        public.ST_SetSRID(
          public.ST_MakePoint(${utm.easting}, ${utm.northing}),
          ${utm.zone_srid}
        ),
        4326
      )
    `);
  } else if (latLong) {
    // transform latLong string into point, if it is not null
    sqlStatement.append(SQL`
      ,public.ST_Transform(
        public.ST_SetSRID(
          public.ST_MakePoint(${latLong.long}, ${latLong.lat}),
          4326
        ),
        4326
      )
    `);
  } else {
    // insert null geography
    sqlStatement.append(SQL`
        ,null
      `);
  }

  sqlStatement.append(');');

  return sqlStatement;
};
