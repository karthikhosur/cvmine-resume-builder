// components/ProfessionalSummary.js
import React, { useEffect, useState } from 'react';
import { PencilIcon, CheckIcon, XIcon, SparklesIcon } from '@heroicons/react/solid';

const ProfessionalSummary = ({ setSummaryJson, apiPayload, icon, summaryJson }) => {
  const [summary, setSummary] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState('');


  useEffect(() => {
    console.log(summaryJson)
    if (summaryJson?.professionalSummary?.summary) {
      setSummary(summaryJson.professionalSummary?.summary)
      setIsChecked(summaryJson.professionalSummary?.addSummary)

    }
  }, [summaryJson])

  const handleCheck = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);

    if (!checked) {
      handleDelete();
    } else {
      handleSave();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();

    setIsEditing(false);
    updateParentState();
  };

  const handleDelete = () => {
    setSummary('');
    setIsEditing(false);
    updateParentState();
  };

  const updateParentState = () => {
    setSummaryJson({
      professionalSummary: {
        addSummary: isChecked,
        summary: summary
      }
    });
  };

  const handleImproveWithAI = async () => {
    setIsGeneratingAI(true);
    try {
      const summaryPayload = {
        ...apiPayload,
        summaryText: summary,
      };

      if (showSuggestion && suggestion.trim() !== '') {
        summaryPayload.summaryText += `\n\nProvided Suggestion:\n${suggestion.trim()}`;
      }

      console.log('JSON request being made:', JSON.stringify(summaryPayload, null, 2));

      const response = await fetch('https://api.parsinga.com/generate_career_summary/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(summaryPayload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const text = await response.text();
      setSummary(text.replace(/^"|"$/g, ''));
    } catch (error) {
      console.error('Error improving summary with AI:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-xl font-medium">{icon}Professional Summary</div>
      <div className="collapse-content">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isChecked}
              onChange={handleCheck}
            />
            <label className="ml-2">Add a professional summary</label>
          </div>
          {isChecked && !isEditing && (
            <button
              onClick={handleEdit}
              className="btn btn-primary btn-sm"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        {isChecked && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-gray-700">Summary</label>
              <textarea
                name="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="textarea textarea-bordered w-full"
                disabled={!isEditing}
                required
              />
              {isEditing && (
                <>
                  <div className="flex items-center mt-2 mb-2">
                    <input
                      type="checkbox"
                      checked={showSuggestion}
                      onChange={() => setShowSuggestion(!showSuggestion)}
                      className="toggle toggle-primary mr-2"
                    />
                    <label className="label-text">Add A Suggestion</label>
                  </div>
                  {showSuggestion && (
                    <textarea
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      className="textarea textarea-bordered w-full text-sm"
                      placeholder="Enter your suggestion here..."
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleImproveWithAI}
                    className={`btn btn-secondary mt-2 ${isGeneratingAI ? 'loading' : ''}`}
                    disabled={isGeneratingAI}
                  >
                    {isGeneratingAI ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        GENERATING with AI
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Improve with AI
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
            {isEditing && (
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-error btn-sm"
                >
                  <XIcon className="h-5 w-5" />
                </button>
                <button type="submit" className="btn btn-success btn-sm">
                  <CheckIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfessionalSummary;