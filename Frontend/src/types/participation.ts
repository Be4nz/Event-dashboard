export interface NewParticipation {
  notes?: string;
  eventId: number;
  appointmentTime?: string;
}

export interface Participant {
  id: number;
  notes?: string;
  createdAt: Date;
  eventId: number;
  userId: string;
  appointmentTime?: Date;
  firstName?: string;
  lastName?: string;
  displayName: string;
}
