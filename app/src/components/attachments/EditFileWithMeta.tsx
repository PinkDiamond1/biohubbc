import Box from '@material-ui/core/Box';
import { useFormikContext } from 'formik';
import React from 'react';
import EditReportMetaForm, { IEditReportMetaForm } from '../attachments/EditReportMetaForm';

export const EditFileWithMeta: React.FC = () => {
  const { handleSubmit } = useFormikContext<IEditReportMetaForm>();

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={3}>
        <EditReportMetaForm />
      </Box>
    </form>
  );
};

export default EditFileWithMeta;
