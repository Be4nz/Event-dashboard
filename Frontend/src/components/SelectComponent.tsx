import React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, * as SelectTypes from '@mui/material/Select';

export default function MultipleSelect({
  options,
  values,
  onChange,
}: {
  options: object;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const handleChange = (
    event: SelectTypes.SelectChangeEvent<typeof values>,
  ) => {
    const {
      target: { value },
    } = event;
    onChange(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <FormControl sx={{ m: 1, width: 300 }}>
      <InputLabel id='demo-multiple-name-label'>Type</InputLabel>
      <Select
        labelId='demo-multiple-name-label'
        id='demo-multiple-name'
        multiple
        value={values}
        onChange={handleChange}
        input={<OutlinedInput label='Type' />}
      >
        {Object.entries(options).map(([key, entry]) => (
          <MenuItem key={key} value={entry.value}>
            {entry.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
