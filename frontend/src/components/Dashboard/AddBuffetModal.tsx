import React from "react";

interface Buffet {
  name: string;
  email: string;
  password: string;
  location: string;
  openingHours: string;
  image: string;
  tags: string[];
}

interface AddBuffetModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  newBuffet: Omit<Buffet, "id">;
  setNewBuffet: React.Dispatch<React.SetStateAction<Omit<Buffet, "id">>>;
}

export const AddBuffetModal: React.FC<AddBuffetModalProps> = ({
  show,
  onClose,
  onSave,
  newBuffet,
  setNewBuffet,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--admin-surface)] rounded-lg p-6 w-full max-w-md animate-fade-in shadow-2xl">
        <h3 className="text-2xl font-bold mb-4 text-[var(--admin-primary-dark)]">
          Új Büfé
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Név"
            className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
            value={newBuffet.name}
            onChange={(e) =>
              setNewBuffet({ ...newBuffet, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Helyszín"
            className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
            value={newBuffet.location}
            onChange={(e) =>
              setNewBuffet({ ...newBuffet, location: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Nyitvatartás"
            className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
            value={newBuffet.openingHours}
            onChange={(e) =>
              setNewBuffet({ ...newBuffet, openingHours: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email cím"
            value={newBuffet.email}
            className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
            onChange={(e) =>
              setNewBuffet({ ...newBuffet, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Jelszó"
            value={newBuffet.password}
            className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
            onChange={(e) =>
              setNewBuffet({ ...newBuffet, password: e.target.value })
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

export default AddBuffetModal;