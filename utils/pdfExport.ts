
import { jsPDF } from 'jspdf';
import { AgentData, SynthesisResult } from '../types';
import { COLORS } from '../constants';

export const exportToPDF = (agent: AgentData, synthesis: SynthesisResult) => {
  const doc = new jsPDF();
  const margin = 20;
  let cursorY = 40;

  // Header Background
  doc.setFillColor(180, 1, 1); // KW Red
  doc.rect(0, 0, 210, 30, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('KW CONSULTING ASSISTANT PRO', margin, 15);
  doc.setFontSize(12);
  doc.text(`Executive Summary for ${agent.agentName}`, margin, 22);

  // Content Formatting Helper
  const addSection = (title: string, content: string) => {
    if (cursorY > 260) {
      doc.addPage();
      cursorY = 20;
    }
    doc.setTextColor(180, 1, 1);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, margin, cursorY);
    cursorY += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const splitContent = doc.splitTextToSize(content, 170);
    doc.text(splitContent, margin, cursorY);
    cursorY += (splitContent.length * 6) + 12;
  };

  addSection('Current Structure', synthesis.currentStructure);
  addSection('Primary Gaps', synthesis.primaryGaps);
  addSection('Appointment Breakthroughs', synthesis.breakthroughs);
  addSection('Next Actions', synthesis.nextActions);

  doc.save(`KW_Consulting_Summary_${agent.agentName.replace(/\s+/g, '_')}.pdf`);
};

export const stripMarkdown = (text: string) => {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/### /g, '').replace(/## /g, '');
};
