import { useState } from 'react';
import SkillSelector from './components/SkillSelector';
import DesignationSelector from './components/DesignationSelector';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './index.css';
import { FaUser, FaBriefcase, FaGraduationCap, FaCertificate, FaTools, FaProjectDiagram, FaFileAlt, FaTrash, FaPaperPlane, FaDownload, FaSpinner, FaFileArchive, FaFilePdf } from 'react-icons/fa';

function App() {
  const [formData, setFormData] = useState({
    Contact: { Name: '', Designation: '', Email: '', Phone: '', LinkedIn: '' },
    Summary: [''],
    Skills: [],
    Projects: [{ Name: '', Year: '', Description: [''] }],
    Education: [{ Institute: '', Degree: '', StartYear: '', EndYear: '' }],
    Experience: [{
      Role: '', Company: '', Description: [''], StartDate: '', EndDate: '', Present: false
    }],
    Certification: ['']
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [resumeFiles, setResumeFiles] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  const handleChange = (section, key, index = null, subkey = null, descIdx = null) => (e) => {
    const updated = { ...formData };

    if (Array.isArray(updated[section])) {
      if (typeof updated[section][index] === 'string') {
        updated[section][index] = e.target.value;
      } else if (subkey === 'Description' && descIdx !== null) {
        updated[section][index][subkey][descIdx] = e.target.value;
      } else if (subkey) {
        updated[section][index][subkey] = e.target.value;
      } else {
        updated[section][index][key] = e.target.value;
      }
    } else {
      updated[section][key] = e.target.value;
    }

    setFormData(updated);
  };

  const addItem = (section, template) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], template],
    }));
  };

  const removeItem = (section, index) => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (updated[section].length > 1) {
        updated[section] = updated[section].filter((_, i) => i !== index);
      }
      return updated;
    });
  };

  const addExperienceDescription = (expIdx) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.Experience[expIdx].Description.push('');
      return updated;
    });
  };

  const addProjectDescription = (projIdx) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.Projects[projIdx].Description.push('');
      return updated;
    });
  };

  const removeExperienceDescription = (expIdx, descIdx) => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (updated.Experience[expIdx].Description.length > 1) {
        updated.Experience[expIdx].Description = updated.Experience[expIdx].Description.filter(
          (_, i) => i !== descIdx
        );
      }
      return updated;
    });
  };

  const removeProjectDescription = (projIdx, descIdx) => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (updated.Projects[projIdx].Description.length > 1) {
        updated.Projects[projIdx].Description = updated.Projects[projIdx].Description.filter(
          (_, i) => i !== descIdx
        );
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.Contact.Name || !formData.Contact.Email) {
      setMessage({ text: 'Please fill in Name and Email in Contact Information.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });
    setResumeFiles([]);
    setZipBlob(null);
    setPreviewContent(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/generate-resume-zip/',
        formData,
        {
          responseType: 'blob',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Store ZIP blob for downloading
      setZipBlob(response.data);

      // Extract ZIP contents
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(response.data);
      const files = [];

      // Iterate through ZIP files
      for (const [filename, file] of Object.entries(zipContent.files)) {
        if (!file.dir && filename.endsWith('.pdf')) { // Only process PDF files
          const content = await file.async('blob');
          const pdfBlob = new Blob([content], { type: 'application/pdf' });
          const url = URL.createObjectURL(pdfBlob);
          files.push({ name: filename, blob: content, url });
        }
      }

      setResumeFiles(files);
      setMessage({ text: 'Resume formats generated successfully! Select a format to download.', type: 'success' });
    } catch (error) {
      setMessage({ text: `Error generating resumes: ${error.response?.data?.message || error.message}`, type: 'error' });
      console.error('Submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFromZip = (file) => {
    const url = window.URL.createObjectURL(new Blob([file.blob], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadZip = () => {
    if (zipBlob) {
      saveAs(zipBlob, 'resumes.zip');
    } else {
      setMessage({ text: 'No ZIP file available to download.', type: 'error' });
    }
  };

  const handlePreview = (filename) => {
    // Simplified text-based preview using formData
    setPreviewContent({
      filename,
      content: `
        <h3>${formData.Contact.Name}</h3>
        <p>${formData.Contact.Designation}</p>
        <p>Email: ${formData.Contact.Email}</p>
        <p>Phone: ${formData.Contact.Phone}</p>
        <p>LinkedIn: ${formData.Contact.LinkedIn}</p>
        <h4>Summary</h4>
        <ul>${formData.Summary.filter(line => line).map(line => `<li>${line}</li>`).join('')}</ul>
        <h4>Skills</h4>
        <ul>${formData.Skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
        <h4>Projects</h4>
        ${formData.Projects.map(proj => `
          <div>
            <p><strong>${proj.Name}</strong> (${proj.Year})</p>
            <ul>${proj.Description.filter(desc => desc).map(desc => `<li>${desc}</li>`).join('')}</ul>
          </div>
        `).join('')}
        <h4>Education</h4>
        ${formData.Education.map(edu => `
          <div>
            <p><strong>${edu.Degree}</strong>, ${edu.Institute}</p>
            <p>${edu.StartYear} - ${edu.EndYear}</p>
          </div>
        `).join('')}
        <h4>Experience</h4>
        ${formData.Experience.map(exp => `
          <div>
            <p><strong>${exp.Role}</strong>, ${exp.Company}</p>
            <p>${exp.StartDate} - ${exp.Present ? 'Present' : exp.EndDate}</p>
            <ul>${exp.Description.filter(desc => desc).map(desc => `<li>${desc}</li>`).join('')}</ul>
          </div>
        `).join('')}
        <h4>Certifications</h4>
        <ul>${formData.Certification.filter(cert => cert).map(cert => `<li>${cert}</li>`).join('')}</ul>
      `
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-purple-100 to-indigo-100 flex flex-col items-center px-4 py-8 font-inter">
      {/* Data Entry Section */}
      <div className="bg-white w-full max-w-5xl p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-screen neumorphic-card animate-fade-in">
        <h1 className="text-5xl font-poppins font-extrabold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-purple-600 animate-pulse">
          Resume Builder
        </h1>

        {/* Feedback Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Contact */}
        <Section title="Contact Information" icon={<FaUser />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input placeholder="Name" value={formData.Contact.Name} onChange={handleChange('Contact', 'Name')} />
            <DesignationSelector
              value={formData.Contact.Designation}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  Contact: { ...prev.Contact, Designation: val }
                }))
              }
            />
            <Input placeholder="Email" value={formData.Contact.Email} onChange={handleChange('Contact', 'Email')} />
            <Input placeholder="Phone" value={formData.Contact.Phone} onChange={handleChange('Contact', 'Phone')} />
            <Input placeholder="LinkedIn" value={formData.Contact.LinkedIn} onChange={handleChange('Contact', 'LinkedIn')} />
          </div>
        </Section>

        {/* Summary */}
        <Section title="Professional Summary" icon={<FaFileAlt />}>
          <div className="space-y-4">
            {formData.Summary.map((line, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Input
                  placeholder={`Summary Line ${idx + 1}`}
                  value={line}
                  onChange={handleChange('Summary', null, idx)}
                  className="flex-1"
                />
                {formData.Summary.length > 1 && (
                  <RemoveButton onClick={() => removeItem('Summary', idx)} label="Remove" />
                )}
              </div>
            ))}
            <AddButton onClick={() => addItem('Summary', '')} label="Add Summary Line" />
          </div>
        </Section>

        {/* Skills */}
        <Section title="Skills" icon={<FaTools />}>
          <SkillSelector
            selectedSkills={formData.Skills}
            setSelectedSkills={(skills) => setFormData((prev) => ({ ...prev, Skills: skills }))}
          />
        </Section>

        {/* Projects */}
        <Section title="Projects" icon={<FaProjectDiagram />}>
          {formData.Projects.map((proj, idx) => (
            <div key={idx} className="space-y-4 mb-6 neumorphic-card-inner p-4">
              <div className="flex items-center justify-between gap-4">
                <Input
                  placeholder="Project Name"
                  value={proj.Name}
                  onChange={handleChange('Projects', 'Name', idx)}
                  className="flex-1"
                />
                {formData.Projects.length > 1 && (
                  <RemoveButton onClick={() => removeItem('Projects', idx)} label="Remove" />
                )}
              </div>
              <Input placeholder="Year" value={proj.Year} onChange={handleChange('Projects', 'Year', idx)} />
              {proj.Description.map((desc, dIdx) => (
                <div key={dIdx} className="flex items-center gap-4">
                  <TextArea
                    placeholder={`Description Line ${dIdx + 1}`}
                    value={desc}
                    onChange={handleChange('Projects', null, idx, 'Description', dIdx)}
                    className="flex-1"
                  />
                  {proj.Description.length > 1 && (
                    <RemoveButton onClick={() => removeProjectDescription(idx, dIdx)} label="Remove" />
                  )}
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-teal-600 hover:text-teal-800 font-medium underline transition-colors duration-300"
                onClick={() => addProjectDescription(idx)}
              >
                + Add Description Line
              </button>
            </div>
          ))}
          <AddButton
            onClick={() => addItem('Projects', { Name: '', Year: '', Description: [''] })}
            label="Add Project"
          />
        </Section>

        {/* Education */}
        <Section title="Education" icon={<FaGraduationCap />}>
          {formData.Education.map((edu, idx) => (
            <div key={idx} className="space-y-4 mb-6 neumorphic-card-inner p-4">
              <div className="flex items-center justify-between gap-4">
                <Input
                  placeholder="Institute"
                  value={edu.Institute}
                  onChange={handleChange('Education', 'Institute', idx)}
                  className="flex-1"
                />
                {formData.Education.length > 1 && (
                  <RemoveButton onClick={() => removeItem('Education', idx)} label="Remove" />
                )}
              </div>
              <Input placeholder="Degree" value={edu.Degree} onChange={handleChange('Education', 'Degree', idx)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <select
                  value={edu.StartYear}
                  onChange={handleChange('Education', 'StartYear', idx)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 hover:shadow-md"
                >
                  <option value="">Start Year</option>
                  {Array.from({ length: 50 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
                <select
                  value={edu.EndYear}
                  onChange={handleChange('Education', 'EndYear', idx)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 hover:shadow-md"
                >
                  <option value="">End Year</option>
                  {Array.from({ length: 50 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
          ))}
          <AddButton
            onClick={() => addItem('Education', { Institute: '', Degree: '', StartYear: '', EndYear: '' })}
            label="Add Education"
          />
        </Section>

        {/* Experience */}
        <Section title="Work Experience" icon={<FaBriefcase />}>
          {formData.Experience.map((exp, idx) => {
            const durationLabel = (exp.StartDate || exp.EndDate || exp.Present)
              ? `${exp.StartDate || ''} - ${exp.Present ? 'Present' : exp.EndDate || ''}`
              : '';

            return (
              <div key={idx} className="space-y-4 mb-6 neumorphic-card-inner p-6">
                <div className="flex items-center justify-between gap-4">
                  <Input
                    placeholder="Role"
                    value={exp.Role}
                    onChange={handleChange('Experience', 'Role', idx)}
                    className="flex-1"
                  />
                  {formData.Experience.length > 1 && (
                    <RemoveButton onClick={() => removeItem('Experience', idx)} label="Remove" />
                  )}
                </div>
                <Input placeholder="Company" value={exp.Company} onChange={handleChange('Experience', 'Company', idx)} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Input
                    placeholder="From (e.g. Jan 2020)"
                    value={exp.StartDate}
                    onChange={handleChange('Experience', 'StartDate', idx)}
                  />
                  <Input
                    placeholder="To (e.g. Dec 2022)"
                    value={exp.EndDate}
                    onChange={handleChange('Experience', 'EndDate', idx)}
                    disabled={exp.Present}
                  />
                  <label className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <input
                      type="checkbox"
                      checked={!!exp.Present}
                      onChange={(e) => {
                        const updated = { ...formData };
                        updated.Experience[idx].Present = e.target.checked;
                        if (e.target.checked) updated.Experience[idx].EndDate = '';
                        setFormData(updated);
                      }}
                      className="form-checkbox h-5 w-5 text-teal-600 border-gray-200 rounded focus:ring-teal-500 transition-all"
                    />
                    <span className="font-medium">Present</span>
                  </label>
                </div>

                {durationLabel && (
                  <div className="text-sm text-gray-500 italic mt-2 font-poppins">{durationLabel}</div>
                )}

                {exp.Description.map((desc, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-4">
                    <TextArea
                      placeholder={`Description Line ${dIdx + 1}`}
                      value={desc}
                      onChange={handleChange('Experience', null, idx, 'Description', dIdx)}
                      className="flex-1"
                    />
                    {exp.Description.length > 1 && (
                      <RemoveButton onClick={() => removeExperienceDescription(idx, dIdx)} label="Remove" />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="text-sm text-teal-600 hover:text-teal-800 font-medium underline transition-colors duration-300"
                  onClick={() => addExperienceDescription(idx)}
                >
                  + Add Description Line
                </button>
              </div>
            );
          })}
          <AddButton
            onClick={() =>
              addItem('Experience', {
                Role: '', Company: '', Description: [''], StartDate: '', EndDate: '', Present: false
              })
            }
            label="Add Experience"
          />
        </Section>

        {/* Certifications */}
        <Section title="Certifications" icon={<FaCertificate />}>
          <div className="space-y-4">
            {formData.Certification.map((cert, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Input
                  placeholder={`Certification ${idx + 1}`}
                  value={cert}
                  onChange={handleChange('Certification', null, idx)}
                  className="flex-1"
                />
                {formData.Certification.length > 1 && (
                  <RemoveButton onClick={() => removeItem('Certification', idx)} label="Remove" />
                )}
              </div>
            ))}
            <AddButton onClick={() => addItem('Certification', '')} label="Add Certification" />
          </div>
        </Section>

        {/* Submit Button and Loading Indicator */}
        <div className="flex flex-col items-center mt-8">
          <SubmitButton onClick={handleSubmit} label="Submit Resume" disabled={isLoading} />
          {isLoading && (
            <div className="mt-2 flex flex-col items-center">
              <div className="relative flex items-center justify-center w-16 h-16 mb-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-tr from-teal-400 to-purple-400 opacity-30 animate-ping"></span>
                <FaSpinner className="text-4xl text-teal-600 animate-spin" />
              </div>
              <span className="text-base font-semibold text-teal-700">Generating your resumes...</span>
            </div>
          )}
        </div>
      </div>

      {/* Resume Formats (Full Width) */}
      {resumeFiles.length > 0 && (
        <div className="full-width-section w-full px-4 py-8">
          <Section title="Available Resume Formats" icon={<FaFileAlt />}>
            <div className="space-y-4 ">
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-poppins font-medium rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                  onClick={handleDownloadZip}
                >
                  <FaFileArchive />
                  Download All Resumes (ZIP)
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {resumeFiles.map((file, idx) => (
                  <div key={idx} className="a4-box neumorphic-card-inner rounded-xl p-4 flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-800 mb-2">{file.name}</span>
                    <div className="w-full h-[283px] border border-gray-200 rounded-lg flex items-center justify-center bg-gray-100">
                      {file.url ? (
                        <iframe
                          src={`${file.url}#view=FitH`}
                          className="w-full h-full"
                          title={file.name}
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-600">
                          <FaFilePdf size={50} />
                          <span className="text-xs mt-2">PDF Preview Not Available</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="mt-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-600 text-white text-sm font-poppins font-medium rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                      onClick={() => handleDownloadFromZip(file)}
                    >
                      <FaDownload />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Resume Preview (Constrained Width) */}
      {previewContent && (
        <div className="bg-white w-full max-w-5xl p-8 rounded-3xl shadow-2xl neumorphic-card animate-fade-in">
          <Section title={`Preview: ${previewContent.filename}`} icon={<FaFileAlt />}>
            <div className="p-4 neumorphic-card-inner rounded-xl">
              <div
                className="text-sm text-gray-800"
                dangerouslySetInnerHTML={{ __html: previewContent.content }}
              />
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

// Reusable Components
const Section = ({ title, children, icon }) => (
  <section className="mb-10 p-6 rounded-2xl neumorphic-card bg-gradient-to-br from-gray-50 to-teal-50 transition-all duration-300 hover:shadow-lg animate-slide-in">
    <h2 className="text-3xl font-poppins font-semibold text-gray-800 mb-4 border-b-2 border-teal-300 pb-2 flex items-center gap-3">
      {icon}
      <span>{title}</span>
    </h2>
    {children}
  </section>
);

const Input = ({ value, onChange, placeholder, disabled, className }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 hover:shadow-md ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''} ${className || ''}`}
  />
);

const TextArea = ({ value, onChange, placeholder, className }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 hover:shadow-md resize-none ${className || ''}`}
    rows={4}
  />
);

const AddButton = ({ onClick, label }) => (
  <button
    className="mt-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white text-sm font-poppins font-medium rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
    onClick={onClick}
  >
    {label}
  </button>
);

const RemoveButton = ({ onClick, label }) => (
  <button
    className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white text-sm font-poppins font-medium rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
    onClick={onClick}
  >
    <FaTrash />
    {label}
  </button>
);

const SubmitButton = ({ onClick, label, disabled }) => (
  <button
    className={`px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white text-base font-poppins font-medium rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    <FaPaperPlane />
    {label}
  </button>
);

export default App;