// components/ContactInformation.js
import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, AlertCircle } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './ContactInformation.css';

const ContactInformation = ({ setContactJson, icon, initialValues, data }) => {
  const [contactInfo, setContactInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_no: '',
    linkedin: '',
    github: '',
    address: '',
    city: '',
    state: '',
    website: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setContactInfo(prevState => ({
        ...prevState,
        first_name: initialValues.firstName || '',
        last_name: initialValues.lastName || '',
        email: initialValues.emailId || '',
        phone_no: initialValues.mobileNumber || '',
      }));
    }

    if (data) {
      console.log(data)
      if (data.contactInformation) {
        setContactInfo(prevState => ({
          ...prevState,
          first_name: data.contactInformation.firstName || '',
          last_name: data.contactInformation.lastName || '',
          email: data.contactInformation.email?.length ? data.contactInformation.email[0] : '',
          phone_no: data.contactInformation.phoneNo?.length ? data.contactInformation.phoneNo[0] : '',
          linkedin: data.contactInformation.linkedin || '',
          github: data.contactInformation.github || '',
          address: data.contactInformation.address || '',
          city: data.contactInformation.city || '',
          state: data.contactInformation.state || '',
          website: data.contactInformation.website || '',
        }));
      }


    }
  }, [initialValues, data]);

  const updateParentState = (data) => {
    setContactJson({
      contactInformation: {
        firstName: data.first_name,
        lastName: data.last_name,
        email: [data.email],
        phoneNo: [data.phone_no],
        linkedin: data.linkedin,
        github: data.github,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
      }
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value, country, e, formattedValue) => {
    console.log(formattedValue)
    setContactInfo((prev) => ({
      ...prev,
      phone_no: formattedValue,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    updateParentState(contactInfo);
  };

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4 relative">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-xl font-medium">
        {icon}Contact Information
      </div>
      <div className="collapse-content">
        {!isEditing && (
          <div className="absolute top-14 right-20 bg-blue-100 border border-blue-300 text-blue-700 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-10">
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-blue-100 h-3 w-3 rotate-45 border-r border-blue-300"></div>
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <span className="text-sm">
              Click the edit button to fill out the form.
            </span>
          </div>
        )}

        <div className="flex justify-end mb-4 relative">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="btn btn-error btn-sm mr-2">
                <X className="h-5 w-5" />
              </button>
              <button onClick={handleSave} className="btn btn-success btn-sm">
                <Check className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm relative">
              <Pencil className="h-5 w-5" />
            </button>
          )}
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                name="first_name"
                value={contactInfo.first_name}
                onChange={handleChange}
                className="input input-bordered w-full"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={contactInfo.last_name}
                onChange={handleChange}
                className="input input-bordered w-full"
                disabled={!isEditing}
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={contactInfo.email}
              onChange={handleChange} // This onChange is still here in case you need to programmatically update the value
              className="input input-bordered w-full"
              disabled={true}  // This will disable editing at all times
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Phone Number</label>
            <div className="phone-input-wrapper">
              <PhoneInput
                country={'us'}
                value={contactInfo.phone_no}
                onChange={handlePhoneChange}
                disabled={!isEditing}
                inputProps={{
                  name: 'phone_no',
                  required: true,
                }}
                containerClass="phone-input-container"
                inputClass="phone-input-field"
                buttonClass="phone-input-button"
                dropdownClass="phone-input-dropdown"
                searchClass="phone-input-search"
                enableSearch={true}
                disableSearchIcon={false}
                countryCodeEditable={false}
                placeholder="(555) 123-4567"
                masks={{
                  us: '(...) ...-....',
                  in: '.... ......',
                  ca: '(...) ...-....'
                }}
                preferredCountries={['us', 'in', 'ca']}
                inputStyle={{
                  width: '100%',
                  height: '100%',
                  fontSize: '16px',
                  paddingLeft: '50px',
                  borderRadius: '0.375rem',
                }}
                buttonStyle={{
                  borderTopLeftRadius: '0.375rem',
                  borderBottomLeftRadius: '0.375rem',
                }}
                dropdownStyle={{
                  width: '300px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">LinkedIn</label>
            <input
              type="text"
              name="linkedin"
              value={contactInfo.linkedin}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-gray-700">GitHub</label>
            <input
              type="text"
              name="github"
              value={contactInfo.github}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={contactInfo.address}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={!isEditing}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={contactInfo.city}
                onChange={handleChange}
                className="input input-bordered w-full"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-gray-700">State</label>
              <input
                type="text"
                name="state"
                value={contactInfo.state}
                onChange={handleChange}
                className="input input-bordered w-full"
                disabled={!isEditing}
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Website</label>
            <input
              type="text"
              name="website"
              value={contactInfo.website}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={!isEditing}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactInformation;