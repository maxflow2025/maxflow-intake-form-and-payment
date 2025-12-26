import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

interface CatalogProps {
  onClose?: () => void;
  isStep?: boolean;
  quantities: Record<string, number>;
  onUpdateQuantity: (item: string, qty: number) => void;
}

const QuantitySelector: React.FC<{ 
  item: string; 
  qty: number; 
  onChange: (qty: number) => void; 
}> = ({ qty, onChange }) => {
  const [inputValue, setInputValue] = useState<string>(qty.toString());

  // Keep input in sync with external state if needed (though now it's the primary source)
  useEffect(() => {
    setInputValue(qty.toString());
  }, [qty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const parsed = parseInt(val);
    if (!isNaN(parsed)) {
      // Direct propagation of whole numbers (0+)
      onChange(Math.max(0, parsed));
    } else if (val === '') {
      // Empty input treated as 0 internally for calculations
      onChange(0);
    }
  };

  const handleBlur = () => {
    // Standardize display on blur (e.g., empty becomes "0")
    setInputValue(qty.toString());
  };

  return (
    <div className="ml-auto flex items-center">
      <input 
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={`text-[12px] font-black w-14 text-center bg-[#121418] border border-gray-700 rounded-lg py-1.5 focus:border-yellow-500 focus:outline-none appearance-none no-scrollbar transition-colors ${qty > 0 ? 'text-yellow-500 border-yellow-500/50' : 'text-gray-600'}`}
        style={{ MozAppearance: 'textfield' }}
        placeholder="0"
      />
    </div>
  );
};

export const CatalogContent: React.FC<{
  quantities: Record<string, number>;
  onUpdateQuantity: (item: string, qty: number) => void;
}> = ({ quantities, onUpdateQuantity }) => {
  return (
    <div className="space-y-8 pb-4">
      {/* PANEL A */}
      <section className="bg-[#1a1d23] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-yellow-500 px-6 py-3">
          <h2 className="text-black font-black uppercase text-xs tracking-widest">PANEL A — SMALL / SIDEWALK / LOCAL SIGNS</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">(Typical sizes: 30”×24”, 12”×48”)</p>
            <p className="text-[11px] text-white font-bold uppercase leading-relaxed">Used for: Sidewalk control, detours, parking restrictions, low-speed local roads</p>
          </div>
          <div className="grid grid-cols-1 gap-y-2">
            {[
              'Work Zone Ahead', 'End Road Work', 'Detour Left', 'Detour Right', 'Detour Straight', 'End Detour', 
              'No Parking (Construction)', 'Keep Left', 'Keep Right', 'No Left Turn', 'No Right Turn', 
              'Sidewalk Closed', 'Sidewalk Closed – Use Other Side', 'Sidewalk Crossover (Left / Right)', 'Blank Type I Barricade (Pedestrian Control)'
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-[11px] text-gray-400 font-medium uppercase py-1 border-b border-gray-800/30 last:border-0">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-yellow-500/50 mt-0.5">•</span>
                  <span>{item}</span>
                </div>
                <QuantitySelector 
                  item={item} 
                  qty={quantities[item] || 0} 
                  onChange={(q) => onUpdateQuantity(item, q)} 
                />
              </div>
            ))}
          </div>
          <div className="pt-5 border-t border-gray-800 flex justify-between items-end gap-3">
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-tight">Pricing (Per Sign – Stand Included)</span>
            <div className="text-right">
              <div className="text-white text-base font-black tracking-tight">Daily: $10</div>
              <div className="text-gray-500 text-[9px] font-black uppercase tracking-widest mt-0.5">Weekly: $30 | Monthly: $90</div>
            </div>
          </div>
        </div>
      </section>

      {/* PANEL B */}
      <section className="bg-[#1a1d23] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-yellow-500 px-6 py-3">
          <h2 className="text-black font-black uppercase text-xs tracking-widest">PANEL B — STANDARD WORK ZONE SIGNS</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">(48”×48” MUTCD Standard)</p>
            <p className="text-[11px] text-white font-bold uppercase leading-relaxed">Used for: Lane closures, one-lane roads, flagging, roadway advance warning</p>
          </div>
          <div className="grid grid-cols-1 gap-y-2">
            {[
              'Road Work Ahead (RWA)', 'One Lane Road Ahead (OLR)', 'Flagger Ahead', 'Be Prepared to Stop', 'Left Lane Closed', 
              'Right Lane Closed', 'Shoulder Work Ahead', 'Utility Work Ahead', 'Uneven Lanes', 'Rough Road', 'Loose Gravel', 
              'Dip / Bump Ahead', 'Road Closed', 'Road Closed Ahead', 'Road Closed Thru Traffic', 'Road Closed with Detour', 
              'Detour Ahead', 'Two-Way Traffic Ahead', 'Trucks Entering Highway', 'Survey Crew Ahead', 'Left Turn Lane Closed', 'Right Lane Closed'
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-[11px] text-gray-400 font-medium uppercase py-1 border-b border-gray-800/30 last:border-0">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-yellow-500/50 mt-0.5">•</span>
                  <span>{item}</span>
                </div>
                <QuantitySelector 
                  item={item} 
                  qty={quantities[item] || 0} 
                  onChange={(q) => onUpdateQuantity(item, q)} 
                />
              </div>
            ))}
          </div>
          <div className="pt-5 border-t border-gray-800 flex justify-between items-end gap-3">
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-tight">Pricing (Per Sign – Stand Included)</span>
            <div className="text-right">
              <div className="text-white text-base font-black tracking-tight">Daily: $12</div>
              <div className="text-gray-500 text-[9px] font-black uppercase tracking-widest mt-0.5">Weekly: $36 | Monthly: $108</div>
            </div>
          </div>
        </div>
      </section>

      {/* PANEL C */}
      <section className="bg-[#1a1d23] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-yellow-500 px-6 py-3">
          <h2 className="text-black font-black uppercase text-xs tracking-widest">PANEL C — LARGE / SPECIAL WARNING SIGNS</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">(48”×72” or Type III Mounted)</p>
            <p className="text-[11px] text-white font-bold uppercase leading-relaxed">Used for: Speed reductions, enforcement zones, high-risk areas</p>
          </div>
          <div className="grid grid-cols-1 gap-y-2">
            {[
              'Reduced Speed Ahead', 'Begin Double Fine Zone', 'End Double Fine Zone', 'Road Closed (Type III Barricade)', 
              'Detour Route Marker – Left', 'Detour Route Marker – Right', 'Detour Route Marker – Both Directions', 'Type III Blank Barricade'
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-[11px] text-gray-400 font-medium uppercase py-1 border-b border-gray-800/30 last:border-0">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-yellow-500/50 mt-0.5">•</span>
                  <span>{item}</span>
                </div>
                <QuantitySelector 
                  item={item} 
                  qty={quantities[item] || 0} 
                  onChange={(q) => onUpdateQuantity(item, q)} 
                />
              </div>
            ))}
          </div>
          <div className="pt-5 border-t border-gray-800 flex justify-between items-end gap-3">
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-tight">Pricing (Per Sign – Stand or Barricade Included)</span>
            <div className="text-right">
              <div className="text-white text-base font-black tracking-tight">Daily: $15</div>
              <div className="text-gray-500 text-[9px] font-black uppercase tracking-widest mt-0.5">Weekly: $45 | Monthly: $135</div>
            </div>
          </div>
        </div>
      </section>

      {/* CHANNELIZING DEVICES */}
      <section className="bg-[#1a1d23] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
          <h2 className="text-white font-black uppercase text-xs tracking-widest">CHANNELIZING DEVICES</h2>
        </div>
        <div className="p-6 divide-y divide-gray-800/50">
          {[
            { label: 'Traffic Cones (36” MUTCD)', price: '$5 / $15 / $35' },
            { label: 'Drums', price: '$10 / $30 / $90' },
            { label: 'Drums with Warning Light', price: '$15 / $45 / $135' },
            { label: 'Vertical Panels (VP)', price: '$8 / $24 / $72' },
            { label: 'Vertical Panels with Light', price: '$15 / $45 / $135' }
          ].map(d => (
            <div key={d.label} className="py-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-white font-bold uppercase tracking-tight">{d.label}</span>
                <span className="text-yellow-500 text-[9px] font-black">{d.price}</span>
              </div>
              <QuantitySelector 
                item={d.label} 
                qty={quantities[d.label] || 0} 
                onChange={(q) => onUpdateQuantity(d.label, q)} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* ADVANCED TRAFFIC DEVICES */}
      <section className="bg-[#1a1d23] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
          <h2 className="text-white font-black uppercase text-xs tracking-widest">ADVANCED TRAFFIC DEVICES</h2>
        </div>
        <div className="p-6 divide-y divide-gray-800/50">
          <div className="py-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-white font-bold uppercase tracking-tight">Arrow Board</span>
              <span className="text-yellow-500 text-[9px] font-black">$70 / $210 / $700</span>
            </div>
            <QuantitySelector 
              item="Arrow Board" 
              qty={quantities["Arrow Board"] || 0} 
              onChange={(q) => onUpdateQuantity("Arrow Board", q)} 
            />
          </div>
          <div className="py-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-white font-bold uppercase tracking-tight">VMS / Portable Message Board</span>
                <span className="text-yellow-500 text-[9px] font-black">$225 / $675 / $2,100</span>
              </div>
              <QuantitySelector 
                item="VMS / Portable Message Board" 
                qty={quantities["VMS / Portable Message Board"] || 0} 
                onChange={(q) => onUpdateQuantity("VMS / Portable Message Board", q)} 
              />
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg inline-block">
              <p className="text-[8px] text-yellow-500 font-black uppercase tracking-widest">3-Month Project Rate: $5,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT PROTECTION */}
      <section className="bg-[#1a1d23] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl border-l-4 border-l-red-600">
        <div className="bg-red-600/10 px-6 py-3 border-b border-gray-800">
          <h2 className="text-white font-black uppercase text-xs tracking-widest">IMPACT PROTECTION</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-[11px] font-black text-white uppercase tracking-tight">TMA — Truck Mounted Attenuator</h3>
            <span className="text-red-500 text-[8px] font-black uppercase tracking-widest bg-red-600/10 border border-red-600/20 px-2 py-0.5 rounded-full">Quote Required</span>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Required for: State highways, High-speed roadway work, Approved TCP compliance</p>
          </div>
          <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-800 flex items-center justify-between">
            <p className="text-[9px] text-gray-400 font-bold italic uppercase leading-relaxed tracking-tight flex-1">
              Pricing: Quoted per project. Includes truck + certified operator. Minimum hours apply.
            </p>
            <div className="ml-4">
              <QuantitySelector 
                item="TMA" 
                qty={quantities["TMA"] || 0} 
                onChange={(q) => onUpdateQuantity("TMA", q)} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* MOBILIZATION & DELIVERY */}
      <section className="bg-[#1a1d23] border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-white font-black uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
          <i className="fa-solid fa-truck-fast text-yellow-500 text-[10px]"></i>
          MOBILIZATION & DELIVERY
        </h2>
        <div className="space-y-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tight leading-tight">
          <p>• Mobilization / Delivery / Pickup billed separately</p>
          <p>• Pricing based on zone and device quantity</p>
          <p>• Additional trips billed if scope changes</p>
        </div>
      </section>

      {/* IMPORTANT BILLING NOTES */}
      <section className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 shadow-inner">
        <h2 className="text-yellow-500 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
          IMPORTANT BILLING NOTES
        </h2>
        <div className="space-y-2 text-[10px] text-gray-300 font-black uppercase tracking-widest leading-relaxed">
          <p className="border-l border-yellow-500/30 pl-3">All signs include stands — no separate stand charge</p>
          <p className="border-l border-yellow-500/30 pl-3">Labor (Flagger / UTC) is billed upfront and daily</p>
          <p className="border-l border-yellow-500/30 pl-3">Equipment & mobilization billed 50% upfront / 50% post-job</p>
          <p className="border-l border-yellow-500/30 pl-3">Remaining balances invoiced Net 7 after completion</p>
          <p className="border-l border-yellow-500/30 pl-3">Damage or loss billed at replacement cost</p>
        </div>
      </section>
    </div>
  );
};

export const Catalog: React.FC<CatalogProps> = ({ onClose, isStep, quantities, onUpdateQuantity }) => {
  if (isStep) {
    return <CatalogContent quantities={quantities} onUpdateQuantity={onUpdateQuantity} />;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f1115] overflow-y-auto px-4 py-8 no-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        {/* Header Branding */}
        <div className="bg-[#161920] border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <Logo />
        </div>

        {/* Catalog Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-6 sticky top-0 bg-[#0f1115] z-10">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none">Signs & Devices</h1>
            <p className="text-yellow-500 font-bold uppercase tracking-widest text-[9px] mt-2">Maxflow Official Catalog</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-700 shadow-lg"
          >
            Close
          </button>
        </div>

        <CatalogContent quantities={quantities} onUpdateQuantity={onUpdateQuantity} />

        <button 
          onClick={onClose}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-xl uppercase tracking-[0.2em] transition-all shadow-2xl shadow-yellow-500/20 hover:scale-[1.01] active:scale-[0.99]"
        >
          Return to Intake Flow
        </button>
      </div>
    </div>
  );
};