// components/BuffetDetails.tsx
import { FC } from "react";
import { Buffet } from "../../types";

interface BuffetDetailsProps {
  buffet: Buffet;
}

export const BuffetDetails: FC<BuffetDetailsProps> = ({ buffet }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Buffet Details</h2>
      <div className="space-y-3">
        <div>
          <span className="font-semibold">Név: </span>{buffet.name}
        </div>
        <div>
          <span className="font-semibold">Email: </span>{buffet.email}
        </div>
        <div>
          <span className="font-semibold">Helyszín: </span>{buffet.location}
        </div>
        <div>
          <span className="font-semibold">Nyitvatartás: </span>{buffet.openingHours}
        </div>
        <div>
          <span className="font-semibold">Címkék: </span>
          {buffet.tags && buffet.tags.length > 0 ? buffet.tags.join(", ") : "Nincsenek címkék"}
        </div>
      </div>
    </div>
  );
};