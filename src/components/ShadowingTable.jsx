import React from 'react';

export default function ShadowingTable({ entries }) {
  const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);

  return (
    <div className="overflow-x-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">📊 Shadowing Summary</h2>
      <table className="min-w-full table-auto border border-gray-300 bg-white rounded">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="border px-4 py-2">Physician</th>
            <th className="border px-4 py-2">Specialty</th>
            <th className="border px-4 py-2">Date(s)</th>
            <th className="border px-4 py-2">Hours</th>
            <th className="border px-4 py-2">Observations</th>
            <th className="border px-4 py-2">Reflections</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-t">
              <td className="border px-4 py-2">{entry.physician}</td>
              <td className="border px-4 py-2">{entry.specialty}</td>
              <td className="border px-4 py-2">{entry.date}</td>
              <td className="border px-4 py-2">{entry.hours}</td>
              <td className="border px-4 py-2">{entry.observations}</td>
              <td className="border px-4 py-2">{entry.reflections}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td colSpan="3" className="px-4 py-2 text-right">Total Hours:</td>
            <td className="px-4 py-2">{totalHours}</td>
            <td colSpan="2" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
