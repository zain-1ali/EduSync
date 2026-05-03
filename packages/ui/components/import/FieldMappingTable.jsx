export function FieldMappingTable() {
  const fields = [
    { source: "admission_no", example: "ADM-2023-001", status: "matched", defaultTarget: "Admission Number" },
    { source: "FullName", example: "John Smith", status: "matched", defaultTarget: "Student Full Name" },
    { source: "Contact_No", example: "+1 555-0123", status: "unmapped", defaultTarget: "Select a field..." },
    { source: "Grade_Section", example: "Grade 5-A", status: "matched", defaultTarget: "Class/Section" },
    { source: "Bus_Route", example: "Route 42A", status: "custom", defaultTarget: "+ Save as New Custom Field" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold">Field Mapping</h2>
        <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded uppercase tracking-wider">
          10 Columns Found
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <th className="px-6 py-4">Your File's Column</th>
              <th className="px-4 py-4 text-center">Status</th>
              <th className="px-6 py-4">System Field</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {fields.map((field, idx) => {
              let rowClass = "bg-white dark:bg-slate-900";
              let statusIcon = <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>;
              let selectClass = "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-primary focus:border-primary";

              if (field.status === "unmapped") {
                rowClass = "bg-yellow-50/50 dark:bg-yellow-900/10";
                statusIcon = <span className="material-symbols-outlined text-yellow-500 text-lg">warning</span>;
                selectClass = "border-yellow-300 dark:border-yellow-700 bg-white dark:bg-slate-800 focus:ring-yellow-500 focus:border-yellow-500";
              } else if (field.status === "custom") {
                rowClass = "bg-blue-50/30 dark:bg-blue-900/10";
                statusIcon = <span className="material-symbols-outlined text-blue-500 text-lg">add_circle</span>;
                selectClass = "border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-semibold focus:ring-blue-500";
              }

              return (
                <tr key={idx} className={rowClass}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm text-slate-900 dark:text-slate-200 font-bold">{field.source}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Example: "{field.example}"</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">{statusIcon}</td>
                  <td className="px-6 py-4">
                    <select className={`w-full max-w-xs rounded-lg text-sm dark:text-slate-200 ${selectClass}`} defaultValue={field.defaultTarget}>
                      {field.status === "unmapped" && <option disabled>Select a field...</option>}
                      <option>{field.defaultTarget}</option>
                      {field.status !== "custom" && <option>+ Save as New Custom Field</option>}
                      <option>Ignore this column</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}