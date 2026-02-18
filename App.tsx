
import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { AppStage, AgentData, AnalysisResult, SynthesisResult } from './types';
import { EMPTY_AGENT_DATA, COLORS, RESOURCES } from './constants';
import { extractAgentData, analyzeGaps, synthesizeMeeting } from './services/gemini';
import { exportToPDF, stripMarkdown } from './utils/pdfExport';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.GATHERING);
  const [agentData, setAgentData] = useState<AgentData>(EMPTY_AGENT_DATA);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [noteImage, setNoteImage] = useState<string | null>(null);
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleInputChange = (field: keyof AgentData, value: string) => {
    setAgentData(prev => ({ ...prev, [field]: value }));
  };

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
  };

  const handleScanPrint = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setLoadingMessage("AI is scanning production data...");
    try {
      const base64 = await processImageFile(file);
      const extracted = await extractAgentData(base64);
      setAgentData(prev => ({ ...prev, ...extracted }));
    } finally {
      setLoading(false);
    }
  };

  const handleNoteImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await processImageFile(file);
    setNoteImage(base64);
  };

  const proceedToAnalysis = async () => {
    if (!agentData.agentName.trim()) {
      alert("Agent Name is a required field to proceed.");
      return;
    }
    setLoading(true);
    setLoadingMessage("Generating strategic gap analysis...");
    try {
      const result = await analyzeGaps(agentData);
      setAnalysis(result);
      setStage(AppStage.ANALYSIS);
    } catch (err) {
      alert("Failed to analyze. " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const proceedToSynthesis = async () => {
    setLoading(true);
    setLoadingMessage("Synthesizing appointment breakthroughs...");
    try {
      const result = await synthesizeMeeting(agentData, analysis!, appointmentNotes, noteImage || undefined);
      setSynthesis(result);
      setStage(AppStage.SYNTHESIS);
    } catch (err) {
      alert("Synthesis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyForCommand = () => {
    if (!synthesis) return;
    const text = `
KW CONSULTING SUMMARY - ${agentData.agentName}
CURRENT STRUCTURE: ${stripMarkdown(synthesis.currentStructure)}
PRIMARY GAPS: ${stripMarkdown(synthesis.primaryGaps)}
BREAKTHROUGHS: ${stripMarkdown(synthesis.breakthroughs)}
NEXT ACTIONS: ${stripMarkdown(synthesis.nextActions)}
    `.trim();
    navigator.clipboard.writeText(text);
    alert("Clean summary copied for KW Command!");
  };

  return (
    <div className="flex h-screen overflow-hidden text-gray-900 bg-[#f8f9fa]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 relative">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center glass">
            <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-gray-100 max-w-sm w-full animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 border-4 border-[#B40101] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-black text-black mb-2 tracking-tight">{loadingMessage}</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Consultant AI active</p>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Stage Progress Header */}
          <header className="space-y-6">
            <div className="flex items-center gap-2">
              {[AppStage.GATHERING, AppStage.ANALYSIS, AppStage.APPOINTMENT, AppStage.SYNTHESIS].map((s, idx) => (
                <React.Fragment key={s}>
                  <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    stage === s ? 'bg-[#B40101] w-12' : 'bg-gray-200'
                  }`} />
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <h1 className="text-5xl font-[900] text-black tracking-tight leading-none uppercase">
                {stage === AppStage.GATHERING && "Gathering"}
                {stage === AppStage.ANALYSIS && "Gap Analysis"}
                {stage === AppStage.APPOINTMENT && "Appointment"}
                {stage === AppStage.SYNTHESIS && "Summary"}
              </h1>
              {stage !== AppStage.GATHERING && (
                <button 
                  onClick={() => {
                    if (stage === AppStage.ANALYSIS) setStage(AppStage.GATHERING);
                    if (stage === AppStage.APPOINTMENT) setStage(AppStage.ANALYSIS);
                    if (stage === AppStage.SYNTHESIS) setStage(AppStage.APPOINTMENT);
                  }}
                  className="p-3 rounded-full hover:bg-white transition-colors text-gray-400 hover:text-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                </button>
              )}
            </div>
          </header>

          {/* Logic Machine Stages */}
          <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-xl shadow-gray-200/50 border border-gray-100">
            {stage === AppStage.GATHERING && (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 group hover:border-[#B40101] transition-all">
                  <div className="flex-1">
                    <h3 className="text-2xl font-[900] text-black tracking-tight mb-2">SCAN PRODUCTION PRINT</h3>
                    <p className="text-gray-500 text-sm font-medium">Auto-fill 14 production fields using AI scanning technology.</p>
                  </div>
                  <label className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-black cursor-pointer hover:bg-[#B40101] transition-all shadow-xl shadow-gray-200 uppercase tracking-widest text-xs">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Upload Image
                    <input type="file" className="hidden" accept="image/*" onChange={handleScanPrint} />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(EMPTY_AGENT_DATA).map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                        {key.replace(/([A-Z])/g, ' $1')} {key === 'agentName' && <span className="text-[#B40101]">*</span>}
                      </label>
                      <input 
                        type="text" 
                        placeholder={key.replace(/([A-Z])/g, ' $1')}
                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#B40101] focus:bg-white transition-all outline-none font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-medium"
                        value={(agentData as any)[key]}
                        onChange={(e) => handleInputChange(key as keyof AgentData, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-6">
                  <button 
                    onClick={proceedToAnalysis}
                    className="group flex items-center gap-3 px-12 py-5 bg-[#B40101] text-white rounded-2xl font-[900] text-lg shadow-2xl shadow-red-200 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tight"
                  >
                    Analyze Business
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                </div>
              </div>
            )}

            {stage === AppStage.ANALYSIS && analysis && (
              <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-500">
                <div className="flex flex-col gap-8">
                  <div className="max-w-[85%] self-start">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B40101] mb-2 px-6">Consultant Analysis</h3>
                    <div className="p-8 rounded-[2rem] rounded-tl-none bg-gray-50 border border-gray-100 shadow-sm">
                      <p className="text-xl font-medium text-gray-800 leading-relaxed italic">
                        "{analysis.gapAnalysis}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Consulting Strategy Questions</h3>
                    <div className="grid gap-3">
                      {analysis.recruitingQuestions.map((q, i) => (
                        <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-white border-2 border-gray-50 hover:border-[#B40101]/20 transition-all">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#B40101] text-white flex items-center justify-center text-xs font-black">
                            {i + 1}
                          </span>
                          <p className="font-bold text-lg text-black">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-black text-white">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">Resource Center</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {RESOURCES.map((res, i) => (
                        <a 
                          key={i} 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-[#B40101] hover:bg-gray-800 transition-all group"
                        >
                          <span className="text-xs font-bold uppercase tracking-tight text-gray-400 group-hover:text-white">{res.title}</span>
                          <svg className="w-4 h-4 text-gray-600 group-hover:text-[#B40101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-10 border-t border-gray-100">
                  <button 
                    onClick={() => setStage(AppStage.APPOINTMENT)}
                    className="px-12 py-5 bg-black text-white rounded-2xl font-[900] text-lg shadow-xl hover:scale-[1.02] transition-all uppercase tracking-tight"
                  >
                    Start Appointment
                  </button>
                </div>
              </div>
            )}

            {stage === AppStage.APPOINTMENT && (
              <div className="space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-[900] text-black uppercase tracking-tight">Meeting Context</h2>
                  <p className="text-gray-500 font-medium">Capture breakthroughs, whiteboard photos, or audio transcripts.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Meeting Notes</label>
                    <textarea 
                      placeholder="Type breakthroughs, commitments, or 'aha' moments here..."
                      className="w-full h-80 p-8 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-[#B40101] focus:bg-white transition-all outline-none font-medium text-lg text-gray-700 resize-none"
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Whiteboard / Visuals</label>
                    <div className="relative h-80 rounded-[2rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center p-8 text-center group hover:border-[#B40101] transition-all bg-gray-50/50 overflow-hidden">
                      {noteImage ? (
                        <>
                          <img src={`data:image/jpeg;base64,${noteImage}`} alt="Note" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                          <button onClick={() => setNoteImage(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg text-[#B40101]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                          <div className="relative z-10 bg-white/80 backdrop-blur-sm p-4 rounded-2xl font-black text-black text-xs uppercase">Photo Captured</div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center text-[#B40101] group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          </div>
                          <div>
                            <p className="font-[900] text-black text-sm tracking-tight uppercase">Upload Whiteboard</p>
                            <p className="text-gray-400 text-xs mt-1">AI will extract key concepts</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleNoteImageUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={proceedToSynthesis}
                    disabled={!appointmentNotes.trim() && !noteImage}
                    className="px-12 py-5 bg-[#B40101] disabled:bg-gray-200 text-white rounded-2xl font-[900] text-lg shadow-2xl shadow-red-200 hover:scale-[1.02] transition-all uppercase tracking-tight"
                  >
                    Generate Executive Summary
                  </button>
                </div>
              </div>
            )}

            {stage === AppStage.SYNTHESIS && synthesis && (
              <div className="space-y-12 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#B40101] px-1">Current Structure</h3>
                      <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 font-bold text-gray-700 leading-relaxed text-lg">
                        {synthesis.currentStructure}
                      </div>
                    </section>
                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#B40101] px-1">Primary Gaps</h3>
                      <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 font-bold text-gray-700 leading-relaxed text-lg">
                        {synthesis.primaryGaps}
                      </div>
                    </section>
                  </div>
                  <div className="space-y-8">
                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-green-600 px-1">Breakthroughs</h3>
                      <div className="p-8 rounded-[2rem] bg-green-50 border border-green-100 font-[900] text-gray-900 leading-relaxed text-lg">
                        {synthesis.breakthroughs}
                      </div>
                    </section>
                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 px-1">Next Actions</h3>
                      <div className="p-8 rounded-[2rem] bg-blue-50 border border-blue-100 font-[900] text-gray-900 leading-relaxed text-lg">
                        {synthesis.nextActions}
                      </div>
                    </section>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center pt-10 border-t border-gray-100">
                  <button 
                    onClick={() => exportToPDF(agentData, synthesis)}
                    className="flex-1 max-w-xs py-5 bg-black text-white rounded-2xl font-[900] text-lg shadow-xl hover:bg-gray-800 transition-all uppercase tracking-tight flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Export PDF
                  </button>
                  <button 
                    onClick={copyForCommand}
                    className="flex-1 max-w-xs py-5 bg-gray-100 text-black rounded-2xl font-[900] text-lg hover:bg-gray-200 transition-all uppercase tracking-tight flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                    Command Notes
                  </button>
                </div>
              </div>
            )}
          </div>

          <footer className="text-center py-12">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">KW Consulting Assistant Pro v2.0</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
