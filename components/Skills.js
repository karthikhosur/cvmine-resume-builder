// components/Skills.js
import React, { useState, useRef, useEffect } from 'react';
import { TrashIcon, PlusIcon, XIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';

const Skills = ({ setSkillsJson, icon, skillsJson }) => {
  const [skills, setSkills] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteSkillId, setDeleteSkillId] = useState(null);
  const [newSkills, setNewSkills] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);


  useEffect(() => {
    if (skillsJson?.length) {
      console.log(skillsJson);

      let keys = Object.keys(skillsJson[0]);

      // Create a Set to track existing IDs
      let idSet = new Set();

      skillsJson.forEach((item, index) => {
        // If the item doesn't have an ID or the ID is already used, generate a new one
        if (!item.id || idSet.has(item.id)) {
          item.id = Date.now().toString() + index;
        }

        // Add the ID to the Set to track it
        idSet.add(item.id);

        // Ensure all keys exist and are populated with empty strings if missing
        keys.forEach(k => {
          if (!item[k]) {
            item[k] = '';  // Fix: item['k'] -> item[k]
          }
        });
      });

      setSkills(skillsJson);
    }

  }, [skillsJson])

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/skills-autocomplete?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleAddSkill = () => {
    setIsAdding(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewSkills([]);
    setCurrentInput('');
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      e.preventDefault();
      setNewSkills([...newSkills, currentInput.trim()]);
      setCurrentInput('');
      setSuggestions([]);
    }
  };

  const removeNewSkill = (index) => {
    setNewSkills(newSkills.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newSkills.length === 0) return;

    const skillPayloads = newSkills.map((skill, index) => ({
      id: Date.now() + index,
      skill: skill,
      order: skills.length + index + 1
    }));

    const updatedSkills = [...skills, ...skillPayloads];
    setSkills(updatedSkills);
    updateParentState(updatedSkills);
    handleCancel();
  };

  const handleDelete = () => {
    const updatedSkills = skills.filter(skill => skill.id !== deleteSkillId);
    setSkills(updatedSkills);
    updateParentState(updatedSkills);
    setDeleteSkillId(null);
  };

  const moveSkill = (index, direction) => {
    const newSkills = [...skills];
    const [movedItem] = newSkills.splice(index, 1);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newSkills.splice(newIndex, 0, movedItem);

    const updatedSkills = newSkills.map((skill, i) => ({
      ...skill,
      order: i + 1
    }));

    setSkills(updatedSkills);
    updateParentState(updatedSkills);
  };

  const updateParentState = (updatedSkills) => {
    setSkillsJson(updatedSkills.map(skill => ({ skill: skill.skill })));
  };

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-xl font-medium">
        {icon}
        Skills
      </div>
      <div className="collapse-content">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => {
                  setCurrentInput(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className="input input-bordered w-full"
                placeholder="Type a skill and press Enter"
                ref={inputRef}
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setNewSkills([...newSkills, suggestion]);
                        setCurrentInput('');
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {newSkills.map((skill, index) => (
                <div key={index} className="bg-primary text-primary-content rounded-full px-3 py-1 text-sm flex items-center">
                  {skill}
                  <button type="button" onClick={() => removeNewSkill(index)} className="ml-2 focus:outline-none">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={handleCancel} className="btn btn-error">
                <XIcon className="h-5 w-5" />
              </button>
              <button type="submit" className="btn btn-success" disabled={newSkills.length === 0}>
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        ) : (
          <div>
            <button onClick={handleAddSkill} className="btn btn-outline btn-primary mb-4">
              + Add Skills
            </button>
            {skills.length > 0 ? (
              <ul>
                {skills.map((skill, index) => (
                  <li key={skill.id} className="mb-4 border p-4 rounded flex justify-between items-center">
                    <p className="text-lg font-semibold">{skill.skill}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => moveSkill(index, 'up')}
                        className="btn btn-sm btn-circle"
                        disabled={index === 0}
                      >
                        <ChevronUpIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => moveSkill(index, 'down')}
                        className="btn btn-sm btn-circle"
                        disabled={index === skills.length - 1}
                      >
                        <ChevronDownIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteSkillId(skill.id)}
                        className="btn btn-sm btn-error"
                      >
                        <TrashIcon className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No skills added yet</p>
            )}
          </div>
        )}
      </div>

      {deleteSkillId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this skill?</p>
            <div className="modal-action">
              <button
                onClick={() => setDeleteSkillId(null)}
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

export default Skills;