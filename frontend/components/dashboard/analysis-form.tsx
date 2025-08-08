'use client'

import { useState } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'

interface AnalysisFormProps {
  onAnalyze: (data: {
    reportSource: 'upload' | 'sample'
    file?: File
    patientName: string
    age: number
    gender: string
  }) => void
  isLoading: boolean
}

export default function AnalysisForm({ onAnalyze, isLoading }: AnalysisFormProps) {
  const [reportSource, setReportSource] = useState<'upload' | 'sample'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [patientName, setPatientName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientName || !age || !gender) return
    if (reportSource === 'upload' && !file) return

    onAnalyze({
      reportSource,
      file: reportSource === 'upload' ? file! : undefined,
      patientName,
      age: parseInt(age),
      gender
    })
  }

  return (
    <div className="flex-1 p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="neo-card p-8 mb-8">
          <h2 className="text-4xl font-black text-black mb-2 uppercase tracking-tighter">NEW ANALYSIS SESSION</h2>
          <p className="text-lg font-bold text-gray-600 uppercase tracking-wide">Fill out the form below to analyze your medical report</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Report Source Selection */}
          <div className="neo-card p-6">
            <label className="block text-xl font-black text-black mb-6 uppercase tracking-wide">
              Choose Report Source
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="upload"
                  checked={reportSource === 'upload'}
                  onChange={(e) => setReportSource(e.target.value as 'upload')}
                  className="mr-3 w-5 h-5 border-4 border-black"
                />
                <span className="text-lg font-black uppercase tracking-wide">UPLOAD PDF</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="sample"
                  checked={reportSource === 'sample'}
                  onChange={(e) => setReportSource(e.target.value as 'sample')}
                  className="mr-3 w-5 h-5 border-4 border-black"
                />
                <span className="text-lg font-black uppercase tracking-wide">USE SAMPLE PDF</span>
              </label>
            </div>
          </div>

          {/* File Upload */}
          {reportSource === 'upload' && (
            <div className="neo-card p-6">
              <label className="block text-xl font-black text-black mb-4 uppercase tracking-wide">
                Upload Blood Report PDF (Max 10MB)
              </label>
              <div
                className={`transition-all ${
                  dragActive
                    ? 'neo-upload-zone-active'
                    : file
                    ? 'neo-upload-zone-success'
                    : 'neo-upload-zone'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="bg-black p-3 border-4 border-black">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-xl font-black uppercase tracking-wide">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <div className="bg-black p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-auto mb-6 w-fit">
                      <Upload className="h-16 w-16 text-white" />
                    </div>
                    <p className="text-xl font-black mb-4 uppercase tracking-wide">
                      DROP YOUR PDF HERE OR{' '}
                      <label className="underline cursor-pointer hover:bg-black hover:text-white px-2 py-1 border-2 border-black">
                        BROWSE
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                      MAXIMUM FILE SIZE: 10MB. ONLY PDF FILES CONTAINING MEDICAL REPORTS ARE SUPPORTED.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Patient Information */}
          <div className="neo-card p-6">
            <h3 className="text-xl font-black text-black mb-6 uppercase tracking-wide">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="patientName" className="block text-lg font-black text-black mb-3 uppercase tracking-wide">
                  Patient Name
                </label>
                <input
                  id="patientName"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="neo-input"
                  placeholder="ENTER PATIENT NAME"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="age" className="block text-lg font-black text-black mb-3 uppercase tracking-wide">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="neo-input"
                  placeholder="ENTER AGE"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-lg font-black text-black mb-3 uppercase tracking-wide">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="neo-input"
                  required
                >
                  <option value="">SELECT GENDER</option>
                  <option value="Male">MALE</option>
                  <option value="Female">FEMALE</option>
                  <option value="Other">OTHER</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !patientName || !age || !gender || (reportSource === 'upload' && !file)}
            className="w-full neo-button py-6 px-8 text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                ANALYZING REPORT...
              </>
            ) : (
              'ANALYZE REPORT'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
