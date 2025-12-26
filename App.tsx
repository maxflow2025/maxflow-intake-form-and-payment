// App.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Step, FormData, INITIAL_FORM_DATA } from './types';
import { StepWrapper } from './components/StepWrapper';
import { Input } from './components/Input';
import { SelectionBox } from './components/SelectionBox';
import { Catalog } from './components/Catalog';

// =====================
// TOGGLES
// =====================
const IS_TEST_MODE = false; // DISABLED TEST MODE - ABSOLUTE LOCK

// =====================
// CONFIG
// =====================
const APP_COMPANY_NAME = 'MAXFLOW TRAFFIC CONTROL & THERMOPLASTIC LLC';
const ADMIN_EMAIL = 'longdang@maxflowtc.com';
const SUPPORT_PHONE = '1-888-912-8999';
const DISPLAY_TOTAL_STEPS = 9; // UPDATED FOR STEP 9

// =====================
// PRICING RATES
// =====================
const RATE_FLAGGER = 65;
const RATE_UTC = 165;
const BASE_MOBILIZATION = 500;
const RATE_SIGN_PACKAGE = 200;

// Catalog Constants for Summary Calculations
const PANEL_A_ITEMS = ['Work Zone Ahead', 'End Road Work', 'Detour Left', 'Detour Right', 'Detour Straight', 'End Detour', 'No Parking (Construction)', 'Keep Left', 'Keep Right', 'No Left Turn', 'No Right Turn', 'Sidewalk Closed', 'Sidewalk Closed – Use Other Side', 'Sidewalk Crossover (Left / Right)', 'Blank Type I Barricade (Pedestrian Control)'];
const PANEL_B_ITEMS = ['Road Work Ahead (RWA)', 'One Lane Road Ahead (OLR)', 'Flagger Ahead', 'Be Prepared to Stop', 'Left Lane Closed', 'Right Lane Closed', 'Shoulder Work Ahead', 'Utility Work Ahead', 'Uneven Lanes', 'Rough Road', 'Loose Gravel', 'Dip / Bump Ahead', 'Road Closed', 'Road Closed Ahead', 'Road Closed Thru Traffic', 'Road Closed with Detour', 'Detour Ahead', 'Two-Way Traffic Ahead', 'Trucks Entering Highway', 'Survey Crew Ahead', 'Left Turn Lane Closed', 'Right Lane Closed'];
const PANEL_C_ITEMS = ['Reduced Speed Ahead', 'Begin Double Fine Zone', 'End Double Fine Zone', 'Road Closed (Type III Barricade)', 'Detour Route Marker – Left', 'Detour Route Marker – Right', 'Detour Route Marker – Both Directions', 'Type III Blank Barricade'];

// Fixed App component with return and export
const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.CustomerInfo);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [locating, setLocating] = useState(false);
  const [isReturningClient, setIsReturningClient] = useState<boolean | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Stripe Redirection / Success State
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      setStep(Step.ThankYou);
      // Clean up the URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const updateField = useCallback(
    <T extends keyof FormData>(field: T, value: FormData[T]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateCatalogQuantity = useCallback((item: string, qty: number) => {
    setFormData(prev => ({
      ...prev,
      catalogQuantities: {
        ...prev.catalogQuantities,
        [item]: qty
      }
    }));
  }, []);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateField('phone', formatted);
  };

  const handleOnSitePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateField('onSitePhone', formatted);
  };

  const captureLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField('locationLat', position.coords.latitude);
        updateField('locationLng', position.coords.longitude);
        setLocating(false);
      },
      (error) => {
        console.error('Error obtaining location', error);
        alert('Could not obtain current location. Please ensure location services are enabled.');
        setLocating(false);
      }
    );
  };

  const isStep1Valid = useMemo(() => {
    if (IS_TEST_MODE) return true;
    const phoneDigits = formData.phone.replace(/\D/g, '');
    return (
      isReturningClient !== null &&
      formData.companyName.trim() !== '' &&
      formData.contactName.trim() !== '' &&
      phoneDigits.length === 10 &&
      formData.email.trim() !== '' &&
      formData.smsConsent !== null
    );
  }, [formData.companyName, formData.contactName, formData.phone, formData.email, formData.smsConsent, isReturningClient]);

  const nextStep = () => {
    if (step < Step.ThankYou) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step > Step.CustomerInfo && step !== Step.ThankYou) {
      setStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isOneLaneRoad = formData.configuration.some(c => c.includes('Option 3'));
  
  const rulesTriggered = useMemo(() => {
    const flaggerRule1 = isOneLaneRoad;
    const utcRule2 = formData.isIntersection && formData.hasTrafficSignal;
    const flaggerRule3 = formData.isIntersection && !formData.hasTrafficSignal;
    const flaggerRule4 = formData.roadwayClass === 'Residential' && isOneLaneRoad;

    return {
      flaggersSystemRequired: flaggerRule1 || flaggerRule3 || flaggerRule4,
      utcSystemRequired: utcRule2,
      minFlaggers: flaggerRule4 ? 3 : flaggerRule3 ? 3 : flaggerRule1 ? 2 : 0,
      minUTC: utcRule2 ? 1 : 0
    };
  }, [formData.configuration, formData.isIntersection, formData.hasTrafficSignal, formData.roadwayClass, isOneLaneRoad]);

  const isWithin24Hours = useMemo(() => {
    if (!formData.startDate) return false;
    const selectedDate = new Date(formData.startDate.replace(/-/g, '/'));
    const now = new Date();
    const diff = selectedDate.getTime() - now.getTime();
    return diff < 24 * 60 * 60 * 1000;
  }, [formData.startDate]);

  useEffect(() => {
    if (formData.laborPolicyAccepted && !IS_TEST_MODE) return;

    if (rulesTriggered.flaggersSystemRequired) {
      updateField('needsFlaggers', true);
      if (formData.numFlaggers < rulesTriggered.minFlaggers) {
        updateField('numFlaggers', rulesTriggered.minFlaggers);
      }
    }
    if (rulesTriggered.utcSystemRequired) {
      updateField('needsUTC', true);
      if (formData.numUTC < rulesTriggered.minUTC) {
        updateField('numUTC', rulesTriggered.minUTC);
      }
    }
  }, [rulesTriggered, formData.laborPolicyAccepted, updateField]);

  // Financial Calculations for Summary
  const financialSummary = useMemo(() => {
    let panelATotal = 0;
    let panelBTotal = 0;
    let panelCTotal = 0;
    let equipCost = 0;

    Object.entries(formData.catalogQuantities).forEach(([item, qty]) => {
      if (PANEL_A_ITEMS.includes(item)) {
        panelATotal += qty;
        equipCost += qty * 10;
      } else if (PANEL_B_ITEMS.includes(item)) {
        panelBTotal += qty;
        equipCost += qty * 12;
      } else if (PANEL_C_ITEMS.includes(item)) {
        panelCTotal += qty;
        equipCost += qty * 15;
      } else {
        // Miscellaneous Devices
        if (item === 'Traffic Cones (36” MUTCD)') equipCost += qty * 5;
        if (item === 'Drums') equipCost += qty * 10;
        if (item === 'Drums with Warning Light') equipCost += qty * 15;
        if (item === 'Vertical Panels (VP)') equipCost += qty * 8;
        if (item === 'Vertical Panels with Light') equipCost += qty * 15;
        if (item === 'Arrow Board') equipCost += qty * 70;
        if (item === 'VMS / Portable Message Board') equipCost += qty * 225;
      }
    });

    const laborCost = 
      (formData.needsFlaggers ? (formData.numFlaggers * formData.flaggerHours * RATE_FLAGGER) : 0) +
      (formData.needsUTC ? (formData.numUTC * formData.utcHours * RATE_UTC) : 0);

    const depositAmount = (equipCost * 0.5) + laborCost;

    return {
      panelATotal,
      panelBTotal,
      panelCTotal,
      equipCost,
      laborCost,
      depositAmount
    };
  }, [formData.catalogQuantities, formData.needsFlaggers, formData.numFlaggers, formData.flaggerHours, formData.needsUTC, formData.numUTC, formData.utcHours]);

  const handleCheckout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // 1. Lock final total and convert to cents
      const finalDepositAmount = financialSummary.depositAmount;
      const amountInCents = Math.round(finalDepositAmount * 100);

      // 2. Create Stripe Checkout Session
      // We call the backend endpoint to create a secure Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInCents,
          currency: 'usd',
          email: formData.email,
          success_url: window.location.origin + window.location.pathname + '?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: window.location.href,
          metadata: {
            companyName: formData.companyName,
            contactName: formData.contactName,
            startDate: formData.startDate,
            is24hRequest: isWithin24Hours ? 'true' : 'false'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate secure checkout session.');
      }

      const session = await response.json();

      // 3. Redirect to Stripe-hosted checkout
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Invalid checkout session received.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout could not be initialized. Please check your internet connection or try again later.');
      setIsSubmitting(false);
    }
  };

  const isStep5Valid = useMemo(() => {
    if (IS_TEST_MODE) return true;
    const permitOk = formData.hasPermit === 'No' || (formData.hasPermit === 'Yes' && formData.permitFileName);
    const tcpOk = (formData.hasTCP === 'No' && formData.tcpType) || (formData.hasTCP === 'Yes' && formData.tcpFileName);
    const configOk = formData.configuration.length > 0;
    return permitOk && tcpOk && configOk;
  }, [formData.hasPermit, formData.permitFileName, formData.hasTCP, formData.tcpFileName, formData.tcpType, formData.configuration]);

  const renderStep = () => {
    switch (step) {
      case Step.CustomerInfo:
        return (
          <StepWrapper title="Customer Information" currentStep={step} totalSteps={DISPLAY_TOTAL_STEPS} isTestMode={IS_TEST_MODE}>
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Client Status *</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setIsReturningClient(false)} className={`py-3 text-[10px] font-black uppercase rounded-xl border transition-all ${isReturningClient === false ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>New Client</button>
                <button onClick={() => setIsReturningClient(true)} className={`py-3 text-[10px] font-black uppercase rounded-xl border transition-all ${isReturningClient === true ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Returning</button>
              </div>
            </div>

            <Input label="Company Name *" placeholder="e.g. Acme Corp" icon="fa-solid fa-building" value={formData.companyName} onChange={e => updateField('companyName', e.target.value)} />
            <Input label="Primary Contact Name *" placeholder="Full Name" icon="fa-solid fa-user" value={formData.contactName} onChange={e => updateField('contactName', e.target.value)} />
            <Input label="Phone Number *" placeholder="(000) 000-0000" icon="fa-solid fa-phone" type="tel" value={formData.phone} onChange={handlePhoneChange} />
            <Input label="Email Address *" placeholder="name@company.com" icon="fa-solid fa-envelope" type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} />
            <Input label="PO Number (Optional)" placeholder="e.g. PO-12345" icon="fa-solid fa-file-invoice" value={formData.purchaseOrder} onChange={e => updateField('purchaseOrder', e.target.value)} />
            
            <div className="flex flex-col gap-4 mt-2 bg-[#121418] border border-gray-800 p-4 rounded-xl">
              <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">SMS Opt-In Consent *</label>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 w-4 h-4 border border-gray-600 rounded flex-shrink-0 flex items-center justify-center bg-gray-900">
                    <span className="text-[10px] text-gray-700">☐</span>
                  </div>
                  <p className="text-[9px] text-gray-400 leading-normal uppercase font-bold">
                    Maxflow Traffic Control And Thermoplastic LLC would like your consent to send text message communications from +1-888-912-8999 to your mobile number listed above, regarding account notifications, customer care, delivery notifications. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe at any time. Reply HELP for assistance or more information.
                  </p>
                </div>
                <button type="button" onClick={() => updateField('smsConsent', 'Yes')} className="flex gap-3 items-start text-left w-full group">
                  <div className={`mt-0.5 w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-all ${formData.smsConsent === 'Yes' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-600 bg-gray-900'}`}>
                    {formData.smsConsent === 'Yes' ? <i className="fa-solid fa-check text-[10px] text-black"></i> : <span className="text-[10px] text-gray-700">☐</span>}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight leading-tight ${formData.smsConsent === 'Yes' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    Yes, I consent to receive informational messages from Maxflow Traffic Control And Thermoplastic LLC regarding account notifications, customer care, delivery notifications.
                  </span>
                </button>
                <button type="button" onClick={() => updateField('smsConsent', 'No')} className="flex gap-3 items-start text-left w-full group">
                  <div className={`mt-0.5 w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-all ${formData.smsConsent === 'No' ? 'border-gray-500 bg-gray-500' : 'border-gray-600 bg-gray-900'}`}>
                    {formData.smsConsent === 'No' ? <i className="fa-solid fa-check text-[10px] text-black"></i> : <span className="text-[10px] text-gray-700">☐</span>}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight leading-tight ${formData.smsConsent === 'No' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    No, I do not want to receive any text messages from Maxflow Traffic Control And Thermoplastic LLC.
                  </span>
                </button>
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight leading-normal mt-2 border-t border-gray-800 pt-3">
                We do not share your mobile opt-in information with anyone. See our Privacy Policy for more information on how we handle your data.
              </p>
            </div>
            <button onClick={nextStep} disabled={!isStep1Valid} className={`mt-4 w-full font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${isStep1Valid ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'}`}>START INTAKE <i className="fa-solid fa-arrow-right"></i></button>
          </StepWrapper>
        );

      case Step.JobLocation:
        return (
          <StepWrapper title="Job Location" currentStep={step} totalSteps={DISPLAY_TOTAL_STEPS} isTestMode={IS_TEST_MODE}>
            <Input label="Street Address" placeholder="123 Roadway Blvd" icon="fa-solid fa-location-dot" value={formData.address} onChange={e => updateField('address', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" placeholder="Denver" icon="fa-solid fa-city" value={formData.city} onChange={e => updateField('city', e.target.value)} />
              <Input label="State" placeholder="CO" icon="fa-solid fa-map" value={formData.state} onChange={e => updateField('state', e.target.value)} />
            </div>
            <Input label="ZIP Code *" placeholder="e.g. 80021" type="text" inputMode="numeric" maxLength={5} value={formData.zipCode} onChange={e => updateField('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))} />
            <button type="button" onClick={captureLocation} className="w-full mt-2 flex items-center justify-center gap-2 py-3 border border-gray-700 bg-gray-800/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:bg-gray-800/50 transition-all">
              {locating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-crosshairs"></i>}
              {formData.locationLat ? `Job Pin Set (${formData.locationLat.toFixed(4)}, ${formData.locationLng?.toFixed(4)})` : 'Set Job Location Pin'}
            </button>
            <div className="mt-4 border-t border-gray-800 pt-4 flex flex-col gap-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">On-Site Contact</label>
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" placeholder="First Name" value={formData.onSiteFirstName} onChange={e => updateField('onSiteFirstName', e.target.value)} />
                <Input label="Last Name" placeholder="Last Name" value={formData.onSiteLastName} onChange={e => updateField('onSiteLastName', e.target.value)} />
              </div>
              <Input label="On-Site Phone" placeholder="(000) 000-0000" type="tel" value={formData.onSitePhone} onChange={handleOnSitePhoneChange} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={prevStep} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-yellow-500 text-black font-black py-4 rounded-xl">Continue</button>
            </div>
          </StepWrapper>
        );

      case Step.WorkCategory:
        return (
          <StepWrapper title="Service Category" currentStep={step} totalSteps={DISPLAY_TOTAL_STEPS} isTestMode={IS_TEST_MODE}>
            <div className="flex flex-col gap-4">
              {['Traffic Control', 'Thermoplastic Pavement Marking'].map(cat => (
                <SelectionBox key={cat} label={cat} selected={formData.serviceCategories.includes(cat)} onClick={() => {
                  const current = formData.serviceCategories;
                  updateField('serviceCategories', current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat]);
                }} />
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={prevStep} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-yellow-500 text-black font-black py-4 rounded-xl">Continue</button>
            </div>
          </StepWrapper>
        );

      case Step.WorkType:
        const workGroups = [
          { title: 'BOX 1 — Underground Work', items: ['Pothole', 'Coring / Drilling'] },
          { title: 'BOX 2 — Concrete / Asphalt / Paving', items: ['Concrete Cutting', 'Milling', 'Asphalt Cutting', 'Paving'] },
          { title: 'BOX 3 — Striping & Thermoplastic', items: ['Install Striping', 'Remove Striping', 'Thermoplastic'] },
          { title: 'BOX 4 — Other', items: ['Other'] }
        ];

        return (
          <StepWrapper title="Work Types" currentStep={step} totalSteps={DISPLAY_TOTAL_STEPS} isTestMode={IS_TEST_MODE}>
            <div className="flex flex-col gap-8 h-[500px] overflow-y-auto pr-2 no-scrollbar">
              {workGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-3">
                  <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block px-1">{group.title}</label>
                  <div className="flex flex-col gap-2">
                    {group.items.map(type => (
                      <SelectionBox 
                        key={type} 
                        label={type} 
                        selected={formData.workTypes.includes(type)} 
                        onClick={() => {
                          const current = formData.workTypes;
                          updateField('workTypes', current.includes(type) ? current.filter(t => t !== type) : [...current, type]);
                        }} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={prevStep} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-yellow-500 text-black font-black py-4 rounded-xl">Continue</button>
            </div>
          </StepWrapper>
        );

      case Step.TrafficNeeds:
        const trafficOptions = [
          {
            label: "Option 1 — Stationary Single Lane Closure",
            desc: "This setup is used to close one specific lane on a multilane highway for a fixed work area.",
            features: [
              { title: "Delineation", text: "A transition taper made of drums or vertical panels is used to move traffic out of the closed lane and into the adjacent open lane." },
              { title: "Warning", text: "It requires a sequence of advance warning signs (e.g., “Road Work Ahead,” “Right/Left Lane Closed Ahead,” and “Lane Ends”)." },
              { title: "Electronic Aids", text: "An Arrow Panel is placed at the beginning of the taper to direct merging traffic." }
            ]
          },
          {
            label: "Option 2 — Shoulder Closure",
            desc: "This setup is used when work is performed on the shoulder and does not require traffic to leave their travel lanes.",
            features: [
              { title: "Delineation", text: "Channelizing devices are placed along the shoulder to separate the work area from the traveled way." },
              { title: "Warning", text: "Specific signs such as “Shoulder Work” and “Right/Left Shoulder Closed” are used to alert drivers of equipment or personnel near the white line." },
              { title: "Clearance", text: "If hazards are within 18 feet of the traveled way, specialized high-speed signing and attenuators may be required." }
            ]
          },
          {
            label: "Option 3 — Flagging Operation (Alternating One-Way)",
            desc: "Used primarily on two-lane roads where one lane must be closed, requiring traffic from both directions to take turns using the single open lane.",
            features: [
              { title: "Control", text: "Flaggers are stationed at both ends of the work zone to coordinate movement." },
              { title: "Warning", text: "Advanced signs must include “One Lane Road Ahead” and the “Flagger Symbol” sign." },
              { title: "Tapers", text: "A short “one-lane, two-way” taper of 50 to 100 feet is used at the flagger stations." }
            ]
          },
          {
            label: "Option 4 — Mobile or Moving Closure",
            desc: "This is used for work that moves continuously or intermittently along the roadway, such as sweeping or pavement marking.",
            features: [
              { title: "Shadow Vehicles", text: "Instead of stationary signs and drums, this relies on a group of highly visible vehicles, including Advanced Warning Vehicles and Mobile Attenuators (TMA Trucks)." },
              { title: "Protection", text: "Each vehicle is equipped with 360-degree yellow flashing beacons, arrow boards, or Variable Message Signs (VMS) to warn traffic from behind." },
              { title: "Spacing", text: "Vehicles maintain specific following distances and buffer spaces based on the posted speed limit to provide a “rolling” safety zone for the work crew." }
            ]
          }
        ];

        return (
          <StepWrapper title="Traffic Need" currentStep={step} totalSteps={DISPLAY_TOTAL_STEPS} isTestMode={IS_TEST_MODE}>
            <div className="flex flex-col gap-6 h-[500px] overflow-y-auto pr-2 no-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">TRAFFIC CONDITIONS (MULTI-SELECT)</label>
                <div className="flex flex-col gap-3">
                  {trafficOptions.map((opt) => (
                    <div key={opt.label} className="flex flex-col gap-2">
                      <SelectionBox
                        label={opt.label}
                        selected={formData.configuration.includes(opt.label)}
                        onClick={() => {
                          const current = formData.configuration;
                          updateField('configuration', current.includes(opt.label) ? current.filter(c => c !== opt.label) : [...current, opt.label]);
                        }}
                      />
                      {formData.configuration.includes(opt.label) && (
                        <div className="p-4 bg-[#121418] border border-yellow-500/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[11px] text-gray-300 leading-relaxed font-medium">{opt.desc}</p>
                          {opt.features.map(f => (
                            <div key={f.title} className="space-y-1">
                              <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{f.title}:</p>
                              <p className="text-[11px] text-gray-400 leading-relaxed">{f.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-800 pt-6">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">SECTION A — FLAGGER REQUIREMENT</label>
                <div className="bg-[#121418] p-4 rounded-xl border border-gray-800 space-y-4 shadow-inner">
                  <span className="text-[11px] font-black text-white uppercase tracking-widest block">Do you need Flaggers?</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Yes', 'No'].map(val => (
                      <button 
                        key={val} 
                        onClick={() => updateField('needsFlaggers', val === 'Yes')} 
                        className={`py-2 text-[10px] font-bold rounded-lg border ${(formData.needsFlaggers ? 'Yes' : 'No') === val ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {formData.needsFlaggers && (
                    <div className="space-y-3 pt-2">
                      <Input label="Number of Flaggers" type="number" min="0" value={formData.numFlaggers} onChange={e => updateField('numFlaggers', Math.max(0, parseInt(e.target.value) || 0))} />
                      <Input label="Hours per Day (Min 4)" type="number" min="4" value={formData.flaggerHours} onChange={e => updateField('flaggerHours', Math.max(4, parseInt(e.target.value) || 4))} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-800 pt-6">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">SECTION B — UTC REQUIREMENT</label>
                <div className="bg-[#121418] p-4 rounded-xl border border-gray-800 space-y-4 shadow-inner">
                  <span className="text-[11px] font-black text-white uppercase tracking-widest block">Do you need a UTC?</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Yes', 'No'].map(val => (
                      <button 
                        key={val} 
                        disabled={formData.isIntersection && val === 'No'}
                        onClick={() => updateField('needsUTC', val === 'Yes')} 
                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                          (formData.needsUTC ? 'Yes' : 'No') === val 
                            ? 'bg-yellow-500 border-yellow-500 text-black' 
                            : (formData.isIntersection && val === 'No' ? 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed' : 'bg-gray-800 border-gray-700 text-gray-400')
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {formData.needsUTC && (
                    <div className="space-y-3 pt-2">
                      <Input label="Number of UTC" type="number" min="0" value={formData.numUTC} onChange={e => updateField('numUTC', Math.max(0, parseInt(e.target.value) || 0))} />
                      <Input label="Hours per Day (Min 4)" type="number" min="4" value={formData.utcHours} onChange={e => updateField('utcHours', Math.max(4, parseInt(e.target.value) || 4))} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-800 pt-6">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">SECTION C — INTERSECTION LOGIC</label>
                <div className="bg-[#121418] p-4 rounded-xl border border-gray-800 space-y-4 shadow-inner">
                  <span className="text-[11px] font-black text-white uppercase tracking-widest block">Is the work at an intersection?</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        updateField('isIntersection', true);
                        updateField('needsUTC', true);
                        updateField('numUTC', Math.max(formData.numUTC, 1));
                        updateField('needsFlaggers', true);
                        updateField('numFlaggers', Math.max(formData.numFlaggers, 1));
                      }} 
                      className={`py-2 text-[10px] font-bold rounded-lg border ${formData.isIntersection ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => {
                        updateField('isIntersection', false);
                        updateField('needsFlaggers', true);
                        updateField('numFlaggers', Math.max(formData.numFlaggers, 2));
                      }} 
                      className={`py-2 text-[10px] font-bold rounded-lg border ${!formData.isIntersection ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                    >
                      No
                    </button>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-tight leading-normal">
                      “Intersection traffic with signalized lights requires a UTC per MUTCD. No exceptions.”
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION D — PERMIT STATUS */}
              <div className="space-y-4 border-t border-gray-800 pt-6">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">SECTION D — PERMIT STATUS</label>
                <div className="bg-[#121418] p-4 rounded-xl border border-gray-800 space-y-4 shadow-inner">
                  <span className="text-[11px] font-black text-white uppercase tracking-widest block">Do you already have an approved permit?</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Yes', 'No'].map(val => (
                      <button 
                        key={val} 
                        onClick={() => updateField('hasPermit', val as 'Yes' | 'No')} 
                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                          formData.hasPermit === val ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-800 border-gray-700 text-gray-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {formData.hasPermit === 'Yes' && (
                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1">
                       <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Upload Permit (PDF/Image)</label>
                       <div className="relative">
                         <input 
                           type="file" 
                           onChange={(e) => updateField('permitFileName', e.target.files?.[0]?.name || '')}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                         />
                         <div className="w-full bg-gray-900 border border-dashed border-gray-700 rounded-lg py-4 flex flex-col items-center justify-center gap-2">
                           <i className={`fa-solid ${formData.permitFileName ? 'fa-file-circle-check text-green-500' : 'fa-cloud-arrow-up text-gray-600'}`}></i>
                           <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">
                             {formData.permitFileName || 'Tap to Select File'}
                           </span>
                         </div>
                       </div>
                    </div>
                  )}
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight italic">
                    “Permit procurement is the customer’s responsibility unless otherwise agreed in writing.”
                  </p>
                </div>
              </div>

              {/* SECTION E — TRAFFIC CONTROL PLAN (TCP) */}
              <div className="space-y-4 border-t border-gray-800 pt-6">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">SECTION E — TRAFFIC CONTROL PLAN (TCP)</label>
                <div className="bg-[#121418] p-4 rounded-xl border border-gray-800 space-y-4 shadow-inner">
                  <span className="text-[11px] font-black text-white uppercase tracking-widest block">Do you already have an approved Traffic Control Plan (TCP)?</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Yes', 'No'].map(val => (
                      <button 
                        key={val} 
                        onClick={() => updateField('hasTCP', val as 'Yes' | 'No')} 
                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                          formData.hasTCP === val ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-800 border-gray-700 text-gray-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {formData.hasTCP === 'Yes' && (
                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1">
                       <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Upload TCP (PDF/Image)</label>
                       <div className="relative">
                         <input 
                           type="file" 
                           onChange={(e) => updateField('tcpFileName', e.target.files?.[0]?.name || '')}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                         />
                         <div className="w-full bg-gray-900 border border-dashed border-gray-700 rounded-lg py-4 flex flex-col items-center justify-center gap-2">
                           <i className={`fa-solid ${formData.tcpFileName ? 'fa-file-circle-check text-green-500' : 'fa-cloud-arrow-up text-gray-600'}`}></i>
                           <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">
                             {formData.tcpFileName || 'Tap to Select File'}
                           </span>
                         </div>
                       </div>
                    </div>
                  )}
                  {formData.hasTCP === 'No' && (
                    <div className="bg-[#121418] border border-gray-800 p-4 rounded-xl space-y-4">
                      <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Select TCP Service:</p>
                      <div className="space-y-2">
                        <button 
                          onClick={() => updateField('tcpType', 'Regular')}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${formData.tcpType === 'Regular' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-gray-900 border-gray-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.tcpType === 'Regular' ? 'border-yellow-500' : 'border-gray-600'}`}>
                            {formData.tcpType === 'Regular' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[11px] font-black text-white uppercase">Regular TCP — $250 / page</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">10 business days</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => updateField('tcpType', 'Rush')}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${formData.tcpType === 'Rush' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-gray-900 border-gray-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.tcpType === 'Rush' ? 'border-yellow-500' : 'border-gray-600'}`}>
                            {formData.tcpType === 'Rush' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[11px] font-black text-white uppercase">Rush TCP — $1,250 / page</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Electronic PDF — 8 hours</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight italic mt-2">
                    “TCP preparation is optional and provided only if requested. Permit procurement remains the customer’s responsibility unless otherwise agreed in writing.”
                  </p>
                </div>
              </div>

            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={prevStep} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl">Back</button>
              <button 
                onClick={nextStep} 
                disabled={!isStep5Valid}
                className={`flex-[2] font-black py-4 rounded-xl transition-all ${!isStep5Valid ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-yellow-500 text-black'}`}
              >
                Continue
              </button>
            </div>
          </StepWrapper>
        );

      case Step.RoadwayClass:
        return (
          <StepWrapper title="Roadway Classification" currentStep={step} totalSteps={DISPLAY_TOTAL_STEPS} isTestMode={IS_TEST_MODE}>
            {IS_TEST_MODE && (
              <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
                <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest text-center">
                  TEST MODE — Section requirements temporarily bypassed.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Roadway Class *</label>
              <div className="flex flex-col gap-2">
                {['Residential', 'City / Local Road', 'State Highway'].map(cls => (
                  <SelectionBox 
                    key={cls} 
                    label={cls} 
                    selected={formData.roadwayClass === cls} 
                    onClick={() => updateField('roadwayClass', cls as any)} 
                  />
                ))}
                {/* LOCKED OPTION PER STRICTURES */}
                <div className="w-full flex items-center gap-4 p-4 rounded-xl border bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed opacity-50 min-h-[56px] select-none">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gray-800 text-gray-700">
                    <div className="w-3 h-3 rounded-full border border-gray-700" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-gray-600 uppercase">Interstate Highway</span>
                  </div>
                  <div className="ml-auto flex items-center text-gray-700">
                    <i className="fa-solid fa-lock text-[10px]"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={prevStep} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl">Back</button>
              <button onClick={nextStep} disabled={!IS_TEST_MODE && !formData.roadwayClass} className={`flex-[2] font-black py-4 rounded-xl transition-all ${(!IS_TEST_MODE && !formData.roadwayClass) ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-yellow-500 text-black'}`}>Continue</button>
            </div>
          </StepWrapper>
        );

      case Step.SignsCatalog:
        return (
          <StepWrapper title="Signs Catalog" currentStep={step} totalSteps={DISPLAY_TOTAL_STEPS} isTestMode={IS_TEST_MODE}>
            <div className="h-[500px] overflow-y-auto pr-2 no-scrollbar">
              <Catalog isStep quantities={formData.catalogQuantities} onUpdateQuantity={updateCatalogQuantity} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={prevStep} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-yellow-500 text-black font-black py-4 rounded-xl">Continue</button>
            </div>
          </StepWrapper>
        );

      case Step.Schedule:
        const isWeekend = formData.startDate ? [0, 6].includes(new Date(formData.startDate.replace(/-/g, '/')).getDay()) : false;
        const isOvertime = isWeekend || formData.flaggerHours > 8 || formData.utcHours > 8;

        return (
          <StepWrapper title="Schedule Request" currentStep={step} totalSteps={DISPLAY_TOTAL_STEPS} isTestMode={IS_TEST_MODE}>
            <div className="flex flex-col gap-6 h-[500px] overflow-y-auto pr-2 no-scrollbar pb-6">
              
              <div className="space-y-4">
                <Input label="Requested Start Date" type="date" value={formData.startDate} onChange={e => updateField('startDate', e.target.value)} />
                <Input label="Estimated Duration" placeholder="e.g. 1 day" value={formData.duration} onChange={e => updateField('duration', e.target.value)} />
              </div>

              {/* READ-ONLY SUMMARY BLOCK */}
              <div className="space-y-4 border-t border-gray-800 pt-6">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">JOB SUMMARY (READ-ONLY)</label>
                <div className="bg-[#121418] border border-gray-800 p-4 rounded-xl space-y-6">
                  
                  {/* 1. TOTAL DEVICES */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">1. TOTAL DEVICES</p>
                    <div className="grid grid-cols-1 gap-1 text-[11px] text-gray-300 font-bold uppercase">
                      <div className="flex justify-between"><span>Panel A:</span><span>{financialSummary.panelATotal}</span></div>
                      <div className="flex justify-between"><span>Panel B:</span><span>{financialSummary.panelBTotal}</span></div>
                      <div className="flex justify-between"><span>Panel C:</span><span>{financialSummary.panelCTotal}</span></div>
                    </div>
                  </div>

                  {/* 2. TOTAL EQUIPMENT */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">2. TOTAL EQUIPMENT</p>
                    <div className="space-y-1 text-[11px] text-gray-300 font-bold uppercase">
                      <div className="flex justify-between"><span>Arrow Boards:</span><span>{formData.catalogQuantities['Arrow Board'] || 0}</span></div>
                      <div className="flex justify-between"><span>VMS Boards:</span><span>{formData.catalogQuantities['VMS / Portable Message Board'] || 0}</span></div>
                      {Object.entries(formData.catalogQuantities)
                        .filter(([k, v]) => v > 0 && !PANEL_A_ITEMS.includes(k) && !PANEL_B_ITEMS.includes(k) && !PANEL_C_ITEMS.includes(k) && k !== 'Arrow Board' && k !== 'VMS / Portable Message Board')
                        .map(([k, v]) => (
                          <div key={k} className="flex justify-between"><span>{k}:</span><span>{v}</span></div>
                        ))
                      }
                    </div>
                  </div>

                  {/* 3. LABOR SUMMARY */}
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">3. LABOR SUMMARY</p>
                    <div className="space-y-4">
                      {formData.needsFlaggers && (
                        <div className="bg-gray-800/30 p-2 rounded border border-gray-800">
                          <p className="text-[10px] text-white font-black mb-1">FLAGGERS</p>
                          <div className="grid grid-cols-3 gap-2 text-[9px] text-gray-400 font-bold uppercase">
                            <div>QTY: {formData.numFlaggers}</div>
                            <div>HRS: {formData.flaggerHours}</div>
                            <div className="text-yellow-500">TOTAL: {formData.numFlaggers * formData.flaggerHours} HRS</div>
                          </div>
                        </div>
                      )}
                      {formData.needsUTC && (
                        <div className="bg-gray-800/30 p-2 rounded border border-gray-800">
                          <p className="text-[10px] text-white font-black mb-1">UTC</p>
                          <div className="grid grid-cols-3 gap-2 text-[9px] text-gray-400 font-bold uppercase">
                            <div>QTY: {formData.numUTC}</div>
                            <div>HRS: {formData.utcHours}</div>
                            <div className="text-yellow-500">TOTAL: {formData.numUTC * formData.utcHours} HRS</div>
                          </div>
                        </div>
                      )}
                      <div className="bg-gray-800/30 p-2 rounded border border-gray-800">
                        <p className="text-[10px] text-white font-black mb-1 uppercase">TCS</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase italic">Hours (Not Prepaid - Billed Post-Job)</p>
                      </div>
                    </div>
                  </div>

                  {/* OVERTIME RULES */}
                  <div className="pt-2 border-t border-gray-800 space-y-2">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-tight ${isOvertime ? 'text-yellow-500' : 'text-gray-500'}`}>
                      <i className={`fa-solid ${isOvertime ? 'fa-circle-exclamation' : 'fa-circle-info'}`}></i>
                      <span>{isOvertime ? 'Overtime Rates Detected' : 'Standard Rates Apply'}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                      “Overtime applies after 8 hours, after 5:00 PM, and on weekends. Overtime labor is billed daily EOD.”
                    </p>
                  </div>

                  {/* BILLING SUMMARY */}
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-[9px] font-black text-yellow-500 uppercase mb-3 tracking-widest">BILLING SUMMARY</p>
                    <div className="space-y-2 text-[11px] font-black uppercase tracking-tight">
                      <div className="flex justify-between text-white"><span>Equipment & Devices:</span><span>50% Upfront</span></div>
                      <div className="flex justify-between text-white"><span>Labor (Flagger + UTC):</span><span>100% Upfront</span></div>
                      <div className="flex justify-between text-gray-500"><span>TCS:</span><span>Post-Job</span></div>
                      
                      <div className="flex justify-between text-yellow-500 pt-2 border-t border-gray-800/50 mt-2 font-black text-xs">
                        <span>Total Estimated Deposit:</span>
                        <span>${financialSummary.depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed mt-4">
                      “Labor is billed daily and upfront. Equipment and mobilization are billed 50% upfront. Remaining balances invoiced Net 7 after job completion.”
                    </p>
                  </div>
                </div>
              </div>

              {/* 24-HOUR WARNING SECTION */}
              {isWithin24Hours && (
                <div className="space-y-4 border-t border-red-800 pt-6 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-red-600/10 border border-red-500 p-4 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                      <p className="text-[11px] text-red-500 font-black uppercase tracking-widest">
                        Requests scheduled within 24 hours are subject to double charges.
                      </p>
                    </div>
                    <div className="flex gap-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl items-start">
                      <input 
                        type="checkbox" 
                        id="double_charge_ack" 
                        className="mt-1 h-5 w-5 accent-red-500 rounded border-red-700 bg-gray-900" 
                        checked={formData.doubleChargeAccepted} 
                        onChange={e => updateField('doubleChargeAccepted', e.target.checked)} 
                      />
                      <label htmlFor="double_charge_ack" className="text-[10px] text-white font-black uppercase tracking-tight leading-normal cursor-pointer">
                        I understand and agree to the double charge for requests within 24 hours.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* DEPOSIT AND OVERTIME SUMMARY SECTION */}
              <div className="space-y-4 border-t border-gray-800 pt-6">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest block">Deposit Required to Deploy Traffic Control</label>
                <div className="bg-[#121418] border border-gray-800 p-4 rounded-xl space-y-4">
                  <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tight leading-relaxed">
                    To schedule and deploy traffic control resources, the following payment structure applies:
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] text-white font-black uppercase tracking-tight">• 100% of all labor is billed upfront</p>
                      <div className="ml-4 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                        - Flaggers<br/>
                        - UTC (Police / State Trooper)<br/>
                        - TCS (if applicable)
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white font-black uppercase tracking-tight">• 50% deposit required on all equipment</p>
                      <div className="ml-4 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                        - Signs (Panels A, B, C)<br/>
                        - Channelizing devices (cones, drums, vertical panels)<br/>
                        - Arrow Boards, VMS, TMA (if applicable)<br/>
                        - Mobilization / delivery
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tight leading-relaxed">
                      • Remaining equipment balance is invoiced <span className="text-yellow-500 font-black">Net 7</span> after job completion and signed ticket confirmation.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-800 space-y-2">
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Overtime Notice</p>
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tight leading-relaxed">
                      Overtime rates apply under the following conditions:
                    </p>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-4">
                      - Any work beyond 8 hours<br/>
                      - Work performed after 5:00 PM<br/>
                      - Weekend work (Saturday or Sunday)
                    </div>
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tight leading-relaxed italic">
                      Overtime labor is billed <span className="text-yellow-500 font-black">daily at end of day (EOD)</span>.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-800 bg-yellow-500/5 p-2 rounded-lg">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed text-center italic">
                      By proceeding, you acknowledge and agree to the deposit requirements necessary to reserve labor, equipment, and traffic control resources.
                    </p>
                  </div>
                </div>
              </div>

              {/* ORIGINAL ACKNOWLEDGMENTS */}
              <div className="space-y-4 border-t border-gray-800 pt-6">
                <div className="flex gap-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl items-start">
                  <input 
                    type="checkbox" 
                    id="billing_ack" 
                    className="mt-1 h-5 w-5 accent-yellow-500 rounded border-gray-700 bg-gray-900" 
                    checked={formData.billingTermsAccepted} 
                    onChange={e => updateField('billingTermsAccepted', e.target.checked)} 
                  />
                  <label htmlFor="billing_ack" className="text-[10px] text-white font-black uppercase tracking-tight leading-normal cursor-pointer">
                    I understand and agree to the billing terms, overtime rules, and cancellation policy.
                  </label>
                </div>
                
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                   <input 
                     type="checkbox" 
                     className="mt-1 h-4 w-4 accent-yellow-500" 
                     checked={formData.schedulingNoticeAccepted} 
                     onChange={e => updateField('schedulingNoticeAccepted', e.target.checked)} 
                   />
                   <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tight leading-relaxed">I acknowledge crew availability/weather factors.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={prevStep} 
                disabled={isSubmitting}
                className={`flex-1 font-bold py-4 rounded-xl transition-all ${isSubmitting ? 'bg-gray-800/50 text-gray-700 cursor-not-allowed' : 'bg-gray-800 text-white'}`}
              >
                Back
              </button>
              <button 
                onClick={handleCheckout} 
                disabled={isSubmitting || !formData.billingTermsAccepted || !formData.schedulingNoticeAccepted || !formData.startDate || (isWithin24Hours && !formData.doubleChargeAccepted)}
                className={`flex-[2] font-black py-4 rounded-xl uppercase tracking-widest transition-all ${isSubmitting || (!formData.billingTermsAccepted || !formData.schedulingNoticeAccepted || !formData.startDate || (isWithin24Hours && !formData.doubleChargeAccepted)) ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-yellow-500 text-black'}`}
              >
                {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Initializing...</> : 'Submit Request'}
              </button>
            </div>
          </StepWrapper>
        );

      case Step.ThankYou:
        return (
          <StepWrapper title="Request Received" currentStep={step} totalSteps={DISPLAY_TOTAL_STEPS} isTestMode={IS_TEST_MODE}>
            <div className="flex flex-col items-center justify-center py-8 text-center gap-6">
              <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center animate-bounce">
                <i className="fa-solid fa-circle-check text-4xl text-yellow-500"></i>
              </div>
              
              <div className="space-y-3">
                <p className="text-white font-black text-xl uppercase tracking-tight">Payment & Request Successful</p>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                  Your deposit has been processed securely. Our engineering and dispatch team at Maxflow Traffic Control LLC has received your request and will reach out shortly for final coordination.
                </p>
              </div>

              <div className="w-full bg-[#121418] border border-gray-800 p-5 rounded-2xl space-y-4">
                <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Important Reassurance:</p>
                <div className="text-left space-y-3">
                  <p className="text-[10px] text-gray-300 font-bold uppercase leading-relaxed">• Your project is now prioritized in our daily scheduling queue.</p>
                  <p className="text-[10px] text-gray-300 font-bold uppercase leading-relaxed">• An official confirmation email containing your receipt and project details has been sent to {formData.email}.</p>
                  <p className="text-[10px] text-gray-300 font-bold uppercase leading-relaxed">• For immediate assistance or changes, please reference your order number in the email when calling support.</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  window.location.href = window.location.origin + window.location.pathname;
                }} 
                className="w-full bg-gray-800 text-white font-black py-4 rounded-xl uppercase tracking-widest border border-gray-700 hover:bg-gray-700 transition-all"
              >
                Start a New Request
              </button>
            </div>
          </StepWrapper>
        );

      default:
        return null;
    }
  };

  // Main return statement for the App component
  return (
    <div className="min-h-screen bg-[#0f1115]">
      {renderStep()}
      {showCatalog && (
        <Catalog 
          onClose={() => setShowCatalog(false)} 
          quantities={formData.catalogQuantities} 
          onUpdateQuantity={updateCatalogQuantity} 
        />
      )}
    </div>
  );
};

export default App;
