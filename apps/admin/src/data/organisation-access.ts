/** Isolated local governance requests; not an application permission source. */
export interface AccessRequest {
  id: string;
  memberId: string;
  site: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'declined';
}

export const initialAccessRequests: AccessRequest[] = [
  {
    id: 'd17e9981-90c1-47b7-8c88-7a3f6e63bc56',
    memberId: '1d9066f3-7b76-43d9-906e-20f53b7ef1ea',
    site: 'North Construction Site',
    requestedAt: '25 Sep 2026',
    status: 'pending',
  },
  {
    id: 'ab8251df-41d2-48b5-a7f0-65c6174ac9c1',
    memberId: '599cf5a8-c640-4361-a4f1-d363f310a46d',
    site: 'Riverside Warehouse',
    requestedAt: '24 Sep 2026',
    status: 'pending',
  },
];
