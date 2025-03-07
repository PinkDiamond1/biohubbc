import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import PublicFundingSource from './components/PublicFundingSource';
import PublicGeneralInformation from './components/PublicGeneralInformation';
import PublicIUCNClassification from './components/PublicIUCNClassification';
import PublicLocationBoundary from './components/PublicLocationBoundary';
import PublicPartnerships from './components/PublicPartnerships';
import PublicProjectCoordinator from './components/PublicProjectCoordinator';
import PublicProjectObjectives from './components/PublicProjectObjectives';

export interface IPublicProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
  codes: IGetAllCodeSetsResponse;
}

const useStyles = makeStyles((theme: Theme) => ({
  projectDetailsSection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),
    '&:last-child': {
      marginBottom: 0
    },
    '&:first-child': {
      marginTop: 0
    }
  }
}));

/**
 * Project details content for a public project.
 *
 * @return {*}
 */
const PublicProjectDetails: React.FC<IPublicProjectDetailsProps> = (props) => {
  const { projectForViewData, codes, refresh } = props;

  const classes = useStyles();

  return (
    <>
      <Box mb={5}>
        <Typography variant="h2">Project Details</Typography>
      </Box>

      <Box component={Paper} p={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <PublicGeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <PublicProjectObjectives projectForViewData={projectForViewData} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <PublicProjectCoordinator projectForViewData={projectForViewData} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <PublicLocationBoundary projectForViewData={projectForViewData} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <PublicIUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <PublicPartnerships projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <PublicFundingSource projectForViewData={projectForViewData} refresh={refresh} />
        </Box>
      </Box>
    </>
  );
};

export default PublicProjectDetails;
