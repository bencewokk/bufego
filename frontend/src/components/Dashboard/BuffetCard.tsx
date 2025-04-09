import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faMapMarkerAlt,
  faPencilAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

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

interface BuffetCardProps {
  buffet: Buffet;
  onEdit: (buffet: Buffet, event: React.MouseEvent) => void;
  onDelete: (id: string, event: React.MouseEvent) => void;
}

export const BuffetCard: React.FC<BuffetCardProps> = ({
  buffet,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-[var(--admin-surface)] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      <Link to={`/admin/buffet/${buffet.id}`}>
        <div className="h-48 bg-gray-200 relative">
          <div className="absolute bottom-0 left-0 bg-[var(--admin-primary)] text-white px-3 py-1 rounded-tr-lg">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            {buffet.openingHours}
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-semibold text-[var(--admin-text)]">
              {buffet.name}
            </h2>
          </div>

          <div className="flex items-center text-[var(--admin-text)] mb-3">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
            <span>{buffet.location}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {buffet.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-[var(--admin-primary-light)] text-[var(--admin-primary)] px-2 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={(e) => onEdit(buffet, e)}
          className="bg-[var(--admin-primary-light)] text-[var(--admin-primary)] h-[35px] w-[35px] rounded hover:bg-[var(--admin-primary)] hover:text-white transition-colors cursor-pointer"
          title="Szerkesztés"
        >
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
        <button
          onClick={(e) => onDelete(buffet.id, e)}
          className="bg-red-100 text-red-500 h-[35px] w-[35px] rounded hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
          title="Törlés"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
};

export default BuffetCard;