// components/MetricsSection.js
import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const MetricsSection = ({ resumeData }) => {
  const [overallScore, setOverallScore] = useState(0);
  const [sectionScores, setSectionScores] = useState({});

  const sections = [
    { name: 'Contact Information', key: 'contactInformation' },
    { name: 'Professional Summary', key: 'professionalSummary' },
    { name: 'Work Experience', key: 'workExperience' },
    { name: 'Education', key: 'education' },
    { name: 'Skills', key: 'skills' },
    { name: 'Projects', key: 'projects' },
    { name: 'Certifications', key: 'certifications' },
  ];

  const fieldChecks = {
    contactInformation: ['firstName', 'lastName', 'email', 'phoneNo', 'linkedin'],
    professionalSummary: ['summary'],
    workExperience: ['companyName', 'designation', 'fromDate', 'toDate', 'description'],
    education: ['school', 'degree', 'field_of_study', 'start_date', 'end_date'],
    skills: ['skill'],
    projects: ['project_name', 'description', 'start_date', 'end_date'],
    certifications: ['certification', 'provider', 'awarded_date'],
  };

  const fieldLabels = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phoneNo: 'Phone Number',
    linkedin: 'LinkedIn Profile',
    summary: 'Professional Summary',
    companyName: 'Company Name',
    designation: 'Position',
    fromDate: 'Start Date',
    toDate: 'End Date',
    description: 'Description',
    school: 'School Name',
    degree: 'Degree',
    field_of_study: 'Field of Study',
    start_date: 'Start Date',
    end_date: 'End Date',
    skill: 'Skills',
    project_name: 'Project Name',
    certification: 'Certification Name',
    provider: 'Certification Provider',
    awarded_date: 'Certification Date',
  };

  useEffect(() => {
    const scores = {};
    let totalScore = 0;

    sections.forEach(section => {
      const { score, feedback } = calculateSectionScore(resumeData[section.key], section.key);
      scores[section.key] = { score, feedback };
      totalScore += score;
    });

    setSectionScores(scores);
    setOverallScore(Math.round((totalScore / sections.length) * 100));
  }, [resumeData]);

  const calculateSectionScore = (sectionData, sectionKey) => {
    if (!sectionData) return { score: 0, feedback: ['Section is empty'] };

    const fields = fieldChecks[sectionKey];
    let filledFields = 0;
    const feedback = [];

    if (sectionKey === 'contactInformation') {
      filledFields = fields.filter(field => 
        sectionData.contactInformation && 
        sectionData.contactInformation[field] && 
        (Array.isArray(sectionData.contactInformation[field]) 
          ? sectionData.contactInformation[field].length > 0 
          : sectionData.contactInformation[field].trim() !== '')
      ).length;
      fields.forEach(field => {
        if (!sectionData.contactInformation || 
            !sectionData.contactInformation[field] || 
            (Array.isArray(sectionData.contactInformation[field]) 
              ? sectionData.contactInformation[field].length === 0 
              : sectionData.contactInformation[field].trim() === '')) {
          feedback.push(`Add ${fieldLabels[field]}`);
        }
      });
    } else if (sectionKey === 'professionalSummary') {
      filledFields = sectionData.professionalSummary && sectionData.professionalSummary.summary ? 1 : 0;
      if (!sectionData.professionalSummary || !sectionData.professionalSummary.summary) {
        feedback.push('Add Professional Summary');
      }
    } else if (Array.isArray(sectionData)) {
      // For array sections (like work experience, education, projects, certifications)
      if (sectionData.length === 0) {
        feedback.push(`Add at least one ${sectionKey.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} entry`);
      } else {
        const totalFields = fields.length * sectionData.length;
        filledFields = sectionData.reduce((acc, item) => {
          return acc + fields.filter(field => item[field] && item[field].toString().trim() !== '').length;
        }, 0);
        fields.forEach(field => {
          if (sectionData.every(item => !item[field] || item[field].toString().trim() === '')) {
            feedback.push(`Add ${fieldLabels[field]}`);
          }
        });
      }
    } else if (sectionKey === 'skills') {
      const skillCount = sectionData.length;
      filledFields = Math.min(skillCount, 5);
      if (skillCount < 5) {
        feedback.push(`Add ${5 - skillCount} more skill${skillCount === 4 ? '' : 's'} (minimum 5 skills recommended)`);
      }
    }

    let score;
    if (sectionKey === 'skills') {
      score = Math.min(filledFields / 5, 1);
    } else {
      score = fields.length > 0 ? filledFields / (Array.isArray(sectionData) ? fields.length * Math.max(sectionData.length, 1) : fields.length) : 0;
    }

    return { score, feedback };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Resume Metrics</h2>
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/4 px-2 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg h-full flex flex-col items-center justify-center">
            <div className="w-32 h-32 mb-4">
              <CircularProgressbar
                value={overallScore}
                text={`${overallScore}%`}
                styles={buildStyles({
                  textSize: '16px',
                  pathColor: `rgba(62, 152, 199, ${overallScore / 100})`,
                  textColor: '#3e98c7',
                  trailColor: '#d6d6d6',
                })}
              />
            </div>
            <p className="text-center font-semibold">Overall Completion</p>
          </div>
        </div>
        <div className="w-full md:w-3/4 px-2">
          <div className="bg-blue-50 p-4 rounded-lg">
            {sections.map((section) => (
              <div key={section.key} className="mb-6 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold">{section.name}</span>
                  <span className="text-sm font-semibold">
                    {sectionScores[section.key] ? Math.round(sectionScores[section.key].score * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${sectionScores[section.key] ? sectionScores[section.key].score * 100 : 0}%` }}
                  ></div>
                </div>
                {sectionScores[section.key] && sectionScores[section.key].feedback.length > 0 && (
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {sectionScores[section.key].feedback.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;