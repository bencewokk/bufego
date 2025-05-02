import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faMapMarkerAlt, faTag, faEnvelope, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { Buffet } from "../../types";

interface BuffetInfoProps {
  buffet: Buffet;
  today: string;
  todayHours: string;
}

const BuffetInfo: React.FC<BuffetInfoProps> = ({ buffet, today, todayHours }) => (
  <>
    {/* Image Section */}
    <div className="relative h-64 md:h-auto bg-gradient-to-r from-blue-50 to-purple-50 md:rounded-l-xl">
      {buffet.image ? (
        <img
          src={buffet.image}
          alt={buffet.name}
          className="w-full h-full object-cover object-center md:rounded-l-xl"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 md:rounded-l-xl">
          <span className="text-gray-500 text-xl">🍽️ Buffet Preview</span>
        </div>
      )}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center text-sm">
        <FontAwesomeIcon icon={faClock} style={{ color: "var(--primary)" }} className="mr-2" />
        <span className="font-medium text-gray-700">Today: {todayHours}</span>
      </div>
    </div>
    {/* Details Section */}
    <div className="p-6 md:p-8 flex flex-col justify-between">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
          {buffet.name}
        </h1>
        <div className="space-y-4">
          <div className="flex items-start">
            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: "var(--primary)" }} className="mt-1 mr-3 text-lg" />
            <div>
              <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--text)" }}>Helyszín</h3>
              <p className="text-gray-700 text-base">{buffet.location}</p>
            </div>
          </div>
          <div className="flex items-start">
            <FontAwesomeIcon icon={faCalendarAlt} style={{ color: "var(--primary)" }} className="mt-1 mr-3 text-lg" />
            <div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>Nyitvatartás</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {buffet.dailyHours && Object.entries(buffet.dailyHours).map(([day, hours]) => (
                  <div key={day} className={`flex justify-between ${day === today ? 'font-semibold' : ''}`}>
                    <span className="capitalize">{day.substring(0,3)}</span>
                    <span className="text-gray-600 ml-2">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {buffet.email && (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faEnvelope} style={{ color: "var(--primary)" }} className="mr-3 text-lg" />
              <div>
                <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--text)" }}>Elérhetőség</h3>
                <a href={`mailto:${buffet.email}`} className="link-color text-base hover:underline">
                  {buffet.email}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      {buffet.tags?.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center mb-2">
            <FontAwesomeIcon icon={faTag} style={{ color: "var(--primary)" }} className="mr-2 text-base"/>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Lehetőségek</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {buffet.tags.map((tag, index) => (
              <span key={index} className="px-2.5 py-1 rounded-full text-xs tag-bg border tag-border">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </>
);

export default BuffetInfo;
