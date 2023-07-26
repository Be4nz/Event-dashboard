import React, { useEffect, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Link, TextField, styled } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from './filterSlice';
import { RootState } from '../../store';
import { EventFilters, initialFilters } from '../../types/event';
import dayjs from 'dayjs';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import MultipleSelect from '../SelectComponent';

const FilterButton = styled(Link)`
  font-size: 20px;
  text-decoration: none;
  color: grey;
  font-family: 'Roboto', sans-serif;
  vertical-align: middle;
  cursor: pointer;

  svg {
    vertical-align: middle;
  }

  &:hover {
    color: rgb(32, 32, 32);
  }
`;

const FiltersBar = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 150px;
  height: 80px;
  border: 1px solid rgb(224, 224, 224);
  border-radius: 5px;
  padding: 0 50px;
  background-color: rgb(255, 255, 255);
`;

const eventTypes = [
  { label: 'Personal', value: 'PERSONAL' },
  { label: 'Company managed', value: 'COMPANY_MANAGED' },
  { label: 'External', value: 'EXTERNAL' },
];

export default function EventFilter() {
  const [filterList, setFilterList] = useState<EventFilters>(initialFilters);

  const filtersRedux = useSelector((state: RootState) => state.filter.filters);
  useEffect(() => {
    setFilterList(filtersRedux);
  }, [filtersRedux]);

  const dispatch = useDispatch();

  const clearFilters = () => {
    setFilterList(initialFilters);
    dispatch(setFilters(initialFilters));
  };

  const submitFilters = () => {
    dispatch(setFilters({ ...filterList, offset: 0 }));
  };

  return (
    <FiltersBar>
      <TextField
        id='Title'
        label='Title'
        variant='outlined'
        value={filterList.title}
        onChange={(e) => {
          setFilterList({ ...filterList, title: e.target.value });
        }}
      />
      <MultipleSelect
        options={eventTypes}
        values={filterList.types}
        onChange={(values: string[]) => {
          setFilterList({
            ...filterList,
            types: values,
          });
        }}
      />
      <DatePicker
        slotProps={{
          textField: {
            error: false,
          },
        }}
        label='Filter from'
        value={dayjs(filterList.startDate)}
        maxDate={dayjs(filterList.endDate)}
        onChange={(newValue) =>
          setFilterList({
            ...filterList,
            startDate: newValue?.toDate() || null,
          })
        }
      />
      <DatePicker
        slotProps={{
          textField: {
            error: false,
          },
        }}
        label='Filter to'
        value={dayjs(filterList.endDate)}
        minDate={dayjs(filterList.startDate)}
        onChange={(newValue) => {
          setFilterList({
            ...filterList,
            endDate: newValue?.toDate() || null,
          });
        }}
      />
      <FilterButton onClick={() => submitFilters()}>
        <FilterAltIcon /> Filter
      </FilterButton>
      <FilterButton onClick={() => clearFilters()}>
        <ClearIcon /> Clear
      </FilterButton>
    </FiltersBar>
  );
}
