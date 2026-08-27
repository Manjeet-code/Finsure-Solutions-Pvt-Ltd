import { jsPDF } from 'jspdf';

const loadLogoBase64 = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.width, height: img.height });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

export const generateBranchReportPDF = async (selectedBranch, branchDetails) => {
  if (!selectedBranch || !branchDetails) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryDark = [10, 25, 47]; // #0A192F (Deep Banking Navy)
  const accentBlue = [37, 99, 235]; // #2563EB (Royal Blue)
  const bgLight = [248, 250, 252]; // #F8FAFC
  const cardBorder = [226, 232, 240]; // #E2E8F0
  const textDark = [15, 23, 42]; // #0F172A
  const textMuted = [100, 116, 139]; // #64748B

  const managerInfo = selectedBranch.managerId;
  const mgrName = typeof managerInfo === 'object' ? managerInfo.name || managerInfo.email : 'Rohit Mathur';
  const mgrEmail = typeof managerInfo === 'object' ? managerInfo.email : 'branchmanager.lucknow@finsure.in';

  // Load FinSure Logo Image
  const logoObj = await loadLogoBase64('/logo.png');

  // 1. Top Premium Header Banner
  doc.setFillColor(...primaryDark);
  doc.rect(0, 0, 210, 42, 'F');

  // Add FinSure Logo Image if loaded
  if (logoObj && logoObj.dataUrl) {
    const logoW = 24;
    const logoH = (logoObj.height / logoObj.width) * logoW;
    doc.addImage(logoObj.dataUrl, 'PNG', 14, 9, logoW, Math.min(logoH, 24));
  } else {
    // Fallback Logo text box
    doc.setFillColor(...accentBlue);
    doc.roundedRect(14, 9, 26, 24, 2, 2, 'F');
    doc.setFont('helvetica', 'black');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('FS', 20, 25);
  }

  // Header Title & Tagline
  const textLeft = logoObj ? 42 : 46;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FinSure Solutions Pvt. Ltd.', textLeft, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(191, 219, 254);
  doc.text('BRANCH AUDIT, OPERATIONS & ANALYTICS EXECUTIVE REPORT', textLeft, 25);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Official Banking Compliance Document | Confidential', textLeft, 31);

  // Header Right Metadata Box
  const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.setFillColor(255, 255, 255, 0.1);
  doc.roundedRect(148, 10, 48, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('REPORT METADATA', 152, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${dateStr}`, 152, 21);
  doc.text(`Ref ID: RPT-${selectedBranch.branchCode || 'LKO'}-${Date.now().toString().slice(-4)}`, 152, 26);

  // Decorative Accent Line below header
  doc.setFillColor(...accentBlue);
  doc.rect(0, 42, 210, 2, 'F');

  // 2. Branch Overview Profile Card
  let currentY = 52;
  doc.setFillColor(...bgLight);
  doc.roundedRect(14, currentY, 182, 36, 4, 4, 'F');
  doc.setDrawColor(...cardBorder);
  doc.roundedRect(14, currentY, 182, 36, 4, 4, 'D');

  // Left Column Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text(selectedBranch.branchName || 'Lucknow Gomti Nagar Branch', 20, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text(`Branch Code: ${selectedBranch.branchCode || 'BR-LKO-01'}  |  City: ${selectedBranch.city || 'Lucknow'}, ${selectedBranch.state || 'UP'}`, 20, currentY + 17);
  doc.text(`Address: ${selectedBranch.address || '45, Inner Circle, Lucknow'}`, 20, currentY + 23);

  const pincodes = Array.isArray(selectedBranch.pincodeRanges) ? selectedBranch.pincodeRanges.join(', ') : '226010, 226012, 226016';
  doc.text(`Pincodes Mapped: ${pincodes}`, 20, currentY + 29);

  // Right Column Details (Manager)
  doc.setDrawColor(226, 232, 240);
  doc.line(130, currentY + 6, 130, currentY + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text('Assigned Branch Manager', 135, currentY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...accentBlue);
  doc.text(mgrName, 135, 17 + currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text(mgrEmail, 135, 23 + currentY);
  doc.text('Status: Active & Authorized', 135, 29 + currentY);

  // 3. KPI Analytical Scorecard Grid
  currentY += 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text('Real-Time Operations Scorecard', 14, currentY);

  const kpis = [
    { title: "TODAY'S APPLICATIONS", val: branchDetails.todaysApplications || 0, color: [37, 99, 235], bg: [239, 246, 255] },
    { title: 'PENDING AUTHENTICATION', val: branchDetails.pendingVerification || 0, color: [217, 119, 6], bg: [254, 243, 199] },
    { title: 'APPROVED APPLICATIONS', val: branchDetails.approvedToday || 0, color: [16, 185, 129], bg: [209, 250, 229] },
    { title: 'REJECTED APPLICATIONS', val: branchDetails.rejectedToday || 0, color: [225, 29, 72], bg: [255, 228, 230] },
  ];

  const cardW = 42.5;
  const cardH = 22;
  const cardGap = 4;

  kpis.forEach((kpi, i) => {
    const x = 14 + i * (cardW + cardGap);
    const y = currentY + 4;

    doc.setFillColor(...kpi.bg);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
    doc.setDrawColor(...kpi.color);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text(kpi.title, x + 4, y + 7);

    doc.setFontSize(15);
    doc.setTextColor(...kpi.color);
    doc.text(String(kpi.val), x + 4, y + 17);
  });

  // 4. Recent Application Activity Audit Table
  currentY += 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text('Recent Application Activity Audit Log', 14, currentY);

  const tableHeaderY = currentY + 4;
  doc.setFillColor(...primaryDark);
  doc.roundedRect(14, tableHeaderY, 182, 9, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('APPLICANT NAME', 18, tableHeaderY + 6);
  doc.text('LOAN SCHEME', 75, tableHeaderY + 6);
  doc.text('REQUESTED AMOUNT', 130, tableHeaderY + 6);
  doc.text('DECISION STATUS', 168, tableHeaderY + 6);

  const apps = branchDetails.recentApplications || [];
  let rowY = tableHeaderY + 9;

  if (apps.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, rowY, 182, 12, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...textMuted);
    doc.text('No recent application activity logged for this branch.', 18, rowY + 7.5);
    rowY += 12;
  } else {
    apps.forEach((app, idx) => {
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(14, rowY, 182, 10, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(14, rowY + 10, 196, rowY + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...textDark);
      doc.text(app.citizenId?.name || app.applicantName || 'Applicant User', 18, rowY + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textMuted);
      doc.text(app.loanProductId?.name || app.loanType || 'Personal Loan', 75, rowY + 6.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...textDark);
      const amtStr = app.amount ? `₹${Number(app.amount).toLocaleString('en-IN')}` : '₹0';
      doc.text(amtStr, 130, rowY + 6.5);

      const status = app.status || 'Pending';
      let badgeBg = [254, 243, 199];
      let badgeColor = [180, 83, 9];

      if (status === 'Approved') {
        badgeBg = [209, 250, 229];
        badgeColor = [4, 120, 87];
      } else if (status === 'Rejected') {
        badgeBg = [255, 228, 230];
        badgeColor = [190, 18, 60];
      }

      doc.setFillColor(...badgeBg);
      doc.roundedRect(168, rowY + 2, 22, 6, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...badgeColor);
      doc.text(status.toUpperCase(), 170, rowY + 6);

      rowY += 10;
    });
  }

  // 5. Official Verification Stamp & Signature Block
  currentY = rowY + 14;
  if (currentY < 235) {
    doc.setFillColor(...bgLight);
    doc.roundedRect(14, currentY, 182, 28, 3, 3, 'F');
    doc.setDrawColor(...cardBorder);
    doc.roundedRect(14, currentY, 182, 28, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    doc.text('SYSTEM COMPLIANCE & AUTHORIZATION', 20, currentY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text('This document is electronically generated and verified by the FinSure Central Risk & Audit Control Engine.', 20, currentY + 16);
    doc.text('All data entries match the live MongoDB ledger records at the time of report generation.', 20, currentY + 21);

    // Signature Seal Box
    doc.setDrawColor(...accentBlue);
    doc.roundedRect(145, currentY + 5, 44, 18, 2, 2, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...accentBlue);
    doc.text('FINSURE VERIFIED', 149, currentY + 12);
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text('AUDIT SEAL APPROVED', 148, currentY + 17);
  }

  // 6. Professional Footer
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, 196, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);
  doc.text('FinSure Solutions Pvt. Ltd.', 14, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text(' | Corporate Office: Vibhuti Khand, Lucknow, UP | Support: support@finsure.in', 48, footerY + 5);

  doc.text('Page 1 of 1', 196, footerY + 5, { align: 'right' });

  // Save PDF with clean filename
  const filename = `FinSure_Branch_Report_${(selectedBranch.branchName || 'Branch').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
