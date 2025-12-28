
import React, { useState, useEffect } from 'react';
import { FLAT_NUMBERS, MONTHS } from './constants';
import { ApartmentData, PaymentStatus } from './types';

const UploadIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 B24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const App: React.FC = () => {
  const [apartments, setApartments] = useState<ApartmentData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  
  const specialFlats = ['101', '203', '301', '302', '303', '502'];

  // Effect to load data from localStorage when component mounts or month/year changes
  useEffect(() => {
    const key = `apartment-data-${selectedYear}-${selectedMonth}`;
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        setApartments(JSON.parse(savedData));
      } else {
        // Initialize with empty state for a new month
        setApartments(
          FLAT_NUMBERS.map(flat => ({
            flatNumber: flat,
            maintenance: PaymentStatus.BLANK,
            waterBill: PaymentStatus.BLANK,
            name: '',
            comments: '',
            receiptName: undefined,
            receipt: undefined,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, [selectedYear, selectedMonth]);

  // Effect to save data to localStorage whenever apartments data changes
  useEffect(() => {
    if (apartments.length === 0) return; // Don't save initial empty state before loading
    const key = `apartment-data-${selectedYear}-${selectedMonth}`;
    try {
       // Create a version of the data suitable for JSON serialization (without File objects)
       const dataToSave = apartments.map(apt => {
        const { receipt, ...rest } = apt;
        return rest;
      });
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [apartments, selectedYear, selectedMonth]);

  const handleStatusToggle = (index: number, field: 'maintenance' | 'waterBill') => {
    const updatedApartments = [...apartments];
    const currentStatus = updatedApartments[index][field];
    let nextStatus: PaymentStatus;

    if (currentStatus === PaymentStatus.BLANK) {
      nextStatus = PaymentStatus.PAID;
    } else if (currentStatus === PaymentStatus.PAID) {
      nextStatus = PaymentStatus.UNPAID;
    } else {
      nextStatus = PaymentStatus.BLANK;
    }
    updatedApartments[index] = { ...updatedApartments[index], [field]: nextStatus };
    setApartments(updatedApartments);
  };

  const handleInputChange = (index: number, field: 'name' | 'comments', value: string) => {
    const updatedApartments = [...apartments];
    updatedApartments[index] = { ...updatedApartments[index], [field]: value };
    setApartments(updatedApartments);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedApartments = [...apartments];
      updatedApartments[index] = { ...updatedApartments[index], receipt: file, receiptName: file.name };
      setApartments(updatedApartments);
       e.target.value = '';
    }
  };
  
  const getStatusButtonClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-500/80 text-white shadow-[0_0_8px_theme(colors.green.500)] hover:bg-green-500';
      case PaymentStatus.UNPAID:
        return 'bg-red-500/80 text-white shadow-[0_0_8px_theme(colors.red.500)] hover:bg-red-500';
      default:
        return 'bg-slate-600 text-slate-300 hover:bg-slate-500';
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-cyan-400 [text-shadow:0_0_5px_theme(colors.cyan.400),0_0_10px_theme(colors.cyan.400)]">Apartment Maintenance Tracker</h1>
            <p className="text-slate-400 mt-2">Manage resident payments and records efficiently.</p>
          </div>
          <div className="mt-6 flex justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="month-select" className="text-sm font-medium text-slate-300">Month:</label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-36 rounded-md bg-slate-800 border border-slate-600 shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
               <label htmlFor="year-select" className="text-sm font-medium text-slate-300">Year:</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-28 rounded-md bg-slate-800 border border-slate-600 shadow-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="bg-slate-800/50 rounded-lg shadow-2xl shadow-cyan-500/10 border border-cyan-500/20 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[58vh]">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  {['Flat Number', 'Maintenance', 'Water Bill', 'Name', 'Comments', 'Receipt'].map(header => (
                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {apartments.map((apt, index) => (
                  <tr key={apt.flatNumber} className="hover:bg-slate-700/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${specialFlats.includes(apt.flatNumber) ? 'text-yellow-400 [text-shadow:0_0_3px_theme(colors.yellow.400)]' : 'text-slate-100'}`}>
                        {apt.flatNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(index, 'maintenance')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 w-20 text-center ${getStatusButtonClass(apt.maintenance)}`}
                      >
                        {apt.maintenance || 'N/A'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(index, 'waterBill')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 w-20 text-center ${getStatusButtonClass(apt.waterBill)}`}
                      >
                        {apt.waterBill || 'N/A'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={apt.name}
                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                        placeholder="Resident's Name"
                        className="w-full min-w-[150px] px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-slate-700 text-slate-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <textarea
                        value={apt.comments}
                        onChange={(e) => handleInputChange(index, 'comments', e.target.value)}
                        placeholder="Add comments..."
                        rows={2}
                        className="w-full min-w-[200px] px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm resize-y bg-slate-700 text-slate-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-cyan-500/50 text-sm font-medium rounded-md text-cyan-400 bg-slate-800 hover:bg-cyan-500/10 transition-colors">
                          <UploadIcon className="w-4 h-4 mr-2" />
                          <span>{apt.receiptName ? 'Change' : 'Upload'}</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileChange(index, e)}
                          />
                        </label>
                        {(apt.receipt?.name || apt.receiptName) && (
                          <span className="text-sm text-slate-400 truncate max-w-xs" title={apt.receipt?.name || apt.receiptName}>
                            {apt.receipt?.name || apt.receiptName}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
