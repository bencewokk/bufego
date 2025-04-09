import React from "react";

interface Buffet {
  id: string;
  name: string;
  email: string;
  password: string;
  location: string;
  openingHours: string;
  image: string;
  tags: string[];
}

interface EditBuffetModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  currentBuffet: Buffet | null;
  setCurrentBuffet: React.Dispatch<React.SetStateAction<Buffet | null>>;
}

export const EditBuffetModal: React.FC<EditBuffetModalProps> = ({
  show,
  onClose,
  onSave,
  currentBuffet,
  setCurrentBuffet,
}) => {
  if (!show || !currentBuffet) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--admin-surface)] rounded-lg p-6 w-full max-w-md animate-fade-in shadow-2xl">
        <h3 className="text-2xl font-bold mb-4 text-[var(--admin-primary-dark)]">
          Büfé Szerkesztése
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Név"
            className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
            value={currentBuffet.name}
            onChange={(e) =>
              setCurrentBuffet({ ...currentBuffet, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Helyszín"
            className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
            value={currentBuffet.location}
            onChange={(e) =>
              setCurrentBuffet({
                ...currentBuffet,
                location: e.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="Nyitvatartás"
            className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
            value={currentBuffet.openingHours}
            onChange={(e) =>
              setCurrentBuffet({
                ...currentBuffet,
                openingHours: e.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="Címkék (vesszővel elválasztva)"
            className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
            value={currentBuffet.tags.join(", ")}
            onChange={(e) =>
              setCurrentBuffet({
                ...currentBuffet,
                tags: e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag !== ""),
              })
            }
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--admin-text)] hover:text-[var(--admin-primary-dark)] cursor-pointer"
          >
            Mégse
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded hover:bg-[var(--admin-primary-dark)] cursor-pointer"
          >
            Mentés
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBuffetModal;