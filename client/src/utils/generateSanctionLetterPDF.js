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

export const generateSanctionLetterPDF = async (application) => {
  if (!application) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryDark = [10, 25, 47]; // #0A192F (Deep Navy)
  const accentBlue = [37, 99, 235]; // #2563EB (Royal Blue)
  const bgLight = [248, 250, 252]; // #F8FAFC
  const borderLight = [226, 232, 240];
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139];

  // Load FinSure Logo
  const logoObj = await loadLogoBase64('/logo.png');

  // 1. Executive Top Header Banner
  doc.setFillColor(...primaryDark);
  doc.rect(0, 0, 210, 42, 'F');

  if (logoObj && logoObj.dataUrl) {
    const logoW = 24;
    const logoH = (logoObj.height / logoObj.width) * logoW;
    doc.addImage(logoObj.dataUrl, 'PNG', 14, 9, logoW, Math.min(logoH, 24));
  } else {
    doc.setFillColor(...accentBlue);
    doc.roundedRect(14, 9, 26, 24, 2, 2, 'F');
    doc.setFont('helvetica', 'black');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('FS', 20, 25);
  }

  const textLeft = logoObj ? 42 : 46;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FinSure Solutions Pvt. Ltd.', textLeft, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(191, 219, 254);
  doc.text('OFFICIAL CREDIT SANCTION LETTER & AGREEMENT', textLeft, 25);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('FinSure Credit Risk & Underwriting Division', textLeft, 31);

  // Top Right Metadata Box
  const dateStr = application.sanctionedAt ? new Date(application.sanctionedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const sanctionRef = application.sanctionRefNumber || `SNC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  doc.setFillColor(255, 255, 255, 0.1);
  doc.roundedRect(144, 10, 52, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SANCTION METADATA', 148, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Sanction Date: ${dateStr}`, 148, 21);
  doc.text(`Ref No: ${sanctionRef}`, 148, 26);

  doc.setFillColor(...accentBlue);
  doc.rect(0, 42, 210, 2, 'F');

  // 2. Salutation & Applicant Details Card
  let currentY = 52;
  const applicantName = application.applicantDetails?.fullName || application.citizenId?.name || 'Valued Applicant';
  const city = application.applicantDetails?.city || 'Lucknow';
  const pincode = application.applicantDetails?.pincode || '226010';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text(`To, ${applicantName}`, 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text(`Address: ${application.applicantDetails?.address || 'Gomti Nagar'}, ${city}, ${application.applicantDetails?.state || 'UP'} - ${pincode}`, 14, currentY + 6);
  doc.text(`Application ID: ${application.applicationId}  |  PAN: ${application.applicantDetails?.panNumber || 'N/A'}`, 14, currentY + 11);

  // Subject line
  currentY += 18;
  doc.setFillColor(...bgLight);
  doc.roundedRect(14, currentY, 182, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...accentBlue);
  doc.text(`SUBJECT: SANCTION APPROVAL FOR ${ (application.loanProductId?.name || 'LOAN SCHEME').toUpperCase() }`, 18, currentY + 6.5);

  // 3. Approved Terms Financial Breakdown Table
  currentY += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text('Approved Sanction Financial Terms', 14, currentY);

  const approvedAmt = application.approvedAmount || application.amount || 250000;
  const tenure = application.approvedTenureMonths || application.tenureMonths || 24;
  const rate = application.loanProductId?.interestRate || 10.5;

  // Calculate Monthly EMI (Principal + Interest formula)
  const r = rate / (12 * 100);
  const emi = Math.round((approvedAmt * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1));

  const termsData = [
    { label: 'Approved Loan Sanction Amount', val: `₹${Number(approvedAmt).toLocaleString('en-IN')}` },
    { label: 'Sanctioned Loan Tenure', val: `${tenure} Months` },
    { label: 'Annual Interest Rate (p.a.)', val: `${rate}% Reducing Balance` },
    { label: 'Equated Monthly Instalment (EMI)', val: `₹${Number(emi).toLocaleString('en-IN')} / month` },
    { label: 'Processing Fee & Administrative Charges', val: '₹1,500 (Inclusive of GST)' },
    { label: 'Sanction Validity Period', val: '30 Days from Sanction Date' },
  ];

  let termY = currentY + 4;
  doc.setFillColor(...primaryDark);
  doc.roundedRect(14, termY, 182, 8, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SANCTION PARAMETER', 18, termY + 5.5);
  doc.text('APPROVED VALUE', 130, termY + 5.5);

  termY += 8;
  termsData.forEach((row, i) => {
    const isEven = i % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(14, termY, 182, 8.5, 'F');
    doc.setDrawColor(...borderLight);
    doc.line(14, termY + 8.5, 196, termY + 8.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    doc.text(row.label, 18, termY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...accentBlue);
    doc.text(row.val, 130, termY + 5.5);

    termY += 8.5;
  });

  // 4. Disbursal Bank Account Box (If accepted)
  currentY = termY + 6;
  if (application.disbursementAccountDetails && application.disbursementAccountDetails.accountNumber) {
    const bankDetails = application.disbursementAccountDetails;
    doc.setFillColor(...bgLight);
    doc.roundedRect(14, currentY, 182, 20, 3, 3, 'F');
    doc.setDrawColor(...borderLight);
    doc.roundedRect(14, currentY, 182, 20, 3, 3, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.text('Confirmed Disbursal Bank Account Details:', 20, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(`Bank: ${bankDetails.bankName || 'HDFC Bank'}  |  A/C Holder: ${bankDetails.accountHolderName || applicantName}`, 20, currentY + 12);
    doc.text(`Account No: ${bankDetails.accountNumber}  |  IFSC Code: ${bankDetails.ifscCode}`, 20, currentY + 17);

    currentY += 24;
  }

  // 5. Terms & Conditions Paragraph
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  doc.text('Standard Sanction Terms & Conditions:', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  const termsList = [
    '1. Monthly repayment EMIs will be automatically debited on the 5th calendar day of each month.',
    '2. FinSure Solutions reserves the right to recall the loan in case of fraudulent documentation or misrepresentation.',
    '3. Premature repayment / zero-cost foreclosure is permitted after successful payment of 6 initial EMIs.',
    '4. Disbursal is subject to final document verification and execution of loan agreement terms.',
  ];

  termsList.forEach((line, i) => {
    doc.text(line, 14, currentY + 6 + i * 5);
  });

  // 6. Signatory & Digital Seal Block
  const sealY = currentY + 28;
  doc.setFillColor(...bgLight);
  doc.roundedRect(14, sealY, 182, 26, 3, 3, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(14, sealY, 182, 26, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text('Authorized Signatory', 20, sealY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('FinSure Credit Approval Committee', 20, sealY + 14);
  doc.text(`Assigned Regional Branch: ${application.branchId?.branchName || 'Lucknow Branch'}`, 20, sealY + 19);

  // Digital Seal Badge
  doc.setDrawColor(...accentBlue);
  doc.roundedRect(142, sealY + 4, 48, 18, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...accentBlue);
  doc.text('SANCTION APPROVED', 145, sealY + 11);
  doc.setFontSize(6.5);
  doc.setTextColor(...textMuted);
  doc.text('DIGITALLY SIGNED & VERIFIED', 144, sealY + 16);

  // 7. Footer
  const footerY = 282;
  doc.setDrawColor(...borderLight);
  doc.line(14, footerY, 196, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);
  doc.text('FinSure Solutions Pvt. Ltd.', 14, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text(' | Corporate Office: Vibhuti Khand, Lucknow, UP | Helpline: 1800-FINSURE', 48, footerY + 5);
  doc.text('Page 1 of 1', 196, footerY + 5, { align: 'right' });

  // Save PDF
  const filename = `FinSure_Sanction_Letter_${application.applicationId}_${sanctionRef}.pdf`;
  doc.save(filename);
};
