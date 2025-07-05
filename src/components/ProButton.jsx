import { useState } from "react";

export default function ProButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="rounded-xl px-4 py-2 font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow"
      >
        🚀 Pro
      </button>

      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-semibold mb-2">🚀 Pro Features Coming Soon</h2>
            <p className="text-gray-600">
              Exporting, analytics, themes, and more — built to supercharge your shadowing logs.
            </p>
            <button
              onClick={() => setShow(false)}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              Okay!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
