/** Isolated local site records; these do not change operational site access. */
export type SiteStatus = 'active' | 'inactive' | 'archived';
export interface WorkArea {
  id: string;
  name: string;
  note: string;
  status: SiteStatus;
}
export interface OrganisationSite {
  id: string;
  name: string;
  location: string;
  address: string;
  hseContact: string;
  emergencyName: string;
  emergencyPhone: string;
  status: SiteStatus;
  areas: WorkArea[];
}

export const initialOrganisationSites: OrganisationSite[] = [
  {
    id: '229a3bfb-44b5-49c9-8411-897836589035',
    name: 'Riverside Logistics',
    location: 'Riverside district',
    address: '',
    hseContact: 'Sarah Chen',
    emergencyName: '',
    emergencyPhone: '',
    status: 'active',
    areas: [
      {
        id: '23dde9af-0941-4439-aa8a-068614583f83',
        name: 'Dock B',
        note: '',
        status: 'active',
      },
    ],
  },
  {
    id: '28469ed3-c252-4f49-984b-71163e241a18',
    name: 'Riverside Warehouse',
    location: 'Riverside district',
    address: '',
    hseContact: 'Sarah Chen',
    emergencyName: '',
    emergencyPhone: '',
    status: 'active',
    areas: [
      {
        id: '6141d409-b66f-4c4f-a1e4-18b0a8131424',
        name: 'Aisle 12',
        note: '',
        status: 'active',
      },
    ],
  },
  {
    id: 'fb02037e-6fd4-4278-9b7c-377ee828c813',
    name: 'Riverside Refinery',
    location: 'Riverside district',
    address: '',
    hseContact: 'Lisa Wong',
    emergencyName: '',
    emergencyPhone: '',
    status: 'active',
    areas: [
      {
        id: 'be6c3354-c3e4-443c-9f67-78ac9cd3b204',
        name: 'Tank Farm',
        note: '',
        status: 'active',
      },
      {
        id: '7c3e345d-ac90-471a-99a1-6877c704cd38',
        name: 'Pond 2',
        note: '',
        status: 'active',
      },
      {
        id: '1392a5f7-2cc2-4e80-a86b-0ca2b1f877db',
        name: 'Compressor Station',
        note: '',
        status: 'active',
      },
      {
        id: 'e90b22f9-0bce-46b5-aed3-426e53436146',
        name: 'Treatment Plant',
        note: '',
        status: 'active',
      },
    ],
  },
  {
    id: '513097c5-1ca4-473f-805f-cc17d8263fb4',
    name: 'North Construction Site',
    location: 'North district',
    address: '',
    hseContact: 'James Park',
    emergencyName: '',
    emergencyPhone: '',
    status: 'active',
    areas: [
      {
        id: 'f6db164b-e790-4589-91eb-8d6baf404170',
        name: 'Site Office',
        note: '',
        status: 'active',
      },
      {
        id: 'ce34046c-5c5a-49e1-b1e4-f8b4e15433a4',
        name: 'Level 4',
        note: '',
        status: 'active',
      },
      {
        id: '1aa0ef27-f850-4f76-b465-e4571e657913',
        name: 'Scaffold Area',
        note: '',
        status: 'active',
      },
      {
        id: 'f74bb235-dbc2-4de7-a493-fb94770f4afc',
        name: 'Crane Zone',
        note: '',
        status: 'active',
      },
    ],
  },
  {
    id: '967ee7bc-dd4d-4c64-8daf-0ead0fd022e2',
    name: 'Harbor Yard',
    location: 'Harbor district',
    address: '',
    hseContact: 'Lisa Wong',
    emergencyName: '',
    emergencyPhone: '',
    status: 'active',
    areas: [
      {
        id: 'f255831f-ce56-49c7-9fee-09372705aa36',
        name: 'Admin Building',
        note: '',
        status: 'active',
      },
      {
        id: 'd47ec4e3-1d1f-429c-888a-c0c1eaaee7a3',
        name: 'Chemical Storage',
        note: '',
        status: 'active',
      },
      {
        id: '402767e3-222e-4a67-b9ab-dd5edb668f20',
        name: 'Fabrication Shop',
        note: '',
        status: 'active',
      },
      {
        id: '7cb5b989-026c-4de7-830b-c4a0849c6291',
        name: 'Tank Interior',
        note: '',
        status: 'active',
      },
      {
        id: 'a4ea67aa-a7b6-47d0-b0ac-8cc7e2421cec',
        name: 'Warehouse Roof',
        note: '',
        status: 'active',
      },
    ],
  },
];
