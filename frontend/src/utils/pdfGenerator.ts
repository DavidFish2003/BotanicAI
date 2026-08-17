import type { PlantCardData } from '../types';

export const generatePlantReportPDF = async (card: PlantCardData): Promise<void> => {
  // Check for jsPDF in window (loaded via CDN)
  let jsPDFClass = (window as any).jspdf?.jsPDF || (window as any).jsPDF;

  if (!jsPDFClass) {
    // Dynamic import fallback or wait for script load
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        jsPDFClass = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load PDF generation engine.'));
      document.head.appendChild(script);
    });
  }

  if (!jsPDFClass) {
    throw new Error('PDF generator is unavailable.');
  }

  const doc = new jsPDFClass({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  let y = margin;
  let currentPage = 1;

  // Helper to draw faint background watermark and page decorations into the BACKGROUND layer
  const drawBackgroundWatermark = () => {
    try {
      doc.saveGraphicsState?.();
      
      // Use low opacity GState if available
      if ((doc as any).GState) {
        const faintGState = new (doc as any).GState({ opacity: 0.045 });
        doc.setGState(faintGState);
      }

      // Draw faint BotanicAI background watermark
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(68);
      doc.setTextColor(16, 185, 129); // Faint emerald tint
      
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;

      doc.text('BotanicAI', centerX, centerY - 10, {
        align: 'center',
        angle: 35,
      });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(5, 150, 105);
      doc.text('The Search Engine For Plant Biochemistry', centerX, centerY + 12, {
        align: 'center',
        angle: 35,
      });

      // Restore graphics state to 100% opacity for foreground content
      doc.restoreGraphicsState?.();
      if ((doc as any).GState) {
        const fullGState = new (doc as any).GState({ opacity: 1.0 });
        doc.setGState(fullGState);
      }
    } catch {
      // Fallback if GState not supported
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(68);
      doc.setTextColor(240, 247, 243);
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      doc.text('BotanicAI', centerX, centerY, { align: 'center', angle: 35 });
    }
  };

  // Helper to add footer to pages at the end
  const applyFooters = () => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 160);
      
      // Footer divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.text(
        `BotanicAI Plant Biochemistry Dossier • Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
        margin,
        pageHeight - 6
      );
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
    }
  };

  const addNewPage = () => {
    doc.addPage();
    currentPage++;
    y = margin;
    drawBackgroundWatermark();
  };

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - 18) {
      addNewPage();
      return true;
    }
    return false;
  };

  // --- INITIALIZE PAGE 1 BACKGROUND ---
  drawBackgroundWatermark();

  // --- HEADER BANNER ---
  // Background Header Box with Deep Emerald Accent
  doc.setFillColor(10, 26, 17);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  // Title Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(52, 211, 153);
  doc.text('BotanicAI', margin + 6, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(248, 250, 252);
  doc.text(': The Search Engine For Plant Biochemistry', margin + 37, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Comprehensive Pharmacological Dossier & Peer-Reviewed Literature Synthesis', margin + 6, y + 18);

  y += 32;

  // --- PLANT OVERVIEW CARD ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(209, 250, 229);
  doc.roundedRect(margin, y, contentWidth, 42, 3, 3, 'FD');

  // Green accent bar on left edge of summary card
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin, y, 3, 42, 1, 1, 'F');

  // Botanical Species Name
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(card.plant_name, margin + 7, y + 9);

  // Morphology / Plant Part Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin + 7, y + 13, 38, 6.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(card.plant_part.toUpperCase(), margin + 26, y + 17.5, { align: 'center' });

  // Confidence Indicator & Paper Count
  const confidencePercent = Math.round(card.confidence_score * 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105);
  doc.text(`Evidence Confidence: ${confidencePercent}%`, margin + 49, y + 17.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Mined Publications: ${card.paper_count} papers`, margin + 115, y + 17.5);

  // Extract Types
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Extract Types:', margin + 7, y + 26);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const extractText = card.extract_types && card.extract_types.length > 0
    ? card.extract_types.join(', ')
    : 'Standard phytochemical extractions';
  doc.text(extractText, margin + 31, y + 26);

  // Reported Bioactivities
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Bioactivities:', margin + 7, y + 34);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 115, 80);
  const bioText = card.bioactivities.join(' • ');
  const splitBio = doc.splitTextToSize(bioText, contentWidth - 38);
  doc.text(splitBio, margin + 31, y + 34);

  y += 48;

  // --- ACTIVE PHYTOCHEMICALS SECTION ---
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Active Phytochemicals', margin, y);
  y += 4;

  doc.setDrawColor(52, 211, 153);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  if (card.bioactive_compounds && card.bioactive_compounds.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(30, 41, 59);

    const compoundsText = card.bioactive_compounds.join(', ');
    const splitCompounds = doc.splitTextToSize(compoundsText, contentWidth);

    // Draw light box container around active compounds
    const boxHeight = splitCompounds.length * 4.8 + 6;
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'F');

    doc.text(splitCompounds, margin + 4, y + 5);
    y += boxHeight + 6;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No specific individual phytochemical isolate listed in extracted records.', margin, y);
    y += 10;
  }

  // --- PHYTOCHEMICAL MOLECULAR PROFILES TABLE ---
  if (card.compound_details && card.compound_details.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Phytochemical Molecular Profiles (${card.compound_details.length})`, margin, y);
    y += 4;

    doc.setDrawColor(52, 211, 153);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;

    // Table Header
    doc.setFillColor(235, 245, 240);
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 23, 42);
    doc.text('Compound Name', margin + 4, y + 4.8);
    doc.text('PubChem CID', margin + 62, y + 4.8);
    doc.text('Formula', margin + 98, y + 4.8);
    doc.text('Molecular Weight', margin + 138, y + 4.8);
    y += 8.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);

    for (const comp of card.compound_details) {
      checkPageBreak(8);

      doc.setFont('helvetica', 'bold');
      doc.text(comp.name, margin + 4, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.text(comp.cid ? `CID ${comp.cid}` : '—', margin + 62, y + 4);
      doc.text(comp.molecular_formula || '—', margin + 98, y + 4);
      doc.text(comp.molecular_weight ? `${comp.molecular_weight} g/mol` : '—', margin + 138, y + 4);

      doc.setDrawColor(240, 240, 240);
      doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
      y += 7;
    }
    y += 4;
  }

  // --- SUPPORTING SCIENTIFIC PUBLICATIONS SECTION ---
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Supporting Scientific Publications (${card.papers.length})`, margin, y);
  y += 4;

  doc.setDrawColor(52, 211, 153);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 7;

  for (let i = 0; i < card.papers.length; i++) {
    const item = card.papers[i];
    const paper = item.paper;

    // Height check for start of paper entry
    checkPageBreak(28);

    // Publication Number & Full Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const titleText = `${i + 1}. ${paper.title || 'Untitled Publication'}`;
    const titleLines = doc.splitTextToSize(titleText, contentWidth);
    
    doc.text(titleLines, margin, y);
    y += titleLines.length * 4.3 + 1;

    // Metadata line (Journal, Year, Source, DOI)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(5, 150, 105);

    let xCursor = margin;

    // Journal
    if (paper.journal) {
      doc.setFont('helvetica', 'bolditalic');
      doc.text(paper.journal, xCursor, y);
      xCursor += doc.getTextWidth(paper.journal) + 3;
      doc.setFont('helvetica', 'normal');
      doc.text('•', xCursor, y);
      xCursor += 4;
    }

    // Year
    if (paper.year) {
      doc.text(`Year: ${paper.year}`, xCursor, y);
      xCursor += doc.getTextWidth(`Year: ${paper.year}`) + 3;
      doc.text('•', xCursor, y);
      xCursor += 4;
    }

    // Source
    if (paper.source) {
      doc.text(`Source: ${paper.source}`, xCursor, y);
      xCursor += doc.getTextWidth(`Source: ${paper.source}`) + 3;
    }

    y += 4.5;

    // DOI Active Clickable Link
    if (paper.doi || paper.url) {
      const cleanDoi = paper.doi ? paper.doi.replace(/^https?:\/\/doi\.org\//i, '') : null;
      const targetUrl = paper.url || (cleanDoi ? `https://doi.org/${cleanDoi}` : null);

      if (targetUrl) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(6, 182, 212); // Cyan link color

        const linkLabel = cleanDoi ? `https://doi.org/${cleanDoi}` : targetUrl;
        const displayLink = linkLabel.length > 70 ? linkLabel.slice(0, 67) + '...' : linkLabel;
        
        doc.text(`DOI / Link: ${displayLink}`, margin, y);

        // Add clickable hyperlinked area
        const linkWidth = doc.getTextWidth(`DOI / Link: ${displayLink}`);
        try {
          if ((doc as any).textWithLink) {
            (doc as any).textWithLink(`DOI / Link: ${displayLink}`, margin, y, { url: targetUrl });
          } else if ((doc as any).link) {
            (doc as any).link(margin, y - 3, linkWidth, 4, { url: targetUrl });
          }
        } catch {
          // Fallback if link function unavailable
        }

        y += 4.5;
      }
    }

    // Authors List
    if (paper.authors && paper.authors.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.8);
      doc.setTextColor(100, 116, 139);
      const authorsText = `Authors: ${paper.authors.join(', ')}`;
      const authorLines = doc.splitTextToSize(authorsText, contentWidth);
      
      for (const line of authorLines) {
        checkPageBreak(5);
        doc.text(line, margin, y);
        y += 3.8;
      }
      y += 1;
    }

    // Complete Abstract Rendering with Smart Multi-page Wrapping
    if (paper.abstract && paper.abstract.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(51, 65, 85);

      const abstractIndent = 3;
      const abstractWidth = contentWidth - abstractIndent - 2;
      const fullAbstractLines = doc.splitTextToSize(paper.abstract.trim(), abstractWidth);

      checkPageBreak(12);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('Abstract:', margin, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(51, 65, 85);

      // Render lines chunk by chunk, ensuring seamless page breaks if abstract is lengthy
      for (let l = 0; l < fullAbstractLines.length; l++) {
        if (y > pageHeight - 18) {
          addNewPage();
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.8);
          doc.setTextColor(51, 65, 85);
        }

        // Draw left emerald margin indicator line for abstract container
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.4);
        doc.line(margin + 1, y - 3, margin + 1, y + 1);

        doc.text(fullAbstractLines[l], margin + abstractIndent, y);
        y += 3.8;
      }
      y += 3;
    }

    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;
  }

  // --- APPLY FOOTERS & PAGE NUMBERS TO ALL PAGES ---
  applyFooters();

  // Save PDF
  const safeSpecies = card.plant_name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePart = card.plant_part.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${safeSpecies}_${safePart}_BotanicAI_Report.pdf`);
};
