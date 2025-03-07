import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteProjectI18N } from 'constants/i18n';
import { ProjectStatusType } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDateRangeString } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  projectNav: {
    minWidth: '15rem',
    '& a': {
      color: theme.palette.text.secondary,
      '&:hover': {
        background: 'rgba(0, 51, 102, 0.05)'
      }
    },
    '& a.active': {
      color: theme.palette.primary.main,
      background: 'rgba(0, 51, 102, 0.05)',
      '& svg': {
        color: theme.palette.primary.main
      }
    }
  },
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  chip: {
    color: '#ffffff'
  },
  chipActive: {
    backgroundColor: theme.palette.success.main
  },
  chipCompleted: {
    backgroundColor: theme.palette.primary.main
  },
  spacingRight: {
    paddingRight: '1rem'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  projectTitle: {
    fontWeight: 400
  }
}));

export interface IProjectHeaderProps {
  projectWithDetails: IGetProjectForViewResponse;
  refresh?: () => void;
}

/**
 * Project header for a single-project view.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectHeader: React.FC<IProjectHeaderProps> = (props) => {
  const { projectWithDetails } = props;

  const classes = useStyles();
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const { keycloakWrapper } = useContext(AuthStateContext);

  const defaultYesNoDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteTitle,
    dialogText: DeleteProjectI18N.deleteText,
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const deleteErrorDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteErrorTitle,
    dialogText: DeleteProjectI18N.deleteErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showDeleteProjectDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      onYes: () => {
        deleteProject();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deleteProject = async () => {
    if (!projectWithDetails) {
      return;
    }

    try {
      const response = await biohubApi.project.deleteProject(projectWithDetails.id);

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.push(`/admin/projects`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  };

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === status_name) {
      chipLabel = 'Active';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === status_name) {
      chipLabel = 'Complete';
      chipStatusClass = classes.chipCompleted;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  // Show delete button if you are a system admin or a project admin
  const showDeleteProjectButton = keycloakWrapper?.hasSystemRole([
    SYSTEM_ROLE.SYSTEM_ADMIN,
    SYSTEM_ROLE.PROJECT_CREATOR
  ]);

  return (
    <Paper square={true}>
      <Container maxWidth="xl">
        <Box pt={3} pb={2}>
          <Breadcrumbs>
            <Link
              color="primary"
              onClick={() => history.push('/admin/projects')}
              aria-current="page"
              className={classes.breadCrumbLink}>
              <Typography variant="body2">Projects</Typography>
            </Link>
            <Typography variant="body2">{projectWithDetails.project.project_name}</Typography>
          </Breadcrumbs>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box pb={3}>
            <Box mb={1.5} display="flex">
              <Typography className={classes.spacingRight} variant="h1">
                Project - <span className={classes.projectTitle}>{projectWithDetails.project.project_name}</span>
              </Typography>
            </Box>
            <Box mb={0.75} display="flex" alignItems="center">
              {getChipIcon(projectWithDetails.project.completion_status)}
              &nbsp;&nbsp;
              <Typography component="span" variant="subtitle1" color="textSecondary">
                {projectWithDetails.project.end_date ? (
                  <>
                    <span>Timeline:</span>{' '}
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
                      projectWithDetails.project.start_date,
                      projectWithDetails.project.end_date
                    )}
                  </>
                ) : (
                  <>
                    <span>Start Date:</span>{' '}
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
                      projectWithDetails.project.start_date
                    )}
                  </>
                )}
              </Typography>
            </Box>
          </Box>
          <Box ml={4} mb={4}>
            <Button
              variant="outlined"
              disableElevation
              className={classes.actionButton}
              data-testid="manage-project-team-button"
              aria-label="Manage Project Team"
              onClick={() => history.push('users')}>
              Manage Project Team
            </Button>
            {showDeleteProjectButton && (
              <IconButton data-testid="delete-project-button" onClick={showDeleteProjectDialog}>
                <Icon path={mdiTrashCanOutline} size={1} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default ProjectHeader;
