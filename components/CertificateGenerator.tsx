import React from 'react';
import { UserInfo } from '../types';

interface CertificateGeneratorProps {
  userInfo: UserInfo;
  testTitle: string;
  score: number;
  completedAt: string;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  userInfo,
  testTitle,
  score,
  completedAt
}) => {
  const generateCertificateId = () => {
    const date = new Date(completedAt);
    const timestamp = date.getTime().toString();
    return `CERT-${userInfo.employeeId}-${timestamp.slice(-6)}`;
  };

  const downloadCertificate = () => {
    const certificateId = generateCertificateId();
    const completedDate = new Date(completedAt).toLocaleDateString();
    
    // Create certificate HTML content with large watermark
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Safety Training Certificate</title>
        <style>
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.4;
            color: #333;
            background: #fff;
            position: relative;
            overflow: hidden;
          }
          
          .certificate {
            width: 100%;
            min-height: 10in;
            border: 8px solid #2c5282;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            position: relative;
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          }
          
          /* Large Watermark overlaying student details */
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 120px;
            font-weight: bold;
            color: rgba(45, 82, 130, 0.15);
            z-index: 10;
            white-space: nowrap;
            pointer-events: none;
            font-family: Arial, sans-serif;
            letter-spacing: 8px;
          }
          
          .header {
            margin-bottom: 30px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2c5282;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          
          .certificate-title {
            font-size: 36px;
            font-weight: bold;
            color: #2d3748;
            margin: 20px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .awarded-to {
            font-size: 18px;
            color: #4a5568;
            margin: 20px 0 10px 0;
            font-style: italic;
          }
          
          .student-name {
            font-size: 42px;
            font-weight: bold;
            color: #2c5282;
            margin: 15px 0;
            border-bottom: 3px solid #2c5282;
            display: inline-block;
            padding-bottom: 5px;
            position: relative;
            z-index: 5;
          }
          
          .student-id {
            font-size: 20px;
            color: #4a5568;
            margin: 10px 0 30px 0;
            font-weight: bold;
            position: relative;
            z-index: 5;
          }
          
          .completion-text {
            font-size: 20px;
            color: #4a5568;
            margin: 30px 0 15px 0;
            line-height: 1.6;
          }
          
          .test-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c5282;
            margin: 15px 0;
            font-style: italic;
          }
          
          .score {
            font-size: 24px;
            font-weight: bold;
            color: #38a169;
            margin: 20px 0;
          }
          
          .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .signature-section {
            text-align: center;
            flex: 1;
          }
          
          .signature-line {
            border-top: 2px solid #2c5282;
            width: 200px;
            margin: 30px auto 10px auto;
          }
          
          .signature-title {
            font-size: 14px;
            color: #4a5568;
            font-weight: bold;
          }
          
          .certificate-info {
            text-align: right;
            flex: 1;
            font-size: 12px;
            color: #4a5568;
          }
          
          .date {
            font-weight: bold;
            color: #2c5282;
          }
          
          .cert-id {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #718096;
            margin-top: 5px;
          }
          
          @media print {
            body { background: white !important; }
            .certificate { box-shadow: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <!-- Large Watermark overlaying student name and ID -->
          <div class="watermark">BULLDOG GARAGE</div>
          
          <div class="header">
            <div class="company-name">🏭 Bulldog Garage</div>
            <div style="font-size: 16px; color: #718096; margin-top: 5px;">
              Professional Safety Training Program
            </div>
          </div>
          
          <div class="certificate-title">
            Certificate of Completion
          </div>
          
          <div class="awarded-to">This certifies that</div>
          
          <div class="student-name">${userInfo.firstName} ${userInfo.lastName}</div>
          
          <div class="student-id">Employee ID: ${userInfo.employeeId}</div>
          
          <div class="completion-text">
            has successfully completed the safety training course
          </div>
          
          <div class="test-title">"${testTitle}"</div>
          
          <div class="completion-text">
            and has demonstrated proficiency by achieving a score of
          </div>
          
          <div class="score">${score}% (PASSED)</div>
          
          <div class="footer">
            <div class="signature-section">
              <div class="signature-line"></div>
              <div class="signature-title">Safety Coordinator</div>
            </div>
            
            <div class="certificate-info">
              <div class="date">Date: ${completedDate}</div>
              <div class="cert-id">Certificate ID: ${certificateId}</div>
              <div style="margin-top: 10px; font-size: 10px;">
                This certificate verifies completion of mandatory safety training<br/>
                as required by workplace safety regulations.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create and download the certificate
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Safety_Certificate_${userInfo.lastName}_${userInfo.firstName}_${certificateId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={downloadCertificate}
      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
    >
      <i className="fas fa-certificate mr-2"></i>
      Download Certificate
    </button>
  );
};

export default CertificateGenerator;