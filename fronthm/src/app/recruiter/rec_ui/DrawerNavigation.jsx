import { useState, useRef } from 'react';

const DrawerNavigation = () => {
  const [isMaximized, setIsMaximized] = useState(false); // Maximize state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal Open state
  const [drawerWidth, setDrawerWidth] = useState(320); // Width of the drawer (initial is 320px)
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // Drawer open/close state
  const startX = useRef(0); // Reference to store the initial mouse position during drag
  const startWidth = useRef(0); // Reference to store the initial drawer width during drag

  // Toggle for maximizing the sidebar
  const toggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  // Toggle for opening the modal
  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  // Handle the mouse down event to start the resizing
  const handleMouseDown = (e) => {
    startX.current = e.clientX;
    startWidth.current = drawerWidth;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle the mouse move event to resize the drawer
  const handleMouseMove = (e) => {
    const delta = startX.current - e.clientX; // Inverse the delta calculation
    const newWidth = startWidth.current + delta;

    // Calculate the minimum width as 40% of the screen width
    const minWidth = window.innerWidth * 0.2; // 20% of the window's width
    const maxWidth = window.innerWidth; // Full screen width
    const newWidthClamped = Math.min(maxWidth, Math.max(minWidth, newWidth)); // Clamp between 20% and full width

    setDrawerWidth(newWidthClamped);
  };

  // Handle the mouse up event to stop resizing
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Close the drawer and modal
  const closeDrawer = () => {
    document.getElementById('drawer-navigation').style.display = 'none';
    // setIsDrawerOpen(false); // Uncomment if you want to close the drawer state
    // setIsModalOpen(false);  // Uncomment if you want to close the modal state
  };

  return (
    <>
      {/* Modal when open */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div
            className={`bg-blue-500 p-1 rounded-lg shadow-lg transition-all duration-300 ${isMaximized ? 'w-full h-full' : 'w-3/4 h-3/4'}`}
          >
            {/* Modal buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={toggleMaximize}
                className="bg-blue-600 text-white py-1 px-3 rounded"
              >
                Maximize
              </button>
              <button
                onClick={toggleModal}
                className="bg-red-600 text-white py-1 px-3 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar component */}
      {isDrawerOpen && (
        <div
          id="drawer-navigation"
          className={`fixed top-0 right-0 z-40 p-4 overflow-y-auto transition-transform ${isMaximized ? 'w-full h-full' : 'w-[256px] h-[100vh]'}`}
          style={{
            display: 'none', // Control visibility directly with inline style
            marginTop: '143px', // Adjust top margin by 60px
            width: isMaximized ? '100%' : `${drawerWidth}px`,
            height: 'calc(100vh - 60px)', // Adjust height by decreasing top margin by 60px
            backgroundColor: '#F3F4F6', // Background color
          }}
          tabIndex="-1"
          aria-labelledby="drawer-navigation-label"
        >
          <h5
            id="drawer-navigation-label"
            className="text-base font-semibold text-gray-800 uppercase"
          >
            Sidebar
          </h5>

          <div className="absolute top-2.5 right-2.5 flex items-center space-x-2">
            {/* Modal button */}
            <button
              type="button"
              onClick={toggleModal}
              className="text-gray-800 bg-transparent hover:bg-blue-400 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9 1a1 1 0 0 1 1 1v16a1 1 0 0 1-2 0V2a1 1 0 0 1 1-1Z"
                ></path>
                <path
                  fillRule="evenodd"
                  d="M2 9a1 1 0 0 1 1-1h16a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1Z"
                ></path>
              </svg>
              <span className="sr-only">Open Modal</span>
            </button>

            {/* Maximize button */}
            <button
              type="button"
              onClick={toggleMaximize}
              className="text-gray-800 bg-transparent hover:bg-blue-400 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm0 12V5h10v10H5Z"
                ></path>
              </svg>
              <span className="sr-only">Maximize</span>
            </button>

            {/* Close button with refined icon */}
            <button
              type="button"
              onClick={closeDrawer} // Close the drawer and modal
              className="text-gray-800 bg-transparent hover:bg-red-400 hover:text-white rounded-lg text-sm p-1.5 inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M6.293 4.293a1 1 0 0 1 1.414 0L10 7.586l2.293-2.293a1 1 0 1 1 1.414 1.414L11.414 9l2.293 2.293a1 1 0 1 1-1.414 1.414L10 10.414l-2.293 2.293a1 1 0 1 1-1.414-1.414L8.586 9 6.293 6.707a1 1 0 1 1 0-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close Drawer</span>
            </button>
          </div>

          {/* Resizable border */}
          <div
            className="absolute top-0 left-0 w-0.5 h-full cursor-ew-resize bg-gray-600"
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </>
  );
};

export default DrawerNavigation;

const Rightsidebar = ({ isOpen, onNavigate, components }) => {
  return (
    <div className={`right-sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="nav-menu">
        {components.map((item) => (
          <button
            key={item.id}
            className="nav-item"
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-text">{item.name}</span>
          </button>
        ))}
      </nav>
      <style jsx>{`
        .right-sidebar {
          width: 280px;
          height: 100vh;
          position: fixed;
          right: 0;
          top: 0;
          background: white;
          box-shadow: -2px 0 8px rgba(0,0,0,0.1);
          transform: translateX(${isOpen ? '0' : '100%'});
          transition: transform 0.3s ease;
        }
        .nav-menu {
          padding: 1rem;
        }
        .nav-item {
          width: 100%;
          padding: 0.75rem 1rem;
          text-align: left;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s;
        }
        .nav-item:hover {
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
};