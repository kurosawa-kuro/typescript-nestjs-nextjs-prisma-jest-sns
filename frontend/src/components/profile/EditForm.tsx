type EditFormProps = {
  editedName: string;
  editedEmail: string;
  setEditedName: (name: string) => void;
  setEditedEmail: (email: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
};

export function EditForm({
  editedName,
  editedEmail,
  setEditedName,
  setEditedEmail,
  handleSave,
  handleCancel
}: EditFormProps) {
  return (
    <>
      <input
        type="text"
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        value={editedEmail}
        onChange={(e) => setEditedEmail(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <div className="flex justify-end space-x-2">
        <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
        <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </>
  );
} 