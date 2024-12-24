import { useState } from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      
      {isOpen && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50">
          <div className="p-2">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="p-2 bg-yellow-50 rounded text-sm"
                >
                  {notification}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
