/* =========================
   STEP ENUM
   ========================= */

export enum Step {
  CustomerInfo = 0,
  JobLocation = 1,
  WorkCategory = 2,
  WorkType = 3,
  TrafficNeeds = 4,
  RoadwayClass = 5,
  SignsCatalog = 6, 
  Schedule = 7,     
  ThankYou = 8,     // NEW STEP 9
}

/* =========================
   SHARED TYPES
   ========================= */

export type YesNoUnsure = 'Yes' | 'No' | 'Unsure';

export type WorkHourType = 'Day' | 'Night' | 'Mixed' | 'Flex';

export type PaymentMethod = 'Credit' | 'ACH' | 'Zelle' | 'Invoice';

/* =========================
   FORM DATA INTERFACE
   ========================= */

export interface FormData {
  /* Customer Info */
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  purchaseOrder: string;
  smsConsent: 'Yes' | 'No' | null;

  /* Job Location */
  address: string;
  city: string;
  state: string;
  zipCode: string;
  onSiteFirstName: string;
  onSiteLastName: string;
  onSitePhone: string;
  locationLat?: number;
  locationLng?: number;
  isPublicRightOfWay: YesNoUnsure | null;

  /* Step 3: Work Category & Docs */
  serviceCategories: string[];
  hasTCP: 'Yes' | 'No' | null;
  tcpType: 'Regular' | 'Rush' | null;
  hasPermit: 'Yes' | 'No' | null;
  permitFileName?: string;
  tcpFileName?: string;

  /* Work Type */
  workTypes: string[];

  /* Traffic Needs */
  impactsTraffic: YesNoUnsure | null;
  impactsPedestrians: YesNoUnsure | null;
  configuration: string[];

  /* Roadway Classification (Step 6) */
  roadwayClass: 'Residential' | 'City / Local Road' | 'State Highway' | null;
  isIntersection: boolean;
  hasTrafficSignal: boolean;
  
  /* Labor (Step 6) */
  needsFlaggers: boolean;
  numFlaggers: number;
  flaggerHours: number;
  needsUTC: boolean;
  numUTC: number;
  utcHours: number;
  laborPolicyAccepted: boolean;

  /* Catalog (Step 7) */
  catalogQuantities: Record<string, number>;

  /* Legacy Roadway (to be cleared or kept for compatibility) */
  roadwayType: string;

  /* Schedule */
  startDate: string;
  duration: string;
  workHours: WorkHourType | null;
  schedulingNoticeAccepted: boolean;
  billingTermsAccepted: boolean;
  doubleChargeAccepted: boolean;

  /* MUTCD Sign Package */
  signPackages: string[];

  /* Payment */
  paymentMethod: PaymentMethod;
  ccNumber: string;
  ccExp: string;
  ccCvv: string;
}

/* =========================
   INITIAL FORM STATE
   ========================= */

export const INITIAL_FORM_DATA: FormData = {
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  purchaseOrder: '',
  smsConsent: null,

  address: '',
  city: '',
  state: '',
  zipCode: '',
  onSiteFirstName: '',
  onSiteLastName: '',
  onSitePhone: '',
  isPublicRightOfWay: null,

  serviceCategories: [],
  hasTCP: null,
  tcpType: null,
  hasPermit: null,
  permitFileName: '',
  tcpFileName: '',

  workTypes: [],

  impactsTraffic: null,
  impactsPedestrians: null,
  configuration: [],

  roadwayClass: null,
  isIntersection: false,
  hasTrafficSignal: false,
  needsFlaggers: false,
  numFlaggers: 0,
  flaggerHours: 8,
  needsUTC: false,
  numUTC: 0,
  utcHours: 8,
  laborPolicyAccepted: false,

  catalogQuantities: {},

  roadwayType: '',

  startDate: '',
  duration: '',
  workHours: null,
  schedulingNoticeAccepted: false,
  billingTermsAccepted: false,
  doubleChargeAccepted: false,

  signPackages: [],

  paymentMethod: 'Credit',
  ccNumber: '',
  ccExp: '',
  ccCvv: '',
};