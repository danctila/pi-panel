import React, { useState } from "react";

const TestUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [siteName, setSiteName] = useState("testsite");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDirectUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult("Uploading...");

    const formData = new FormData();
    formData.append("siteZip", file);
    formData.append("name", siteName);

    try {
      console.log("TestUpload: Starting direct fetch upload");
      const response = await fetch(
        "https://admin.totaltechtools.com/api/upload/static",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log("TestUpload: Upload complete", data);

      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error("TestUpload: Upload failed", err);
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-2">Direct Upload Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        This uses the same approach as debug.html that works
      </p>

      <form onSubmit={handleDirectUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            File:
            <input
              type="file"
              onChange={handleFileChange}
              accept=".zip"
              className="mt-1 block w-full"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Site Name:
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="mt-1 block w-full border rounded p-2"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className={`px-4 py-2 bg-blue-500 text-white rounded ${
            loading || !file
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-600"
          }`}
        >
          {loading ? "Uploading..." : "Upload File Directly"}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          <h4 className="font-medium">Result:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs mt-1 max-h-40 overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestUpload;
