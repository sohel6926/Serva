export type BookingStatus =
  | 'REQUEST_SUBMITTED'
  | 'PROVIDER_ASSIGNED'
  | 'QUOTATION_PENDING_APPROVAL'
  | 'AWAITING_ADVANCE'
  | 'CONFIRMED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'PACKING_IN_PROGRESS'
  | 'LOADING_IN_PROGRESS'
  | 'VEHICLE_DEPARTED'
  | 'ARRIVED_AT_DESTINATION'
  | 'UNLOADING_IN_PROGRESS'
  | 'PLACEMENT_UNPACKING'
  | 'WORK_STARTED'
  | 'IN_PROGRESS'
  | 'WORK_COMPLETED'
  | 'COMPLETED'
  | 'PAID'
  | 'CANCELLED'
  | 'ISSUE_RAISED';

export const STATUS_LABELS: Record<BookingStatus, string> = {
  REQUEST_SUBMITTED: 'Request submitted',
  PROVIDER_ASSIGNED: 'Provider assigned',
  QUOTATION_PENDING_APPROVAL: 'Quotation pending approval',
  AWAITING_ADVANCE: 'Awaiting advance',
  CONFIRMED: 'Confirmed',
  ON_THE_WAY: 'On the way',
  ARRIVED: 'Arrived',
  PACKING_IN_PROGRESS: 'Packing in progress',
  LOADING_IN_PROGRESS: 'Loading in progress',
  VEHICLE_DEPARTED: 'Vehicle departed',
  ARRIVED_AT_DESTINATION: 'Team arrived at destination',
  UNLOADING_IN_PROGRESS: 'Unloading in progress',
  PLACEMENT_UNPACKING: 'Placement / unpacking',
  WORK_STARTED: 'Work started',
  IN_PROGRESS: 'In progress',
  WORK_COMPLETED: 'Work completed (awaiting confirmation)',
  COMPLETED: 'Completed',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  ISSUE_RAISED: 'Issue raised',
};

const PARTNER_NEXT_STATES: Partial<Record<BookingStatus, BookingStatus[]>> = {
  CONFIRMED: ['ON_THE_WAY', 'ARRIVED', 'WORK_STARTED', 'IN_PROGRESS'],
  ON_THE_WAY: ['ARRIVED'],
  ARRIVED: ['WORK_STARTED', 'PACKING_IN_PROGRESS', 'LOADING_IN_PROGRESS', 'IN_PROGRESS'],
  PACKING_IN_PROGRESS: ['LOADING_IN_PROGRESS', 'IN_PROGRESS'],
  LOADING_IN_PROGRESS: ['VEHICLE_DEPARTED', 'IN_PROGRESS'],
  VEHICLE_DEPARTED: ['ARRIVED_AT_DESTINATION'],
  ARRIVED_AT_DESTINATION: ['UNLOADING_IN_PROGRESS'],
  UNLOADING_IN_PROGRESS: ['PLACEMENT_UNPACKING', 'WORK_COMPLETED'],
  PLACEMENT_UNPACKING: ['WORK_COMPLETED'],
  WORK_STARTED: ['IN_PROGRESS', 'WORK_COMPLETED'],
  IN_PROGRESS: ['WORK_COMPLETED'],
};

export function canPartnerTransition(from: BookingStatus, to: BookingStatus): boolean {
  const allowed = PARTNER_NEXT_STATES[from];
  return Boolean(allowed && allowed.includes(to));
}

export function canCancel(status: BookingStatus): boolean {
  return !['COMPLETED', 'PAID', 'CANCELLED'].includes(status);
}

export function defaultCancellationTerms(categorySlug: string): string {
  if (categorySlug === 'events') {
    return 'Free cancellation up to 7 days before event (advance refunded minus 5% processing). Rescheduling subject to vendor availability. If vendor cancels, SERVA offers an alternate vendor or 100% advance refund.';
  }
  if (categorySlug === 'moving') {
    return 'Free cancellation before provider acceptance. After confirmation, cancellation within 12 hours of shift window incurs a ₹300 team dispatch fee. Rescheduling is free up to 24 hours prior.';
  }
  if (categorySlug === 'agriculture') {
    return 'Free cancellation up to 12 hours before field arrival. Rescheduling due to rain or weather is supported free of charge with provider coordination.';
  }
  return 'Free cancellation before provider starts travel. Once the technician is On the Way, a ₹100 visit fee applies. Full refund for online-paid cancelled bookings within 3–5 business days.';
}
