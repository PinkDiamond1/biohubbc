/**
 * A single code value.
 *
 * @export
 * @interface ICode
 */
export interface ICode {
  id: number;
  name: string;
}

/**
 * A code set (an array of ICode values).
 */
export type CodeSet<T extends ICode = ICode> = T[];

/**
 * Get all codes response object.
 *
 * @export
 * @interface IGetAllCodeSetsResponse
 */
export interface IGetAllCodeSetsResponse {
  coordinator_agency: CodeSet;
  management_action_type: CodeSet;
  first_nations: CodeSet;
  funding_source: CodeSet;
  investment_action_category: CodeSet<{ id: number; fs_id: number; name: string }>;
  activity: CodeSet;
  project_type: CodeSet;
  region: CodeSet;
  proprietor_type: CodeSet<{ id: number; name: string; is_first_nation: boolean }>;
  iucn_conservation_action_level_1_classification: CodeSet;
  iucn_conservation_action_level_2_subclassification: CodeSet<{ id: number; iucn1_id: number; name: string }>;
  iucn_conservation_action_level_3_subclassification: CodeSet<{ id: number; iucn2_id: number; name: string }>;
  system_roles: CodeSet;
  project_roles: CodeSet;
  regional_offices: CodeSet;
  administrative_activity_status_type: CodeSet;
  field_methods: CodeSet<{ id: number; name: string; description: string }>;
  intended_outcomes: CodeSet<{ id: number; name: string; description: string }>;
  ecological_seasons: CodeSet<{ id: number; name: string; description: string }>;
  vantage_codes: CodeSet;
}
