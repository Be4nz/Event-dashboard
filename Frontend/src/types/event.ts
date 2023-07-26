export interface NewEventRequest {
  title: string;
  type: string;
  subtype?: string | null;
  description?: string;
  eventDate: string;
  registrationDeadline?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  image: File | null;
  deleted?: boolean | null;
  shareWith?: string[];
}

export type Event = NewEventRequest & {
  id: number;
  createdBy: string;
  imageUrl?: string | null;
};

export enum EventType {
  External = 'EXTERNAL',
  CompanyManaged = 'COMPANY_MANAGED',
  Personal = 'PERSONAL',
}

export enum EventSubtype {
  SLD = 'SLD',
  Appointment = 'APPOINTMENT',
  Sports = 'SPORTS',
  Other = 'OTHER',
}

export interface EventFormData {
  title: string;
  type: EventType;
  subtype?: EventSubtype | null;
  description?: string;
  eventDate: Date;
  registrationDeadline?: Date | null;
  startTime?: Date | null;
  endTime?: Date | null;
  duration?: number | null;
  image: File | null;
  shareWith?: string[];
}

export type EventTypeSelect = {
  value: EventType;
  label: string;
};

export type EventSubtypeSelect = {
  value: EventSubtype;
  label: string;
};

export interface EventFilters {
  title: string | null;
  types: string[];
  startDate: Date | null;
  endDate: Date | null;
  offset: number;
  limit: number;
  sortDirection: Direction;
  sortField: string;
}

export const initialFilters: EventFilters = {
  title: '',
  types: [],
  startDate: new Date(),
  endDate: null,
  offset: 0,
  limit: 10,
  sortDirection: 'DESC',
  sortField: 'eventDate',
};
export type Direction = 'ASC' | 'DESC';

export const eventTypes: EventTypeSelect[] = [
  { value: EventType.External, label: 'External' },
  { value: EventType.Personal, label: 'Personal' },
  {
    value: EventType.CompanyManaged,
    label: 'Company managed',
  },
];

export const personalSubtypes: EventSubtypeSelect[] = [
  { value: EventSubtype.SLD, label: 'SLD' },
  { value: EventSubtype.Other, label: 'Other' },
];

export const companySubtypes: EventSubtypeSelect[] = [
  { value: EventSubtype.Appointment, label: 'Appointment' },
  { value: EventSubtype.Sports, label: 'Sports' },
  { value: EventSubtype.Other, label: 'Other' },
];
