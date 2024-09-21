// components/WorkExperience.js
import React, { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, SparklesIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';

const WorkExperience = ({ setWorkExperienceJson, icon, workExperienceJson }) => {
  const [workExperiences, setWorkExperiences] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [deleteExperienceId, setDeleteExperienceId] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [newExperience, setNewExperience] = useState({
    id: '',
    company_name: '',
    job_description: '• ',
    position: '',
    location: '',
    type: '',
    start_date: '',
    end_date: '',
    is_current: false,
    order: null,
  });

  useEffect(() => {
    if (workExperienceJson && workExperienceJson.length > 0) {
      const formattedExperiences = workExperienceJson.map((exp, index) => ({
        id: exp.id || Date.now() + index,
        company_name: exp.companyName,
        job_description: exp.description,
        position: exp.designation,
        start_date: exp.fromDate,
        end_date: exp.toDate,
        is_current: exp.isCurrent,
        order: index + 1
      }));
      setWorkExperiences(formattedExperiences);
    }
  }, [workExperienceJson]);

  const updateParentState = useCallback((experiences) => {
    const formattedExperiences = experiences.map((exp) => ({
      id: exp.id,
      companyName: exp.company_name,
      designation: exp.position,
      fromDate: exp.start_date,
      toDate: exp.end_date,
      isCurrent: exp.is_current,
      description: exp.job_description,
    }));
    setWorkExperienceJson(formattedExperiences);
  }, [setWorkExperienceJson]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'job_description') {
      const newValue = value.startsWith('• ') ? value : '• ' + value;
      setNewExperience((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setNewExperience((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const currentValue = newExperience.job_description;
      const newValue = currentValue.substring(0, selectionStart) + '\n• ' + currentValue.substring(selectionEnd);
      setNewExperience((prev) => ({
        ...prev,
        job_description: newValue,
      }));
    }
  };

  const handleAddExperience = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingExperienceId(null);
    setNewExperience({
      id: '',
      company_name: '',
      job_description: '• ',
      position: '',
      location: '',
      type: '',
      start_date: '',
      end_date: '',
      is_current: false,
      order: null,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const experiencePayload = {
      id: editingExperienceId || Date.now().toString(),
      company_name: newExperience.company_name,
      job_description: newExperience.job_description,
      position: newExperience.position || null,
      location: newExperience.location || null,
      type: newExperience.type,
      start_date: newExperience.start_date,
      end_date: newExperience.is_current ? null : newExperience.end_date,
      is_current: newExperience.is_current,
      order: newExperience.order || workExperiences.length + 1,
    };

    let updatedExperiences;
    if (editingExperienceId) {
      updatedExperiences = workExperiences.map(exp =>
        exp.id === editingExperienceId ? experiencePayload : exp
      );
    } else {
      updatedExperiences = [...workExperiences, experiencePayload];
    }

    setWorkExperiences(updatedExperiences);
    updateParentState(updatedExperiences);
    handleCancel();
  };

  const handleEdit = (experience) => {
    setEditingExperienceId(experience.id);
    setNewExperience({
      ...experience,
      job_description: experience.job_description.startsWith('• ') ? experience.job_description : '• ' + experience.job_description,
      is_current: !experience.end_date,
    });
  };

  const handleDelete = () => {
    const updatedExperiences = workExperiences.filter(exp => exp.id !== deleteExperienceId);
    setWorkExperiences(updatedExperiences);
    updateParentState(updatedExperiences);
    setDeleteExperienceId(null);
  };

  const handleImproveWithAI = async () => {
    setIsGeneratingAI(true);
    try {
      const apiPayload = {
        workExperienceText: newExperience.job_description,
      };

      if (showSuggestion && suggestion.trim() !== '') {
        apiPayload.workExperienceText += `\n\nProvided Suggestion:\n${suggestion.trim()}`;
      }

      console.log('JSON request being made:', JSON.stringify(apiPayload, null, 2));

      const response = await fetch('https://api.parsinga.com/generate_work_experience/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const improvedDescription = Object.values(data).join('\n• ');
      setNewExperience((prev) => ({
        ...prev,
        job_description: improvedDescription.startsWith('• ') ? improvedDescription : `• ${improvedDescription}`,
      }));
    } catch (error) {
      console.error('Error improving description with AI:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const moveExperience = (index, direction) => {
    const newExperiences = [...workExperiences];
    const [movedItem] = newExperiences.splice(index, 1);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newExperiences.splice(newIndex, 0, movedItem);

    const updatedExperiences = newExperiences.map((exp, i) => ({
      ...exp,
      order: i + 1
    }));

    setWorkExperiences(updatedExperiences);
    updateParentState(updatedExperiences);
  };

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-xl font-medium">
        {icon}
        Work Experience
      </div>
      <div className="collapse-content">
        {isAdding || editingExperienceId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={newExperience.company_name}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Job Description</label>
              <textarea
                name="job_description"
                value={newExperience.job_description}
                onChange={handleChange}
                onKeyDown={handleDescriptionKeyDown}
                className="textarea textarea-bordered w-full text-sm"
                required
              />
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Position</label>
                <input
                  type="text"
                  name="position"
                  value={newExperience.position}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newExperience.location}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Type</label>
                <select
                  name="type"
                  value={newExperience.type}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={newExperience.start_date}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={newExperience.end_date}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  disabled={newExperience.is_current}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_current"
                  checked={newExperience.is_current}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <label className="ml-2 text-gray-700">I am currently in this position</label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={handleCancel} className="btn btn-error">
                <XIcon className="h-5 w-5" />
              </button>
              <button type="submit" className="btn btn-success">
                <CheckIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        ) : (
          <div>
            <button onClick={handleAddExperience} className="btn btn-outline btn-primary mb-4">
              + Add Work Experience
            </button>
            {workExperiences.length > 0 ? (
              <ul>
                {workExperiences.map((experience, index) => (
                  <li key={experience.id} className="mb-4 border p-4 rounded relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">{experience.position}</h4>
                        <p className="text-gray-700">{experience.company_name}</p>
                        <p className="text-gray-500">{experience.start_date} - {experience.end_date || 'Present'}</p>
                        {experience.job_description && experience.job_description.split('\n').map((line, lineIndex) => (
                          <p key={lineIndex} className="text-gray-700 text-sm">{line}</p>
                        ))}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => moveExperience(index, 'up')}
                          className="btn btn-sm btn-circle"
                          disabled={index === 0}
                        >
                          <ChevronUpIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => moveExperience(index, 'down')}
                          className="btn btn-sm btn-circle"
                          disabled={index === workExperiences.length - 1}
                        >
                          <ChevronDownIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => handleEdit(experience)}
                        className="btn btn-sm btn-primary"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteExperienceId(experience.id)}
                        className="btn btn-sm btn-error"
                      >
                        <TrashIcon className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No work experience added yet</p>
            )}
          </div>
        )}
      </div>

      {deleteExperienceId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this work experience?</p>
            <div className="modal-action">
              <button
                onClick={() => setDeleteExperienceId(null)}
                className="btn"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkExperience;