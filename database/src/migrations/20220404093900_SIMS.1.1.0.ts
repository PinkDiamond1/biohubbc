import { Knex } from 'knex';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path = biohub_dapi_v1;

  drop view survey;
  drop view common_survey_methodology;
  drop view template_methodology_species;


  set search_path = biohub, public;

  CREATE TABLE ecological_season(
      ecological_season_id     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                     varchar(50)       NOT NULL,
      record_effective_date    date              NOT NULL,
      description              varchar(3000),
      record_end_date          date,
      create_date              timestamptz(6)    DEFAULT now() NOT NULL,
      create_user              integer           NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer           DEFAULT 0 NOT NULL,
      CONSTRAINT ecological_season_pk PRIMARY KEY (ecological_season_id)
  )
  ;



  COMMENT ON COLUMN ecological_season.ecological_season_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN ecological_season.name IS 'The name of the project role.'
  ;
  COMMENT ON COLUMN ecological_season.record_effective_date IS 'Record level effective date.'
  ;
  COMMENT ON COLUMN ecological_season.description IS 'The description of the project type.'
  ;
  COMMENT ON COLUMN ecological_season.record_end_date IS 'Record level end date.'
  ;
  COMMENT ON COLUMN ecological_season.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN ecological_season.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN ecological_season.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN ecological_season.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN ecological_season.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE ecological_season IS 'Broad classification for the ecological season of a survey.'
  ;

  --
  -- TABLE: intended_outcome
  --

  CREATE TABLE intended_outcome(
      intended_outcome_id      integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                     varchar(50)       NOT NULL,
      record_effective_date    date              NOT NULL,
      description              varchar(3000),
      record_end_date          date,
      create_date              timestamptz(6)    DEFAULT now() NOT NULL,
      create_user              integer           NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer           DEFAULT 0 NOT NULL,
      CONSTRAINT intended_outcome_pk PRIMARY KEY (intended_outcome_id)
  )
  ;



  COMMENT ON COLUMN intended_outcome.intended_outcome_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN intended_outcome.name IS 'The name of the project role.'
  ;
  COMMENT ON COLUMN intended_outcome.record_effective_date IS 'Record level effective date.'
  ;
  COMMENT ON COLUMN intended_outcome.description IS 'The description of the project type.'
  ;
  COMMENT ON COLUMN intended_outcome.record_end_date IS 'Record level end date.'
  ;
  COMMENT ON COLUMN intended_outcome.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN intended_outcome.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN intended_outcome.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN intended_outcome.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN intended_outcome.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE intended_outcome IS 'Broad classification of intended outcomes of the survey work.'
  ;

  --
  -- TABLE: vantage
  --

  CREATE TABLE vantage(
      vantage_id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                     varchar(50)       NOT NULL,
      record_effective_date    date              NOT NULL,
      description              varchar(250),
      record_end_date          date,
      create_date              timestamptz(6)    DEFAULT now() NOT NULL,
      create_user              integer           NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer           DEFAULT 0 NOT NULL,
      CONSTRAINT vantage_pk PRIMARY KEY (vantage_id)
  )
  ;



  COMMENT ON COLUMN vantage.vantage_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN vantage.name IS 'The name of the project role.'
  ;
  COMMENT ON COLUMN vantage.record_effective_date IS 'Record level effective date.'
  ;
  COMMENT ON COLUMN vantage.description IS 'The description of the project type.'
  ;
  COMMENT ON COLUMN vantage.record_end_date IS 'Record level end date.'
  ;
  COMMENT ON COLUMN vantage.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN vantage.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN vantage.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN vantage.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN vantage.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE vantage IS 'Broad classification for the vantage code of the survey.'
  ;

  CREATE TABLE survey_vantage
  (
      survey_vantage_id integer         NOT NULL GENERATED ALWAYS AS IDENTITY
          (START WITH 1
          INCREMENT BY 1
          NO MINVALUE
          NO MAXVALUE
          NO CYCLE),
      survey_id         integer         NOT NULL,
      vantage_id        integer         NOT NULL,
      create_date       timestamptz(6)  NOT NULL DEFAULT now(),
      create_user       integer         NOT NULL,
      update_date       timestamptz(6),
      update_user       integer,
      revision_count    integer         NOT NULL DEFAULT 0,
      CONSTRAINT survey_vantage_pk PRIMARY KEY (survey_vantage_id)
  )
  WITH (
      OIDS=false
  );

  CREATE UNIQUE INDEX survey_vantage_uk1 ON survey_vantage
      (survey_id,
       vantage_id)

  ;

  CREATE  INDEX "Ref153215" ON survey_vantage
      (survey_id)

  ;

  CREATE  INDEX "Ref222216" ON survey_vantage
      (vantage_id)

  ;

  -- Add Referencing Foreign Keys SQL


  ALTER TABLE survey_vantage
      ADD
      FOREIGN KEY (vantage_id)
      REFERENCES vantage (vantage_id)
      MATCH SIMPLE
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
      NOT VALID
  ;

  ALTER TABLE survey_vantage
      ADD
      FOREIGN KEY (survey_id)
      REFERENCES survey (survey_id)
      MATCH SIMPLE
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
      NOT VALID
  ;

  COMMENT ON TABLE survey_vantage IS 'An associative entity that joins surveys and vantage codes.';

  COMMENT ON COLUMN survey_vantage.survey_vantage_id IS 'System generated surrogate primary key identifier.';

  COMMENT ON COLUMN survey_vantage.survey_id IS 'System generated surrogate primary key identifier.';

  COMMENT ON COLUMN survey_vantage.vantage_id IS 'System generated surrogate primary key identifier.';

  COMMENT ON COLUMN survey_vantage.create_date IS 'The datetime the record was created.';

  COMMENT ON COLUMN survey_vantage.create_user IS 'The id of the user who created the record as identified in the system user table.';

  COMMENT ON COLUMN survey_vantage.update_date IS 'The datetime the record was updated.';

  COMMENT ON COLUMN survey_vantage.update_user IS 'The id of the user who updated the record as identified in the system user table.';

  COMMENT ON COLUMN survey_vantage.revision_count IS 'Revision count used for concurrency control.';


  CREATE UNIQUE INDEX ecological_season_nuk1 ON ecological_season(name, (record_end_date is NULL)) where record_end_date is null
  ;

  CREATE UNIQUE INDEX vantage_nuk1 ON vantage(name, (record_end_date is NULL)) where record_end_date is null
  ;

  CREATE UNIQUE INDEX intended_outcome_nuk1 ON intended_outcome(name, (record_end_date is NULL)) where record_end_date is null
  ;

  alter table survey
  add column ecological_season_id integer,
  add column intended_outcome_id integer
  ;

  COMMENT ON COLUMN survey.ecological_season_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey.intended_outcome_id IS 'System generated surrogate primary key identifier.'
  ;

  ALTER TABLE survey ADD CONSTRAINT "Refecological_season212"
      FOREIGN KEY (ecological_season_id)
      REFERENCES ecological_season(ecological_season_id)
  ;

  ALTER TABLE survey ADD CONSTRAINT "Refintended_outcome211"
      FOREIGN KEY (intended_outcome_id)
      REFERENCES intended_outcome(intended_outcome_id)
  ;

  CREATE INDEX "Ref223211" ON survey(intended_outcome_id)
  ;

  CREATE INDEX "Ref220212" ON survey(ecological_season_id)
  ;

  alter table common_survey_methodology
  rename to field_method
  ;

  alter table field_method
  rename column common_survey_methodology_id to field_method_id
  ;

  alter table survey
  rename column common_survey_methodology_id to field_method_id
  ;

  ALTER TABLE survey drop CONSTRAINT "Refcommon_survey_methodology190";

  ALTER TABLE survey ADD CONSTRAINT "Reffield_method190" FOREIGN KEY (field_method_id) REFERENCES field_method(field_method_id);
  ALTER TABLE survey ADD CONSTRAINT "Refecological_season190" FOREIGN KEY (ecological_season_id) REFERENCES ecological_season(ecological_season_id);
  ALTER TABLE survey ADD CONSTRAINT "Refintended_outcome190" FOREIGN KEY (intended_outcome_id) REFERENCES intended_outcome(intended_outcome_id);

  alter table survey
  rename column objectives to additional_details
  ;

  alter table survey
  alter column additional_details drop not null
  ;

  alter trigger audit_common_survey_methodology on field_method rename to audit_field_method;
  alter trigger journal_common_survey_methodology on field_method rename to journal_field_method;

  create trigger journal_intended_outcome after
  insert or delete or update on biohub.intended_outcome for each row execute function biohub.tr_journal_trigger();

  create trigger journal_ecological_season after
  insert or delete or update on biohub.ecological_season for each row execute function biohub.tr_journal_trigger();

  create trigger journal_vantage after
  insert or delete or update on biohub.vantage for each row execute function biohub.tr_journal_trigger();

  create trigger journal_survey_vantage after
  insert or delete or update on biohub.survey_vantage for each row execute function biohub.tr_journal_trigger();

  create trigger audit_intended_outcome before
  insert or delete or update on biohub.intended_outcome for each row execute function biohub.tr_audit_trigger();

  create trigger audit_ecological_season before
  insert or delete or update on biohub.ecological_season for each row execute function biohub.tr_audit_trigger();

  create trigger audit_vantage before
  insert or delete or update on biohub.vantage for each row execute function biohub.tr_audit_trigger();

  create trigger audit_survey_vantage before
  insert or delete or update on biohub.survey_vantage for each row execute function biohub.tr_audit_trigger();

  alter table template_methodology_species rename Constraint "PK192" to template_methodology_species_pk;

  alter table template_methodology_species rename column common_survey_methodology_id to field_method_id;

  alter table template_methodology_species add column intended_outcome_id integer;

  COMMENT ON COLUMN template_methodology_species.intended_outcome_id IS 'System generated surrogate primary key identifier.';

  ALTER TABLE template_methodology_species ADD CONSTRAINT "Refintended_outcome217"
      FOREIGN KEY (intended_outcome_id)
      REFERENCES intended_outcome(intended_outcome_id);

  CREATE INDEX "Ref223217" ON template_methodology_species(intended_outcome_id);

  ALTER TABLE template_methodology_species drop column wldtaxonomic_units_id;

  -- api_delete_survey.sql
  drop procedure if exists api_delete_survey;

  create or replace procedure api_delete_survey(p_survey_id survey.survey_id%type)
  language plpgsql
  security definer
  as
  $$
  -- *******************************************************************
  -- Procedure: api_delete_survey
  -- Purpose: deletes a survey and dependencies
  --
  -- MODIFICATION HISTORY
  -- Person           Date        Comments
  -- ---------------- ----------- --------------------------------------
  -- shreyas.devalapurkar@quartech.com
  --                  2021-06-18  initial release
  -- charlie.garrettjones@quartech.com
  --                  2021-06-21  added occurrence submission delete
  -- charlie.garrettjones@quartech.com
  --                  2021-09-21  added survey summary submission delete
  -- charlie.garrettjones@quartech.com
  --                  2022-04-06  added survey_vantage
  -- *******************************************************************
  declare
    _occurrence_submission_id occurrence_submission.occurrence_submission_id%type;
  begin
    for _occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id) loop
      call api_delete_occurrence_submission(_occurrence_submission_id);
    end loop;

    delete from survey_vantage where survey_id = p_survey_id;
    delete from survey_summary_submission_message where survey_summary_submission_id in (select survey_summary_submission_id from survey_summary_submission where survey_id = p_survey_id);
    delete from survey_summary_detail where survey_summary_submission_id in (select survey_summary_submission_id from survey_summary_submission where survey_id = p_survey_id);
    delete from survey_summary_submission where survey_id = p_survey_id;
    delete from survey_proprietor where survey_id = p_survey_id;
    delete from survey_attachment where survey_id = p_survey_id;
    delete from survey_report_author where survey_report_attachment_id in (select survey_report_attachment_id from survey_report_attachment where survey_id = p_survey_id);
    delete from survey_report_attachment where survey_id = p_survey_id;
    delete from study_species where survey_id = p_survey_id;
    delete from survey_funding_source where survey_id = p_survey_id;

    update permit set survey_id = null where survey_id = p_survey_id;

  exception
    when others THEN
      raise;
  end;
  $$;

  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Habitat Assessment',	'To assess habitat for its value to wildlife and to record evidence of its usage by wildlife.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Reconnaissance',	'To provide information for planning another Survey or to informally determine species presence.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Recruitment',	'To count or obtain an index of the number of new individuals (e.g., young) that have been added to the population between 2 points in time. For example, a caribou recruitment Survey counts young animals after winter; the young are considered established and contributing to the population.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Population Composition',	'To count or obtain an index of the number of individuals in a population belonging to particular age or sex categories. E.g., bull:cow ratio for moose.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Community Composition',	'To determine the numbers or proportions of species in an ecological community or geographic area. E.g., relative ground-cover by plant species, relative density of birds of each species in a forest.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Population Count',	'To obtain a number that indicates the number of individuals in an area. A population count may be obtained by enumerating every individual in a population (e.g., by doing a census) or by sampling a portion of the population (e.g., stratified random block design) and then adjusting the observed number to estimate the population size.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Population Count & Recruitment',	'To obtain a number that indicates the number of individuals in an area (population count) AND to count or obtain an index of the number of new individuals (e.g., young) that have been added to the population between 2 points in time (recruitment).');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Population Count & Composition',	'To obtain a number that indicates the number of individuals in an area (population count) AND to count or obtain an index of the number of individuals in a population belonging to particular age or sex categories (composition).');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Population Index',	'To obtain a population index. For example, to obtain a relative abundance index by calculating the number of tracks detected per kilometre of transect, or number of detections per hour of surveying.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Mortality',	'To count or obtain an index of the number and conditions of dead individuals, and/or the causes of death.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Survival',	'To count or obtain an index of the number of individuals in a population that have survived a period between 2 points in time.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Specimen Collection',	'To collect sample specimens of a species or taxon.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Translocation',	'To move individuals from one location to another.');
  insert into intended_outcome(record_effective_date, name, description) values (now(), 'Distribution or Range Map',	'To determine the manner in which a species (or population or taxon) is spatially arranged, or to define the geographic limits of the species.');

  update field_method set description = 'A sampling technique in which a population is divided into discrete units called strata based on similar attributes. The researcher selects a small sample size with similar characteristics to represent a population group under study.'
  where name = 'Stratified Random Block';

  update field_method set record_end_date = now()
  where name in ('Composition', 'Recruitment');

  insert into field_method(record_effective_date, name, description) values (now(), 'Total Count', 'They are intended to enumerate all animals using 100% flight coverage of the study area. Alpine areas are usually small, and thus the technique is practical for surveying mountain sheep and goats, and sometimes caribou.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Encounter Transects', 'The recommended protocol for conducting herd composition surveys are encounter transects. Occasionally, however, sample blocks may be selected. The purpose of these surveys is to provide information on population composition and recruitment. Encounter transects  can be flown by either fixed-wing aircraft or helicopter, and all visible animals are counted and classified. Encounter transects may follow predetermined straight lines, contours, or drainages. When classification is conducted, it will normally be necessary to deviate from the transect line to ensure accurate classification of the animals. Following the classification, the pilot should be instructed to resume the transect line.  Ground transects are often secondary roads or trails.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Fixed-width Transects', 'When using fixed-width transects  only animals within a defined survey area (strip) are counted. Fixed-widths can be defined by marks on the airplane struts, or by placing a board across the helicopter skids and calibrating that with a mark on the bubble window.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Wildlife Camera', 'To use a camera to record individuals or species in the absence of an observer.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Track Count', 'To count the number of tracks of a species or group of species.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Spotlight Count', 'To use a spotlight to see and identify or count the number of individuals.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Classification Transects/Blocks', 'The recommended protocol for conducting herd composition surveys are encounter transects. Occasionally, however, sample blocks may be selected. The purpose of these surveys is to provide information on population composition and recruitment.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Pellet/Scat Count', 'To count the number of pellet and/or scat groups of a species or group of species.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Call Playback', 'To play prerecorded calls of species and listen for responses.');
  insert into field_method(record_effective_date, name, description) values (now(), 'DNA - Individual', 'To obtain DNA samples from individuals.');
  insert into field_method(record_effective_date, name, description) values (now(), 'DNA - Environmental', 'To obtain environmental DNA.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Mark Resight Recapture', 'To mark and subsequently resight or recapture individuals.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Mark Resight Recapture - Wildlife Camera', 'To mark and subsequently resight or recapture individuals by use of a camera to record individuals or species in the absence of an observer.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Mark Resight Recapture - Spotlight Count', 'To mark and subsequently resight or recapture individuals by use of a spotlight to see and identify or count the number of individuals.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Mark Resight Recapture - DNA - Individual', 'To mark and subsequently resight or recapture individuals by obtaining DNA samples from individuals.');
  insert into field_method(record_effective_date, name, description) values (now(), 'Described in Comments', 'The field method is described in the comments field of the Survey. Note: Describing the data in comments rather than using a predefined code may reduce the clarity and accessibility of data.');

  insert into ecological_season(record_effective_date, name, description) values (now(), 'Spring', '');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Summer', '');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Fall', '');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Winter', '');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Early Spring', '');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Growing', 'The season of growth for a species; often includes all or portions of Spring, Summer, and Fall.');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Early Winter', '');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Mid Winter', '');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Late Winter', '');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Rutting', 'The courtship and copulation period of mammals, typically large mammals.');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Breeding', 'The term "breeding season" typically applies to species, such as birds and some insects and some rodents, in which courtship and/or copulation is followed (within hours, days, or weeks) by hatching or birthing of young. In contrast, large mammals do not have a "breeding season" because they tend to have long gestation periods in which the birthing period is far removed from courtship and copulation.');
  insert into ecological_season(record_effective_date, name, description) values (now(), 'Post Birthing/Calving', 'The period after a species within a Study Area has finished giving birth to young, and the young are still closely associated with their parent(s) . For large mammals this period may start weeks after birthing, and extend for several weeks.');

  insert into vantage(record_effective_date, name) values (now(), 'Aerial');
  insert into vantage(record_effective_date, name) values (now(), 'Walking');
  insert into vantage(record_effective_date, name) values (now(), 'Vehicle');
  insert into vantage(record_effective_date, name) values (now(), 'Boat');

  set search_path = biohub_dapi_v1;

  create view ecological_season as select * from biohub.ecological_season;
  create view intended_outcome as select * from biohub.intended_outcome;
  create view vantage as select * from biohub.vantage;
  create view survey_vantage as select * from biohub.survey_vantage;
  create view survey as select * from biohub.survey;
  create view field_method as select * from biohub.field_method;
  create view template_methodology_species as select * from biohub.template_methodology_species;
          `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
