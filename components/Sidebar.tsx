
import React from 'react';
import { NEEDS_ANALYSIS_FRAMEWORK, COLORS } from '../constants';

const Sidebar: React.FC = () => {
  return (
    <div className="w-80 h-full overflow-y-auto bg-white border-r border-gray-200 p-8 hidden lg:block sticky top-0">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-black tracking-tighter mb-2">KW <span style={{ color: COLORS.PRIMARY_RED }}>ASSISTANT</span></h2>
        <p className="text-gray-500 font-medium">Consulting Pro Suite</p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Needs Analysis Framework</h3>
          <div className="space-y-6">
            {NEEDS_ANALYSIS_FRAMEWORK.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-50 text-[#B40101] flex items-center justify-center text-xs font-bold border border-red-100">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-[#B40101] transition-colors">
                      {item.q}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 p-6 rounded-2xl bg-gray-50 border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Internal Note</p>
        <p className="text-xs text-gray-600 leading-relaxed italic">
          "The person who asks the questions controls the conversation."
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
